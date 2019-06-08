//
//  MAAdViewAdDelegate.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "MAAdDelegate.h"
#import "MAAd.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This delegate is notified about ad view events.
 */
@protocol MAAdViewAdDelegate <MAAdDelegate>

/**
 * This method will be invoked when the `MAAdView` has expanded the full screen.
 *
 * @param ad An ad for which the ad view expanded for.
 */
- (void)didExpandAd:(MAAd *)ad;

/**
 * This method will be invoked when the `MAAdView` has collapsed back to its original size.
 *
 * @param ad An ad for which the ad view collapsed for.
 */
- (void)didCollapseAd:(MAAd *)ad;

@end

NS_ASSUME_NONNULL_END
