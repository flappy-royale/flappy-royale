// Copyright (C) 2014 - 2018 by Tapjoy Inc.
//
// This file is part of the Tapjoy SDK.
//
// By using the Tapjoy SDK in your software, you agree to the terms of the Tapjoy SDK License Agreement.
//
// The Tapjoy SDK is bound by the Tapjoy SDK License Agreement and can be found here: https://www.tapjoy.com/sdk/license

//The Tapjoy iOS SDK.

#ifndef _TAPJOY_H
#define _TAPJOY_H

#import <UIKit/UIKit.h>
#import "TapjoyConnectConstants.h"
#import "TapjoyAuctionConstants.h"
#import "TJPlacement.h"

#define TJC_DEPRECATION_WARNING(VERSION) __attribute__((deprecated("Go to dev.tapjoy.com for instructions on how to fix this warning")))
#define TJ_DEPRECATED_CLASS     __attribute__((deprecated("TapjoyConnect Class is deprecated, use Tapjoy Class")))
#define TJC_HIGHEST_UNSUPPORTED_SYSTEM_VERISON	@"4.3.5"

typedef void (^currencyCompletion)(NSDictionary *parameters, NSError *error);
typedef void (^networkCompletion)(BOOL success, NSError *error);
typedef void (^urlCompletion)(NSURL *url, NSDate *expires, NSError *error);

@class TJCCurrencyManager;
@class TJCVideoManager;
@class TJCViewHandler;
@class TJCNetReachability;
@class TJCUtil;
@class TJCLog;
@class TJPlacement;

/**	
 * The Tapjoy Connect Main class. This class provides all publicly available methods for developers to integrate Tapjoy into their applications. 
 */
@interface Tapjoy :  NSObject

/** The application SDK key unique to this app. */
@property (nonatomic, copy) NSString *sdkKey;

/** The application ID unique to this app. */
@property (nonatomic, copy) NSString *appID;

/** The Tapjoy secret key for this applicaiton. */
@property (nonatomic, copy) NSString *secretKey;

/** The user ID, a custom ID set by the developer of an app to keep track of its unique users. */
@property (nonatomic, copy) NSString *userID;

/** The name of the plugin used. If no plugin is used, this value is set to "native" by default. */
@property (nonatomic, copy) NSString *plugin;

/** The currency multiplier value, used to adjust currency earned. */
@property (nonatomic, assign) float currencyMultiplier;

@property (nonatomic, copy) NSString *appGroupID;

@property (nonatomic, copy) NSString *store;
@property (nonatomic, copy) NSString *analyticsApiKey;
@property (nonatomic, copy) NSString *managedDeviceID;

@property (nonatomic, strong) TJCCurrencyManager *currencyManager;
@property (nonatomic, strong) TJCVideoManager *videoManager;
@property (nonatomic, strong) TJCViewHandler *viewHandler;
@property (nonatomic, strong) TJCUtil *util;
@property (nonatomic, strong) TJCLog *log;


/**
 * This method is called to initialize the Tapjoy system and notify the server that this device is running your application.
 *
 * This method should be called upon app delegate initialization in the applicationDidFinishLaunching method.
 *
 * @param sdkKey The application SDK Key. Retrieved from the app dashboard in your Tapjoy account.
 * @return n/a
 */
+ (void)connect:(NSString *)sdkKey;

/**
 * This method is called to initialize the Tapjoy system and notify the server that this device is running your application.
 *
 * This method should be called upon app delegate initialization in the applicationDidFinishLaunching method.
 *
 * @param sdkKey The application SDK Key. Retrieved from the app dashboard in your Tapjoy account.
 * @param options NSDictionary of special flags to enable non-standard settings. Valid key:value options:
 *
 * TJC_OPTION_ENABLE_LOGGING : BOOL to enable logging
 *
 * TJC_OPTION_USER_ID : NSString user id that must be set if your currency is not managed by Tapjoy. If you don’t have a user id on launch you can call setUserID later
 *
 * TJC_OPTION_DISABLE_GENERIC_ERROR_ALERT : BOOL to disable our default error dialogs
 *
 * @return n/a
 */
+ (void)connect:(NSString *)sdkKey options:(NSDictionary *)optionsDict;

/**
 * Helper function to check if SDK is initialized
 */
+ (BOOL)isConnected;

/**
 * This method returns URL to Tapjoy support web page. This will use your default currency.
 *
 * @return URL of Tapjoy support web page
 */
+ (NSString*)getSupportURL;

/**
 * This method returns the URL to Tapjoy support web page for specified currency
 * You can get your currencyID from the Tapjoy Dashboard under the currency section.
 *
 * @param currencyID the app's currency id
 *
 * @return URL of Tapjoy support web page for specified currency
 */
+ (NSString*)getSupportURL:(NSString*)currencyID;

/**
 * Attempts to get an URL of Offerwall to show it on an external browser, i.e. Safari.
 *
 * @param placementName The name of the placement that is configured for Offerwall.
 * @param completion The completion block that is invoked after the attempt has completed.
 */
+ (void)getOfferwallURL:(NSString *)placementName completion:(urlCompletion)completion;

/**
 * This method returns a user token for programmatic mediation.
 *
 */
+ (NSString*)getUserToken;

/**
 *
 * This method enables/disables the debug mode of the SDK.
 * @param enabled true to enable, false to disable
 * @return n/a
 */
+ (void)setDebugEnabled:(BOOL)enabled; // default NO

/**
 * This method is called to track the session manually. If this method called, automatic session tracking will be disabled.
 *
 * @return n/a
 */
+ (void)startSession;
/**
 * This method is called to track the session manually. If this method called, automatic session tracking will be disabled.
 *
 * @return n/a
 */
+ (void)endSession;

/**
 * This method is called to set data version of your application.
 *
 * @param appDataVersion The application data version.
 * @return n/a
 */
+ (void)setAppDataVersion:(NSString *)appDataVarsion TJC_DEPRECATION_WARNING(11.11.1);

/**
 * This method is called to set LaunchOptions.
 * Call this method in application:didFinishLaunchingWithOptions:
 * NOTE: From 11.2.2, you don't have to call this method.
 *
 * @param launchOptions the same parameter that passed on application:didFinishLaunchingWithOptions:
 */
+ (void)setApplicationLaunchingOptions:(NSDictionary *)launchOptions TJC_DEPRECATION_WARNING(11.2.2);

/**
 * This method is called to set RemoteNotificationUserInfo.
 * Call this method in application:didReceiveRemoteNotification:
 *
 * @param userInfo the same parameter that passed on application:didReceiveRemoteNotification:
 */
+ (void)setReceiveRemoteNotification:(NSDictionary *)userInfo;

/** 
 * This method is called to send APN device token to Tapjoy server.
 * 
 * @param deviceToken the same parameter that passed on application:didRegisterForRemoteNotificationsWithDeviceToken:
 * @return n/a
 */
+ (void)setDeviceToken:(NSData *)deviceToken;

/**
 * Sets the default UIViewController to show a content of the placement having no specific view controller given.
 *
 * @warning This is **experimental** and only applicable to contents of "Push to Earn" or the default placements so far.
 */
+ (void)setDefaultViewController:(UIViewController*)viewController;

/**
 * This method is called to set the level of the user.
 *
 * @param userLevel
 *        the level of the user
 * @return n/a
 */
+ (void)setUserLevel:(int)userLevel;

/**
 * This method is callled to sets the friends count of the user.
 *
 * @param friendCount the number of friends
 * @return n/a
 */
+ (void)setUserFriendCount:(int)friendCount;

/**
 * This method is called to set a variable of the cohort.
 *
 * @param index the index of the cohort to set (1,2,3,4,5)
 * @param value the value of the property to set
 * @return n/a
 */
+ (void)setUserCohortVariable:(int)index value:(NSString *)value;

/**
 * Returns a string set which contains tags on the user.
 *
 * @return set of string
 */
+ (NSSet*)getUserTags;

/**
 * Sets tags for the user.
 *
 * @param tags the tags to be set
 *             can have up to 200 tags where each tag can have 200 characters
 */
+ (void)setUserTags:(NSSet *)tags;

/**
 * Removes all tags from the user.
 */
+ (void)clearUserTags;

/**
 * Adds the given tag to the user if it is not already present.
 *
 * @param tag the tag to be added
 */
+ (void)addUserTag:(NSString *)tag;

/**
 * Removes the given tag from the user if it is present.
 *
 * @param tag the tag to be removed
 */
+ (void)removeUserTag:(NSString *)tag;

/**
 * This method is called to track the purchase.
 *
 * @param productIdentifier the identifier of product
 * @param currencyCode the currency code of price as an alphabetic currency code specified in ISO 4217, i.e. "USD", "KRW"
 * @param price the price of product
 * @param campaignId the campaign id of the purchase request which initiated this purchase, can be nil
 * @param transactionId the identifier of iap transaction, if this is given, we will check receipt validation. (Available in iOS 7.0 and later)
 * @return n/a
 */
+ (void)trackPurchase:(NSString *)productIdentifier currencyCode:(NSString *)currencyCode price:(double)price campaignId:(NSString *)campaignId transactionId:(NSString *)transactionId;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// it will be improve/change API in Oct 2014
/**
 * This method is called to track an event of the given name with category, parameter1, parameter2 and values.
 *
 * @param name the name of event
 * @param category the category of event, can be nil
 * @param parameter1 the parameter of event, string type, can be nil
 * @param parameter2 the parameter of event, string type, can be nil
 * @param value the value of event
 * @param value1name the name of value1 of event
 * @param value1 the value of value1name
 * @param value2name the name of value2 of event
 * @param value2 the value of value2name
 * @param value3name the name of value3 of event
 * @param value3 the value of value3name
 * @param values NSDictionary that contains values of event (key must be string & value must be number)
 * @return n/a
 */
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2;
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2 value:(int64_t)value;
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2
        value1name:(NSString *)value1name value1:(int64_t)value1;
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2
        value1name:(NSString *)value1name value1:(int64_t)value1 value2name:(NSString *)value2name value2:(int64_t)value2;
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2
        value1name:(NSString *)value1name value1:(int64_t)value1 value2name:(NSString *)value2name value2:(int64_t)value2 value3name:(NSString *)value3name value3:(int64_t)value3;
+ (void)trackEvent:(NSString *)name category:(NSString *)category parameter1:(NSString *)parameter1 parameter2:(NSString *)parameter2 values:(NSDictionary *)values;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Informs the Tapjoy server that the specified Pay-Per-Action was completed. Should be called whenever a user completes an in-game action.
 *
 * @param actionID The action ID of the completed action
 * @return n/a
 */
+ (void)actionComplete:(NSString*)actionID;

/**	
 * Retrieves the globally accessible Tapjoy singleton object.
 *
 * @return The globally accessible Tapjoy singleton object.
 */
+ (id)sharedTapjoyConnect;

/**
 * Assigns a user ID for this user/device. This is used to identify the user in your application
 *
 * @param theUserID The user ID you wish to assign to this device.
 * @return n/a
 */
+ (void)setUserID:(NSString*)theUserID;
/**
 * Assigns a user ID for this user/device. This is used to identify the user in your application
 *
 * @param theUserID The user ID you wish to assign to this device.
 * @param completion The completion block that is invoked after a response is received from the server.
 * @return n/a
 */
+ (void)setUserIDWithCompletion:(NSString*)theUserID completion:(networkCompletion)completion;
/**
 * Sets the currency multiplier for virtual currency to be earned. The default is 1.0.
 *
 * Only used for non-managed (by Tapjoy) currency.
 * 
 * @param mult The currency multiplier.
 * @return n/a
 */
+ (void)setCurrencyMultiplier:(float)mult TJC_DEPRECATION_WARNING(11.4.0);

/**
 * Gets the currency multiplier for virtual currency to be earned.
 *
 * @return The currency multiplier value.
 */
+ (float)getCurrencyMultiplier TJC_DEPRECATION_WARNING(11.4.0);

/**
 * Toggle logging to the console.
 *
 * @param enable YES to enable logging, NO otherwise.
 * @return n/a
 */
+ (void)enableLogging:(BOOL)enable;

/**
 * Returns the SDK version.
 *
 * @return The Tapjoy SDK version.
 */
+ (NSString*)getVersion;

/** Used by limited SDK only **/
@property (nonatomic, copy) NSString *limitedSdkKey;
@property (nonatomic, copy) NSString *limitedAppID;
@property (nonatomic, copy) NSString *limitedSecretKey;
@property (nonatomic, copy) NSString *limitedAppGroupID;
+ (BOOL)isLimitedConnected;
+ (void)limitedConnect:(NSString *)sdkKey;

@end

/**
 * The Tapjoy Video Ad Delegate Protocol.
 */
@protocol TJCVideoAdDelegate <NSObject>

@optional

/**
 * Called when a video starts playing.
 *
 * @return n/a
 */
- (void)videoAdBegan;

/**
 * Called when a video ad is closed.
 *
 * @return n/a
 */
- (void)videoAdClosed;

/**
 * Called when a video has completed playing.
 *
 * @return n/a
 */
- (void)videoAdCompleted;

/**
 * Called when a video related error occurs.
 *
 * @param errorMsg Error message.
 * @return n/a
 */
- (void)videoAdError:(NSString*)errorMsg;

@end

@interface Tapjoy (TJCCurrencyManager)

/**
 * Requests for virtual currency balance notify via TJC_GET_CURRENCY_RESPONSE_NOTIFICATION notification.
 *
 * @return n/a
 */
+ (void)getCurrencyBalance;

/**
 * Requests for virtual currency balance information.
 *
 * @param completion The completion block that is invoked after a response is received from the server.
 * @return n/a
 */
+ (void)getCurrencyBalanceWithCompletion:(currencyCompletion)completion;

/**
 * Updates the virtual currency for the user with the given spent amount of currency.
 *
 * If the spent amount exceeds the current amount of currency the user has, nothing will happen.
 * @param points The amount of currency to subtract from the current total amount of currency the user has.
 * @return n/a
 */
+ (void)spendCurrency:(int)amount;

/**
 * Updates the virtual currency for the user with the given spent amount of currency.
 *
 * If the spent amount exceeds the current amount of currency the user has, nothing will happen.
 * @param amount The amount of currency to subtract from the current total amount of currency the user has.
 * @param completion The completion block that is invoked after a response is received from the server.
 * @return n/a
 */
+ (void)spendCurrency:(int)amount completion:(currencyCompletion)completion;

/**
 * Updates the virtual currency for the user with the given awarded amount of currency.
 *
 * @param amount The amount of currency to add to the current total amount of currency the user has.
 * @return n/a
 */
+ (void)awardCurrency:(int)amount;

/**
 * Updates the virtual currency for the user with the given awarded amount of currency.
 *
 * @param amount The amount of currency to add to the current total amount of currency the user has.
 * @param completion The completion block that is invoked after a response is received from the server.
 * @return n/a
 */
+ (void)awardCurrency:(int)amount completion:(currencyCompletion)completion;

/**
 * Shows a UIAlert that tells the user how much currency they just earned.
 *
 * @return n/a
 */
+ (void)showDefaultEarnedCurrencyAlert;

/**
 * This is used for sending User's consent to behavioral advertising such as in the context of GDPR
 * The consent value can be "0" (User has not provided consent), "1" (User has provided consent) or
 * a daisybit string as suggested in IAB's Transparency and Consent Framework
 *
 * @param value "0" (User has not provided consent), "1" (User has provided consent) or a daisybit string as suggested in IAB's Transparency and Consent Framework
 **/
+ (void)setUserConsent:(NSString*) value;

/**
 * This can be used by the integrating App to indicate if the user falls in any of the GDPR applicable countries
 * (European Economic Area). The value should be set to YES when User (Subject) is applicable to GDPR regulations
 * and NO when User is not applicable to GDPR regulations. In the absence of this call, Tapjoy server makes the
 * determination of GDPR applicability.
 *
 * @param gdprApplicability YES if the user is affected by GDPR, NO if they are not.
 */
+(void)subjectToGDPR:(BOOL) gdprApplicability;

/**
 * In the US, the Children’s Online Privacy Protection Act (COPPA) imposes certain requirements on operators of online services that (a)
 * have actual knowledge that the connected user is a child under 13 years of age, or (b) operate services (including apps) that are
 * directed to children under 13.
 *
 * Similarly, the GDPR imposes certain requirements in connection with data subjects who are below the applicable local minimum age for
 * online consent (ranging from 13 to 16, as established by each member state).
 *
 * For applications that are not directed towards children under 13 years of age, but still have a minority share of users known to be
 * under the applicable minimum age, utilize this method to access Tapjoy’s monetization capability. This method will set
 * ad_tracking_enabled to false for Tapjoy which only shows the user contextual ads. No ad tracking will be done on this user.
 *
 * @param isBelowConsentAge YES if the user is affected by COPPA, NO if they are not.
 */
+(void)belowConsentAge:(BOOL) isBelowConsentAge;

@end


@interface Tapjoy (TJCVideoManager)

/**
 * Sets the class that implements the TJCVideoAdDelegate protocol.
 *
 * @param delegate The class that implements the TJCVideoAdDelegate protocol.
 * @return n/a
 */
+ (void)setVideoAdDelegate:(id<TJCVideoAdDelegate>)delegate;

@end

@protocol TJCTopViewControllerProtocol <NSObject>
@required
@property (nonatomic, assign) BOOL canRotate;
@end

#endif
