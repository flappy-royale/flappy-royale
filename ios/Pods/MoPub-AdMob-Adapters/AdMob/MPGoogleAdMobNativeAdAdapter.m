#import "MPGoogleAdMobNativeAdAdapter.h"

#if __has_include("MoPub.h")
#import "MPLogging.h"
#import "MPNativeAdConstants.h"
#import "MPNativeAdError.h"
#endif

static NSString *const kGADMAdvertiserKey = @"advertiser";
static NSString *const kGADMPriceKey = @"price";
static NSString *const kGADMStoreKey = @"store";

@implementation MPGoogleAdMobNativeAdAdapter

@synthesize properties = _properties;

- (instancetype)initWithAdMobUnifiedNativeAd:(GADUnifiedNativeAd *)adMobUnifiedNativeAd
                         unifiedNativeAdView:(GADUnifiedNativeAdView *)adMobUnifiedNativeAdView {
  if (self = [super init]) {
    self.adMobUnifiedNativeAd = adMobUnifiedNativeAd;
    self.adMobUnifiedNativeAd.delegate = self;
    self.adMobUnifiedNativeAdView = adMobUnifiedNativeAdView;

    NSMutableDictionary *properties = [NSMutableDictionary dictionary];
    if (adMobUnifiedNativeAd.headline) {
      properties[kAdTitleKey] = adMobUnifiedNativeAd.headline;
    }

    if ([adMobUnifiedNativeAd.icon.imageURL absoluteString]) {
      properties[kAdIconImageKey] = adMobUnifiedNativeAd.icon.imageURL.absoluteString;
    }

    if (adMobUnifiedNativeAd.body) {
      properties[kAdTextKey] = adMobUnifiedNativeAd.body;
    }

    if (adMobUnifiedNativeAd.starRating) {
      properties[kAdStarRatingKey] = adMobUnifiedNativeAd.starRating;
    }

    if (adMobUnifiedNativeAd.callToAction) {
      properties[kAdCTATextKey] = adMobUnifiedNativeAd.callToAction;
    }

    if (adMobUnifiedNativeAd.price) {
      properties[kGADMPriceKey] = adMobUnifiedNativeAd.price;
    }

    if (adMobUnifiedNativeAd.store) {
      properties[kGADMStoreKey] = adMobUnifiedNativeAd.store;
    }

    if (adMobUnifiedNativeAdView.mediaView) {
      properties[kAdMainMediaViewKey] = self.adMobUnifiedNativeAdView.mediaView;
    }

    _properties = properties;
  }

  return self;
}

#pragma mark - <GADUnifiedNativeAdDelegate>

- (void)nativeAdDidRecordImpression:(GADUnifiedNativeAd *)nativeAd {
  // Sending impression to MoPub SDK.
  [self.delegate nativeAdWillLogImpression:self];
  MPLogAdEvent([MPLogEvent adShowSuccessForAdapter:NSStringFromClass(self.class)], nil);
  MPLogAdEvent([MPLogEvent adDidAppearForAdapter:NSStringFromClass(self.class)], nil);
}

- (void)nativeAdDidRecordClick:(GADUnifiedNativeAd *)nativeAd {
  // Sending click to MoPub SDK.
  [self.delegate nativeAdDidClick:self];
  MPLogAdEvent([MPLogEvent adTappedForAdapter:NSStringFromClass(self.class)], nil);
}

#pragma mark - <MPNativeAdAdapter>

- (UIView *)privacyInformationIconView {
  return self.adMobUnifiedNativeAdView.adChoicesView;
}

- (UIView *)mainMediaView {
  return self.adMobUnifiedNativeAdView.mediaView;
}

- (NSURL *)defaultActionURL {
  return nil;
}

- (BOOL)enableThirdPartyClickTracking {
  return YES;
}

@end

