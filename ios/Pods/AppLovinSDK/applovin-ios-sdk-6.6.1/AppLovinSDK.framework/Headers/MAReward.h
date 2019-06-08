//
//  MAReward.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * This object represents a reward given to the user.
 */
@interface MAReward : NSObject

/**
 * This the label that is used when a label is not given by the third-party network.
 */
@property (nonatomic, copy, readonly, class) NSString *defaultLabel;

/**
 * This is the amount that is used when no amount is given by the third-party network.
 */
@property (nonatomic, assign, readonly, class) NSInteger defaultAmount;

/**
 * Get rewarded label or `MAReward.defaultLabel` if none specified.
 */
@property (nonatomic, copy, readonly) NSString *label;

/**
 * Get rewarded amount or `MAReward.defaultAmount` if none specified.
 */
@property (nonatomic, assign, readonly) NSInteger amount;


+ (instancetype)reward;
+ (instancetype)rewardWithAmount:(NSInteger)amount label:(NSString *)label;

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
