//
//  ALIncentivizedInterstitialAd.h
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALInterstitialAd.h"
#import "ALAdVideoPlaybackDelegate.h"
#import "ALAdDisplayDelegate.h"
#import "ALAdLoadDelegate.h"
#import "ALAdRewardDelegate.h"

NS_ASSUME_NONNULL_BEGIN

/**
 *  This class is used to show rewarded videos to the user. These differ from regular interstitials in that they allow you to provide you user virtual currency in exchange for watching a video.
 */
@interface ALIncentivizedInterstitialAd : NSObject

#pragma mark - Ad Delegates

/**
 *  An object conforming to the ALAdDisplayDelegate protocol, which, if set, will be notified of ad show/hide events.
 */
@property (strong, nonatomic, nullable) id<ALAdDisplayDelegate> adDisplayDelegate;

/**
 *  An object conforming to the ALAdVideoPlaybackDelegate protocol, which, if set, will be notified of video start/stop events.
 */
@property (strong, nonatomic, nullable) id<ALAdVideoPlaybackDelegate> adVideoPlaybackDelegate;

#pragma mark - Integration, Class Methods

/**
 * Get a reference to the shared instance of ALIncentivizedInterstitialAd.
 *
 * This wraps the [ALSdk shared] call, and will only work if you hve set your SDK key in Info.plist.
*/
+ (ALIncentivizedInterstitialAd *)shared;

/**
 * Pre-load an incentivized interstitial, and notify your provided Ad Load Delegate.
 *
 * Invoke once to preload, then do not invoke again until the ad has has been closed (e.g., ALAdDisplayDelegate's adWasHidden callback).
 * You may pass a nil argument to preloadAndNotify if you intend to use the synchronous ( isIncentivizedAdReady ) flow. Note that this is NOT recommended; we HIGHLY RECOMMEND you use an ad load delegate.
 * This method uses the shared instance, and will only work if you have set your SDK key in Info.plist.
 * Note that we internally try to pull down the next ad's resources before you need it. Therefore, this method may complete immediately in many circumstances.
 *
 * @param adLoadDelegate The delegate to notify that preloading was completed. May be nil.
 */
+ (void)preloadAndNotify:(nullable id<ALAdLoadDelegate>)adLoadDelegate;

/**
 * Check if an ad is currently ready on this object. You must call preloadAndNotify in order to reach this state.
 *
 * It is highly recommended that you implement an asynchronous flow (using an ALAdLoadDelegate with preloadAndNotify) rather than checking this property. This class does not contain a queue and can hold only one preloaded ad at a time. Therefore, you should NOT simply call preloadAndNotify: any time this method returns NO; it is important to invoke only one ad load - then not invoke any further loads until the ad has been closed (e.g., ALAdDisplayDelegate's adWasHidden callback).
 *
 * @return YES if an ad has been loaded into this incentivized interstitial and is ready to display. NO otherwise.
 */
+ (BOOL)isReadyForDisplay;

/**
 * Show an incentivized interstitial over the current key window, using the most recently pre-loaded ad.
 *
 * You must call preloadAndNotify before calling showOver.
 */
+ (void)show;

/**
 * Show an incentivized interstitial over the current key window, using the most recently pre-loaded ad.
 *
 * You must call preloadAndNotify before calling showOver.
 *
 * Using the ALAdRewardDelegate, you will be able to verify with AppLovin servers the the video view is legitimate,
 * as we will confirm whether the specific ad was actually served - then we will ping your server with a url for you to update
 * the user's balance. The Reward Validation Delegate will tell you whether we were able to reach our servers or not. If you receive
 * a successful response, you should refresh the user's balance from your server. For more info, see the documentation.
 *
 * @param adRewardDelegate The reward delegate to notify upon validating reward authenticity with AppLovin.
 *
 */
+ (void)showAndNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate;

#pragma mark - Integration, Instance Methods

/**
 * Initialize an incentivized interstitial with a specific custom SDK.
 *
 * This is necessary if you use <code>[ALSdk sharedWithKey: ...]</code>.
 *
 * @param sdk An SDK instance to use.
 */
- (instancetype)initWithSdk:(ALSdk *)sdk;

#pragma mark - Integration, zones

/**
 * Initialize an incentivized interstitial with a zone.
 *
 * @param zoneIdentifier The identifier of the zone for which to load ads for.
 */
- (instancetype)initWithZoneIdentifier:(NSString *)zoneIdentifier;

/**
 * Initialize an incentivized interstitial with a zone and a specific custom SDK.
 *
 * This is necessary if you use <code>[ALSdk sharedWithKey: ...]</code>.
 *
 * @param zoneIdentifier The identifier of the zone for which to load ads for.
 * @param sdk            An SDK instance to use.
 */
- (instancetype)initWithZoneIdentifier:(NSString *)zoneIdentifier sdk:(ALSdk *)sdk;

/**
 *  The zone identifier this incentivized ad was initialized with and is loading ads for, if any.
 */
@property (copy, nonatomic, readonly, nullable) NSString *zoneIdentifier;

/**
 * Pre-load an incentivized interstitial, and notify your provided Ad Load Delegate.
 *
 * Invoke once to preload, then do not invoke again until the ad has has been closed (e.g., ALAdDisplayDelegate's adWasHidden callback).
 * You may pass a nil argument to preloadAndNotify if you intend to use the synchronous ( isIncentivizedAdReady ) flow. Note that this is NOT recommended; we HIGHLY RECOMMEND you use an ad load delegate.
 * Note that we internally try to pull down the next ad's resources before you need it. Therefore, this method may complete immediately in many circumstances.
 *
 * @param adLoadDelegate The delegate to notify that preloading was completed.
 */
- (void)preloadAndNotify:(nullable id<ALAdLoadDelegate>)adLoadDelegate;

/**
 * Check if an ad is currently ready on this object. You must call preloadAndNotify in order to reach this state.
 *
 * It is highly recommended that you implement an asynchronous flow (using an ALAdLoadDelegate with preloadAndNotify) rather than checking this property. This class does not contain a queue and can hold only one preloaded ad at a time. Therefore, you should NOT simply call preloadAndNotify: any time this method returns NO; it is important to invoke only one ad load - then not invoke any further loads until the ad has been closed (e.g., ALAdDisplayDelegate's adWasHidden callback).
 *
 * @return YES if an ad has been loaded into this incentivized interstitial and is ready to display. NO otherwise.
 */
@property (readonly, atomic, getter=isReadyForDisplay) BOOL readyForDisplay;

/**
 * Show an incentivized interstitial over the current key window, using the most recently pre-loaded ad.
 *
 * You must call preloadAndNotify before calling showOver.
 */
- (void)show;

/**
 * Show an incentivized interstitial over the current key window, using the most recently pre-loaded ad.
 *
 * You must call preloadAndNotify before calling showOver.
 *
 * Using the ALAdRewardDelegate, you will be able to verify with AppLovin servers the the video view is legitimate,
 * as we will confirm whether the specific ad was actually served - then we will ping your server with a url for you to update
 * the user's balance. The Reward Validation Delegate will tell you whether we were able to reach our servers or not. If you receive
 * a successful response, you should refresh the user's balance from your server. For more info, see the documentation.
 *
 * @param adRewardDelegate The reward delegate to notify upon validating reward authenticity with AppLovin.
 *
 */
- (void)showAndNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate;

/**
 * Show an incentivized interstitial, using the most recently pre-loaded ad.
 *
 * You must call preloadAndNotify before calling showOver.
 *
 * Using the ALAdRewardDelegate, you will be able to verify with AppLovin servers that the video view is legitimate,
 * as we will confirm whether the specific ad was actually served - then we will ping your server with a url for you to update
 * the user's balance. The Reward Validation Delegate will tell you whether we were able to reach our servers or not. If you receive
 * a successful response, you should refresh the user's balance from your server. For more info, see the documentation.
 *
 * @param ad               The ad to render into this incentivized ad.
 * @param adRewardDelegate The reward delegate to notify upon validating reward authenticity with AppLovin.
 */
- (void)showAd:(ALAd *)ad andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate;

/**
 * Dismiss an incentivized interstitial prematurely, before video playback has completed.
 *
 * In most circumstances, this is not recommended, as it may confuse users by denying them a reward.
 */
- (void)dismiss;


- (instancetype)init __attribute__((unavailable("Use initWithSdk:, initWithZoneIdentifier:, or [ALIncentivizedInterstitialAd shared] instead.")));

@end

@interface ALIncentivizedInterstitialAd(ALDeprecated)
+ (void)showOverPlacement:(nullable NSString *)placement
__deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
+ (void)showOverPlacement:(nullable NSString *)placement andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate
__deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
+ (void)showOver:(UIWindow *)window placement:(nullable NSString *)placement andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate
__deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
- (void)showOver:(UIWindow *)window placement:(nullable NSString *)placement andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate
__deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
- (instancetype)initIncentivizedInterstitialWithSdk:(ALSdk *)sdk __deprecated_msg("Use initWithSdk:, initWithZoneIdentifier: or [ALIncentivizedInterstitialAd shared] instead.");

+ (void)showOver:(UIWindow *)window andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use showAndNotify: instead.");
- (void)showOver:(UIWindow *)window andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use showAndNotify: instead.");
- (void)showOver:(UIWindow *)window renderAd:(ALAd *)ad andNotify:(nullable id<ALAdRewardDelegate>)adRewardDelegate __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use showAd:andNotify: instead.");
@property (nonatomic, copy, nullable, class) NSString *userIdentifier __deprecated_msg("Please use -[ALSdk userIdentifier] instead to properly identify your users in our system. This property is now deprecated and will be removed in a future SDK version.");

@end

NS_ASSUME_NONNULL_END
