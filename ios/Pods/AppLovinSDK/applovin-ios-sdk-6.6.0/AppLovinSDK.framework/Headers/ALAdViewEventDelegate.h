//
//  ALAdViewEventDelegate.h
//  AppLovinSDK
//
//  Created by Thomas So on 6/23/17.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALAd.h"

@class ALAdView;

NS_ASSUME_NONNULL_BEGIN

/**
 *  This enum contains possible error codes that should be returned when the ad view fails to display an ad.
 */
typedef NS_ENUM(NSInteger, ALAdViewDisplayErrorCode)
{
    /**
     * The ad view failed to display an ad for an unspecified reason.
     */
    ALAdViewDisplayErrorCodeUnspecified
};

/**
 * This protocol defines a listener for ad view events.
 */
@protocol ALAdViewEventDelegate <NSObject>

@optional

/**
 * This method is invoked after the ad view presents fullscreen content.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad that the ad view presented fullscreen content for.
 * @param adView Ad view that presented fullscreen content.
 */
- (void)ad:(ALAd *)ad didPresentFullscreenForAdView:(ALAdView *)adView;

/**
 * This method is invoked before the fullscreen content is dismissed.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad for which the fullscreen content is to be dismissed for.
 * @param adView Ad view for which the fullscreen content it presented will be dismissed for.
 */
- (void)ad:(ALAd *)ad willDismissFullscreenForAdView:(ALAdView *)adView;

/**
 * This method is invoked after the fullscreen content is dismissed.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad for which the fullscreen content is dismissed for.
 * @param adView Ad view for which the fullscreen content it presented is dismissed for.
 */
- (void)ad:(ALAd *)ad didDismissFullscreenForAdView:(ALAdView *)adView;

/**
 * This method is invoked before the user is taken out of the application after a click.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad for which the user will be taken out of the application for.
 * @param adView Ad view containing the ad for which the user will be taken out of the application for.
 */
- (void)ad:(ALAd *)ad willLeaveApplicationForAdView:(ALAdView *)adView;

/**
 * This method is invoked after the user returns to the application after a click.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad for which the user will return to the application for.
 * @param adView Ad view containing the ad for which the user will return to the application for.
 */
- (void)ad:(ALAd *)ad didReturnToApplicationForAdView:(ALAdView *)adView;

/**
 * This method is invoked if the ad view fails to display an ad.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad for which the ad view failed to display for.
 * @param adView Ad view which failed to display the ad.
 * @param code   Error code specifying the reason why the ad view failed to display ad.
 */
- (void)ad:(ALAd *)ad didFailToDisplayInAdView:(ALAdView *)adView withError:(ALAdViewDisplayErrorCode)code;

@end

NS_ASSUME_NONNULL_END
