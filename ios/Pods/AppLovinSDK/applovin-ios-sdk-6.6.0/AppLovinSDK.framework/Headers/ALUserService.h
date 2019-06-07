//
//  ALUserService.h
//  AppLovinSDK
//
//  Created by Thomas So on 10/2/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * Service object for performing user-related tasks.
 */
@interface ALUserService : NSObject

/**
 * Show the user consent dialog to the user using one from AppLovin's SDK. You should check that you actually need to show the consent dialog
 * by checking `ALSdkConfiguration.consentDialogState` in the completion block of `ALSdk#initializeSdkWithCompletionHandler`.
 */
- (void)showConsentDialogWithCompletionHandler:(void (^_Nullable)(void))completionHandler;


- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
