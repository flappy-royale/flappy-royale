//
//  VungleSDKCreativeTracking.h
//  Vungle iOS SDK
//
//  Copyright (c) 2013-Present Vungle Inc. All rights reserved.
//

@protocol VungleSDKCreativeTracking

@optional
/**
 * If implemented, this will get called when the SDK has an ad ready to be displayed.
 * The parameters will indicate that an ad associated with the included creative ID is
 * ready to play for the specified placement reference ID. Both parameters should return
 * a value if an ad is ready to be played.
 * @param creativeID The creative ID of the ad unit that is ready to be played
 * @param placementID The ID of a placement which is ready to be played
 */
- (void)vungleCreative:(nullable NSString *)creativeID readyForPlacement:(nullable NSString *)placementID;
@end

@interface VungleSDK ()
@property (nullable, weak) NSObject <VungleSDKCreativeTracking> *creativeTrackingDelegate;

@end
