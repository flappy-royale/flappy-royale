//
//  MPRateLimitManager.m
//
//  Copyright 2018-2019 Twitter, Inc.
//  Licensed under the MoPub SDK License Agreement
//  http://www.mopub.com/legal/sdk-license-agreement/
//

#import "MPRateLimitManager.h"
#import "MPRateLimitConfiguration.h"

@interface MPRateLimitManager ()

// Ad Unit IDs are used as keys; @c MPRateLimitConfiguration objects are used as values
@property (nonatomic, strong) NSMutableDictionary <NSString *, MPRateLimitConfiguration *> * configurationDictionary;

@end

@implementation MPRateLimitManager

+ (instancetype)sharedInstance {
    static MPRateLimitManager * sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    if (self = [super init]) {
        _configurationDictionary = [NSMutableDictionary dictionary];
    }

    return self;
}

- (void)setRateLimitTimerWithAdUnitId:(NSString *)adUnitId milliseconds:(NSInteger)milliseconds reason:(NSString *)reason {
    @synchronized (self) {
        if (self.configurationDictionary[adUnitId] == nil) {
            self.configurationDictionary[adUnitId] = [[MPRateLimitConfiguration alloc] init];
        }

        MPRateLimitConfiguration * config = self.configurationDictionary[adUnitId];
        [config setRateLimitTimerWithMilliseconds:milliseconds reason:reason];
    }
}

- (BOOL)isRateLimitedForAdUnitId:(NSString *)adUnitId {
    return self.configurationDictionary[adUnitId].isRateLimited;
}

- (NSUInteger)lastRateLimitMillisecondsForAdUnitId:(NSString *)adUnitId {
    return self.configurationDictionary[adUnitId].lastRateLimitMilliseconds;
}

- (NSString *)lastRateLimitReasonForAdUnitId:(NSString *)adUnitId {
    return self.configurationDictionary[adUnitId].lastRateLimitReason;
}

@end
