//
//  ALSdkSettings.h
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * This class contains settings for the AppLovin SDK.
 */
@interface ALSdkSettings : NSObject

/**
 * Toggle test ads for the SDK. This is set to NO by default.
 *
 * If enabled, AppLovin will display test ads from our servers, guaranteeing 100% fill.
 * This is for integration testing only. Ensure that you set this to NO when the app is launched.
 */
@property (assign, atomic) BOOL isTestAdsEnabled;

/**
 * Toggle verbose logging for the SDK. This is set to NO by default. Set to NO if SDK should be silent (recommended for App Store submissions).
 *
 * If enabled AppLovin messages will appear in standard application log accessible via console.
 * All log messages will be prefixed by the "AppLovinSdk" tag.
 *
 * Verbose logging is <i>disabled</i> by default.
 */
@property (assign, atomic) BOOL isVerboseLogging;

/**
 * Determines whether to begin video ads in a muted state or not. Defaults to YES unless changed in the dashboard.
 */
@property (assign, atomic) BOOL muted;

@end

@interface ALSdkSettings(ALDeprecated)
@property (copy, atomic) NSString *autoPreloadAdSizes __deprecated_msg("Manually managing what ads SDK should automatically preload has been deprecated and will be removed in a future SDK version.");
@property (copy, atomic) NSString *autoPreloadAdTypes __deprecated_msg("Manually managing what ads SDK should automatically preload has been deprecated and will be removed in a future SDK version.");
@end

NS_ASSUME_NONNULL_END
