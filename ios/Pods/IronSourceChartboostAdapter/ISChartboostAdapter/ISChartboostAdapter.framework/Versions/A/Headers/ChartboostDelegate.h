//
//  ChartboostDelegate.h
//  Chartboost
//
//  Copyright 2018 Chartboost. All rights reserved.
//

#import <Foundation/Foundation.h>

@class UIView;

/*!
 @typedef NS_ENUM (NSUInteger, CBLogLevel)
 
 @abstract
 Set logging level. Default is OFF
 */
typedef NS_ENUM(NSUInteger, CBLoggingLevel) {
    /*! Logging Off. */
    CBLoggingLevelOff,
    /*! Verbose. */
    CBLoggingLevelVerbose,
    /*! Info. */
    CBLoggingLevelInfo,
    /*! Warning. */
    CBLoggingLevelWarning,
    /*! Error. */
    CBLoggingLevelError,
};


/*!
 @typedef NS_ENUM (NSUInteger, CBFramework)
 
 @abstract
 Used with setFramework:(CBFramework)framework calls to set suffix for
 wrapper libraries like Unity or Corona.
 */
typedef NS_ENUM(NSUInteger, CBFramework) {
    /*! Unity. */
    CBFrameworkUnity,
    /*! Corona. */
    CBFrameworkCorona,
    /*! Adobe AIR. */
    CBFrameworkAIR,
    /*! GameSalad. */
    CBFrameworkGameSalad,
    /*! Cordova. */
    CBFrameworkCordova,
    /*! CocoonJS. */
    CBFrameworkCocoonJS,
    /*! Cocos2d-x. */
    CBFrameworkCocos2dx,
    /*! Prime31Unreal. */
    CBFrameworkPrime31Unreal,
    /*! Weeby. */
    CBFrameworkWeeby,
    /*! Unknown. Other */
    CBFrameworkOther
};

/*!
 @typedef NS_ENUM (NSUInteger, CBMediation)
 
 @abstract
 Used with setMediation:(CBMediation)library calls to set mediation library name
 partners. If you don't see your library here, contact support.
 */
typedef NS_ENUM(NSUInteger, CBMediation) {
    /*! Unknown. Other */
    CBMediationOther,
    /*! AdMarvel */
    CBMediationAdMarvel,
    /*! Fuse */
    CBMediationFuse,
    /*! Fyber */
    CBMediationFyber,
    /*! HeyZap */
    CBMediationHeyZap,
    /*! MoPub */
    CBMediationMoPub,
    /*! Supersonic */
    CBMediationSupersonic,
    /*! AdMob */
    CBMediationAdMob,
    /*! HyprMX */
    CBMediationHyprMX,
    /*! AerServ */
    CBMediationAerServ
};



/*!
 @typedef NS_ENUM (NSUInteger, CBLoadError)
 
 @abstract
 Returned to ChartboostDelegate methods to notify of Chartboost SDK errors.
 */
typedef NS_ENUM(NSUInteger, CBLoadError) {
    /*! Unknown internal error. */
    CBLoadErrorInternal = 0,
    /*! Network is currently unavailable. */
    CBLoadErrorInternetUnavailable = 1,
    /*! Too many requests are pending for that location.  */
    CBLoadErrorTooManyConnections = 2,
    /*! Interstitial loaded with wrong orientation. */
    CBLoadErrorWrongOrientation = 3,
    /*! Interstitial disabled, first session. */
    CBLoadErrorFirstSessionInterstitialsDisabled = 4,
    /*! Network request failed. */
    CBLoadErrorNetworkFailure = 5,
    /*!  No ad received. */
    CBLoadErrorNoAdFound = 6,
    /*! Session not started. */
    CBLoadErrorSessionNotStarted = 7,
    /*! There is an impression already visible.*/
    CBLoadErrorImpressionAlreadyVisible = 8,
    /*! User manually cancelled the impression. */
    CBLoadErrorUserCancellation = 10,
    /*! No location detected. */
    CBLoadErrorNoLocationFound = 11,
    /*! Error downloading asset. */
    CBLoadErrorAssetDownloadFailure = 16,
    /*! Video Prefetching is not finished */
    CBLoadErrorPrefetchingIncomplete = 21,
    /*! Error Originating from the JS side of a Web View */
    CBLoadErrorWebViewScriptError = 22,
    /*! Network is unavailable while attempting to show. */
    CBLoadErrorInternetUnavailableAtShow = 25
};

/*!
 @typedef NS_ENUM (NSUInteger, CBClickError)
 
 @abstract
 Returned to ChartboostDelegate methods to notify of Chartboost SDK errors.
 */
typedef NS_ENUM(NSUInteger, CBClickError) {
    /*! Invalid URI. */
    CBClickErrorUriInvalid,
    /*! The device does not know how to open the protocol of the URI  */
    CBClickErrorUriUnrecognized,
    /*! User failed to pass the age gate. */
    CBClickErrorAgeGateFailure,
    /*! Unknown internal error */
    CBClickErrorInternal,
};

/*!
 @typedef NS_ENUM (NSUInteger, CBStatusBarBehavior)
 
 @abstract
 Used with setStatusBarBehavior:(CBStatusBarBehavior)statusBarBehavior calls to set how fullscreen ads should
 behave with regards to the status bar.
 */
typedef NS_ENUM(NSUInteger, CBStatusBarBehavior) {
    /*! Ignore status bar altogether; fullscreen ads will use the space of the status bar. */
    CBStatusBarBehaviorIgnore,
    /*! Respect the status bar partially; fullscreen ads will use the space of the status bar but any user interactive buttons will not. */
    CBStatusBarBehaviorRespectButtons,
    /*! Respect the status bar fully; fullscreen ads will not use the status bar space. */
    CBStatusBarBehaviorRespect
};


/*!
 @typedef NS_ENUM (NSUInteger, CBPIDataUseConsent)
 
 @abstract
 GDPR compliance settings:
 */
typedef NS_ENUM(NSInteger, CBPIDataUseConsent) {
  /*! Publisher hasn't implemented functionality or the user has the option to not answer. */
  Unknown = -1,
  /*! User does not consent to targeting (Contextual ads). */
  NoBehavioral = 0,
  /*! User consents (Behavioral and Contextual Ads). */
  YesBehavioral = 1
};

/*!
 @typedef CBLocation
 
 @abstract
 Defines standard locations to describe where Chartboost SDK features appear in game.
 
 @discussion Standard locations used to describe where Chartboost features show up in your game
 For best performance, it is highly recommended to use standard locations.
 
 Benefits include:
 - Higher eCPMs.
 - Control of ad targeting and frequency.
 - Better reporting.
 */
typedef NSString * const CBLocation;

/*! "Startup" - Initial startup of game. */
FOUNDATION_EXPORT CBLocation const CBLocationStartup;
/*! "Home Screen" - Home screen the player first sees. */
FOUNDATION_EXPORT CBLocation const CBLocationHomeScreen;
/*! "Main Menu" - Menu that provides game options. */
FOUNDATION_EXPORT CBLocation const CBLocationMainMenu;
/*! "Game Screen" - Game screen where all the magic happens. */
FOUNDATION_EXPORT CBLocation const CBLocationGameScreen;
/*! "Achievements" - Screen with list of achievements in the game. */
FOUNDATION_EXPORT CBLocation const CBLocationAchievements;
/*! "Quests" - Quest, missions or goals screen describing things for a player to do. */
FOUNDATION_EXPORT CBLocation const CBLocationQuests;
/*!  "Pause" - Pause screen. */
FOUNDATION_EXPORT CBLocation const CBLocationPause;
/*! "Level Start" - Start of the level. */
FOUNDATION_EXPORT CBLocation const CBLocationLevelStart;
/*! "Level Complete" - Completion of the level */
FOUNDATION_EXPORT CBLocation const CBLocationLevelComplete;
/*! "Turn Complete" - Finishing a turn in a game. */
FOUNDATION_EXPORT CBLocation const CBLocationTurnComplete;
/*! "IAP Store" - The store where the player pays real money for currency or items. */
FOUNDATION_EXPORT CBLocation const CBLocationIAPStore;
/*! "Item Store" - The store where a player buys virtual goods. */
FOUNDATION_EXPORT CBLocation const CBLocationItemStore;
/*! "Game Over" - The game over screen after a player is finished playing. */
FOUNDATION_EXPORT CBLocation const CBLocationGameOver;
/*! "Leaderboard" - List of leaders in the game. */
FOUNDATION_EXPORT CBLocation const CBLocationLeaderBoard;
/*! "Settings" - Screen where player can change settings such as sound. */
FOUNDATION_EXPORT CBLocation const CBLocationSettings;
/*! "Quit" - Screen displayed right before the player exits a game. */
FOUNDATION_EXPORT CBLocation const CBLocationQuit;
/*! "Default" - Supports legacy applications that only have one "Default" location */
FOUNDATION_EXPORT CBLocation const CBLocationDefault;
/*!
 @protocol ChartboostDelegate
 
 @abstract
 Provide methods and callbacks to receive notifications of when the Chartboost SDK
 has taken specific actions or to more finely control the Chartboost SDK.
 
 @discussion For more information on integrating and using the Chartboost SDK
 please visit our help site documentation at https://help.chartboost.com
 
 All of the delegate methods are optional.
 */
@protocol ChartboostDelegate <NSObject>

@optional

/*!
 @abstract
 Called by the SDK to show customized AgeGate View. 
  
 @return A valid UIView. Reutrn nil if no customized Age Gate is needed.
 
 @discussion SDK will call this method to see if user wants to implement their own custom age gate view. 
             Check for didPassAgeGate for other details.
 */
- (UIView*)customAgeGateView;

/*!
 @abstract
 Called after the SDK has been successfully initialized
 
 @param status The result of the initialization. YES if successful. NO if failed.
 
 @discussion Implement to be notified of when the initialization process has finished.
 */

- (void)didInitialize:(BOOL)status;

#pragma mark - Interstitial Delegate

/*!
 @abstract
 Called before requesting an interstitial via the Chartboost API server.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if execution should proceed, NO if not.
 
 @discussion Implement to control if the Charboost SDK should fetch data from
 the Chartboost API servers for the given CBLocation.  This is evaluated
 if the showInterstitial:(CBLocation) or cacheInterstitial:(CBLocation)location
 are called.  If YES is returned the operation will proceed, if NO, then the
 operation is treated as a no-op.
 
 Default return is YES.
 */
- (BOOL)shouldRequestInterstitial:(CBLocation)location;

/*!
 @abstract
 Called before an interstitial will be displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if execution should proceed, NO if not.
 
 @discussion Implement to control if the Charboost SDK should display an interstitial
 for the given CBLocation.  This is evaluated if the showInterstitial:(CBLocation)
 is called.  If YES is returned the operation will proceed, if NO, then the
 operation is treated as a no-op and nothing is displayed.
 
 Default return is YES.
 */
- (BOOL)shouldDisplayInterstitial:(CBLocation)location;

/*!
 @abstract
 Called after an interstitial has been displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial has
 been displayed on the screen for a given CBLocation.
 */
- (void)didDisplayInterstitial:(CBLocation)location;

/*!
 @abstract
 Called after an interstitial has been loaded from the Chartboost API
 servers and cached locally.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial has been loaded from the Chartboost API
 servers and cached locally for a given CBLocation.
 */
- (void)didCacheInterstitial:(CBLocation)location;

/*!
 @abstract
 Called after an interstitial has attempted to load from the Chartboost API
 servers but failed.
 
 @param location The location for the Chartboost impression type.
 
 @param error The reason for the error defined via a CBLoadError.
 
 @discussion Implement to be notified of when an interstitial has attempted to load from the Chartboost API
 servers but failed for a given CBLocation.
 */
- (void)didFailToLoadInterstitial:(CBLocation)location
                        withError:(CBLoadError)error;

/*!
 @abstract
 Called after a click is registered, but the user is not fowrwarded to the IOS App Store.
 
 @param location The location for the Chartboost impression type.
 
 @param error The reason for the error defined via a CBLoadError.
 
 @discussion Implement to be notified of when a click is registered, but the user is not fowrwarded
 to the IOS App Store for a given CBLocation.
 */
- (void)didFailToRecordClick:(CBLocation)location
                   withError:(CBClickError)error;

/*!
 @abstract
 Called after an interstitial has been dismissed.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial has been dismissed for a given CBLocation.
 "Dismissal" is defined as any action that removed the interstitial UI such as a click or close.
 */
- (void)didDismissInterstitial:(CBLocation)location;

/*!
 @abstract
 Called after an interstitial has been closed.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial has been closed for a given CBLocation.
 "Closed" is defined as clicking the close interface for the interstitial.
 */
- (void)didCloseInterstitial:(CBLocation)location;

/*!
 @abstract
 Called after an interstitial has been clicked.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial has been click for a given CBLocation.
 "Clicked" is defined as clicking the creative interface for the interstitial.
 */
- (void)didClickInterstitial:(CBLocation)location;


#pragma mark - Rewarded Video Delegate

/*!
 @abstract
 Called before a rewarded video will be displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @return YES if execution should proceed, NO if not.
 
 @discussion Implement to control if the Charboost SDK should display a rewarded video
 for the given CBLocation.  This is evaluated if the showRewardedVideo:(CBLocation)
 is called.  If YES is returned the operation will proceed, if NO, then the
 operation is treated as a no-op and nothing is displayed.
 
 Default return is YES.
 */
- (BOOL)shouldDisplayRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has been displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has
 been displayed on the screen for a given CBLocation.
 */
- (void)didDisplayRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has been loaded from the Chartboost API
 servers and cached locally.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has been loaded from the Chartboost API
 servers and cached locally for a given CBLocation.
 */
- (void)didCacheRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has attempted to load from the Chartboost API
 servers but failed.
 
 @param location The location for the Chartboost impression type.
 
 @param error The reason for the error defined via a CBLoadError.
 
 @discussion Implement to be notified of when an rewarded video has attempted to load from the Chartboost API
 servers but failed for a given CBLocation.
 */
- (void)didFailToLoadRewardedVideo:(CBLocation)location
                         withError:(CBLoadError)error;

/*!
 @abstract
 Called after a rewarded video has been dismissed.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has been dismissed for a given CBLocation.
 "Dismissal" is defined as any action that removed the rewarded video UI such as a click or close.
 */
- (void)didDismissRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has been closed.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has been closed for a given CBLocation.
 "Closed" is defined as clicking the close interface for the rewarded video.
 */
- (void)didCloseRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has been clicked.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has been click for a given CBLocation.
 "Clicked" is defined as clicking the creative interface for the rewarded video.
 */
- (void)didClickRewardedVideo:(CBLocation)location;

/*!
 @abstract
 Called after a rewarded video has been viewed completely and user is eligible for reward.
 
 @param reward The reward for watching the video.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a rewarded video has been viewed completely and user is eligible for reward.
 */
- (void)didCompleteRewardedVideo:(CBLocation)location
                      withReward:(int)reward;

#pragma mark - InPlay Delegate

/*!
 @abstract
 Called after an InPlay object has been loaded from the Chartboost API
 servers and cached locally.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an InPlay object has been loaded from the Chartboost API
 servers and cached locally for a given CBLocation.
 */
- (void)didCacheInPlay:(CBLocation)location;

/*!
 @abstract
 Called after a InPlay has attempted to load from the Chartboost API
 servers but failed.
 
 @param location The location for the Chartboost impression type.
 
 @param error The reason for the error defined via a CBLoadError.
 
 @discussion Implement to be notified of when an InPlay has attempted to load from the Chartboost API
 servers but failed for a given CBLocation.
 */
- (void)didFailToLoadInPlay:(CBLocation)location
                  withError:(CBLoadError)error;

#pragma mark - General Delegate

/*!
 @abstract
 Called before an interstitial has been displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when an interstitial will
 be displayed on the screen for a given CBLocation.
 */
- (void)willDisplayInterstitial:(CBLocation)location;

/*!
 @abstract
 Called before a video has been displayed on the screen.
 
 @param location The location for the Chartboost impression type.
 
 @discussion Implement to be notified of when a video will
 be displayed on the screen for a given CBLocation.  You can then do things like mute
 effects and sounds.
 */
- (void)willDisplayVideo:(CBLocation)location;

/*!
 @abstract
 Called after the App Store sheet is dismissed, when displaying the embedded app sheet.
 
 @discussion Implement to be notified of when the App Store sheet is dismissed.
 */
- (void)didCompleteAppStoreSheetFlow;

/*!
 @abstract
 Called if Chartboost SDK pauses click actions awaiting confirmation from the user.
 
 @discussion Use this method to display any gating you would like to prompt the user for input.
 Once confirmed call didPassAgeGate:(BOOL)pass to continue execution.
 */
- (void)didPauseClickForConfirmation;



@end
