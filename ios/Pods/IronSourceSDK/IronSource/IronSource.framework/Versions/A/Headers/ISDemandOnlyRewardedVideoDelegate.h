//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IS_DEMAND_ONLY_REWARDEDVIDEO_DELEGATE_H
#define IS_DEMAND_ONLY_REWARDEDVIDEO_DELEGATE_H

#import <Foundation/Foundation.h>

@class ISPlacementInfo;

@protocol ISDemandOnlyRewardedVideoDelegate <NSObject>

@required
/**
 Called after a rewarded video has changed its availability.
 
 @param available The new rewarded video availability. YES if available and ready to be shown, NO otherwise.
 */
- (void)rewardedVideoHasChangedAvailability:(BOOL)available instanceId:(NSString *)instanceId;

/**
  Called after a rewarded video has been viewed completely and the user is eligible for reward.

 @param placementInfo An object that contains the placement's reward name and amount.
 */
- (void)didReceiveRewardForPlacement:(ISPlacementInfo *)placementInfo instanceId:(NSString *)instanceId;

/**
 Called after a rewarded video has attempted to show but failed.
 
 @param error The reason for the error
 */
- (void)rewardedVideoDidFailToShowWithError:(NSError *)error instanceId:(NSString *)instanceId;

/**
 Called after a rewarded video has been opened.
 */
- (void)rewardedVideoDidOpen:(NSString *)instanceId;

/**
 Called after a rewarded video has been dismissed.
 */
- (void)rewardedVideoDidClose:(NSString *)instanceId;

/**
 Called after a video has been clicked.
 */
- (void)didClickRewardedVideo:(ISPlacementInfo *)placementInfo instanceId:(NSString *)instanceId;

@end

#endif
