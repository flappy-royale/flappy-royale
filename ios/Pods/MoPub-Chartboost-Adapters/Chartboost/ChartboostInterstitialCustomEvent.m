//
//  ChartboostInterstitialCustomEvent.m
//  MoPubSDK
//
//  Copyright (c) 2012 MoPub, Inc. All rights reserved.
//

#import "ChartboostInterstitialCustomEvent.h"
#import "ChartboostAdapterConfiguration.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
#endif
#import "ChartboostRouter.h"
#import <Chartboost/Chartboost.h>

static NSString *appId = nil;

#define kChartboostAppID        @"YOUR_CHARTBOOST_APP_ID"
#define kChartboostAppSignature @"YOUR_CHARTBOOST_APP_SIGNATURE"

@interface ChartboostInterstitialCustomEvent () <ChartboostDelegate>
@end

@implementation ChartboostInterstitialCustomEvent

+ (void)setAppId:(NSString *)appId
{
    MPLogInfo(@"+setAppId for class ChartboostInterstitialCustomEvent is deprecated. Use the appId parameter when configuring your network in the MoPub UI.");
}

+ (void)setAppSignature:(NSString *)appSignature
{
    MPLogInfo(@"+setAppSignature for class ChartboostInterstitialCustomEvent is deprecated. Use the appSignature parameter when configuring your network in the MoPub UI.");
}

- (void)invalidate
{
    [[ChartboostRouter sharedRouter] unregisterInterstitialEvent:self];
    self.location = nil;
}

#pragma mark - MPInterstitialCustomEvent Subclass Methods

- (void)requestInterstitialWithCustomEventInfo:(NSDictionary *)info
{
    appId = [info objectForKey:@"appId"];
    if (!appId) {

        if ([appId length] == 0) {
            MPLogInfo(@"Setting kChartboostAppId in ChartboostInterstitialCustomEvent.m is deprecated. Use the appId parameter when configuring your network in the MoPub UI.");
            appId = kChartboostAppID;
        }
    }
    NSString *appSignature = [info objectForKey:@"appSignature"];
    if (!appSignature) {

        if ([appSignature length] == 0) {
            MPLogInfo(@"Setting kChartboostAppSignature in ChartboostInterstitialCustomEvent.m is deprecated. Use the appSignature parameter when configuring your network in the MoPub UI.");
            appSignature = kChartboostAppSignature;
        }
    }
    NSString *location = [info objectForKey:@"location"];
    self.location = [location length] != 0 ? location : CBLocationDefault;
    
    // Cache the network SDK initialization parameters
    [ChartboostAdapterConfiguration updateInitializationParameters:info];

    [[ChartboostRouter sharedRouter] cacheInterstitialWithAppId:appId
                                                     appSignature:appSignature
                                                         location:self.location
                             forChartboostInterstitialCustomEvent:self];
}

- (void)showInterstitialFromRootViewController:(UIViewController *)rootViewController
{
    MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    if ([[ChartboostRouter sharedRouter] hasCachedInterstitialForLocation:self.location]) {

        [[ChartboostRouter sharedRouter] showInterstitialForLocation:self.location];
    } else {        
        NSError *error = [self createErrorWith:@"Failed to show Chartboost interstitial"
                                     andReason:@""
                                 andSuggestion:@""];
        
        [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
        MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
    }
}

- (NSError *)createErrorWith:(NSString *)description andReason:(NSString *)reaason andSuggestion:(NSString *)suggestion {
    NSDictionary *userInfo = @{
                               NSLocalizedDescriptionKey: NSLocalizedString(description, nil),
                               NSLocalizedFailureReasonErrorKey: NSLocalizedString(reaason, nil),
                               NSLocalizedRecoverySuggestionErrorKey: NSLocalizedString(suggestion, nil)
                               };

    return [NSError errorWithDomain:NSStringFromClass([self class]) code:0 userInfo:userInfo];
}

#pragma mark - ChartboostDelegate

- (void)didCacheInterstitial:(CBLocation)location
{
    MPLogInfo(@"Successfully loaded Chartboost interstitial. Location: %@", location);

    [self.delegate interstitialCustomEvent:self didLoadAd:nil];
    MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didFailToLoadInterstitial:(CBLocation)location withError:(CBLoadError)error
{
    NSString *failureReason = [NSString stringWithFormat:@"Failed to load Chartboost interstitial. Location: %@", location];
    NSError *mopubError = [self createErrorWith:failureReason
                                 andReason:@""
                             andSuggestion:@""];

    [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:mopubError];
    MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:mopubError], [self getAdNetworkId]);
}

- (void)didDismissInterstitial:(CBLocation)location
{
    MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    MPLogInfo(@"Chartboost interstitial was dismissed. Location: %@", location);

    // Chartboost doesn't seem to have a separate callback for the "will disappear" event, so we
    // signal "will disappear" manually.

    [self.delegate interstitialCustomEventWillDisappear:self];
    [self.delegate interstitialCustomEventDidDisappear:self];

    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didDisplayInterstitial:(CBLocation)location
{
    MPLogInfo(@"Chartboost interstitial was displayed. Location: %@", location);

    // Chartboost doesn't seem to have a separate callback for the "will appear" event, so we
    // signal "will appear" manually.

    [self.delegate interstitialCustomEventWillAppear:self];
    [self.delegate interstitialCustomEventDidAppear:self];
    
    MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)didClickInterstitial:(CBLocation)location
{
    MPLogInfo(@"Chartboost interstitial was clicked. Location: %@", location);
    [self.delegate interstitialCustomEventDidReceiveTapEvent:self];
    
    MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (NSString *) getAdNetworkId {
    return appId;
}

@end
