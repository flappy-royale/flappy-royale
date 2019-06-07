//
//  ALNativeAdService.h
//  AppLovinSDK
//
//  Created by Thomas So on 5/21/15.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALNativeAdLoadDelegate.h"
#import "ALNativeAdPrecacheDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@class ALSdk;
@class ALNativeAd;

@interface ALNativeAdService : NSObject

/**
 * Load a native ad asynchronously.
 *
 * @param delegate  The native ad load delegate to notify upon completion.
 */
- (void)loadNextAdAndNotify:(id<ALNativeAdLoadDelegate>)delegate;

/**
 * Pre-cache image and video resources of a native ad.
 *
 * @param ad        The native ad whose resources should be cached.
 * @param delegate  The delegate to be notified upon completion.
 */
- (void)precacheResourcesForNativeAd:(ALNativeAd *)ad andNotify:(nullable id<ALNativeAdPrecacheDelegate>)delegate;


- (instancetype)init __attribute__((unavailable("Access ALNativeAdService through ALSdk's nativeAdService property.")));

@end

@interface ALNativeAdService(ALDeprecated)
- (void)preloadAdForZoneIdentifier:(NSString *)zoneIdentifier __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use loadNextAdAndNotify: to load ads.");
- (BOOL)hasPreloadedAdForZoneIdentifier:(NSString *)zoneIdentifier __deprecated_msg("Manually preloading ads in the background has been deprecated and will be removed in a future SDK version. Please use loadNextAdAndNotify: to load ads.");
- (void)loadNativeAdGroupOfCount:(NSUInteger)numberOfAdsToLoad
                       andNotify:(nullable id<ALNativeAdLoadDelegate>)delegate
__deprecated_msg("Loading multiple native ads has been deprecated and will be removed in a future SDK version. Please use loadNextAdAndNotify: instead.");
- (void)loadNativeAdGroupOfCount:(NSUInteger)numberOfAdsToLoad
               forZoneIdentifier:(nullable NSString *)zoneIdentifier
                       andNotify:(nullable id<ALNativeAdLoadDelegate>)delegate
__deprecated_msg("Loading multiple native ads has been deprecated and will be removed in a future SDK version. Please use loadNextAdAndNotify: instead.");
@end

NS_ASSUME_NONNULL_END
