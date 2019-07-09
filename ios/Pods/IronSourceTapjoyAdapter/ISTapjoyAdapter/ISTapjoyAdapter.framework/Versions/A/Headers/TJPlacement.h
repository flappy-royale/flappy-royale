// Copyright (C) 2014 by Tapjoy Inc.
//
// This file is part of the Tapjoy SDK.
//
// By using the Tapjoy SDK in your software, you agree to the terms of the Tapjoy SDK License Agreement.
//
// The Tapjoy SDK is bound by the Tapjoy SDK License Agreement and can be found here: https://www.tapjoy.com/sdk/license

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#define TJC_DEPRECATION_WARNING(VERSION) __attribute__((deprecated("Go to dev.tapjoy.com for instructions on how to fix this warning")))

typedef enum TJCActionRequestTypeEnum {
	TJActionRequestInAppPurchase = 1,
	TJActionRequestVirtualGood,
	TJActionRequestCurrency,
	TJActionRequestNavigation
} TJCActionRequestType;


/**
 A request for an app to take an action, triggered by TJPlacement content.

 */
@interface TJActionRequest : NSObject

/**
 * The type of the request
 */
@property (nonatomic,assign) TJCActionRequestType type;

/**
 * Called by your app to indicate that the request was processed successfully.
 */
- (void)completed;

/**
 * Called by your app to indicate that the request was cancelled or otherwise not successfully completed.
 */
- (void)cancelled;

@property (nonatomic, copy) id callback;

/**
 * The identifier associated with the request.
 */
@property (nonatomic, copy) NSString* requestId;

/**
 * The identifier associated with the request.
 */
@property (nonatomic, copy) NSString* token;

@end

@class TJPlacement;

/**
  The Tapjoy placement Delegate protocol. Adopt this protocol in order to handle responses that send are received upon sending a TJPlacement.
 
  The methods to prepare are:
 
  - requestDidSucceed: Called when a placement request is sent successfully
  - requestDidFail:error: Called when an error occurs while sending the placement request
  - contentIsReady: Called when content for a placement is loaded and ready to display
  - contentDidAppear: Called when placement content did appear
  - contentDidDisappear: Called when placement content did disappear
  - placement:didRequestPurchase:productId: Called when the user has successfully completed a purchase request
  - placement:didRequestReward:itemId:quantity:(int)quantity: Called when the user successfully requests a reward

 */
@protocol TJPlacementDelegate <NSObject>

@optional

/**
 * Callback issued by TJ to publisher to state that placement request is successful
 * @param TJPlacement that was sent
 * @return n/a
 */
- (void)requestDidSucceed:(TJPlacement*)placement;

/**
 * Called when an error occurs while sending the placement
 * @param placement The TJPlacement that was sent
 * @error error code
 * @return n/a
 */
- (void)requestDidFail:(TJPlacement*)placement error:(NSError*)error;

/**
 * Called when content for an placement is successfully cached
 * @param placement The TJPlacement that was sent
 */
- (void)contentIsReady:(TJPlacement*)placement;

/**
 * Called when placement content did appear
 * @param placement The TJPlacement that was sent
 * @return n/a
 */
- (void)contentDidAppear:(TJPlacement*)placement;

/**
 * Called when placement content did disappear
 * @param placement The TJPlacement that was sent
 * @return n/a
 */
- (void)contentDidDisappear:(TJPlacement*)placement;


/**
 * Callback issued by TJ to publisher when the user has successfully completed a purchase request
 * @param request - The TJActionRequest object
 * @param productId - the id of the offer that sent the request
 */
- (void)placement:(TJPlacement*)placement didRequestPurchase:(TJActionRequest*)request productId:(NSString*)productId;

/**
 * Callback issued by TJ to publisher when the user has successfully requests a reward
 * @param placement - The TJPlacement that triggered the action request
 * @param request   - The TJActionRequest object
 * @param itemId    - The itemId for whose reward has been requested
 * @param quantity  - The quantity of the reward for the requested itemId
 */

- (void)placement:(TJPlacement*)placement didRequestReward:(TJActionRequest*)request itemId:(NSString*)itemId quantity:(int)quantity;


@end

/**
 * Delegate used to receive video events from TJPlacement
 */
@protocol TJPlacementVideoDelegate <NSObject>

@optional

/**
 * Called when a placement video starts playing.
 *
 * @return n/a
 */
- (void)videoDidStart:(TJPlacement*)placement;

/**
 * Called when a placement video has completed playing.
 *
 * @return n/a
 */
- (void)videoDidComplete:(TJPlacement*)placement;

/**
 * Called when a placement video related error occurs.
 *
 * @param errorMsg Error message.
 * @return n/a
 */
- (void)videoDidFail:(TJPlacement*)placement error:(NSString*)errorMsg;
@end

/**
  The Tapjoy placement-Based Framework allows one to identify key placements within their application during development,
  and then reconfigure them on the dashboard as desired to help maximize monetization and engagement, without the need to update or resubmit the application.
  
  Use the TJPlacement class to define placement points in your application where ads and other content can be served.
  placements could include launching the application, completing an achievement, finishing a level, or any other moment conducive to communicating with your users.
 
  During your application development process, the key steps are to:
 
  1. Create and configure each placement as a TJPlacement
 
        TJPlacement *placement = [TJPlacement placementWithName: @"level_complete" delegate: self];
 
  2. Request content
 
        [placement requestContent];
 
  3. Present any content that is returned by the placement callbacks defined in TJPlacementDelegate
 */
@interface TJPlacement : NSObject

/** The TJPlacementDelegate used to handle responses that are received upon sending this placement*/
@property (nonatomic, weak) id<TJPlacementDelegate> delegate;

/** The delegate that implements the TJPlacementVideoDelegate protocol */
@property (nonatomic, weak) id<TJPlacementVideoDelegate> videoDelegate;

/** The name of the placement */
@property (nonatomic, copy) NSString *placementName;

/** Whether content has been loaded and is ready to be presented */
@property (nonatomic, assign, readonly, getter=isContentReady) BOOL contentReady;

/** Whether content is available for this placement */
@property (nonatomic, assign, readonly, getter=isContentAvailable) BOOL contentAvailable;

/** The UIViewController to show the content in */
@property (nonatomic, retain) UIViewController* presentationViewController;

/** Allows plugins to specify a topViewController class (currently only used by Unity) */
@property (nonatomic, copy) NSString *topViewControllerClassName;

/**
 * Creates a new instance of TJPlacement
 * @param placementName The name of the placement
 * @param delegate The class that implements the TJPlacementDelegate protocol
 */
+ (id)placementWithName:(NSString*)placementName delegate:(id<TJPlacementDelegate>)delegate;

/**
 * Sends the placement request to the server
 *
 * @return n/a
 */
- (void)requestContent;

/**
 * Shows the content that was received from the server after sending this placement
 * @return n/a
 */
- (void)showContentWithViewController:(UIViewController*)viewController;

/**
 * Dismiss the content
 * @return n/a
 */
+ (void)dismissContent;

/** Mediation params(used by mediation adapters only) */
@property (nonatomic, copy) NSString *mediationAgent;
@property (nonatomic, copy) NSString *mediationId;
+ (id)placementWithName:(NSString*)placementName mediationAgent:(NSString*)mediationAgent mediationId:(NSString*)mediationId delegate:(id<TJPlacementDelegate>)delegate;

@property (nonatomic, copy) NSString *adapterVersion;

/** Programmatic mediation */
@property (nonatomic, copy) NSDictionary *auctionData;

/** Used by limited SDK request Only **/
@property (nonatomic, assign) BOOL isLimited;
+ (id)limitedPlacementWithName:(NSString*)placementName mediationAgent:(NSString*)mediationAgent delegate:(id<TJPlacementDelegate>)delegate;
@end
