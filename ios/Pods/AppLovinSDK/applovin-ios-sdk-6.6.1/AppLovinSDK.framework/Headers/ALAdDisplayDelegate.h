//
//  ALAdDisplayDelegate.h
//  AppLovinSDK
//
//  Created by Basil on 3/23/12.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import <UIKit/UIView.h>
#import "ALAd.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This protocol defines a listener for ad display events. 
 */
@protocol ALAdDisplayDelegate <NSObject>

/**
 * This method is invoked when the ad is displayed in the view.
 *
 * This method is invoked on the main UI thread.
 * 
 * @param ad     Ad that was just displayed. Will not be nil.
 * @param view   Ad view in which the ad was displayed. Will not be nil.
 */
- (void)ad:(ALAd *)ad wasDisplayedIn:(UIView *)view;

/**
 * This method is invoked when the ad is hidden from in the view.
 * This occurs when the user "X's" out of an interstitial.
 *
 * This method is invoked on the main UI thread.
 * 
 * @param ad     Ad that was just hidden. Will not be nil.
 * @param view   Ad view in which the ad was hidden. Will not be nil.
 */
- (void)ad:(ALAd *)ad wasHiddenIn:(UIView *)view;

/**
 * This method is invoked when the ad is clicked from in the view.
 * 
 * This method is invoked on the main UI thread.
 *
 * @param ad     Ad that was just clicked. Will not be nil.
 * @param view   Ad view in which the ad was hidden. Will not be nil.
 */
- (void)ad:(ALAd *)ad wasClickedIn:(UIView *)view;

@end

NS_ASSUME_NONNULL_END
