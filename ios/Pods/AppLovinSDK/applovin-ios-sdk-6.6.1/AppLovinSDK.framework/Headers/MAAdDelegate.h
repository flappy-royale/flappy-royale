//
//  MAAdDelegate.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "MAAd.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This protocol defines a listener intended to be notified about ad events.
 */
@protocol MAAdDelegate<NSObject>

/**
 * This method is called when a new ad has been loaded.
 */
- (void)didLoadAd:(MAAd *)ad;

/**
 * This method is called when an ad could not be retrieved.
 *
 * Common error codes:
 * 204 - no ad is available
 * 5xx - internal server error
 * negative number - internal errors
 *
 * @param adUnitIdentifier  Ad unit identifier for which the ad was requested.
 * @param errorCode         An error code representing the failure reason. Common error codes are defined in `MAErrorCode.h`.
 */
- (void)didFailToLoadAdForAdUnitIdentifier:(NSString *)adUnitIdentifier withErrorCode:(NSInteger)errorCode;

/**
 * This method is invoked when an ad is displayed.
 *
 * This method is invoked on the main UI thread.
 */
- (void)didDisplayAd:(MAAd *)ad;

/**
 * This method is invoked when an ad is hidden.
 *
 * This method is invoked on the main UI thread.
 */
- (void)didHideAd:(MAAd *)ad;

/**
 * This method is invoked when the ad is clicked.
 *
 * This method is invoked on the main UI thread.
 */
- (void)didClickAd:(MAAd *)ad;

/**
 * This method is invoked when the ad failed to displayed.
 *
 * This method is invoked on the main UI thread.
 *
 * @param ad        Ad that was just failed to display.
 * @param errorCode Error that indicates display failure. Common error codes are defined in `MAErrorCode.h`.
 */
- (void)didFailToDisplayAd:(MAAd *)ad withErrorCode:(NSInteger)errorCode;

@end

NS_ASSUME_NONNULL_END
