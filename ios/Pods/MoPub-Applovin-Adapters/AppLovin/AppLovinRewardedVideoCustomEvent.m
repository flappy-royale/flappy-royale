#import "AppLovinRewardedVideoCustomEvent.h"
#import "AppLovinAdapterConfiguration.h"

#if __has_include("MoPub.h")
    #import "MPRewardedVideoReward.h"
    #import "MPError.h"
    #import "MPLogging.h"
    #import "MoPub.h"
#endif

#if __has_include(<AppLovinSDK/AppLovinSDK.h>)
    #import <AppLovinSDK/AppLovinSDK.h>
#else
    #import "ALIncentivizedInterstitialAd.h"
    #import "ALPrivacySettings.h"
#endif

#define DEFAULT_ZONE @""
#define DEFAULT_TOKEN_ZONE @"token"
#define ZONE_FROM_INFO(__INFO) ( ([__INFO[@"zone_id"] isKindOfClass: [NSString class]] && ((NSString *) __INFO[@"zone_id"]).length > 0) ? __INFO[@"zone_id"] : @"" )

// This class implementation with the old classname is left here for backwards compatibility purposes.
@implementation AppLovinRewardedCustomEvent
@end

@interface AppLovinRewardedVideoCustomEvent() <ALAdLoadDelegate, ALAdDisplayDelegate, ALAdVideoPlaybackDelegate, ALAdRewardDelegate>

@property (nonatomic, strong) ALSdk *sdk;
@property (nonatomic, strong) ALIncentivizedInterstitialAd *incent;

@property (nonatomic, assign) BOOL fullyWatched;
@property (nonatomic, strong) MPRewardedVideoReward *reward;
@property (nonatomic, assign, getter=isTokenEvent) BOOL tokenEvent;
@property (nonatomic, strong) ALAd *tokenAd;
@property (nonatomic, copy) NSString *zoneIdentifier;

@end

@implementation AppLovinRewardedVideoCustomEvent
static NSString *const kALMoPubMediationErrorDomain = @"com.applovin.sdk.mediation.mopub.errorDomain";

// A dictionary of Zone -> `ALIncentivizedInterstitialAd` to be shared by instances of the custom event.
// This prevents skipping of ads as this adapter will be re-created and preloaded (along with underlying `ALIncentivizedInterstitialAd`)
// on every ad load regardless if ad was actually displayed or not.
static NSMutableDictionary<NSString *, ALIncentivizedInterstitialAd *> *ALGlobalIncentivizedInterstitialAds;

#pragma mark - Class Initialization

+ (void)initialize
{
    [super initialize];
    
    ALGlobalIncentivizedInterstitialAds = [NSMutableDictionary dictionary];
}

#pragma mark - MPRewardedVideoCustomEvent Overridden Methods

- (void)requestRewardedVideoWithCustomEventInfo:(NSDictionary *)info
{
    [self requestRewardedVideoWithCustomEventInfo: info adMarkup: nil];
}

- (void)requestRewardedVideoWithCustomEventInfo:(NSDictionary *)info adMarkup:(NSString *)adMarkup
{
    // Collect and pass the user's consent from MoPub onto the AppLovin SDK
    if ([[MoPub sharedInstance] isGDPRApplicable] == MPBoolYes) {
        BOOL canCollectPersonalInfo = [[MoPub sharedInstance] canCollectPersonalInfo];
        [ALPrivacySettings setHasUserConsent: canCollectPersonalInfo];
    }
    
    self.sdk = [self SDKFromCustomEventInfo: info];
    self.sdk.mediationProvider = ALMediationProviderMoPub;
    [self.sdk setPluginVersion: AppLovinAdapterConfiguration.pluginVersion];
    
    [AppLovinAdapterConfiguration setCachedInitializationParameters: info];
    
    BOOL hasAdMarkup = adMarkup.length > 0;
    
    MPLogInfo(@"Requesting AppLovin rewarded video with info: %@ and has ad markup: %d", info, hasAdMarkup);
    
    if ( hasAdMarkup )
    {
        self.zoneIdentifier = DEFAULT_TOKEN_ZONE;
    }
    else
    {
        self.zoneIdentifier = ZONE_FROM_INFO(info);
    }
    
    // Create incentivized ad based off of zone
    self.incent = [[self class] incentivizedInterstitialAdForZoneIdentifier: self.zoneIdentifier
                                                                customEvent: self
                                                                        sdk: self.sdk];
    
    // Use token API
    if ( hasAdMarkup )
    {
        self.tokenEvent = YES;
        
        [self.sdk.adService loadNextAdForAdToken: adMarkup andNotify: self];
        MPLogAdEvent([MPLogEvent adLoadAttemptForAdapter:NSStringFromClass(self.class) dspCreativeId:nil dspName:nil], [self getAdNetworkId]);
    }
    // Zone/regular ad load
    else
    {
        [self.incent preloadAndNotify: self];
        MPLogAdEvent([MPLogEvent adLoadAttemptForAdapter:NSStringFromClass(self.class) dspCreativeId:nil dspName:nil], [self getAdNetworkId]);
    }
}

- (BOOL)hasAdAvailable
{
    if ( [self isTokenEvent] )
    {
        return self.tokenAd != nil;
    }
    else
    {
        return self.incent.readyForDisplay;
    }
}

- (void)presentRewardedVideoFromViewController:(UIViewController *)viewController
{
    MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);

    if ( [self hasAdAvailable] )
    {
        self.reward = nil;
        self.fullyWatched = NO;
        
        if ( [self isTokenEvent] )
        {
            [self.incent showAd: self.tokenAd andNotify: self];
        }
        else
        {
            [self.incent showAndNotify: self];
        }
    }
    else
    {
        NSError *error = [NSError errorWithDomain: kALMoPubMediationErrorDomain
                                             code: kALErrorCodeUnableToRenderAd
                                         userInfo: @{NSLocalizedFailureReasonErrorKey : @"Adapter requested to display a rewarded video before one was loaded"}];
        
        [self.delegate rewardedVideoDidFailToPlayForCustomEvent: self error: error];
        MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
    }
}

- (void)handleCustomEventInvalidated { }
- (void)handleAdPlayedForCustomEventNetwork { }

#pragma mark - Ad Load Delegate

- (void)adService:(ALAdService *)adService didLoadAd:(ALAd *)ad
{

    if ( [self isTokenEvent] )
    {
        self.tokenAd = ad;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.delegate rewardedVideoDidLoadAdForCustomEvent: self];
        
        MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    });
}

- (void)adService:(ALAdService *)adService didFailToLoadAdWithError:(int)code
{
    NSError *error = [NSError errorWithDomain: kALMoPubMediationErrorDomain
                                         code: [self toMoPubErrorCode: code]
                                     userInfo: nil];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.delegate rewardedVideoDidFailToLoadAdForCustomEvent: self error: error];
        MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
    });
}

#pragma mark - Ad Display Delegate

- (void)ad:(ALAd *)ad wasDisplayedIn:(UIView *)view
{
    [self.delegate rewardedVideoWillAppearForCustomEvent: self];
    [self.delegate rewardedVideoDidAppearForCustomEvent: self];
    
    MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

- (void)ad:(ALAd *)ad wasHiddenIn:(UIView *)view
{
    if ( self.fullyWatched && self.reward )
    {
        [self.delegate rewardedVideoShouldRewardUserForCustomEvent: self reward: self.reward];
    }
    
    [self.delegate rewardedVideoWillDisappearForCustomEvent: self];
    [self.delegate rewardedVideoDidDisappearForCustomEvent: self];
    
    MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    
    self.incent = nil;
}

- (void)ad:(ALAd *)ad wasClickedIn:(UIView *)view
{
    [self.delegate rewardedVideoDidReceiveTapEventForCustomEvent: self];
    [self.delegate rewardedVideoWillLeaveApplicationForCustomEvent: self];
    
    MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
}

#pragma mark - Video Playback Delegate

- (void)videoPlaybackBeganInAd:(ALAd *)ad
{
}

- (void)videoPlaybackEndedInAd:(ALAd *)ad atPlaybackPercent:(NSNumber *)percentPlayed fullyWatched:(BOOL)wasFullyWatched
{
    MPLogInfo(@"Rewarded video video playback ended at playback percent: %lu", (unsigned long)percentPlayed.unsignedIntegerValue);
    
    self.fullyWatched = wasFullyWatched;
}

#pragma mark - Reward Delegate

- (void)rewardValidationRequestForAd:(ALAd *)ad didExceedQuotaWithResponse:(NSDictionary *)response
{
    MPLogInfo(@"Rewarded video validation request for ad did exceed quota with response: %@", response);
}

- (void)rewardValidationRequestForAd:(ALAd *)ad didFailWithError:(NSInteger)responseCode
{
    NSString *failureReason = [NSString stringWithFormat:@"Rewarded video validation request for ad failed with error code: %ld", (long)responseCode];

    NSError *error = [NSError errorWithCode:MOPUBErrorAdapterInvalid localizedDescription:failureReason];
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
}

- (void)rewardValidationRequestForAd:(ALAd *)ad wasRejectedWithResponse:(NSDictionary *)response
{
    NSString *failureReason = [NSString stringWithFormat: @"Rewarded video validation request was rejected with response: %@", response];

    NSError *error = [NSError errorWithCode:MOPUBErrorAdapterInvalid localizedDescription:failureReason];
    MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
}

- (void)rewardValidationRequestForAd:(ALAd *)ad didSucceedWithResponse:(NSDictionary *)response
{
    NSNumber *amount = response[@"amount"];
    NSString *currency = response[@"currency"];
    
    MPLogInfo(@"Rewarded %@ %@", amount, currency);

    self.reward = [[MPRewardedVideoReward alloc] initWithCurrencyType: currency amount: amount];
}

#pragma mark - Utility Methods

- (MOPUBErrorCode)toMoPubErrorCode:(int)appLovinErrorCode
{
    if ( appLovinErrorCode == kALErrorCodeNoFill )
    {
        return MOPUBErrorAdapterHasNoInventory;
    }
    else if ( appLovinErrorCode == kALErrorCodeAdRequestNetworkTimeout )
    {
        return MOPUBErrorNetworkTimedOut;
    }
    else if ( appLovinErrorCode == kALErrorCodeInvalidResponse )
    {
        return MOPUBErrorServerError;
    }
    else
    {
        return MOPUBErrorUnknown;
    }
}

- (ALSdk *)SDKFromCustomEventInfo:(NSDictionary *)info
{
    // The SDK key is not returned from the MoPub dashboard, so we statically read it
    // for Unity publishers who don't have access to the project's info.plist.
    NSString *SDKKey = AppLovinAdapterConfiguration.sdkKey;
    if ( SDKKey.length > 0 )
    {
        return [ALSdk sharedWithKey: SDKKey];
    }
    else
    {
        return [ALSdk shared];
    }
}

+ (ALIncentivizedInterstitialAd *)incentivizedInterstitialAdForZoneIdentifier:(NSString *)zoneIdentifier
                                                                  customEvent:(AppLovinRewardedVideoCustomEvent *)customEvent
                                                                          sdk:(ALSdk *)sdk
{
    ALIncentivizedInterstitialAd *incent;
    
    // Check if incentivized ad for zone already exists
    if ( ALGlobalIncentivizedInterstitialAds[zoneIdentifier] )
    {
        incent = ALGlobalIncentivizedInterstitialAds[zoneIdentifier];
    }
    else
    {
        // If this is a default or token Zone, create the incentivized ad normally
        if ( [DEFAULT_ZONE isEqualToString: zoneIdentifier] || [DEFAULT_TOKEN_ZONE isEqualToString: zoneIdentifier] )
        {
            incent = [[ALIncentivizedInterstitialAd alloc] initWithSdk: sdk];
        }
        // Otherwise, use the Zones API
        else
        {
            incent = [[ALIncentivizedInterstitialAd alloc] initWithZoneIdentifier: zoneIdentifier sdk: sdk];
        }
        
        ALGlobalIncentivizedInterstitialAds[zoneIdentifier] = incent;
    }
    
    incent.adVideoPlaybackDelegate = customEvent;
    incent.adDisplayDelegate = customEvent;
    
    return incent;
}

- (NSString *) getAdNetworkId {
    return self.zoneIdentifier;
}

@end
