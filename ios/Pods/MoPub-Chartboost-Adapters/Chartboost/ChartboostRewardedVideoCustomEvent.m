//
//  ChartboostRewardedVideoCustomEvent.m
//  MoPubSDK
//
//  Copyright (c) 2015 MoPub. All rights reserved.
//

#import "ChartboostRewardedVideoCustomEvent.h"
#import "ChartboostAdapterConfiguration.h"
#import "ChartboostRouter.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
    #import "MPRewardedVideoReward.h"
    #import "MPRewardedVideoError.h"
#endif
#import <Chartboost/Chartboost.h>

@interface ChartboostRewardedVideoCustomEvent () <ChartboostDelegate>
@property (nonatomic, copy) NSString *appId;
@end

@implementation ChartboostRewardedVideoCustomEvent

- (void)requestRewardedVideoWithCustomEventInfo:(NSDictionary *)info
{
    self.appId = [info objectForKey:@"appId"];

    NSString *appSignature = [info objectForKey:@"appSignature"];

    NSString *location = [info objectForKey:@"location"];
    self.location = [location length] != 0 ? location : CBLocationDefault;

    // Cache the network SDK initialization parameters
    [ChartboostAdapterConfiguration updateInitializationParameters:info];

    [[ChartboostRouter sharedRouter] cacheRewardedAdWithAppId:self.appId appSignature:appSignature location:self.location forChartboostRewardedVideoCustomEvent:self];
}

- (void)presentRewardedVideoFromViewController:(UIViewController *)viewController
{
    MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    if ([[ChartboostRouter sharedRouter] hasCachedRewardedVideoForLocation:self.location]) {
        [[ChartboostRouter sharedRouter] showRewardedVideoForLocation:self.location];
    } else {
        NSError *error = [NSError errorWithDomain:MoPubRewardedVideoAdsSDKDomain code:MPRewardedVideoAdErrorNoAdsAvailable userInfo:nil];
        [self.delegate rewardedVideoDidFailToPlayForCustomEvent:self error:error];
        MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
    }
}

- (void)handleCustomEventInvalidated
{
    [[[ChartboostRouter sharedRouter] rewardedVideoEvents] removeObjectForKey:self.location];
}

- (BOOL)hasAdAvailable
{
    return [[ChartboostRouter sharedRouter] hasCachedRewardedVideoForLocation:self.location];
}

- (void)handleAdPlayedForCustomEventNetwork
{
    // If we no longer have an ad available, report back up to the application that this ad expired.
    // We receive this message only when this ad has reported an ad has loaded and another ad unit
    // has played a video for the same ad network.
    if (![self hasAdAvailable]) {
        [self.delegate rewardedVideoDidExpireForCustomEvent:self];
    }
}

#pragma mark - ChartboostDelegate methods

- (void)didDisplayRewardedVideo:(CBLocation)location
{
    [self.delegate rewardedVideoWillAppearForCustomEvent:self];
    [self.delegate rewardedVideoDidAppearForCustomEvent:self];
    
    MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didCacheRewardedVideo:(CBLocation)location
{
    [self.delegate rewardedVideoDidLoadAdForCustomEvent:self];
    
    MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didFailToLoadRewardedVideo:(CBLocation)location
                         withError:(CBLoadError)error
{
    
    NSError *mopubError = [NSError errorWithDomain:MoPubRewardedVideoAdsSDKDomain code:MPRewardedVideoAdErrorNoAdsAvailable userInfo:nil];

    [self.delegate rewardedVideoDidFailToLoadAdForCustomEvent:self error:mopubError];
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:mopubError], [self getAdNetworkId]);
}

- (void)didDismissRewardedVideo:(CBLocation)location
{
    [self.delegate rewardedVideoWillDisappearForCustomEvent:self];
    MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    [self.delegate rewardedVideoDidDisappearForCustomEvent:self];
    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didCloseRewardedVideo:(CBLocation)location
{
    [self.delegate rewardedVideoWillDisappearForCustomEvent:self];
    MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    [self.delegate rewardedVideoDidDisappearForCustomEvent:self];
    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didClickRewardedVideo:(CBLocation)location
{
    [self.delegate rewardedVideoDidReceiveTapEventForCustomEvent:self];
    
    MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didCompleteRewardedVideo:(CBLocation)location
                      withReward:(int)reward
{
    [self.delegate rewardedVideoShouldRewardUserForCustomEvent:self reward:[[MPRewardedVideoReward alloc] initWithCurrencyAmount:@(reward)]];
}

- (NSString *) getAdNetworkId {
    return self.appId;
}

@end
