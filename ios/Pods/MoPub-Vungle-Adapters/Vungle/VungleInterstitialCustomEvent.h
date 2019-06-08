//
//  VungleInterstitialCustomEvent.h
//  MoPubSDK
//
//  Copyright (c) 2013 MoPub. All rights reserved.
//

#if __has_include(<MoPub/MoPub.h>)
    #import <MoPub/MoPub.h>
#elif __has_include(<MoPubSDKFramework/MoPub.h>)
    #import <MoPubSDKFramework/MoPub.h>
#else
    #import "MPInterstitialCustomEvent.h"
#endif

/*
 * The Vungle SDK does not provide an "application will leave" callback, thus this custom event
 * will not invoke the interstitialCustomEventWillLeaveApplication: delegate method.
 */
@interface VungleInterstitialCustomEvent : MPInterstitialCustomEvent

/**
 * Use the MoPub website to set your app ID in your network settings for Vungle.
 * See the Custom Native Network Setup guide for more information.
 * https://dev.twitter.com/mopub/ad-networks/network-setup-custom-native
 */

@end
