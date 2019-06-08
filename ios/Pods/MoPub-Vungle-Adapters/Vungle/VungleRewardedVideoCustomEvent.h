//
//  VungleRewardedVideoCustomEvent.h
//  MoPubSDK
//
//  Copyright (c) 2015 MoPub. All rights reserved.
//

#if __has_include(<MoPub/MoPub.h>)
    #import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
    #import <MoPubSDKFramework/MoPub.h>
#else
    #import "MPRewardedVideoCustomEvent.h"
#endif

/*
 * The Vungle SDK does not provide an "application will leave" callback, thus this custom event
 * will not invoke the rewardedVideoWillLeaveApplicationForCustomEvent: delegate method.
 */
@interface VungleRewardedVideoCustomEvent : MPRewardedVideoCustomEvent

@end
