//
//  MAAdView.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/9/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ALSdk.h"
#import "MAAdViewAdDelegate.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class represents a view-based ad - i.e. banner, mrec or leader.
 */
@interface MAAdView : UIView

/**
 * Create a new ad view for a given ad unit id.
 *
 * @param adUnitIdentifier Ad unit id to load ads for.
 */
- (instancetype)initWithAdUnitIdentifier:(NSString *)adUnitIdentifier;

/**
 * Create a new ad view for a given ad unit id and sdk.
 *
 * @param adUnitIdentifier Ad unit id to load ads for.
 * @param sdk              SDK to use. An instance of the SDK may be obtained by calling +[ALSdk shared].
 */
- (instancetype)initWithAdUnitIdentifier:(NSString *)adUnitIdentifier sdk:(ALSdk *)sdk;

- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithFrame:(CGRect)frame NS_UNAVAILABLE;
- (instancetype)initWithCoder:(NSCoder *)decoder NS_UNAVAILABLE;

/**
 * Set a delegate that will be notified about ad events.
 */
@property (nonatomic, weak, nullable) IBOutlet id<MAAdViewAdDelegate> delegate;

/**
 * Set an extra parameter to pass to the server.
 *
 * @param key   Parameter key.
 * @param value Parameter value.
 */
- (void)setExtraParameterForKey:(NSString *)key value:(nullable NSString *)value;

/**
 * Load ad for the current ad view. Use {@link MAAdView:delegate} to assign a delegate that should be
 * notified about ad load state.
 */
- (void)loadAd;

/**
 * Starts or resumes auto-refreshing of the banner.
 */
- (void)startAutoRefresh;

/**
 * Pauses auto-refreshing of the banner.
 */
- (void)stopAutoRefresh;

/**
 * The placement to tie the future ad events to.
 */
@property (nonatomic, copy, nullable) NSString *placement;

@end

NS_ASSUME_NONNULL_END
