//
//  VungleRewardedVideoCustomEvent.m
//  MoPubSDK
//
//  Copyright (c) 2015 MoPub. All rights reserved.
//

#import "VungleRewardedVideoCustomEvent.h"
#import "VungleAdapterConfiguration.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
    #import "MPError.h"
    #import "MPRewardedVideoReward.h"
    #import "MPRewardedVideoError.h"
    #import "MoPub.h"
#endif
#import <VungleSDK/VungleSDK.h>
#import "VungleRouter.h"
#import "VungleInstanceMediationSettings.h"

@interface VungleRewardedVideoCustomEvent ()  <VungleRouterDelegate>

@property (nonatomic, copy) NSString *placementId;

@end

@implementation VungleRewardedVideoCustomEvent


- (void)initializeSdkWithParameters:(NSDictionary *)parameters
{
    [[VungleRouter sharedRouter] initializeSdkWithInfo:parameters];
}

- (void)requestRewardedVideoWithCustomEventInfo:(NSDictionary *)info
{
    self.placementId = [info objectForKey:kVunglePlacementIdKey];

    // Cache the initialization parameters
    [VungleAdapterConfiguration updateInitializationParameters:info];

    MPLogAdEvent([MPLogEvent adLoadAttemptForAdapter:NSStringFromClass(self.class) dspCreativeId:nil dspName:nil], self.placementId);
    [[VungleRouter sharedRouter] requestRewardedVideoAdWithCustomEventInfo:info delegate:self];
}

- (BOOL)hasAdAvailable
{
    return [[VungleSDK sharedSDK] isAdCachedForPlacementID:self.placementId];
}

- (void)presentRewardedVideoFromViewController:(UIViewController *)viewController
{
    MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], self.placementId);
    if ([[VungleRouter sharedRouter] isAdAvailableForPlacementId:self.placementId]) {
        VungleInstanceMediationSettings *settings = [self.delegate instanceMediationSettingsForClass:[VungleInstanceMediationSettings class]];

        NSString *customerId = [self.delegate customerIdForRewardedVideoCustomEvent:self];
        [[VungleRouter sharedRouter] presentRewardedVideoAdFromViewController:viewController customerId:customerId settings:settings forPlacementId:self.placementId];
    } else {
        NSError *error = [NSError errorWithCode:MPRewardedVideoAdErrorNoAdsAvailable localizedDescription:@"Failed to show Vungle rewarded video: Vungle now claims that there is no available video ad."];
        MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
        [self.delegate rewardedVideoDidFailToPlayForCustomEvent:self error:error];
    }
}

- (void)handleCustomEventInvalidated
{
    [[VungleRouter sharedRouter] clearDelegateForPlacementId:self.placementId];
}

- (void)handleAdPlayedForCustomEventNetwork
{
    //empty implementation
}

#pragma mark - MPVungleDelegate

- (void)vungleAdDidLoad
{
    MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoDidLoadAdForCustomEvent:self];
}
- (void)vungleAdWillAppear
{
    MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoWillAppearForCustomEvent:self];
    MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], self.placementId);
    MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoDidAppearForCustomEvent:self];
}
- (void)vungleAdWillDisappear
{
    MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoWillDisappearForCustomEvent:self];
}

- (void)vungleAdDidDisappear
{
    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoDidDisappearForCustomEvent:self];
}

- (void)vungleAdWasTapped
{
    MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], self.placementId);
    [self.delegate rewardedVideoDidReceiveTapEventForCustomEvent:self];
}

- (void)vungleAdShouldRewardUser
{
    [self.delegate rewardedVideoShouldRewardUserForCustomEvent:self reward:[[MPRewardedVideoReward alloc] initWithCurrencyAmount:@(kMPRewardedVideoRewardCurrencyAmountUnspecified)]];
}


- (void)vungleAdDidFailToLoad:(NSError *)error
{
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
    [self.delegate rewardedVideoDidFailToLoadAdForCustomEvent:self error:error];
}

- (void)vungleAdDidFailToPlay:(NSError *)error
{
    MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], self.placementId);
    [self.delegate rewardedVideoDidFailToPlayForCustomEvent:self error:error];
}

@end
