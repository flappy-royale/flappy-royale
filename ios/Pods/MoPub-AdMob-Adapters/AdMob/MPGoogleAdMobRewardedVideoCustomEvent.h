#if __has_include(<MoPub/MoPub.h>)
#import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
#import <MoPubSDKFramework/MoPub.h>
#else
#import "MPRewardedVideoCustomEvent.h"
#endif
#import "MPGoogleGlobalMediationSettings.h"

@interface MPGoogleAdMobRewardedVideoCustomEvent : MPRewardedVideoCustomEvent

@end
