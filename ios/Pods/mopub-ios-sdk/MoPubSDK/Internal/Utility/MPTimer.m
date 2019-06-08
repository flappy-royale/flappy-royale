//
//  MPTimer.m
//
//  Copyright 2018-2019 Twitter, Inc.
//  Licensed under the MoPub SDK License Agreement
//  http://www.mopub.com/legal/sdk-license-agreement/
//

#import <objc/message.h> // for `objc_msgSend`
#import "MPTimer.h"
#import "MPLogging.h"

@interface MPTimer ()

@property (nonatomic, assign) NSTimeInterval timeInterval;
@property (nonatomic, strong) NSTimer *timer;
@property (nonatomic, assign) BOOL isCountdownActive;

@property (nonatomic, weak) id target;
@property (nonatomic, assign) SEL selector;

@end

@implementation MPTimer

+ (MPTimer *)timerWithTimeInterval:(NSTimeInterval)seconds
                            target:(id)target
                          selector:(SEL)aSelector
                           repeats:(BOOL)repeats
{
    MPTimer *timer = [[MPTimer alloc] init];
    timer.target = target;
    timer.selector = aSelector;
    timer.timer = [NSTimer timerWithTimeInterval:seconds
                                          target:timer
                                        selector:@selector(timerDidFire)
                                        userInfo:nil
                                         repeats:repeats];
    timer.isCountdownActive = NO;
    timer.timeInterval = seconds;
    timer.runLoopMode = NSDefaultRunLoopMode;
    return timer;
}

- (void)dealloc
{
    [self.timer invalidate];
}

/**
 This is the designated run loop that the timer should attach to.
 */
- (NSRunLoop *)runloop
{
    return [NSRunLoop mainRunLoop]; // use the main run loop to make sure the timer stays alive
}

- (void)timerDidFire
{
    @synchronized (self) {
        if (self.selector == nil) {
            MPLogDebug(@"%s `selector` is unexpectedly nil. Return early to avoid crash.", __FUNCTION__);
            return;
        }

        // use `objc_msgSend` to avoid the potential memory leak issue of `performSelector:`
        typedef void (*Message)(id, SEL, id);
        Message func = (Message)objc_msgSend;
        func(self.target, self.selector, self);
    }
}

- (BOOL)isValid
{
    return [self.timer isValid];
}

- (void)invalidate
{
    @synchronized (self) {
        self.target = nil;
        self.selector = nil;
        [self.timer invalidate];
        self.timer = nil;
        self.isCountdownActive = NO;
    }
}

- (BOOL)isScheduled
{
    @synchronized (self) {
        if (!self.timer) {
            return NO;
        }
        CFRunLoopRef runLoopRef = [self.runloop getCFRunLoop];
        CFArrayRef arrayRef = CFRunLoopCopyAllModes(runLoopRef);
        CFIndex count = CFArrayGetCount(arrayRef);

        for (CFIndex i = 0; i < count; ++i) {
            CFStringRef runLoopMode = CFArrayGetValueAtIndex(arrayRef, i);
            if (CFRunLoopContainsTimer(runLoopRef, (__bridge CFRunLoopTimerRef)self.timer, runLoopMode)) {
                CFRelease(arrayRef);
                return YES;
            }
        }

        CFRelease(arrayRef);
        return NO;
    }
}

- (void)scheduleNow
{
    @synchronized (self) {
        if (![self.timer isValid]) {
            MPLogDebug(@"Could not schedule invalidated MPTimer (%p).", self);
            return;
        }

        if (self.isCountdownActive) {
            MPLogDebug(@"Tried to schedule an MPTimer (%p) that is already ticking.",self);
            return;
        }

        NSDate *newFireDate = [NSDate dateWithTimeInterval:self.timeInterval sinceDate:[NSDate date]];
        [self.timer setFireDate:newFireDate];

        if ([self isScheduled]) {
            MPLogDebug(@"MPTimer is already scheduled (%p).", self);
        } else {
            MPLogDebug(@"Start MPTimer (%p), should fire in %.1f seconds.", self, self.timeInterval);
            [self.runloop addTimer:self.timer forMode:self.runLoopMode];
        }

        self.isCountdownActive = YES;
    }
}

- (void)pause
{
    @synchronized (self) {
        if (!self.isCountdownActive) {
            MPLogDebug(@"No-op: tried to pause an MPTimer (%p) that was already paused.", self);
            return;
        }

        if (![self.timer isValid]) {
            MPLogDebug(@"Cannot pause invalidated MPTimer (%p).", self);
            return;
        }

        if (![self isScheduled]) {
            MPLogDebug(@"No-op: tried to pause an MPTimer (%p) that was never scheduled.", self);
            return;
        }

        // `fireDate` is the date which the timer will fire. If the timer is no longer valid, `fireDate`
        // is the last date at which the timer fired.
        NSTimeInterval secondsLeft = [[self.timer fireDate] timeIntervalSinceDate:[NSDate date]];
        if (secondsLeft <= 0) {
            MPLogInfo(@"An MPTimer was somehow paused after it was supposed to fire.");
        } else {
            MPLogDebug(@"Paused MPTimer (%p) %.1f seconds left before firing.", self, secondsLeft);
        }

        // Pause the timer by setting its fire date far into the future.
        [self.timer setFireDate:[NSDate distantFuture]];
        self.isCountdownActive = NO;
    }
}

- (void)resume
{
    [self scheduleNow];
}

@end
