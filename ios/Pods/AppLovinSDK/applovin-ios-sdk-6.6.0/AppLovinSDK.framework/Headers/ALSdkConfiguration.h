//
//  ALSdkConfiguration.h
//  AppLovinSDK
//
//  Created by Thomas So on 9/29/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * Object containing various flags related to the SDK configuration.
 */
@interface ALSdkConfiguration : NSObject

/**
 * This enum represents whether or not the consent dialog should be shown for this user.
 * The state where no such determination could be made is represented by `ALConsentDialogStateUnknown`.
 */
typedef NS_ENUM(NSInteger, ALConsentDialogState)
{
    /**
     * The consent dialog state could not be determined. This is likely due to SDK failing to initialize.
     */
    ALConsentDialogStateUnknown,
    
    /**
     * This user should be shown a consent dialog.
     */
    ALConsentDialogStateApplies,
    
    /**
     * This user should not be shown a consent dialog.
     */
    ALConsentDialogStateDoesNotApply
};

/**
 * Get the consent dialog state for this user. If no such determination could be made, `ALConsentDialogStateUnknown` will be returned.
 */
@property (nonatomic, assign, readonly) ALConsentDialogState consentDialogState;


- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
