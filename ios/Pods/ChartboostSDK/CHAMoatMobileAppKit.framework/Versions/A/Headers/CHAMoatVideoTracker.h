//
//  MoatVideoTracker.h
//  MoatMobileAppKit
//
//  Created by Moat on 2/20/15.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <MediaPlayer/MediaPlayer.h>
#import <AVFoundation/AVFoundation.h>

#import "CHAMoatBaseTracker.h"

/** Tracker for tracking native video ads shown with AVPlayer or MPMoviePlayerController.
 *
 * @warning This class will be removed in a future version of this SDK. We recommend using CHAMoatMPVideoTracker and CHAMoatAVVideoTracker instead of this class.
 * @warning FreeWheel/IMA ads, even ones that use AVPlayer, are best tracked with specialized Moat trackers.
 * Please inform the Moat team to get custom builds and documentation for FreeWheel and IMA based ads.
 */

@interface CHAMoatVideoTracker : CHAMoatBaseTracker

/** Creates tracker for tracking video ads.
 *
 * Should be called before the ad is ready to play.
 *
 * @param partnerCode The code provided to you by Moat for video ad tracking.
 * @return CHAMoatVideoTracker instance
 */
+ (CHAMoatVideoTracker *)trackerWithPartnerCode:(NSString *)partnerCode;

/** Call to start tracking video ad backed by MPMoviePlayerController.
 *
 * Should be called right before the ad is about to start playing.
 *
 * @param adIds information to identify and segment the ad.
 * @param player the MPMoviePlayerController instance being used to play the ad.
 */
- (bool)trackVideoAd:(NSDictionary *)adIds
  usingMPMoviePlayer:(MPMoviePlayerController *)player;

/** Call to start tracking video ad backed by an AVPlayer.
 *
 * Should be called right before the ad is about to start playing.
 *
 * @param adIds information to identify and segment the ad
 * @param player the AVPlayer instance being used to play the ad.
 * @param layer the parent view of the AVPlayer's layer.
 * @param view the view that renders the video ad.
 */
- (bool)trackVideoAd:(NSDictionary *)adIds
  usingAVMoviePlayer:(AVPlayer *)player
           withLayer:(CALayer *)layer
  withContainingView:(UIView *)view;

/** Call if the layer or view in which the video ad is rendered changes.
 *
 * @param newLayer the new parent layer of the player
 * @param view the new view tha renders the video ad.
 */
- (void)changeTargetLayer:(CALayer *)newLayer
       withContainingView:(UIView *)view;

/** Call to stop tracking the ad.
 *
 * Should be called at the completion of playback to ensure that all resources are disposed of properly.
 */
- (void)stopTracking;

@end
