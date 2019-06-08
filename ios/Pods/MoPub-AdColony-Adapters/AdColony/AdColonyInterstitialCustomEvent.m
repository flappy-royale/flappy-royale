//
//  AdColonyInterstitialCustomEvent.m
//  MoPubSDK
//
//  Copyright (c) 2016 MoPub. All rights reserved.
//

#import <AdColony/AdColony.h>
#import "AdColonyAdapterConfiguration.h"
#import "AdColonyInterstitialCustomEvent.h"
#if __has_include("MoPub.h")
    #import "MPLogging.h"
#endif
#import "AdColonyController.h"

@interface AdColonyInterstitialCustomEvent ()

@property (nonatomic, retain) AdColonyInterstitial *ad;
@property (nonatomic, copy) NSString *zoneId;

@end

@implementation AdColonyInterstitialCustomEvent

#pragma mark - MPInterstitialCustomEvent Subclass Methods

- (void)requestInterstitialWithCustomEventInfo:(NSDictionary *)info {

    NSString *appId = [info objectForKey:@"appId"];
    NSArray *allZoneIds = [info objectForKey:@"allZoneIds"];
    if (![self paramsAreValid:appId withAllZoneIds:allZoneIds]) {
        return;
    }
    
    self.zoneId = [info objectForKey:@"zoneId"];
    if (self.zoneId == nil || [self.zoneId length] == 0) {
        if (allZoneIds != nil && allZoneIds.count > 0) {
            NSString *firstZoneId = allZoneIds[0];
            if (firstZoneId != nil && [self.zoneId length] > 0) {
                self.zoneId = firstZoneId;
            }
        }
    }
    
    NSString *userId = [info objectForKey:@"userId"];
    
    // Cache the initialization parameters
    [AdColonyAdapterConfiguration updateInitializationParameters:info];
    
    [AdColonyController initializeAdColonyCustomEventWithAppId:appId allZoneIds:allZoneIds userId:userId callback:^{
        __weak AdColonyInterstitialCustomEvent *weakSelf = self;
        [AdColony requestInterstitialInZone:[self getAdNetworkId] options:nil success:^(AdColonyInterstitial * _Nonnull ad) {
            weakSelf.ad = ad;
            
            MPLogAdEvent([MPLogEvent adLoadAttemptForAdapter:NSStringFromClass(self.class) dspCreativeId:nil dspName:nil], [self getAdNetworkId]);

            [ad setOpen:^{
                [weakSelf.delegate interstitialCustomEventDidAppear:weakSelf];
                
                MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
                MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
            }];
            [ad setClose:^{
                MPLogAdEvent([MPLogEvent adWillDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
                [weakSelf.delegate interstitialCustomEventWillDisappear:weakSelf];
                
                MPLogAdEvent([MPLogEvent adDidDisappearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
                [weakSelf.delegate interstitialCustomEventDidDisappear:weakSelf];
            }];
            [ad setExpire:^{
                [weakSelf.delegate interstitialCustomEventDidExpire:weakSelf];
            }];
            [ad setLeftApplication:^{
                [weakSelf.delegate interstitialCustomEventWillLeaveApplication:weakSelf];
            }];
            [ad setClick:^{
                [weakSelf.delegate interstitialCustomEventDidReceiveTapEvent:weakSelf];
                MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
            }];
            
            [weakSelf.delegate interstitialCustomEvent:weakSelf didLoadAd:(id)ad];
            MPLogAdEvent([MPLogEvent adLoadSuccessForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
        } failure:^(AdColonyAdRequestError * _Nonnull error) {
            weakSelf.ad = nil;
            [weakSelf.delegate interstitialCustomEvent:weakSelf didFailToLoadAdWithError:error];
            
            MPLogAdEvent([MPLogEvent adLoadFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
        }];
    }];
}

- (void)showInterstitialFromRootViewController:(UIViewController *)rootViewController {
    
    MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
    
    if (self.ad) {
        if ([self.ad showWithPresentingViewController:rootViewController]) {
            [self.delegate interstitialCustomEventWillAppear:self];
            
            MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], [self getAdNetworkId]);
        } else {
            NSError *error = [self createErrorWith:@"Failed to show AdColony video"
                                         andReason:@"Unknown Error"
                                     andSuggestion:@""];
            MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
            
            [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
        }
    } else {
        NSError *error = [self createErrorWith:@"Failed to show AdColony video"
                                     andReason:@"ad is not available"
                                 andSuggestion:@""];
        MPLogAdEvent([MPLogEvent adShowFailedForAdapter:NSStringFromClass(self.class) error:error], [self getAdNetworkId]);
        
        [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
    }
}

- (NSString *) getAdNetworkId {
    return self.zoneId;
}

- (NSError *)createErrorWith:(NSString *)description andReason:(NSString *)reason andSuggestion:(NSString *)suggestion {
    NSDictionary *userInfo = @{
                               NSLocalizedDescriptionKey: NSLocalizedString(description, nil),
                               NSLocalizedFailureReasonErrorKey: NSLocalizedString(reason, nil),
                               NSLocalizedRecoverySuggestionErrorKey: NSLocalizedString(suggestion, nil)
                               };
    
    return [NSError errorWithDomain:NSStringFromClass([self class]) code:0 userInfo:userInfo];
}

- (Boolean) paramsAreValid:(NSString *)appId withAllZoneIds:(NSArray *)allZoneIds {
    if (appId == nil || [appId length] == 0) {
        NSError *error = [self createErrorWith:@"AdColony adapter failed to request interstitial"
                                     andReason:@"App Id is nil/empty"
                                 andSuggestion:@"Make sure the App Id is configured on the MoPub UI."];
        
        MPLogDebug(@"%@. %@. %@", error.localizedDescription, error.localizedFailureReason, error.localizedRecoverySuggestion);
        [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
        
        return false;
    }
    
    if (allZoneIds != nil && allZoneIds.count > 0) {
        NSString *firstZoneId = allZoneIds[0];
        if (firstZoneId != nil || [firstZoneId length] > 0) {
            return true;
        }
    } else if (allZoneIds == nil || allZoneIds.count == 0) {
        allZoneIds = [NSArray arrayWithObjects:@""];
    }
    
    NSError *error = [self createErrorWith:@"AdColony adapter failed to request interstitial"
                                 andReason:@"Zone Id is nil/empty"
                             andSuggestion:@"Make sure the Zone Id is configured on the MoPub UI."];
    
    MPLogDebug(@"%@. %@. %@", error.localizedDescription, error.localizedFailureReason, error.localizedRecoverySuggestion);
    [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
    
    return false;
}

@end
