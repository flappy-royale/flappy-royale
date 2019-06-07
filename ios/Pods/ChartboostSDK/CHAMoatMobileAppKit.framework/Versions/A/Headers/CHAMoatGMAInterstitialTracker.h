//
//  CHAMoatGMAInterstitialTracker.h
//  CHAMoatMobileAppKit
//
//  Created by Moat 565 on 12/16/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>

/** Tracker to be used for tracking Interstitial ad units served by the Google Mobile Ads SDK.
 *
 * There are no instance methods in this class, only class methods, so there is no reason to
 * create an instance of this class.
 */
@interface CHAMoatGMAInterstitialTracker : NSObject

/** Call to start tracking an interstitial ad.
 *
 * Should be called right before the screen with the interstitial ad is presented.
 * The standard place to call this method is from the GADInterstitialDelegate's 
 * interstitialWillPresentScreen callback method.
 */
+ (void)startTracking;

/** Call to stop tracking the current interstitial ad.
 *
 * Should be called when the screen with the interstitial ad is dismissed. 
 * The standard place to call this method is from the GADInterstitialDelegate's
 * interstitialDidDismissScreen callback method.
 */
+ (void)stopTracking;

@end
