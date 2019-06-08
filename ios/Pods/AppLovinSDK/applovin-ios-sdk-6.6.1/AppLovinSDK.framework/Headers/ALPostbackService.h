//
//  ALPostbackService.h
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import "ALPostbackDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@class ALSdk;

/**
 * Defines an AppLovin service which can be used to dispatch HTTP GET postbacks to arbitrary URLs.
 *
 * While we provide this service primarily as a convenience for native ad tracking URLs, you are welcome to use it for any postbacks you need to dispatch. Postbacks dispatched from this service happen in a asynchronous task.
 */
@interface ALPostbackService : NSObject

/**
 * Dispatch a postback to a given URL.
 *
 * @param targetURL URL to call via HTTP GET.
 * @param delegate Optional postback delegate. May be nil.
 */
- (void)dispatchPostbackAsync:(NSURL *)targetURL andNotify:(nullable id<ALPostbackDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
