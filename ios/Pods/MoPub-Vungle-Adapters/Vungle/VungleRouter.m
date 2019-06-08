//
//  VungleRouter.m
//  MoPubSDK
//
//  Copyright (c) 2015 MoPub. All rights reserved.
//

#import "VungleRouter.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
    #import "MPRewardedVideoError.h"
    #import "MPRewardedVideo.h"
    #import "MoPub.h"
#endif
#import "VungleInstanceMediationSettings.h"

static NSString *const VunglePluginVersion = @"6.3.2";

NSString *const kVungleAppIdKey = @"appId";
NSString *const kVunglePlacementIdKey = @"pid";
NSString *const kVungleFlexViewAutoDismissSeconds = @"flexViewAutoDismissSeconds";
NSString *const kVungleUserId = @"userId";
NSString *const kVungleOrdinal = @"ordinal";

typedef NS_ENUM(NSUInteger, SDKInitializeState) {
    SDKInitializeStateNotInitialized,
    SDKInitializeStateInitializing,
    SDKInitializeStateInitialized
};

@interface VungleRouter ()

@property (nonatomic, copy) NSString *vungleAppID;
@property (nonatomic, assign) BOOL isAdPlaying;
@property (nonatomic, assign) SDKInitializeState sdkInitializeState;

@property (nonatomic, strong) NSMutableDictionary *delegatesDic;
@property (nonatomic, strong) NSMutableDictionary *waitingListDic;

@end

@implementation VungleRouter


- (instancetype)init {
    if (self = [super init]) {
        self.sdkInitializeState = SDKInitializeStateNotInitialized;

        self.delegatesDic = [NSMutableDictionary dictionary];
        self.waitingListDic = [NSMutableDictionary dictionary];
        self.isAdPlaying = NO;
    }
    return self;
}

+ (VungleRouter *)sharedRouter {
    static VungleRouter * sharedRouter;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedRouter = [[VungleRouter alloc] init];
    });
    return sharedRouter;
}

- (void)initializeSdkWithInfo:(NSDictionary *)info {
    
    // Collect and pass the user's consent from MoPub onto the Vungle SDK
    if ([[MoPub sharedInstance] isGDPRApplicable] == MPBoolYes) {
        BOOL canCollectPersonalInfo = [[MoPub sharedInstance] canCollectPersonalInfo];
        [[VungleSDK sharedSDK] updateConsentStatus:(canCollectPersonalInfo) ? VungleConsentAccepted : VungleConsentDenied consentMessageVersion:@""];
    }
    
    NSString *appId = [info objectForKey:kVungleAppIdKey];
    if (!self.vungleAppID) {
        self.vungleAppID = appId;
    }

    static dispatch_once_t vungleInitToken;
    dispatch_once(&vungleInitToken, ^{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wundeclared-selector"
        [[VungleSDK sharedSDK] performSelector:@selector(setPluginName:version:) withObject:@"mopub" withObject:VunglePluginVersion];
#pragma clang diagnostic pop

        self.sdkInitializeState = SDKInitializeStateInitializing;
        NSError * error = nil;
        [[VungleSDK sharedSDK] startWithAppId:appId error:&error];
        [[VungleSDK sharedSDK] setDelegate:self];
    });
}

- (void)requestInterstitialAdWithCustomEventInfo:(NSDictionary *)info delegate:(id<VungleRouterDelegate>)delegate {
    if ([self validateInfoData:info]) {
        if (self.sdkInitializeState == SDKInitializeStateNotInitialized) {
            [self.waitingListDic setObject:delegate forKey:[info objectForKey:kVunglePlacementIdKey]];
            [self requestAdWithCustomEventInfo:info delegate:delegate];
        }
        else if (self.sdkInitializeState == SDKInitializeStateInitializing) {
            [self.waitingListDic setObject:delegate forKey:[info objectForKey:kVunglePlacementIdKey]];
        }
        else if (self.sdkInitializeState == SDKInitializeStateInitialized) {
            [self requestAdWithCustomEventInfo:info delegate:delegate];
        }
    }
    else {
        [delegate vungleAdDidFailToLoad:nil];
    }
}

- (void)requestRewardedVideoAdWithCustomEventInfo:(NSDictionary *)info delegate:(id<VungleRouterDelegate>)delegate {
    if ([self validateInfoData:info]) {
        if (self.sdkInitializeState == SDKInitializeStateNotInitialized) {
            [self.waitingListDic setObject:delegate forKey:[info objectForKey:kVunglePlacementIdKey]];
            [self requestAdWithCustomEventInfo:info delegate:delegate];
        }
        else if (self.sdkInitializeState == SDKInitializeStateInitializing) {
            [self.waitingListDic setObject:delegate forKey:[info objectForKey:kVunglePlacementIdKey]];
        }
        else if (self.sdkInitializeState == SDKInitializeStateInitialized) {
            [self requestAdWithCustomEventInfo:info delegate:delegate];
        }
    }
    else {
        NSError *error = [NSError errorWithDomain:MoPubRewardedVideoAdsSDKDomain code:MPRewardedVideoAdErrorUnknown userInfo:nil];
        [delegate vungleAdDidFailToLoad:error];
    }
}

- (void)requestAdWithCustomEventInfo:(NSDictionary *)info delegate:(id<VungleRouterDelegate>)delegate {
    [self initializeSdkWithInfo:info];

    NSString *placementId = [info objectForKey:kVunglePlacementIdKey];
    [self.delegatesDic setObject:delegate forKey:placementId];

    NSError *error = nil;
    if ([[VungleSDK sharedSDK] loadPlacementWithID:placementId error:&error]) {
        MPLogInfo(@"Vungle: Start to load an ad for Placement ID :%@", placementId);
    } else {
        if (error) {
            MPLogInfo(@"Vungle: Unable to load an ad for Placement ID :%@, Error %@", placementId, error);
        }
        [delegate vungleAdDidFailToLoad:error];        
    }
}

- (BOOL)isAdAvailableForPlacementId:(NSString *) placementId {
    return [[VungleSDK sharedSDK] isAdCachedForPlacementID:placementId];
}

- (void)presentInterstitialAdFromViewController:(UIViewController *)viewController options:(NSDictionary *)options forPlacementId:(NSString *)placementId {
    if (!self.isAdPlaying && [self isAdAvailableForPlacementId:placementId]) {
        self.isAdPlaying = YES;
        NSError *error;
        BOOL success = [[VungleSDK sharedSDK] playAd:viewController options:options placementID:placementId error:&error];
        if (!success) {
            [[self.delegatesDic objectForKey:placementId] vungleAdDidFailToPlay:nil];
            self.isAdPlaying = NO;
        }
    } else {
        [[self.delegatesDic objectForKey:placementId] vungleAdDidFailToPlay:nil];
    }
}

- (void)presentRewardedVideoAdFromViewController:(UIViewController *)viewController customerId:(NSString *)customerId settings:(VungleInstanceMediationSettings *)settings forPlacementId:(NSString *)placementId {
    if (!self.isAdPlaying && [self isAdAvailableForPlacementId:placementId]) {
        self.isAdPlaying = YES;
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        if (customerId.length > 0) {
            options[VunglePlayAdOptionKeyUser] = customerId;
        } else if (settings && settings.userIdentifier.length > 0) {
            options[VunglePlayAdOptionKeyUser] = settings.userIdentifier;
        }
        if (settings.ordinal > 0)
            options[VunglePlayAdOptionKeyOrdinal] = @(settings.ordinal);
        if (settings.flexViewAutoDismissSeconds > 0)
            options[VunglePlayAdOptionKeyFlexViewAutoDismissSeconds] = @(settings.flexViewAutoDismissSeconds);

        BOOL success = [[VungleSDK sharedSDK] playAd:viewController options:options placementID:placementId error:nil];
        if (!success) {
            [[self.delegatesDic objectForKey:placementId] vungleAdDidFailToPlay:nil];
            self.isAdPlaying = NO;
        }
    } else {
        NSError *error = [NSError errorWithDomain:MoPubRewardedVideoAdsSDKDomain code:MPRewardedVideoAdErrorNoAdsAvailable userInfo:nil];
        [[self.delegatesDic objectForKey:placementId] vungleAdDidFailToPlay:error];
    }
}

- (void)updateConsentStatus:(VungleConsentStatus)status {
    [[VungleSDK sharedSDK] updateConsentStatus:status consentMessageVersion:@""];
}

- (VungleConsentStatus)getCurrentConsentStatus {
    return [[VungleSDK sharedSDK] getCurrentConsentStatus];
}

#pragma mark - private

- (BOOL)validateInfoData:(NSDictionary *)info {
    BOOL isValid = YES;

    NSString *appId = [info objectForKey:kVungleAppIdKey];
    if ([appId length] == 0) {
        isValid = NO;
        MPLogInfo(@"Vungle: AppID is empty. Setup appID on MoPub dashboard.");
    }
    else {
        if (self.vungleAppID && ![self.vungleAppID isEqualToString:appId]) {
            isValid = NO;
            MPLogInfo(@"Vungle: AppID is different from the one used for initialization. Make sure you set the same network App ID for all AdUnits in this application on MoPub dashboard.");
        }
    }

    NSString *placementId = [info objectForKey:kVunglePlacementIdKey];
    if ([placementId length] == 0) {
        isValid = NO;
        MPLogInfo(@"Vungle: PlacementID is empty. Setup placementID on MoPub dashboard.");
    }

    if (isValid) {
        MPLogInfo(@"Vungle: Info data for the Ad Unit is valid.");
    }

    return isValid;
}

- (void)clearDelegateForPlacementId:(NSString *)placementId {
    if (placementId != nil) {
        [self.delegatesDic removeObjectForKey:placementId];
    }
}

- (void)clearWaitingList {
    for (id key in self.waitingListDic) {
        id<VungleRouterDelegate> delegateInstance = [self.waitingListDic objectForKey:key];
        [self.delegatesDic setObject:delegateInstance forKey:key];

        NSError *error = nil;
        if ([[VungleSDK sharedSDK] loadPlacementWithID:key error:&error]) {
            MPLogInfo(@"Vungle: Start to load an ad for Placement ID :%@", key);
        }
        else {
            if (error) {
                MPLogInfo(@"Vungle: Unable to load an ad for Placement ID :%@, Error %@", key, error);
            }
            [delegateInstance vungleAdDidFailToLoad:error];
        }
    }

    [self.waitingListDic removeAllObjects];
}


#pragma mark - VungleSDKDelegate Methods

- (void) vungleSDKDidInitialize {
    MPLogInfo(@"Vungle: the SDK has been initialized successfully.");

    self.sdkInitializeState = SDKInitializeStateInitialized;
    [self clearWaitingList];
}

- (void)vungleAdPlayabilityUpdate:(BOOL)isAdPlayable placementID:(NSString *)placementID error:(NSError *)error {
    if (isAdPlayable) {
        [[self.delegatesDic objectForKey:placementID] vungleAdDidLoad];
    }
    else {
        NSError *playabilityError;
        if (error) {
            MPLogInfo(@"Vungle: Ad playability update returned error for Placement ID: %@, Error: %@", placementID, error.localizedDescription);
            playabilityError = error;
        }
        if (!self.isAdPlaying) {
            [[self.delegatesDic objectForKey:placementID] vungleAdDidFailToLoad:playabilityError];
        }
    }
}

- (void)vungleWillShowAdForPlacementID:(nullable NSString *)placementID {
    [[self.delegatesDic objectForKey:placementID] vungleAdWillAppear];
}

- (void)vungleWillCloseAdWithViewInfo:(VungleViewInfo *)info placementID:(NSString *)placementID {
    if ([info.didDownload isEqual:@YES]) {
        [[self.delegatesDic objectForKey:placementID] vungleAdWasTapped];
    }

    if ([info.completedView boolValue] && [[self.delegatesDic objectForKey:placementID] respondsToSelector:@selector(vungleAdShouldRewardUser)]) {
        [[self.delegatesDic objectForKey:placementID] vungleAdShouldRewardUser];
    }

    [[self.delegatesDic objectForKey:placementID] vungleAdWillDisappear];
    self.isAdPlaying = NO;
}

- (void)vungleDidCloseAdWithViewInfo:(VungleViewInfo *)info placementID:(NSString *)placementID {
    [[self.delegatesDic objectForKey:placementID] vungleAdDidDisappear];
}

@end
