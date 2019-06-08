#import <Foundation/Foundation.h>

#if __has_include(<MoPub/MoPub.h>)
#import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
#import <MoPubSDKFramework/MoPub.h>
#else
#import "MPMediationSettingsProtocol.h"
#import "MoPub.h"
#endif

@interface MPGoogleGlobalMediationSettings : NSObject <MPMediationSettingsProtocol>

@property(nonatomic, copy) NSString *npa;

@end
