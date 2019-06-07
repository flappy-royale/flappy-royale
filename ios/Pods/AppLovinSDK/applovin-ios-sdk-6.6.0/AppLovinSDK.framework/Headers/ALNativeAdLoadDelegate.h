//
//  ALNativeAdGroupLoadDelegate.h
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALNativeAd.h"

NS_ASSUME_NONNULL_BEGIN

@class ALNativeAdService;

@protocol ALNativeAdLoadDelegate

/**
 *  This method is invoked when the native ad service loads an ad.
 *
 *  @param service      Native ad service which loaded the ad.
 *  @param ads          NSArray containing ALNativeAds which were loaded.
 */
- (void)nativeAdService:(ALNativeAdService *)service didLoadAds:(NSArray * /* of ALNativeAd */) ads;

/**
 *  This method is invoked when the native ad service fails to load ad.
 *
 *  @param service      Native ad service which loaded the ad.
 *  @param code         An error code corresponding with a constant defined in <code>ALErrorCodes.h</code>.
 */
- (void)nativeAdService:(ALNativeAdService *)service didFailToLoadAdsWithError:(NSInteger)code;

@end

NS_ASSUME_NONNULL_END
