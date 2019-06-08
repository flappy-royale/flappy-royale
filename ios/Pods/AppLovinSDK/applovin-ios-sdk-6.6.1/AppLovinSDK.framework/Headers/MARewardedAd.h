//
//  MARewardedAd.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/9/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALSdk.h"
#import "MARewardedAdDelegate.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class represents a full screen rewarded ad.
 */
@interface MARewardedAd : NSObject

/**
 * Get an instance of rewarded ad.
 *
 * @param adUnitIdentifier Ad unit id for which to get the instance.
 *
 * @return An instance of rewarded ad tied to the specified ad unit ID.
 */
+ (instancetype)sharedWithAdUnitIdentifier:(NSString *)adUnitIdentifier;

/**
 * Get an instance of rewarded ad.
 *
 * @param adUnitIdentifier Ad unit id for which to get the instance.
 * @param sdk              SDK  to use.
 *
 * @return An instance of rewarded ad tied to the specified ad unit ID.
 */
+ (instancetype)sharedWithAdUnitIdentifier:(NSString *)adUnitIdentifier sdk:(ALSdk *)sdk;
- (instancetype)init NS_UNAVAILABLE;

/**
 * Set a delegate that will be notified about ad events.
 */
@property (nonatomic, weak, nullable) id<MARewardedAdDelegate> delegate;

/**
 * Set an extra parameter to pass to the server.
 *
 * @param key   Parameter key.
 * @param value Parameter value.
 */
- (void)setExtraParameterForKey:(NSString *)key value:(nullable NSString *)value;

/**
 * Load ad for the current rewarded ad. Use -[MARewardedAd delegate] to assign a delegate that should be notified about ad load state.
 */
- (void)loadAd;

/**
 * Show the loaded rewarded ad.
 *
 * Use -[MARewardedAd delegate] to assign a delegate that should be notified about display events.
 * Use -[MARewardedAd isReady] to check if an ad was successfully loaded.
 */
- (void)showAd;

/**
 * Show the loaded rewarded ad for a given placement to tie ad events to.
 *
 * Use -[MARewardedAd delegate] to assign a delegate that should be notified about display events.
 * Use -[MARewardedAd isReady] to check if an ad was successfully loaded.
 *
 * @param placement The placement to tie the showing ad's events to.
 */
- (void)showAdForPlacement:(nullable NSString *)placement;

/**
 * Check if this ad is ready to be shown.
 */
@property (nonatomic, assign, readonly, getter=isReady) BOOL ready;

@end

NS_ASSUME_NONNULL_END
