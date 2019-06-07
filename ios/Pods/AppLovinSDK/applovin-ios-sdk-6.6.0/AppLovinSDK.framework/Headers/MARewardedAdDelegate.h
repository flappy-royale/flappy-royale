//
//  MARewardedAdDelegate.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "MAAdDelegate.h"
#import "MAReward.h"
#import "MAAd.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This delegate is intended to be notified when a user watches a rewarded video and whether a reward was granted or rejected.
 */
@protocol MARewardedAdDelegate <MAAdDelegate>

/**
 * This method will be invoked when rewarded video has started.
 */
- (void)didStartRewardedVideoForAd:(MAAd *)ad;

/**
 * This method will be invoked when rewarded video has completed.
 */
- (void)didCompleteRewardedVideoForAd:(MAAd *)ad;

/**
 * This method will be invoked when a user should be granted a reward.
 *
 * @param ad     Ad for which reward ad was rewarded for.
 * @param reward The reward to be granted to the user.
 */
- (void)didRewardUserForAd:(MAAd *)ad withReward:(MAReward *)reward;

@end

NS_ASSUME_NONNULL_END
