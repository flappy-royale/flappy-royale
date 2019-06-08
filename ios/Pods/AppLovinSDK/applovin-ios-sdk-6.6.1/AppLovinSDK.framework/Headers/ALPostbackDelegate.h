//
//  ALPostbackDelegate
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

@class ALPostbackService;

@protocol ALPostbackDelegate <NSObject>

/**
 * Indicates that a postback dispatched to a given URL completed successfully.
 *
 * We define success as having received a 2XX response code from the remote endpoint.
 *
 * @param postbackURL URL which was notified.
 */
- (void)postbackService:(ALPostbackService *)postbackService didExecutePostback:(NSURL *)postbackURL;

/**
 * Indicates that a postback dispatched to a given URL has failed.
 *
 * We define failed as having received a response code outside the 2XX range, or having been unable to establish a connection.
 *
 * @param postbackURL URL which was notified.
 * @param errorCode HTTP status code received, if any; otherwise a negative constant.
 */
- (void)postbackService:(ALPostbackService *)postbackService didFailToExecutePostback:(nullable NSURL *)postbackURL errorCode:(NSInteger)errorCode;

@end

NS_ASSUME_NONNULL_END
