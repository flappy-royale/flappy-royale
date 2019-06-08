//
//  ALAdService.h
//  AppLovinSDK
//
//  Created by Basil on 2/27/12.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALAd.h"
#import "ALAdSize.h"
#import "ALAdLoadDelegate.h"
#import "ALAdDisplayDelegate.h"
#import "ALAdUpdateDelegate.h"
#import "ALAdVideoPlaybackDelegate.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class is responsible for providing and displaying ads.
 */
@interface ALAdService : NSObject

/**
 * @name Loading and Preloading Ads
 */

/**
 * Fetch a new ad, of a given size, notifying a supplied delegate on completion.
 *
 * @param adSize    Size of an ad to load. Must not be nil.
 * @param delegate  A callback to notify of the fact that the ad is loaded.
 */
- (void)loadNextAd:(ALAdSize *)adSize andNotify:(id<ALAdLoadDelegate>)delegate;

/**
 * Fetch a new ad, for a given zone, notifying a supplied delegate on completion.
 *
 * @param zoneIdentifier  The identifier of the zone to load an ad for. Must not be nil.
 * @param delegate        A callback to notify of the fact that the ad is loaded.
 */
- (void)loadNextAdForZoneIdentifier:(NSString *)zoneIdentifier andNotify:(id<ALAdLoadDelegate>)delegate;

- (instancetype)init __attribute__((unavailable("Access ALAdService through ALSdk's adService property.")));

@end

@interface ALAdService(ALMultizoneSupport)

/**
 * Generates a token used for advanced header bidding.
 */
@property (nonatomic, copy, readonly) NSString *bidToken;

/**
 * Fetch a new ad for the given ad token. Provided ad token must be received from AppLovin S2S API.
 *
 * <b>Please note:</b> this method is designed to be called by SDK mediation providers. Please use
 * <code>loadNextAdForZoneIdentifier:andNotify:</code> for regular integrations.
 *
 * @param adToken   Ad token returned from AppLovin S2S API. Must not be nil.
 * @param delegate  A callback to notify that the ad has been loaded. Must not be nil.
 */
- (void)loadNextAdForAdToken:(NSString *)adToken andNotify:(id<ALAdLoadDelegate>)delegate;

/**
 * Fetch a new ad for any of the provided zone identifiers.
 *
 * <b>Please note:</b> this method is designed to be called by SDK mediation providers. Please use
 * <code>loadNextAdForZoneIdentifier:andNotify:</code> for regular integrations.
 *
 * @param zoneIdentifiers  An array of zone identifiers for which an ad should be loaded. Must not be nil.
 * @param delegate         A callback to notify that the ad has been loaded. Must not be nil.
 */
- (void)loadNextAdForZoneIdentifiers:(NSArray<NSString *> *)zoneIdentifiers andNotify:(id<ALAdLoadDelegate>)delegate;

@end

@interface ALAdService(ALDeprecated)
- (void)preloadAdOfSize:(ALAdSize *)adSize __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use [ALAdService loadNextAd:andNotify:] to load ads to display.");
- (void)preloadAdForZoneIdentifier:(NSString *)zoneIdentifier __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use [ALAdService loadNextAdForZoneIdentifier:andNotify:] to load ads to display.");
- (BOOL)hasPreloadedAdOfSize:(ALAdSize *)adSize __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use [ALAdService loadNextAd:andNotify:] to load ads to display.");
- (BOOL)hasPreloadedAdForZoneIdentifier:(NSString *)zoneIdentifier __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use [ALAdService loadNextAdForZoneIdentifier:andNotify:] to load ads to display.");
- (void)addAdUpdateObserver:(id<ALAdUpdateObserver>)adListener ofSize:(ALAdSize *)adSize __deprecated_msg("Listening to ad updates has been deprecated. The `ALAdView` class for banners, leaderboards, and mrecs no longer automatically refresh contents by itself. You must explicitly call `[ALAdView loadNextAd]` or `[ALAdView renderAd: ...]`. This method will be removed in a future SDK version.");
- (void)removeAdUpdateObserver:(id<ALAdUpdateObserver>)adListener ofSize:(ALAdSize *)adSize __deprecated_msg("Listening to ad updates has been deprecated. The `ALAdView` class for banners, leaderboards, and mrecs no longer automatically refresh contents by itself. You must explicitly call `[ALAdView loadNextAd]` or `[ALAdView renderAd: ...]`. This method will be removed in a future SDK version.");
@end

extern NSString *const ALDeepLinkCommandNextAd;
extern NSString *const ALDeepLinkCommandCloseAd;
extern NSString *const ALDeepLinkCommandExpandAd;
extern NSString *const ALDeepLinkCommandContractAd;

NS_ASSUME_NONNULL_END
