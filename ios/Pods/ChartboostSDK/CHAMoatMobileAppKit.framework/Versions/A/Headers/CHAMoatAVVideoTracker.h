//
//  CHAMoatAVVideoTracker.h
//  CHAMoatMobileAppKit
//
//  Created by Moat 740 on 1/24/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#import "CHAMoatBaseVideoTracker.h"
#import <AVFoundation/AVFoundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CHAMoatAVVideoTracker : CHAMoatBaseVideoTracker

/**
 Starts tracking with the given ad identifiers on the provided player.
 
 @param adIds Identifier dictionary to represent the ad.
 @param player AVPlayer to attach this tracker to.
 @param layer The layer that the AVPlayer is displayed on.
 @return Whether the tracker was successfully attached to the player.
 */

- (BOOL)trackVideoAd:(NSDictionary<NSString *, NSString *>*)adIds player:(AVPlayer *)player layer:(CALayer *)layer;

/**
 Changes the layer and containing view that the ad is being displayed on.
 
 @param targetLayer Layer for the tracker to get positional parameter tracking.
 */

- (void)changeTargetLayer:(CALayer *)targetLayer;

@end

NS_ASSUME_NONNULL_END
