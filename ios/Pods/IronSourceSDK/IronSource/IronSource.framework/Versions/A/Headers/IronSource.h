//
//  Copyright © 2017 IronSource. All rights reserved.
//



#ifndef IRONSOURCE_H
#define IRONSOURCE_H

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "ISGender.h"
#import "ISBannerDelegate.h"
#import "ISRewardedVideoDelegate.h"
#import "ISOfferwallDelegate.h"
#import "ISInterstitialDelegate.h"
#import "ISRewardedInterstitialDelegate.h"
#import "ISLogDelegate.h"
#import "ISConfigurations.h"
#import "ISPlacementInfo.h"
#import "ISIntegrationHelper.h"
#import "ISEventsReporting.h"
#import "ISSupersonicAdsConfiguration.h"
#import "ISSegment.h"
#import "ISSegmentDelegate.h"
#import "ISDemandOnlyRewardedVideoDelegate.h"
#import "ISDemandOnlyInterstitialDelegate.h"
#import "ISBannerSize.h"

NS_ASSUME_NONNULL_BEGIN

#define IS_REWARDED_VIDEO @"rewardedvideo"
#define IS_INTERSTITIAL @"interstitial"
#define IS_OFFERWALL @"offerwall"
#define IS_BANNER @"banner"

static NSString * const MEDIATION_SDK_VERSION     = @"6.8.3";

@interface IronSource : NSObject

/**
 @abstact Retrieve a string-based representation of the SDK version.
 @discussion The returned value will be in the form of "<Major>.<Minor>.<Revision>".

 @return NSString representing the current IronSource SDK version.
 */
+ (NSString *)sdkVersion;


/**
 @abstact Sets a numeric representation of the current user's age.
 @discussion This value will be passed to the supporting ad networks.

 @param age The user's age. Should be between 5 and 120.
 */
+ (void)setAge:(NSInteger)age;

/**
 @abstact Sets the gender of the current user.
 @discussion This value will be passed to the supporting ad networks.

 @param gender The user's gender.
 */
+ (void)setGender:(ISGender)gender;

/**
 @abstract Sets if IronSource SDK should track network changes.
 @discussion Enables the SDK to change the availability according to network modifications, i.e. in the case of no network connection, the availability will turn to FALSE.
 
 Default is NO.

 @param flag YES if allowed to track network changes, NO otherwise.
 */
+ (void)shouldTrackReachability:(BOOL)flag;

/**
 @abstract Sets if IronSource SDK should allow ad networks debug logs.
 @discussion This value will be passed to the supporting ad networks.

 Default is NO.

 @param flag YES to allow ad networks debug logs, NO otherwise.
 */
+ (void)setAdaptersDebug:(BOOL)flag;

/**
 @abstract Sets a dynamic identifier for the current user.
 @discussion This parameter can be changed throughout the session and will be received in the server-to-server ad rewarded callbacks. 
 
 It helps verify AdRewarded transactions and must be set before calling showRewardedVideo.

 @param dynamicUserId Dynamic user identifier. Should be between 1-128 chars in length.
 @return BOOL that indicates if the dynamic identifier is valid.
 */
+ (BOOL)setDynamicUserId:(NSString *)dynamicUserId;

/**
 @abstract Retrieves the device's current advertising identifier.
 @discussion Will first try to retrive IDFA, if impossible, will try to retrive IDFV.
 
 @return The device's current advertising identifier.
 */
+ (NSString *)advertiserId;

/**
 @abstract Sets a mediation type.
 @discussion This method is used only for IronSource's SDK, and will be passed as a custom param.
 
 @param mediationType a mediation type name. Should be alphanumeric and between 1-64 chars in length.
 */
+ (void)setMediationType:(NSString *)mediationType;

/**
 @abstract Sets a mediation segment.
 @discussion This method is used only for IronSource's SDK, and will be passed as a custom param.
 
 @param segment A segment name, which should not exceed 64 characters.
 */
+ (void)setMediationSegment:(NSString *)segment;

/**
 @abstract Sets a segment.
 @discussion This method is used to start a session with a spesific segment.
 
 @param segment A segment object.
 */
+ (void)setSegment:(ISSegment *)segment;

/**
 @abstract Sets the delegate for segment callback.
 
 @param delegate The 'ISSegmentDelegate' for IronSource to send callbacks to.
 */
+ (void)setSegmentDelegate:(id<ISSegmentDelegate>)delegate;

#pragma mark - SDK Initialization

/**
 @abstract Sets an identifier for the current user.

 @param userId User identifier. Should be between 1-64 chars in length.
 */
+ (void)setUserId:(NSString *)userId;

/**
 @abstract Initializes IronSource's SDK with all the ad units that are defined in the platform.

 @param appKey Application key.
 */
+ (void)initWithAppKey:(NSString *)appKey;

/**
 @abstract Initializes IronSource's SDK with the requested ad units.
 @discussion This method checks if the requested ad units are defined in the platform, and initializes them.
 
 The adUnits array should contain string values that represent the ad units.
 
 It is recommended to use predefined constansts:
 
 IS_REWARDED_VIDEO, IS_INTERSTITIAL, IS_OFFERWALL, IS_BANNER
 
 e.g: [IronSource initWithAppKey:appKey adUnits:@[IS_REWARDED_VIDEO, IS_INTERSTITIAL, IS_OFFERWALL, IS_BANNER]];

 @param appKey Application key.
 @param adUnits An array of ad units to initialize.
 */
+ (void)initWithAppKey:(NSString *)appKey adUnits:(NSArray<NSString *> *)adUnits;

/**
 @abstract Initializes ironSource SDK in demand only mode.
 @discussion This method initializes IS_REWARDED_VIDEO and/or IS_INTERSTITIAL ad units.
 @param appKey Application key.
 @param adUnits An array containing IS_REWARDED_VIDEO and/or IS_INTERSTITIAL.
 */
+ (void)initISDemandOnly:(NSString *)appKey adUnits:(NSArray<NSString *> *)adUnits;

#pragma mark - Rewarded Video

/**
 @abstract Sets the delegate for rewarded video callbacks.

 @param delegate The 'ISRewardedVideoDelegate' for IronSource to send callbacks to.
 */
+ (void)setRewardedVideoDelegate:(id<ISRewardedVideoDelegate>)delegate;

/**
 @abstract Shows a rewarded video using the default placement.

 @param viewController The UIViewController to display the rewarded video within.
 */
+ (void)showRewardedVideoWithViewController:(UIViewController *)viewController;

/**
 @abstract Shows a rewarded video using the provided placement name.

 @param viewController The UIViewController to display the rewarded video within.
 @param placementName The placement name as was defined in the platform. If nil is passed, a default placement will be used.
 */
+ (void)showRewardedVideoWithViewController:(UIViewController *)viewController placement:(nullable NSString *)placementName;

/**
 @abstract Determine if a locally cached rewarded video exists on the mediation level.
 @discussion A return value of YES here indicates that there is a cached rewarded video for one of the ad networks.

 @return YES if rewarded video is ready to be played, NO otherwise.
 */
+ (BOOL)hasRewardedVideo;

/**
 @abstract Verify if a certain placement has reached its ad limit.
 @discussion This is to ensure you don’t portray the Rewarded Video button when the placement has been capped or paced and thus will not serve the video ad.

 @param placementName The placement name as was defined in the platform.
 @return YES if capped or paced, NO otherwise.
 */
+ (BOOL)isRewardedVideoCappedForPlacement:(NSString *)placementName;

/**
 @abstract Retrive an object containing the placement's reward name and amount.

 @param placementName The placement name as was defined in the platform.
 @return ISPlacementInfo representing the placement's information.
 */
+ (ISPlacementInfo *)rewardedVideoPlacementInfo:(NSString *)placementName;

/**
 @abstract Enables sending server side parameters on successful rewarded video
 
 @param parameters A dictionary containing the parameters.
 */
+ (void)setRewardedVideoServerParameters:(NSDictionary *)parameters;

/**
 @abstract Disables sending server side parameters on successful rewarded video
  */
+ (void)clearRewardedVideoServerParameters;

#pragma mark - Demand Only Rewarded Video
/**
 @abstract Sets the delegate for demand only rewarded video callbacks.
 @param delegate The 'ISDemandOnlyRewardedVideoDelegate' for IronSource to send callbacks to.
 */
+ (void)setISDemandOnlyRewardedVideoDelegate:(id<ISDemandOnlyRewardedVideoDelegate>)delegate;

/**
 @abstract Shows a demand only rewarded video using the default placement.
 @param viewController The UIViewController to display the rewarded video within.
 @param instanceId The demand only instance id to be used to display the rewarded video.
 */
+ (void)showISDemandOnlyRewardedVideo:(UIViewController *)viewController instanceId:(NSString *)instanceId;

/**
 @abstract Shows a demand only rewarded video using the provided placement name.
 @param viewController The UIViewController to display the rewarded video within.
 @param placementName The placement name as was defined in the platform. If nil is passed, a default placement will be used.
 @param instanceId The demand only instance id to be used to display the rewarded video.
 */
+ (void)showISDemandOnlyRewardedVideo:(UIViewController *)viewController placement:(nullable NSString *)placementName instanceId:(NSString *)instanceId;

/**
 @abstract Determine if a locally cached demand only rewarded video exists for an instance id.
 @discussion A return value of YES here indicates that there is a cached rewarded video for the instance id.
 @param instanceId The demand only instance id to be used to display the rewarded video.
 @return YES if rewarded video is ready to be played, NO otherwise.
 */
+ (BOOL)hasISDemandOnlyRewardedVideo:(NSString *)instanceId;

#pragma mark - Interstitial

/**
 @abstract Sets the delegate for interstitial callbacks.

 @param delegate The 'ISInterstitialDelegate' for IronSource to send callbacks to.
 */
+ (void)setInterstitialDelegate:(id<ISInterstitialDelegate>)delegate;

/**
 @abstract Sets the delegate for rewarded interstitial callbacks.
 
 @param delegate The 'ISRewardedInterstitialDelegate' for IronSource to send callbacks to.
 */
+ (void)setRewardedInterstitialDelegate:(id<ISRewardedInterstitialDelegate>)delegate;

/**
 @abstract Loads an interstitial.
 @discussion This method will load interstitial ads from the underlying ad networks according to their priority.
 */
+ (void)loadInterstitial;

/**
 @abstract Show a rewarded video using the default placement.

 @param viewController The UIViewController to display the interstitial within.
 */
+ (void)showInterstitialWithViewController:(UIViewController *)viewController;

/**
 @abstract Show a rewarded video using the provided placement name.

 @param viewController The UIViewController to display the interstitial within.
 @param placementName The placement name as was defined in the platform. If nil is passed, a default placement will be used.
 */
+ (void)showInterstitialWithViewController:(UIViewController *)viewController placement:(nullable NSString *)placementName;

/**
 @abstract Determine if a locally cached interstitial exists on the mediation level.
 @discussion A return value of YES here indicates that there is a cached interstitial for one of the ad networks.

 @return YES if there is a locally cached interstitial, NO otherwise.
 */
+ (BOOL)hasInterstitial;

/**
 @abstract Verify if a certain placement has reached its ad limit.
 @discussion This is to ensure you don’t try to show interstitial when the placement has been capped or paced and thus will not serve the interstitial ad.

 @param placementName The placement name as was defined in the platform.
 @return YES if capped or paced, NO otherwise.
 */
+ (BOOL)isInterstitialCappedForPlacement:(NSString *)placementName;

#pragma mark - Demand Only Interstitial

/**
 @abstract Sets the delegate for demand only interstitial callbacks.
 @param delegate The 'ISDemandOnlyInterstitialDelegate' for IronSource to send callbacks to.
 */
+ (void)setISDemandOnlyInterstitialDelegate:(id<ISDemandOnlyInterstitialDelegate>)delegate;

/**
 @abstract Loads a demand only interstitial.
 @discussion This method will load a demand only interstitial ad.
 @param instanceId The demand only instance id to be used to display the interstitial.
 */
+ (void)loadISDemandOnlyInterstitial:(NSString *)instanceId;

/**
 @abstract Show a demand only rewarded video using the default placement.
 @param viewController The UIViewController to display the interstitial within.
 @param instanceId The demand only instance id to be used to display the interstitial.
 */
+ (void)showISDemandOnlyInterstitial:(UIViewController *)viewController instanceId:(NSString *)instanceId;

/**
 @abstract Show a demand only rewarded video using the provided placement name.
 @param viewController The UIViewController to display the interstitial within.
 @param placementName The placement name as was defined in the platform. If nil is passed, a default placement will be used.
 @param instanceId The demand only instance id to be used to display the interstitial.
 */
+ (void)showISDemandOnlyInterstitial:(UIViewController *)viewController placement:(nullable NSString *)placementName instanceId:(NSString *)instanceId;

/**
 @abstract Determine if a locally cached interstitial exists for a demand only instance id.
 @discussion A return value of YES here indicates that there is a cached interstitial for the instance id.
 @param instanceId The demand only instance id to be used to display the interstitial.
 @return YES if there is a locally cached interstitial, NO otherwise.
 */
+ (BOOL)hasISDemandOnlyInterstitial:(NSString *)instanceId;

#pragma mark - Offerwall

/**
 @abstract Sets the delegate for offerwall callbacks.

 @param delegate The 'ISOfferwallDelegate' for IronSource to send callbacks to.
 */
+ (void)setOfferwallDelegate:(id<ISOfferwallDelegate>)delegate;

/**
 @abstract Show an offerwall using the default placement.

 @param viewController The UIViewController to display the offerwall within.
 */
+ (void)showOfferwallWithViewController:(UIViewController *)viewController;

/**
 @abstract Show an offerwall using the provided placement name.

 @param viewController The UIViewController to display the offerwall within.
 @param placementName The placement name as was defined in the platform. If nil is passed, a default placement will be used.
 */
+ (void)showOfferwallWithViewController:(UIViewController *)viewController placement:(nullable NSString *)placementName;

/**
 @abstract Retrive information on the user’s total credits and any new credits the user has earned.
 @discussion The function can be called at any point during the user’s engagement with the app.
 */
+ (void)offerwallCredits;

/**
 @abstract Determine if the offerwall is prepared.

 @return YES if there is an available offerwall, NO otherwise.
 */
+ (BOOL)hasOfferwall;

#pragma mark - Banner

/**
 @abstract Sets the delegate for banner callbacks.
 
 @param delegate The 'ISBannerDelegate' for IronSource to send callbacks to.
 */
+ (void)setBannerDelegate:(id<ISBannerDelegate>)delegate;

/**
 @abstract Loads a banner using the default placement.
 @discussion This method will load banner ads of the requested size from the underlying ad networks according to their priority.
 
 The size should contain ISBannerSize value that represent the required banner ad size.
 e.g. [IronSource loadBannerWithViewController:self size:ISBannerSize_BANNER];
 
 Custom banner size:
 ISBannerSize* bannerSize = [[ISBannerSize alloc] initWithWidth:320 andHeight:50];
 [IronSource loadBannerWithViewController:self size:bannerSize];
 
 @param viewController The UIViewController to display the banner within.
 @param size The required banner ad size
 */
+ (void)loadBannerWithViewController:(UIViewController *)viewController size:(ISBannerSize *)size;

/**
 @abstract Loads a banner using the provided placement name.
 @discussion This method will load banner ads of the requested size from the underlying ad networks according to their priority.
 
 The size should contain ISBannerSize value that represent the required banner ad size.
 e.g. [IronSource loadBannerWithViewController:self size:ISBannerSize_BANNER placement:@"your_placement_name"];
 
 Custom banner size:
 ISBannerSize* bannerSize = [[ISBannerSize alloc] initWithWidth:320 andHeight:50];
 [IronSource loadBannerWithViewController:self size:bannerSize placement:@"your_placement_name"];
 
 @param viewController The UIViewController to display the banner within.
 @param size The required banner ad size
 @param placementName The placement name as was defined in the platform. If nil is passed, the default placement will be used.
 */
+ (void)loadBannerWithViewController:(UIViewController *)viewController size:(ISBannerSize *)size placement:(nullable NSString *)placementName;

/**
 @abstract Removes the banner from memory.
 @param banner The ISBannerView to remove.
 */
+ (void)destroyBanner:(ISBannerView *)banner;

/**
 @abstract Verify if a certain placement has reached its ad limit.
 @discussion This is to ensure you don’t try to load a banner when the placement has been capped or paced and thus will not serve the banner ad.
 
 @param placementName The placement name as was defined in the platform.
 @return YES if capped or paced, NO otherwise.
 */
+ (BOOL)isBannerCappedForPlacement:(NSString *)placementName;

#pragma mark - Logging

/**
 @abstract Sets the delegate for log callbacks.

 @param delegate The 'ISLogDelegate' for IronSource to send callbacks to.
 */
+ (void)setLogDelegate:(id<ISLogDelegate>)delegate;

+ (void)setConsent:(BOOL)consent;

@end

NS_ASSUME_NONNULL_END

#endif
