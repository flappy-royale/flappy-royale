//
//  VungleSDKNativeAdsD.h
//  Vungle iOS SDK
//
//  Created by Clarke Bishop on 6/4/18.
//  Copyright © 2018 Vungle Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "VungleSDK.h"

@protocol VungleSDKNativeAds

/**
 * If implemented, this will get called when the SDK has a placement that has triggered
 * a URL launch that will take the user out of the application
 * @param placement The ID of a placement which triggered the URL launch
 */
- (void)nativeAdsPlacementWillTriggerURLLaunch:(NSString *)placement;

/**
 * If implemented, this will get called when the SDK has successfully loaded an ad for
 * the specified placement
 * @param placement The ID of the placement that successfully loaded an ad
 */
- (void)nativeAdsPlacementDidLoadAd:(NSString *)placement;

/**
 * If implemented, this will get called when the SDK fails to load an ad for the
 * specified placement
 * @param placement The ID of the placement that failed to load an ad
 * @param error The NSError object containing details of the failed attempt
 */
- (void)nativeAdsPlacement:(NSString *)placement didFailToLoadAdWithError:(NSError *)error;

@end

@interface VungleSDK ()

@property (nonatomic, weak) id <VungleSDKNativeAds> nativeAdsDelegate;

@end
