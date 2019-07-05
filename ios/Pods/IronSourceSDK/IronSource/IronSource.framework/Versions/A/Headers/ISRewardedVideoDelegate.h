//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_REWARDEDVIDEO_DELEGATE_H
#define IRONSOURCE_REWARDEDVIDEO_DELEGATE_H

#import <Foundation/Foundation.h>

@class ISPlacementInfo;

@protocol ISRewardedVideoDelegate <NSObject>

@required
/**
 Called after a rewarded video has changed its availability.
 
 @param available The new rewarded video availability. YES if available and ready to be shown, NO otherwise.
 */
- (void)rewardedVideoHasChangedAvailability:(BOOL)available;

/**
  Called after a rewarded video has been viewed completely and the user is eligible for reward.

 @param placementInfo An object that contains the placement's reward name and amount.
 */
- (void)didReceiveRewardForPlacement:(ISPlacementInfo *)placementInfo;

/**
 Called after a rewarded video has attempted to show but failed.
 
 @param error The reason for the error
 */
- (void)rewardedVideoDidFailToShowWithError:(NSError *)error;

/**
 Called after a rewarded video has been opened.
 */
- (void)rewardedVideoDidOpen;

/**
 Called after a rewarded video has been dismissed.
 */
- (void)rewardedVideoDidClose;

/**
 * Note: the events below are not available for all supported rewarded video ad networks.
 * Check which events are available per ad network you choose to include in your build.
 * We recommend only using events which register to ALL ad networks you include in your build.
 */

/**
 Called after a rewarded video has started playing.
 */
- (void)rewardedVideoDidStart;

/**
 Called after a rewarded video has finished playing.
 */
- (void)rewardedVideoDidEnd;

/**
 Called after a video has been clicked.
 */
- (void)didClickRewardedVideo:(ISPlacementInfo *)placementInfo;

@end

#endif
