//
//  Chartboost.h
//  Chartboost
//
//  Copyright 2018 Chartboost. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "ChartboostDelegate.h"
@class CBInPlay;
@interface Chartboost : NSObject
#pragma mark - Main Chartboost API

/*!
 @abstract
 Start Chartboost with required appId, appSignature and delegate.
 
 @param appId The Chartboost application ID for this application.
 
 @param appSignature The Chartboost application signature for this application.
 
 @param delegate The delegate instance to receive Chartboost SDK callbacks.
 
 @discussion This method must be executed before any other Chartboost SDK methods can be used.
 Once executed this call will also controll session tracking and background tasks
 used by Chartboost.
 */
+ (void)startWithAppId:(NSString*)appId
          appSignature:(NSString*)appSignature
              delegate:(id<ChartboostDelegate>)delegate;


/*!
 @abstract
 Returns the version of the Chartboost SDK.
 */
+ (NSString*)getSDKVersion;

/*!
 @abstract
 Set the logging level
 
 @param loggingLevel The minimum level that's going to be logged
 
 @discussion Logging by default is off.
 */

+ (void)setLoggingLevel:(CBLoggingLevel)loggingLevel;

/*!
 @abstract
 Check to see if any views are visible
 
 @return YES if there is any view visible
 
 @discussion This method can be used to check if any chartboost ad's are visible on the app.
 */
+ (BOOL)isAnyViewVisible;

/*!
 @abstract
 Determine if a locally cached interstitial exists for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if there a locally cached interstitial, and NO if not.
 
 @discussion A return value of YES here indicates that the corresponding
 showInterstitial:(CBLocation)location method will present without making
 additional Chartboost API server requests to fetch data to present.
 */
+ (BOOL)hasInterstitial:(CBLocation)location;
/*!
 @abstract
 Determine if a locally cached rewarded video exists for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if there a locally cached rewarded video, and NO if not.
 
 @discussion A return value of YES here indicates that the corresponding
 showRewardedVideo:(CBLocation)location method will present without making
 additional Chartboost API server requests to fetch data to present.
 */
+ (BOOL)hasRewardedVideo:(CBLocation)location;
/*!
 @abstract
 Determine if a locally cached InPlay object exists for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if there a locally cached InPlay object, and NO if not.
 
 @discussion A return value of YES here indicates that the corresponding
 getInPlay:(CBLocation)location method will return an InPlay object without making
 additional Chartboost API server requests to fetch data to present.
 */
+ (BOOL)hasInPlay:(CBLocation)location;

/*!
 @abstract
 Cache an interstitial at the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @discussion This method will first check if there is a locally cached interstitial
 for the given CBLocation and, if found, will do nothing. If no locally cached data exists
 the method will attempt to fetch data from the Chartboost API server.
 */
+ (void)cacheInterstitial:(CBLocation)location;
/*!
 @abstract
 Present an interstitial for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @discussion This method will first check if there is a locally cached interstitial
 for the given CBLocation and, if found, will present using the locally cached data.
 If no locally cached data exists the method will attempt to fetch data from the
 Chartboost API server and present it.  If the Chartboost API server is unavailable
 or there is no eligible interstitial to present in the given CBLocation this method
 is a no-op.
 */
+ (void)showInterstitial:(CBLocation)location;

/*!
 @abstract
 Cache a rewarded video at the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @discussion This method will first check if there is a locally cached rewarded video
 for the given CBLocation and, if found, will do nothing. If no locally cached data exists
 the method will attempt to fetch data from the Chartboost API server.
 */
+ (void)cacheRewardedVideo:(CBLocation)location;



/*!
 @abstract
 Present a rewarded video for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @discussion This method will first check if there is a locally cached rewarded video
 for the given CBLocation and, if found, will present it using the locally cached data.
 If no locally cached data exists the method will attempt to fetch data from the
 Chartboost API server and present it.  If the Chartboost API server is unavailable
 or there is no eligible rewarded video to present in the given CBLocation this method
 is a no-op.
 */
+ (void)showRewardedVideo:(CBLocation)location;
/*!
 @abstract
 Cache a number of InPlay objects for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @discussion This method will first check if there is a locally cached InPlay object set
 for the given CBLocation and, if found, will do nothing. If no locally cached data exists
 the method will attempt to fetch data from the Chartboost API server.
 */
+ (void)cacheInPlay:(CBLocation)location;


/*!
 @abstract
 Return an InPlay object for the given CBLocation.
 
 @param location The location for the Chartboost impression type.
 
 @return CBInPlay object if one exists in the InPlay cache or nil if one is not yet available.
 
 @discussion This method will first check if there is a locally cached InPlay object
 for the given CBLocation and, if found, will return the object using the locally cached data.
 If no locally cached data exists the method will attempt to fetch data from the
 Chartboost API server.  If the Chartboost API server is unavailable
 or there is no eligible InPlay object to present in the given CBLocation this method
 is a no-op.
 */
+ (CBInPlay *)getInPlay:(CBLocation)location;

#pragma mark - Advanced Configuration & Use
/*!
 @abstract
 Set the Chartboost Delegate
 
 @param del The new Chartboost Delegate for the sharedChartboost instance
 
 @discussion This doesn't need to be called when calling startWithAppID, only later
 to switch the delegate object.
 */
+ (void)setDelegate:(id<ChartboostDelegate>)del;

/*!
 @abstract
 Confirm if an age gate passed or failed. When specified Chartboost will wait for
 this call before showing the IOS App Store.
 
 @param pass The result of successfully passing the age confirmation.
 
 @discussion If you have configured your Chartboost experience to use the age gate feature
 then this method must be executed after the user has confirmed their age.  The Chartboost SDK
 will halt until this is done.
 */
+ (void)didPassAgeGate:(BOOL)pass;

/*!
 @abstract
 Opens a "deep link" URL for a Chartboost Custom Scheme.
 
 @param url The URL to open.
 
 @param sourceApplication The application that originated the action.
 
 @return YES if Chartboost SDK is capable of handling the URL and does so, and NO if not.
 
 @discussion If you have configured a custom scheme and provided "deep link" URLs that the
 Chartboost SDK is capable of handling you should use this method in your ApplicationDelegate
 class methods that handle custom URL schemes.
 */
+ (BOOL)handleOpenURL:(NSURL *)url
    sourceApplication:(NSString *)sourceApplication;

/*!
 @abstract
 Opens a "deep link" URL for a Chartboost Custom Scheme.
 
 @param url The URL to open.
 
 @param sourceApplication The application that originated the action.
 
 @param annotation The provided annotation.
 
 @return YES if Chartboost SDK is capable of handling the URL and does so, and NO if not.
 
 @discussion If you have configured a custom scheme and provided "deep link" URLs that the
 Chartboost SDK is capable of handling you should use this method in your ApplicationDelegate
 class methods that handle custom URL schemes.
 */
+ (BOOL)handleOpenURL:(NSURL *)url
    sourceApplication:(NSString *)sourceApplication
           annotation:(id)annotation;

/*!
 @abstract
 Set a custom identifier to send in the POST body for all Chartboost API server requests.
 
 @param customId The identifier to send with all Chartboost API server requests.
 
 @discussion Use this method to set a custom identifier that can be used later in the Chartboost
 dashboard to group information by.
 */
+ (void)setCustomId:(NSString *)customId;

/*!
 @abstract
 Get the current custom identifier being sent in the POST body for all Chartboost API server requests.
 
 @return The identifier being sent with all Chartboost API server requests.
 
 @discussion Use this method to get the custom identifier that can be used later in the Chartboost
 dashboard to group information by.
 */
+ (NSString *)getCustomId;

/*!
 @abstract
 Set a custom version to append to the POST body of every request. This is useful for analytics and provides chartboost with important information.
 example: [Chartboost setChartboostWrapperVersion:@"6.4.6"];
 
 @param chartboostWrapperVersion The version sent as a string.
 
 @discussion This is an internal method used via Chartboost's Unity and Corona SDKs
 to track their usage.
 */
+ (void)setChartboostWrapperVersion:(NSString*)chartboostWrapperVersion;

/*!
 @abstract
 Set a custom framework suffix to append to the POST headers field.
 example setFramework:Unity withVersion:4.6, setFrameworkVersion:5.2.1
 
 @param framework The suffix to send with all Chartbooost API server requets.
 @param version The platform version used for analytics. Example Unity should set Application.unityVersion
 
 @discussion This is an internal method used via Chartboost's Unity and Corona SDKs
 to track their usage.
 */
+ (void)setFramework:(CBFramework)framework withVersion:(NSString *)version;

/*!
 @abstract
 Set a custom mediation library to append to the POST body of every request.
 example setMediation:CBMediationMoPub withVersion:@"3.8.0"
 
 @param library The constant for the name of the mediation library.
 @param libraryVersion The version sent as a string.
 
 @discussion This is an internal method used by mediation partners to track their usage.
 */
+ (void)setMediation:(CBMediation)library withVersion:(NSString*)libraryVersion;

/*!
 @abstract
 Decide if Chartboost SDK should show interstitials in the first session.
 
 @param shouldRequest YES if allowed to show interstitials in first session, NO otherwise.
 
 @discussion Set to control if Chartboost SDK can show interstitials in the first session.
 The session count is controlled via the startWithAppId:appSignature:delegate: method in the Chartboost
 class.
 
 Default is YES.
 */
+ (void)setShouldRequestInterstitialsInFirstSession:(BOOL)shouldRequest;

/*!
 @abstract
 Decide if Chartboost SDK should block for an age gate.
 
 @param shouldPause YES if Chartboost should pause for an age gate, NO otherwise.
 
 @discussion Set to control if Chartboost SDK should block for an age gate.
 
 Default is NO.
 */
+ (void)setShouldPauseClickForConfirmation:(BOOL)shouldPause;


/*!
 @abstract
 Decide if Chartboost SDKK will attempt to fetch videos from the Chartboost API servers.
 
 @param shouldPrefetch YES if Chartboost should prefetch video content, NO otherwise.
 
 @discussion Set to control if Chartboost SDK control if videos should be prefetched.
 
 Default is YES.
 */
+ (void)setShouldPrefetchVideoContent:(BOOL)shouldPrefetch;

/*!
 @abstract
 Set to enable and disable the auto cache feature (Enabled by default).
 
 @param shouldCache The param to enable or disable auto caching.
 
 @discussion If set to YES the Chartboost SDK will automatically attempt to cache an impression
 once one has been consumed via a "show" call.  If set to NO, it is the responsibility of the
 developer to manage the caching behavior of Chartboost impressions.
 */
+ (void)setAutoCacheAds:(BOOL)shouldCache;

/*!
 @abstract
 Get the current auto cache behavior (Enabled by default).
 
 @return YES if the auto cache is enabled, NO if it is not.
 
 @discussion If set to YES the Chartboost SDK will automatically attempt to cache an impression
 once one has been consumed via a "show" call.  If set to NO, it is the responsibility of the
 developer to manage the caching behavior of Chartboost impressions.
 */
+ (BOOL)getAutoCacheAds;

/*!
 @abstract
 Set to control how the fullscreen ad units should interact with the status bar. (CBStatusBarBehaviorIgnore by default).
 
 @param statusBarBehavior The param to set if fullscreen video should respect the status bar.
 
 @discussion See the enum value comments for descriptions on the values and their behavior.  Only use this feature if your
 application has the status bar enabled.
 */
+ (void)setStatusBarBehavior:(CBStatusBarBehavior)statusBarBehavior;


/*!
 @abstract
 returns YES if auto IAP tracking is enabled, NO if it isn't.
 
 @discussion Call to check if automatic tracking of in-app purchases is enabled.
 The setting is controlled by the server.
 */
+ (BOOL)getAutoIAPTracking;

/*!
 @abstract
 Mute/unmute chartboost ads.
 @param mute YES all sounds, NO activates them. Default is NO
 @discussion default value is NO
 */
+ (void)setMuted:(BOOL)mute;

/*!
 @abstract
 Set to restrict Chartboost's ability to collect personal data from the device. See CBPIDataUseConsent declaration for details
 Note: This method should be called before starting the Chartboost SDK with startWithAppId:appSignature:delegate.
 @param consent: set the consent level
 @discussion Default value is Unknown
 */
+ (void)setPIDataUseConsent:(CBPIDataUseConsent)consent;

/*!
 @abstract
 Get the current consent setting
 */
+ (CBPIDataUseConsent)getPIDataUseConsent;

#pragma mark - Deprecated
+ (void)restrictDataCollection:(BOOL)shouldRestrict __attribute__((deprecated("Use setPIDataUseConsent:(CBPIDataUseConsent)consent instead")));

+ (BOOL)hasMoreApps:(CBLocation)location  __attribute__((deprecated("This method is deprecated will always return false")));
+ (void)showMoreApps:(CBLocation)location __attribute__((deprecated("This method is deprecated and is a no-op")));
+ (void)showMoreApps:(UIViewController *)viewController
            location:(CBLocation)location  __attribute__((deprecated("This method is deprecated and is a no-op")));
+ (void)setShouldDisplayLoadingViewForMoreApps:(BOOL)shouldDisplay __attribute__((deprecated("This method is deprecated and is a no-op")));
+ (void)cacheMoreApps:(CBLocation)location __attribute__((deprecated("This method is deprecated and is a no-op")));

@end
