//
//  AdColonyController.h
//  MoPubSDK
//
//  Copyright (c) 2016 MoPub. All rights reserved.
//

#import "AdColonyInterstitialCustomEvent.h"
#import "AdColonyRewardedVideoCustomEvent.h"
#import "AdColonyInstanceMediationSettings.h"
#import "AdColonyGlobalMediationSettings.h"

typedef enum {
    INIT_STATE_UNKNOWN,
    INIT_STATE_INITIALIZED,
    INIT_STATE_INITIALIZING
} InitState;

/*
 * Internal controller to handle initialization and common routines across ad types.
 */
@interface AdColonyController : NSObject
@property (atomic, assign, readonly) InitState initState;

+ (AdColonyController *)sharedInstance;

/*
 * Initialize AdColony for the given zone IDs and app ID.
 *
 * Multiple calls to this method will result in initialiazing AdColony only once.
 *
 * @param appId The application's AdColony App ID.
 * @param allZoneIds All the possible zone IDs the application may use across all ad formats.
 * @param userId The user ID to attribute ads/rewards.
 */
+ (void)initializeAdColonyCustomEventWithAppId:(NSString *)appId allZoneIds:(NSArray *)allZoneIds userId:(NSString *)userId callback:(void(^)())callback;

/*
 * Enables test ads for your application without changing dashboard settings.
 */
+ (void)enableClientSideTestMode;

/*
 * Disables test ads for your application without changing dashboard settings.
 */
+ (void)disableClientSideTestMode;

@end
