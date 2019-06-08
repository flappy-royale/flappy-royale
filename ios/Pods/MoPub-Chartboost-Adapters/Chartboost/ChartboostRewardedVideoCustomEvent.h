//
//  ChartboostRewardedVideoCustomEvent.h
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

@interface ChartboostRewardedVideoCustomEvent : MPRewardedVideoCustomEvent

/**
 * A string that corresponds to a Chartboost CBLocation used for differentiating ad requests.
 */
@property (nonatomic, copy) NSString *location;

@end
