//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_INTERSTITIAL_DELEGATE_H
#define IRONSOURCE_INTERSTITIAL_DELEGATE_H

#import <Foundation/Foundation.h>

@protocol ISInterstitialDelegate <NSObject>

@required
/**
 Called after an interstitial has been loaded
 */
- (void)interstitialDidLoad;

/**
 Called after an interstitial has attempted to load but failed.

 @param error The reason for the error
 */
- (void)interstitialDidFailToLoadWithError:(NSError *)error;

/**
 Called after an interstitial has been opened.
 */
- (void)interstitialDidOpen;

/**
  Called after an interstitial has been dismissed.
 */
- (void)interstitialDidClose;

/**
 Called after an interstitial has been displayed on the screen.
 */
- (void)interstitialDidShow;

/**
 Called after an interstitial has attempted to show but failed.

 @param error The reason for the error
 */
- (void)interstitialDidFailToShowWithError:(NSError *)error;

/**
 Called after an interstitial has been clicked.
 */
- (void)didClickInterstitial;

@end

#endif
