//
//  ALNativeAd.h
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALPostbackDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@interface ALNativeAd : NSObject

/**
 *  A unique ID which identifies this advertisement.
 *
 *  Should you need to report a broken ad to AppLovin support, please include this number's longValue.
 */
@property (strong, nonatomic, readonly) NSNumber *adIdNumber;

/**
 *  The zone identifier for the ad, if any.
 */
@property (copy, nonatomic, readonly, nullable) NSString *zoneIdentifier;

/**
 *  The title of the native ad.
 */
@property (copy, nonatomic, readonly, nullable) NSString *title;

/**
 *  The description of the native ad.
 */
@property (copy, nonatomic, readonly, nullable) NSString *descriptionText;

/**
 *  The caption text of the native ad.
 */
@property (copy, nonatomic, readonly, nullable) NSString *captionText;

/**
 *  The CTA text of the native ad.
 */
@property (copy, nonatomic, readonly, nullable) NSString *ctaText;

/**
 *  The app icon URL of the native ad.
 */
@property (strong, nonatomic, readonly, nullable) NSURL *iconURL;

/**
 *  The ad image URL for a non-video native ad.
 */
@property (strong, nonatomic, readonly, nullable) NSURL *imageURL;

/**
 *  The star rating of the native ad. Please use floatValue when extracting value from the NSNumber
 */
@property (strong, nonatomic, readonly, nullable) NSNumber *starRating;

/**
 *  The video URL for a video native ad.
 *
 *  Note that if this native ad does not contain a video, this property will be nil.
 */
@property (strong, nonatomic, readonly, nullable) NSURL *videoURL;

/**
 *  Fires the impression asynchronously.
 */
- (void)trackImpression;

/**
 *  Fires the impression asynchronously and notifies the provided delegate.
 */
- (void)trackImpressionAndNotify:(nullable id<ALPostbackDelegate>)postbackDelegate;

/**
 *  The video begin tracking URL of the native ad.
 *
 *  Note that if this native ad does not contain a video, this property will be nil.
 */
@property (strong, nonatomic, readonly, nullable) NSURL *videoStartTrackingURL;

/**
 * Retrieve the URL which should be fired upon video completion.
 *
 * @param percentViewed The percentage of the video (0 - 100) that was viewed by the user.
 * @param firstPlay Whether or not this postback represents initial playback of the video. The first time you begin playback, you should pass true. If the video is paused for any reason and then later resumed mid-playback, you should fire this postback a second time, passing false to firstPlay.
 */
- (nullable NSURL *)videoEndTrackingURL:(NSUInteger)percentViewed firstPlay:(BOOL)firstPlay;

/**
 *  Represents the precaching states of the ad's images.
 */
@property (assign, atomic, readonly, getter=isImagePrecached) BOOL imagePrecached;

/**
 *  Represents the precaching state of the ad's video.
 *
 *  Note that if this native ad does not contain a video, this property will always be NO.
 */
@property (assign, atomic, readonly, getter=isVideoPrecached) BOOL videoPrecached;

/**
 * Handle a click on this native ad by launching the ad's destination.
 *
 * You should call this method anytime the user taps anywhere on your native ad.
 * Calling this method launches Safari or the App Store and will result in your app being paused.
 */
- (void)launchClickTarget;

@end

@interface ALNativeAd(ALDeprecated)
@property (strong, nonatomic, readonly, nullable) NSURL *clickURL __deprecated_msg("Invoke method -launchClickTarget rather than opening this URL yourself.");
@property (strong, nonatomic, readonly) NSURL *impressionTrackingURL __deprecated_msg("Invoke method -trackImpression or -trackImpressionAndNotify: rather than firing this URL yourself.");
@end

NS_ASSUME_NONNULL_END
