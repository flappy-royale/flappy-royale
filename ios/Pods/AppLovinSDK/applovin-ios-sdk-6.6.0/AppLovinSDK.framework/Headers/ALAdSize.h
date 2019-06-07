//
//  ALAdSize.h
//  AppLovinSDK
//
//  Created by Basil on 2/27/12.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * This class defines a size of an ad to be displayed. It is recommended to use default sizes that are
 * declared in this class (<code>BANNER</code>, <code>INTERSTITIAL</code>)
 */
@interface ALAdSize : NSObject <NSCopying>

/**
 * @name Ad Size Identification
 */

/**
 *  An <code>NSString</code> label which describes this ad size.
 */
@property (copy, nonatomic, readonly) NSString *label;

/**
 * @name Supported Ad Size Singletons
 */

/**
 *  Retrieve a singleton instance of the <code>BANNER</code> ad size object.
 *
 *  Banners are typically 320x50 ads added to the bottom of the view.
 *
 *  @return An instance of ALAdSize which represents the size <code>BANNER</code>.
 */
+ (ALAdSize *)sizeBanner;

/**
 *  Retrieve a singleton instance of the <code>INTERSTITIAL</code> ad size object.
 *
 *  Interstitials are full-screen ads with high click-through rates which will fully cover the <code>UIViewController</code> below.
 *
 *  @return An instance of ALAdSize which represents the size <code>INTERSTITIAL</code>.
 */
+ (ALAdSize *)sizeInterstitial;

/**
 *  Retrieve a singleton instance of the <code>NATIVE</code> ad size object.
 *
 *  @return An instance of ALAdSize which represents the size <code>NATIVE</code>.
 */
+ (ALAdSize *)sizeNative;

/**
 *  Retrieve a singleton instance of the <code>MREC</code> ad size object.
 *
 *  MRECs are 300x250 (mostly square) advertisements.
 *
 *  @return An instance of ALAdSize which represents the size <code>MREC</code>.
 */
+ (ALAdSize *)sizeMRec;

/**
 *  Retrieve a singleton instance of the <code>LEADER</code> ad size object.
 *
 *  Leaderboard ads are 728x90 ads intended for iPads.
 *
 *  @return An instance of ALAdSize which represents the size <code>LEADER</code>.
 */
+ (ALAdSize *)sizeLeader;

- (id)init __attribute__((unavailable("Do not alloc-init your own instances; use an existing singleton size like [ALAdSize sizeBanner]")));

@end

@interface ALAdSize(ALDeprecated)
@property (assign, nonatomic, readonly) CGFloat width __deprecated;
@property (assign, nonatomic, readonly) CGFloat height __deprecated;
+ (NSArray *)allSizes __deprecated_msg("Retrieval of all sizes is deprecated and will be removed in a future SDK version.");
+ (ALAdSize *)sizeWithLabel:(NSString *)label orDefault:(ALAdSize *)defaultSize __deprecated_msg("Custom ad sizes are no longer supported; use an existing singleton size like [ALAdSize sizeBanner]");
@end

NS_ASSUME_NONNULL_END
