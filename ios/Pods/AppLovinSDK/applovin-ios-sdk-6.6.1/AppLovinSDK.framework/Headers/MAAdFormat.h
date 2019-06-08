//
//  MAAdFormat.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * This class defines a format of an ad.
 */
@interface MAAdFormat : NSObject

/**
 * Represents a 320x50 banner advertisement.
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *banner;

/**
 * Represents a 300x250 rectangular advertisement.
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *mrec;

/**
 * Represents a 728x90 leaderboard advertisement (for tablets).
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *leader;

/**
 * Represents a full-screen advertisement.
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *interstitial;

/**
 * Similar to `MAAdFormat.interstitial`, except that users are given a reward at the end of the advertisement.
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *rewarded;

/**
 * Represents a native advertisement.
 */
@property (nonatomic, strong, readonly, class) MAAdFormat *native;


- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
