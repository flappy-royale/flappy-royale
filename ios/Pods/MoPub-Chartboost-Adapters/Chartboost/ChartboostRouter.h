//
//  ChartboostRouter.h
//  MoPubSDK
//
//  Copyright (c) 2015 MoPub. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <Chartboost/Chartboost.h>

@class ChartboostInterstitialCustomEvent;
@class ChartboostRewardedVideoCustomEvent;

/*
 * Maps all Chartboost locations for both interstitial and rewarded video ads to their
 * corresponding custom event objects. Also acts as primary Chartboost delegate and distributes
 * callbacks to their appropriate custom events.
 */
@interface ChartboostRouter : NSObject <ChartboostDelegate>

@property (nonatomic, strong) NSMutableDictionary *interstitialEvents;
@property (nonatomic, strong) NSMutableSet *activeInterstitialLocations;
@property (nonatomic, strong) NSMutableDictionary *rewardedVideoEvents;

+ (ChartboostRouter *)sharedRouter;
- (void)startWithAppId:(NSString *)appId appSignature:(NSString *)appSignature;


/*
 * Interstitial Ads
 */
- (void)cacheInterstitialWithAppId:(NSString *)appId appSignature:(NSString *)appSignature location:(NSString *)location forChartboostInterstitialCustomEvent:(ChartboostInterstitialCustomEvent *)event;
- (BOOL)hasCachedInterstitialForLocation:(NSString *)location;
- (void)showInterstitialForLocation:(NSString *)location;
- (void)unregisterInterstitialEvent:(ChartboostInterstitialCustomEvent *)event;

/*
 * Rewarded Video Ads
 */

- (void)cacheRewardedAdWithAppId:(NSString *)appId appSignature:(NSString *)appSignature location:(NSString *)location forChartboostRewardedVideoCustomEvent:(ChartboostRewardedVideoCustomEvent *)event;
- (BOOL)hasCachedRewardedVideoForLocation:(NSString *)location;
- (void)showRewardedVideoForLocation:(NSString *)location;


@end
