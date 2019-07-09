//
//  VungleSDKHeaderBidding.h
//  Vungle iOS SDK
//
//  Copyright (c) 2013-Present Vungle Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "VungleSDK.h"

@protocol VungleSDKHeaderBidding;

@interface VungleSDK ()

/**
 * Setting this to a non-nil value will enabled header bidding and reporting
 */
@property (nonatomic, weak) NSObject<VungleSDKHeaderBidding> *headerBiddingDelegate;

/**
 * This is a synchronous method to fetch a bid token for any placement. This method
 * will return nil if it is unable to find a bid token, or a cached placement.
 *
 * @param placement The ID of a that has already been loaded placement
 */
- (NSString *)bidTokenForPlacement:(NSString *)placement;

@end

@protocol VungleSDKHeaderBidding

@optional
/**
 * If implemented, this will be called as soon as the SDK receives a bidToken for a particular
 * placement. Note that the placement is NOT available to playback until preparation.
 *
 * @param placement The ID of a placement which is ready to be played
 * @param bidToken An encrypted bid token used to identify the placement through the auction
 */
- (void)placementWillBeginCaching:(NSString *)placement
                     withBidToken:(NSString *)bidToken;

@required
/**
 * If implemented, this will be called when the SDK has a placement fully prepared and cached
 * to disk with a corresponding bid token.
 *
 * @param placement The ID of a placement which is ready to be played
 * @param bidToken An encrypted bid token used to identify the placement through the auction
 */
- (void)placementPrepared:(NSString *)placement
             withBidToken:(NSString *)bidToken;

@end
