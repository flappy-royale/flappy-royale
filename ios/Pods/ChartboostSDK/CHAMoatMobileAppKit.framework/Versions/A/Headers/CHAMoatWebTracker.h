//
//  CHAMoatWebTracker.h
//  CHAMoatMobileAppKit
//
//  Created by Moat on 6/2/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "CHAMoatBaseTracker.h"

/** Tracker for tracking Web View based ads.
 *
 * Web View based ads are ads that track:
 * 1. UIWebView class instances or subclasses of UIWebView
 * 2. WKWebiView class instances or subclasses of WKWebiView
 * 3. Google Mobile Ads (GMA) Banner ads, for example DFPBannerView
 * 4. Hybrid native-webview ads (a very rare case)
 *
 * Each tracker instance must be kept around for the lifetime of the ad impression that it is tracking.
 */
@interface CHAMoatWebTracker : CHAMoatBaseTracker

/** Creates tracker for tracking Web View based ads.
 *
 * @param webViewOrWebViewContainer the UIView that contains the WebView to be tracked
 * @return CHAMoatWebTracker instance
 */
+ (CHAMoatWebTracker *)trackerWithWebComponent:(UIView *)webViewOrWebViewContainer;

/** Creates tracker for tracking hybrid Web View based ads.
 *
 * Should only be used for ads that consist both of a native UIView and a web-based component.
 *
 * @param adView the UIView where the native ad is being shown
 * @param webViewOrWebViewContainer the WebView that is backing and tracking the native
 * @return CHAMoatWebTracker instance
 */
// Use this to track hybrid, two-view ads that consist both of a native UIView and a web-based component.
+ (CHAMoatWebTracker *)trackerWithAdView:(UIView *)adView withWebComponent:(UIView *)webViewOrWebViewContainer;

/** Call to start tracking the ad.
 *
 * Should be called at the start of an impression.
 */
- (bool)startTracking;

/** Call to stop tracking the ad.
 *
 * Should be called at the end of an impression.
 */
- (void)stopTracking;

@end
