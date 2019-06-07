//
//  ALPrivacySettings.h
//  AppLovinSDK
//
//  Created by Basil Shikin on 3/26/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * This class contains privacy settings for AppLovin.
 */
@interface ALPrivacySettings : NSObject

/**
 * Set whether or not user has provided consent for information sharing with AppLovin.
 *
 * @param hasUserConsent 'YES' if the user has provided consent for information sharing with AppLovin. 'false' by default.
 */
+ (void)setHasUserConsent:(BOOL)hasUserConsent;

/**
 * Check if user has provided consent for information sharing with AppLovin.
 */
+ (BOOL)hasUserConsent;

/**
 * Mark user as age restricted (i.e. under 16).
 *
 * @param isAgeRestrictedUser 'YES' if the user is age restricted (i.e. under 16).
 */
+ (void)setIsAgeRestrictedUser:(BOOL)isAgeRestrictedUser;

/**
 * Check if user is age restricted.
 */
+ (BOOL)isAgeRestrictedUser;


- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
