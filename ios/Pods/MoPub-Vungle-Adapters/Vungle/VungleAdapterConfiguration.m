//
//  VungleAdapterConfiguration.m
//  MoPubSDK
//
//  Copyright © 2017 MoPub. All rights reserved.
//

#import <VungleSDK/VungleSDK.h>
#import "VungleAdapterConfiguration.h"
#import "VungleRouter.h"

#if __has_include("MoPub.h")
#import "MPLogging.h"
#endif

// Errors
static NSString * const kAdapterErrorDomain = @"com.mopub.mopub-ios-sdk.mopub-vungle-adapters";

typedef NS_ENUM(NSInteger, VungleAdapterErrorCode) {
    VungleAdapterErrorCodeMissingAppId,
};

@implementation VungleAdapterConfiguration

#pragma mark - Caching

+ (void)updateInitializationParameters:(NSDictionary *)parameters {
    // These should correspond to the required parameters checked in
    // `initializeNetworkWithConfiguration:complete:`
    NSString * appId = parameters[kVungleAppIdKey];
    
    if (appId != nil) {
        NSDictionary * configuration = @{ kVungleAppIdKey: appId };
        [VungleAdapterConfiguration setCachedInitializationParameters:configuration];
    }
}

#pragma mark - MPAdapterConfiguration

- (NSString *)adapterVersion {
    return @"6.3.2.5";
}

- (NSString *)biddingToken {
    return nil;
}

- (NSString *)moPubNetworkName {
    // ⚠️ Do not change this value! ⚠️
    return @"vungle";
}

- (NSString *)networkSdkVersion {
    return VungleSDKVersion;
}

- (void)initializeNetworkWithConfiguration:(NSDictionary<NSString *, id> *)configuration
                                  complete:(void(^)(NSError *))complete {
    NSString * appId = configuration[kVungleAppIdKey];
    if (appId == nil) {
        NSError * error = [NSError errorWithDomain:kAdapterErrorDomain code:VungleAdapterErrorCodeMissingAppId userInfo:@{ NSLocalizedDescriptionKey: @"Missing the appId parameter when configuring your network in the MoPub website." }];
        MPLogEvent([MPLogEvent error:error message:nil]);
        
        if (complete != nil) {
            complete(error);
        }
        return;
    }
    
    [VungleRouter.sharedRouter initializeSdkWithInfo:configuration];
    if (complete != nil) {
        complete(nil);
    }
}

@end
