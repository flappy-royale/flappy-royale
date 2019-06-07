//
//  ALInterstitialAd.h
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "ALSdk.h"
#import "ALAdService.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class is used to display full-screen ads to the user.
 */
@interface ALInterstitialAd : NSObject

#pragma mark - Ad Delegates

/**
 * An object conforming to the ALAdLoadDelegate protocol, which, if set, will be notified of ad load events.
 */
@property (strong, nonatomic, nullable) id<ALAdLoadDelegate> adLoadDelegate;

/**
 * An object conforming to the ALAdDisplayDelegate protocol, which, if set, will be notified of ad show/hide events.
 */
@property (strong, nonatomic, nullable) id<ALAdDisplayDelegate> adDisplayDelegate;

/**
 * An object conforming to the ALAdVideoPlaybackDelegate protocol, which, if set, will be notified of video start/finish events.
 */
@property (strong, nonatomic, nullable) id<ALAdVideoPlaybackDelegate> adVideoPlaybackDelegate;

#pragma mark - Loading and Showing Ads, Class Methods

/**
 * Show an interstitial over the application's key window.
 * This will load the next interstitial and display it.
 */
+ (ALInterstitialAd *)show;

/**
 * Get a reference to the shared singleton instance.
 *
 * This method calls [ALSdk shared] which requires you to have an SDK key defined in <code>Info.plist</code>.
 * If you use <code>[ALSdk sharedWithKey: ...]</code> then you will need to use the instance methods instead.
 */
+ (ALInterstitialAd *)shared;

#pragma mark - Loading and Showing Ads, Instance Methods

/**
 * Show an interstitial over the application's key window.
 * This will load the next interstitial and display it.
 */
- (void)show;

/**
 * Show current interstitial over a given window and render a specified ad loaded by ALAdService.
 *
 * @param ad The ad to render into this interstitial.
 */
- (void)showAd:(ALAd *)ad;

#pragma mark - Initialization

/**
 * Initialize an instance of this class with a SDK instance.
 *
 * @param sdk The AppLovin SDK instance to use.
 */
- (instancetype)initWithSdk:(ALSdk *)sdk;

@end

@interface ALInterstitialAd (ALDeprecated)
- (instancetype)initInterstitialAdWithSdk:(ALSdk *)sdk __deprecated_msg("Use initWithSdk: instead.");
- (void)showOverPlacement:(NSString *)placement __deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
+ (ALInterstitialAd *)showOverPlacement:(nullable NSString *)placement __deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
- (void)showOver:(UIWindow *)window placement:(nullable NSString *)placement andRender:(ALAd *)ad __deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
+ (ALInterstitialAd *)showOver:(UIWindow *)window placement:(nullable NSString* )placement __deprecated_msg("Placements have been deprecated and will be removed in a future SDK version. Please configure zones from the UI and use them instead.");
+ (BOOL)isReadyForDisplay __deprecated_msg("Checking whether an ad is ready for display has been deprecated and will be removed in a future SDK version. Please use `show`, `showOver:` or `showOver:andRender:` to display an ad.");
@property (readonly, atomic, getter=isReadyForDisplay) BOOL readyForDisplay __deprecated_msg("Checking whether an ad is ready for display has been deprecated and will be removed in a future SDK version. Please use `show`, `showOver:` or `showOver:andRender:` to display an ad.");
- (instancetype)initWithFrame:(CGRect)frame sdk:(ALSdk *)sdk __deprecated_msg("Initializing with the `frame` property has been deprecated and will be removed in a future SDK version.");
@property (assign, nonatomic) CGRect frame __deprecated_msg("Setting the `frame` property has no effect. It has been deprecated and will be removed in a future SDK version.");
@property (assign, nonatomic) BOOL hidden __deprecated_msg("Setting the `hidden` property has no effect. It has been deprecated and will be removed in a future SDK version.");
- (void)dismiss __deprecated_msg("Dismissing an interstitial while playing negatively affects CPM and is highy discouraged. It is now deprecated and will be removed in a future SDK version.");
+ (ALInterstitialAd *)showOver:(UIWindow *)window __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use show instead.");
- (void)showOver:(UIWindow *)window __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use show instead.");
- (void)showOver:(UIWindow *)window andRender:(ALAd *)ad __deprecated_msg("Explicitly passing in an UIWindow to show an ad is deprecated as all cases show over the application's key window. Use showAd: instead.");

@end

NS_ASSUME_NONNULL_END
