//
//  AdColonyGlobalMediationSettings.h
//  MoPubSDK
//
//  Copyright (c) 2016 MoPub. All rights reserved.
//

#import <Foundation/Foundation.h>

#if __has_include(<MoPub/MoPub.h>)
    #import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
    #import <MoPubSDKFramework/MoPub.h>
#else
    #import "MPMediationSettingsProtocol.h"
#endif

/*
 * `AdColonyGlobalMediationSettings` allows the application to provide constant global properties
 * to configure aspects of AdColony. See `MPMediationSettingsProtocol` to see how mediation settings
 * are used. This only apply to AdColonyRewardedVideoCustomEvents.
 */
@interface AdColonyGlobalMediationSettings : NSObject <MPMediationSettingsProtocol>

/*
 * Sets the customId to utilize server-side mode for AdColony V4VC.
 */
@property (nonatomic, copy) NSString *customId;

/*
 * Enables test ads for your application without changing dashboard settings.
 * Note this method simply just wraps the identical method on the AdColonyController class.
 * This is so we can keep that class private and have developers just use what's already available to them.
 */
+ (void)enableClientSideTestMode;

/*
 * Disables test ads for your application without changing dashboard settings.
 * Note this method simply just wraps the identical method on the AdColonyController class.
 * This is so we can keep that class private and have developers just use what's already available to them.
 */
+ (void)disableClientSideTestMode;

@end
