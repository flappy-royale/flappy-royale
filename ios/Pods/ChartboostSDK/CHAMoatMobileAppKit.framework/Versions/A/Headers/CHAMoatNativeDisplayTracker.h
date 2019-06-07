//
// Created by Moat on 2/24/15.
// Copyright © 2016 Moat. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CHAMoatBaseTracker.h"

/** Tracker for tracking Native ads - ads that are rendered using native UI elements rather than a WebView.
 * 
 * The class creates an internally managed WebView instance, loads our JavaScript tag into it, and then dispatches
 * viewability-related signals (pertaining to the native ad it is tracking) into that WebView.
 *
 * @warning Web-based ads, including "opaque" web containers (Google's DFPBannerView, etc.) 
 * are best tracked using MoatWebTracker instead
 */
@interface CHAMoatNativeDisplayTracker : CHAMoatBaseTracker

/** Creates tracker for tracking native ads.
 *
 * @param adView the UIView that renders the ad. Accepts any UIView.
 * @param adIds information to identify and segment the ad
 * @return CHAMoatNativeDisplayTracker instance
 */
+ (CHAMoatNativeDisplayTracker *)trackerWithAdView:(UIView *)adView withAdIds:(NSDictionary *)adIds;

/** Call to start tracking the ad.
 *
 * Should be called at the start of an impression.
 */
- (void)startTracking;

/** Call to stop tracking the ad.
 *
 * Should be called at the end of an impression.
 */
- (void)stopTracking;

@end
