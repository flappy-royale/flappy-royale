//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IS_DEMAND_ONLY_INSTINTERSTITIAL_DELEGATE_H
#define IS_DEMAND_ONLY_INSTINTERSTITIAL_DELEGATE_H

@protocol ISDemandOnlyInterstitialDelegate <NSObject>

@required
/**
 Called after an interstitial has been loaded
 */
- (void)interstitialDidLoad:(NSString *)instanceId;

/**
 Called after an interstitial has attempted to load but failed.

 @param error The reason for the error
 */
- (void)interstitialDidFailToLoadWithError:(NSError *)error instanceId:(NSString *)instanceId;

/**
 Called after an interstitial has been opened.
 */
- (void)interstitialDidOpen:(NSString *)instanceId;

/**
  Called after an interstitial has been dismissed.
 */
- (void)interstitialDidClose:(NSString *)instanceId;

/**
 Called after an interstitial has been displayed on the screen.
 */
- (void)interstitialDidShow:(NSString *)instanceId;

/**
 Called after an interstitial has attempted to show but failed.

 @param error The reason for the error
 */
- (void)interstitialDidFailToShowWithError:(NSError *)error instanceId:(NSString *)instanceId;

/**
 Called after an interstitial has been clicked.
 */
- (void)didClickInterstitial:(NSString *)instanceId;

@end

#endif
