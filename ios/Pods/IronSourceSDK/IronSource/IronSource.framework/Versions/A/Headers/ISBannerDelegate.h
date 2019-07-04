//
//  ISBannerDelegate.h
//  IronSource
//
//  Created by Pnina Rapoport on 02/04/2017.
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef ISBannerDelegate_h
#define ISBannerDelegate_h

#import "ISBannerView.h"

@protocol ISBannerDelegate <NSObject>

@required
/**
 Called after a banner ad has been successfully loaded
 */
- (void)bannerDidLoad:(ISBannerView *)bannerView;

/**
 Called after a banner has attempted to load an ad but failed.
 
 @param error The reason for the error
 */
- (void)bannerDidFailToLoadWithError:(NSError *)error;

/**
 Called after a banner has been clicked.
 */
- (void)didClickBanner;

/**
 Called when a banner is about to present a full screen content.
 */
- (void)bannerWillPresentScreen;

/**
 Called after a full screen content has been dismissed.
 */
- (void)bannerDidDismissScreen;

/**
 Called when a user would be taken out of the application context.
 */
- (void)bannerWillLeaveApplication;

@end

#endif /* ISBannerDelegate_h */
