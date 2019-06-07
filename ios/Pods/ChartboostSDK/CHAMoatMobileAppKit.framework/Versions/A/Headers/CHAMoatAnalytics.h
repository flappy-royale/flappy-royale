//
//  CHAMoatAnalytics.h
//  CHAMoatMobileAppKit
//
//  Created by Moat on 6/2/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

/** Settings that determine aspects of the SDK's functionality */
@interface CHAMoatOptions : NSObject<NSCopying>

/** If 'YES' then the SDK will attempt to use the device's location services for more precise location data.
 * The SDK will never request location permissions from a user, it will only attempt to use location services if
 * a user has already granted location permissions to the app.
 * 
 * Default = 'YES'
 */
@property BOOL locationServicesEnabled;

/** If 'YES' then the SDK will attempt to use the device's IDFA for more precise user info.
 * The SDK will only use a user's IDFA if the user has advertising tracking enabled on the device.
 *
 * Default = 'YES'
 */
@property BOOL IDFACollectionEnabled;

/** If 'YES' and a 'MOAT_LOGGING' environment variable is set in Xcode,
 * then the SDK will log information to assist in the implementation and testing process.
 *
 * Default = 'NO'
 */
@property BOOL debugLoggingEnabled;

@end

/** Global Moat SDK class used to start and setup the SDK with the appropriate options. */
@interface CHAMoatAnalytics : NSObject

+ (instancetype)sharedInstance;

/** Call to start the Moat SDK.
 *
 * This call should be made as early as possible to ensure that the SDK is ready
 * when the first ad loads.
 *
 * @param options The desired settings to which the Moat SDK will conform.
 * @see CHAMoatOptions
 */
- (void)startWithOptions:(CHAMoatOptions *)options;

/** Call to start the Moat SDK with the default options.
 *
 * @see startWithOptions for more detail
 */
- (void)start;

/** Call to prepare the Moat SDK for native display tracking.
 *
 * This call should be used if the Moat SDK will be used to track native ads. 
 * Again, this call should be made as early as possible to ensure that the SDK is ready
 * when the first native ad loads.
 * @see CHAMoatVideoTracker.h for more detail on what constitues a native ad.
 *
 * @param partnerCode The code provided to you by Moat for native ad tracking.
 */
- (void)prepareNativeDisplayTracking:(NSString *)partnerCode;

@end
