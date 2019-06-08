#if __has_include(<MoPub/MoPub.h>)
    #import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
    #import <MoPubSDKFramework/MoPub.h>
#else
    #import "MPRewardedVideoCustomEvent.h"
#endif

// PLEASE NOTE: We have renamed this class from "AppLovinRewardedCustomEvent" to "AppLovinRewardedVideoCustomEvent", you can use either classname in your MoPub account.
@interface AppLovinRewardedVideoCustomEvent : MPRewardedVideoCustomEvent
@end

// AppLovinRewardedCustomEvent is deprecated but kept here for backwards-compatibility purposes.
@interface AppLovinRewardedCustomEvent : AppLovinRewardedVideoCustomEvent
@end
