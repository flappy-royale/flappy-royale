//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IS_DEMAND_ONLY_REWARDEDVIDEO_DELEGATE_H
#define IS_DEMAND_ONLY_REWARDEDVIDEO_DELEGATE_H

#import <Foundation/Foundation.h>

@protocol ISDemandOnlyRewardedVideoDelegate <NSObject>
@required
- (void)rewardedVideoDidLoad:(NSString *)instanceId;

- (void)rewardedVideoDidFailToLoadWithError:(NSError *)error instanceId:(NSString *)instanceId;

- (void)rewardedVideoDidOpen:(NSString *)instanceId;

- (void)rewardedVideoDidClose:(NSString *)instanceId;

- (void)rewardedVideoDidFailToShowWithError:(NSError *)error instanceId:(NSString *)instanceId;

- (void)rewardedVideoDidClick:(NSString *)instanceId;

- (void)rewardedVideoAdRewarded:(NSString *)instanceId;

@end

#endif
