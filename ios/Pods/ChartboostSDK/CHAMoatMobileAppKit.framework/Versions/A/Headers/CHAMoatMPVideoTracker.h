//
//  CHAMoatMPVideoTracker.h
//  CHAMoatMobileAppKit
//
//  Created by Moat 740 on 1/24/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#import "CHAMoatBaseVideoTracker.h"
#import <MediaPlayer/MediaPlayer.h>

NS_ASSUME_NONNULL_BEGIN

@interface CHAMoatMPVideoTracker : CHAMoatBaseVideoTracker

/**
 Starts tracking with the given ad identifiers on the provided player.
 
 @param adIds Identifier dictionary to represent the ad.
 @param player MPMoviePlayerController to attach this tracker to.
 @return Whether the tracker was successfully attached to the player.
 */

- (BOOL)trackVideoAd:(NSDictionary<NSString *, NSString *> *)adIds player:(MPMoviePlayerController *)player;

@end

NS_ASSUME_NONNULL_END
