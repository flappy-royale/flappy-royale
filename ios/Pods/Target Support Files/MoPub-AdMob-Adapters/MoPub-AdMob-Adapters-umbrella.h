#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "GoogleAdMobAdapterConfiguration.h"
#import "MPGoogleAdMobBannerCustomEvent.h"
#import "MPGoogleAdMobInterstitialCustomEvent.h"
#import "MPGoogleAdMobNativeAdAdapter.h"
#import "MPGoogleAdMobNativeCustomEvent.h"
#import "MPGoogleAdMobNativeRenderer.h"
#import "MPGoogleAdMobRewardedVideoCustomEvent.h"
#import "MPGoogleGlobalMediationSettings.h"
#import "UIView+MPGoogleAdMobAdditions.h"

FOUNDATION_EXPORT double MoPub_AdMob_AdaptersVersionNumber;
FOUNDATION_EXPORT const unsigned char MoPub_AdMob_AdaptersVersionString[];

