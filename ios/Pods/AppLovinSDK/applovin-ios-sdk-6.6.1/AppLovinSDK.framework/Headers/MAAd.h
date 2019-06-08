//
//  MAAd.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/10/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "MAAdFormat.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class represents an ad that has been served by AppLovin's mediation server and should be displayed to the user.
 */
@interface MAAd : NSObject

/**
 * Get format of this ad.
 */
@property (nonatomic, strong, readonly) MAAdFormat *format;

/**
 * The ad unit id for which this ad was loaded.
 */
@property (nonatomic, copy, readonly) NSString *adUnitIdentifier;

/**
 * Check if this ad is ready to be shown.
 */
@property (nonatomic, assign, readonly, getter=isReady) BOOL ready;

@end

NS_ASSUME_NONNULL_END
