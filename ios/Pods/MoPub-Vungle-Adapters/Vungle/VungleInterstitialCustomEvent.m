//
//  VungleInterstitialCustomEvent.m
//  MoPubSDK
//
//  Copyright (c) 2013 MoPub. All rights reserved.
//

#import <VungleSDK/VungleSDK.h>
#import "VungleInterstitialCustomEvent.h"
#import "VungleAdapterConfiguration.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
    #import "MoPub.h"
#endif
#import "VungleRouter.h"

// If you need to play ads with vungle options, you may modify playVungleAdFromRootViewController and create an options dictionary and call the playAd:withOptions: method on the vungle SDK.

@interface VungleInterstitialCustomEvent () <VungleRouterDelegate>

@property (nonatomic, assign) BOOL handledAdAvailable;
@property (nonatomic, copy) NSString *placementId;
@property (nonatomic, copy) NSDictionary *options;

@end

@implementation VungleInterstitialCustomEvent


#pragma mark - MPInterstitialCustomEvent Subclass Methods

- (void)requestInterstitialWithCustomEventInfo:(NSDictionary *)info
{
    self.placementId = [info objectForKey:kVunglePlacementIdKey];

    self.handledAdAvailable = NO;
    
    // Cache the initialization parameters
    [VungleAdapterConfiguration updateInitializationParameters:info];
    
    MPLogAdEvent([MPLogEvent adLoadAttemptForAdapter:NSStringFromClass(self.class) dspCreativeId:nil dspName:nil], self.placementId);
    [[VungleRouter sharedRouter] requestInterstitialAdWithCustomEventInfo:info delegate:self];
}

- (void)showInterstitialFromRootViewController:(UIViewController *)rootViewController
{
    if ([[VungleRouter sharedRouter] isAdAvailableForPlacementId:self.placementId]) {
        
        if (self.options) {
            // In the event that options have been updated
            self.options = nil;
        }
        
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        
        // VunglePlayAdOptionKeyUser
        if ([[NSUserDefaults standardUserDefaults] objectForKey:kVungleUserId]) {
            NSString *userID = [[NSUserDefaults standardUserDefaults] objectForKey:kVungleUserId];
            if (userID.length > 0) {
                options[VunglePlayAdOptionKeyUser] = userID;
            }
        }
        
        // Ordinal
        if ([[NSUserDefaults standardUserDefaults] objectForKey:kVungleOrdinal]) {
            NSNumber *ordinalPlaceholder = [NSNumber numberWithLongLong:[[[NSUserDefaults standardUserDefaults] objectForKey:kVungleOrdinal] longLongValue]];
            NSUInteger ordinal = ordinalPlaceholder.unsignedIntegerValue;
            if (ordinal > 0) {
                options[VunglePlayAdOptionKeyOrdinal] = @(ordinal);
            }
        }
        
        // FlexVieAutoDismissSeconds
        if ([[NSUserDefaults standardUserDefaults] objectForKey:kVungleFlexViewAutoDismissSeconds]) {
            NSTimeInterval flexDismissTime = [[[NSUserDefaults standardUserDefaults] objectForKey:kVungleFlexViewAutoDismissSeconds] floatValue];
            if (flexDismissTime > 0) {
                options[VunglePlayAdOptionKeyFlexViewAutoDismissSeconds] = @(flexDismissTime);
            }
        }

        self.options = options.count ? options : nil;
        
        MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], self.placementId);
        [[VungleRouter sharedRouter] presentInterstitialAdFromViewController:rootViewController options:self.options forPlacementId:self.placementId];
    } else {
        NSError *error = [NSError errorWithCode:MOPUBErrorAdapterFailedToLoadAd localizedDescription:@"Failed to show Vungle video interstitial: Vungle now claims that there is no available video ad."];
        MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
        [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
    }
}

- (void)invalidate
{
    [[VungleRouter sharedRouter] clearDelegateForPlacementId:self.placementId];
}

#pragma mark - VungleRouterDelegate

- (void)vungleAdDidLoad
{
    if (!self.handledAdAvailable) {
        self.handledAdAvailable = YES;
        MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], self.placementId);
        [self.delegate interstitialCustomEvent:self didLoadAd:nil];
    }
}

- (void)vungleAdWillAppear
{

    MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate interstitialCustomEventWillAppear:self];
    MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], self.placementId);
    MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate interstitialCustomEventDidAppear:self];
}

- (void)vungleAdWillDisappear
{
    MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate interstitialCustomEventWillDisappear:self];
}

- (void)vungleAdDidDisappear
{
    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate interstitialCustomEventDidDisappear:self];
}

- (void)vungleAdWasTapped
{
    MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate interstitialCustomEventDidReceiveTapEvent:self];
}

- (void)vungleAdDidFailToLoad:(NSError *)error
{
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
    [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
}

- (void)vungleAdDidFailToPlay:(NSError *)error
{
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
    [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
}

@end
