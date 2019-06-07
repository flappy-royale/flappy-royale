//
//  ALSdk.h
//  AppLovinSDK
//
//  Created by Basil Shikin on 2/1/12.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ALSdkSettings.h"
#import "ALAdService.h"
#import "ALNativeAdService.h"
#import "ALPostbackService.h"
#import "ALEventService.h"
#import "ALVariableService.h"
#import "ALUserService.h"
#import "ALSdkConfiguration.h"
#import "ALErrorCodes.h"
#import "ALMediationProvider.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This is a base class for the AppLovin iOS SDK.
 */
@interface ALSdk : NSObject

#pragma mark - High Level SDK Properties

/**
 * The current version of the SDK.
 */
@property (class, nonatomic, copy, readonly) NSString *version;

/**
 * The current version of the SDK in numeric format.
 */
@property (class, nonatomic, assign, readonly) NSUInteger versionCode;

/**
 * This SDK's SDK key.
 */
@property (nonatomic, copy, readonly) NSString *sdkKey;

/**
 * This SDK's SDK settings.
 */
@property (nonatomic, strong, readonly) ALSdkSettings *settings;

/**
 * Get the SDK configuration object provided upon initialization.
 */
@property (nonatomic, strong, readonly) ALSdkConfiguration *configuration;

/**
 * Set plugin version for mediation adapter or plugin.
 *
 * @param pluginVersion Some descriptive string which identifies the plugin.
 */
- (void)setPluginVersion:(NSString *)pluginVersion;

/**
 * Set mediation provider using one of the provided strings in ALMediationProvider.h, or your own if not defined.
 */
@property (nonatomic, copy, nullable) NSString *mediationProvider;

#pragma mark - SDK Services

/**
 * This service is used to load and display ads from AppLovin servers.
 */
@property (nonatomic, strong, readonly) ALAdService *adService;

/**
 * Get an instance of AppLovin Native Ad service. This service is
 * used to fetch and display native ads from AppLovin servers.
 *
 * @return Native ad service. Guaranteed not to be null.
 */
@property (nonatomic, strong, readonly) ALNativeAdService *nativeAdService;

/**
 * Get an instance of the AppLovin postback service. This service is used to dispatch HTTP GET postbacks to arbitrary URLs.
 *
 * @return Postback service. Guaranteed not to be null.
 */
@property (nonatomic, strong, readonly) ALPostbackService *postbackService;

/**
 * Get an instance of the AppLovin event service. This service is used to track post-install user events.
 *
 * @return Event service. Guaranteed not to be null.
 */
@property (nonatomic, strong, readonly) ALEventService *eventService;

/**
 * Service object for performing user-related tasks.
 *
 * @return User service. Guaranteed not to be null.
 */
@property (nonatomic, strong, readonly) ALUserService *userService;

/**
 * Get an instance of the AppLovin variable service. This service is used to perform various AB tests that you have set up on your AppLovin dashboard on your users.
 *
 * @return Variable service. Guaranteed not to be null.
 */
@property (nonatomic, strong, readonly) ALVariableService *variableService;

/**
 * Set an identifier for the current user. This identifier will be tied to SDK events and our optional S2S postbacks.
 *
 * If you're using reward validation, you can optionally set an identifier to be included with currency validation postbacks.
 * For example, a username or email. We'll include this in the postback when we ping your currency endpoint from our server.
 */
@property (nonatomic, copy, nullable) NSString *userIdentifier;

/**
 * Present the mediation debugger UI.
 * This debugger tool provides the status of your integration for each third-party ad network.
 *
 * Please call this method after the SDK has initialized, e.g. in the completionHandler of -[ALSdk initializeSdkWithCompletionHandler:].
 */
- (void)showMediationDebugger;

#pragma mark - SDK Initialization

typedef void (^ALSdkInitializationCompletionHandler)(ALSdkConfiguration *configuration);

/**
 * Initialize the SDK.
 */
- (void)initializeSdk;

/**
 * Initialize the SDK with a given completion block.
 *
 * The callback will be invoked on the main thread.
 *
 * @param completionHandler The callback that will be run when the SDK finishes initializing.
 */
- (void)initializeSdkWithCompletionHandler:(nullable ALSdkInitializationCompletionHandler)completionHandler;

/**
 * Initialize the default instance of AppLovin SDK.
 *
 * Please make sure your SDK key is set in the application's Info.plist under the property 'AppLovinSdkKey'.
 */
+ (void)initializeSdk;

/**
 * Initialize the default instance of AppLovin SDK.
 *
 * Please make sure your SDK key is set in the application's Info.plist under the property 'AppLovinSdkKey'.
 *
 * @param completionHandler The callback that will be run when the SDK finishes initializing.
 */
+ (void)initializeSdkWithCompletionHandler:(nullable ALSdkInitializationCompletionHandler)completionHandler;

/**
 * Get a shared instance of AppLovin SDK.
 *
 * Please make sure your SDK key is set in the application's Info.plist under the property 'AppLovinSdkKey'.
 *
 * @return The shared instance of AppLovin's SDK, or nil if SDK key is not set in the application's Info.plist.
 */
+ (nullable ALSdk *)shared;

/**
 * Get an instance of AppLovin SDK using the provided SDK key.
 *
 * @param sdkKey SDK key to use for the instance of the AppLovin SDK.
 *
 * @return An instance of AppLovinSDK, or nil if SDK key is not set.
 */
+ (nullable ALSdk *)sharedWithKey:(NSString *)sdkKey;

/**
 * Get an instance of AppLovin SDK using the provided SDK key and SDK settings.
 *
 * @param sdkKey    SDK key to use for the instance of the AppLovin SDK.
 * @param settings  SDK settings object.
 *
 * @return An instance of AppLovinSDK, or nil if SDK key is not set.
 */
+ (nullable ALSdk *)sharedWithKey:(NSString *)sdkKey settings:(ALSdkSettings *)settings;


- (instancetype)init __attribute__((unavailable("Use +[ALSdk shared], +[ALSdk sharedWithKey:], or +[ALSdk sharedWithKey:settings:].")));

@end

NS_ASSUME_NONNULL_END
