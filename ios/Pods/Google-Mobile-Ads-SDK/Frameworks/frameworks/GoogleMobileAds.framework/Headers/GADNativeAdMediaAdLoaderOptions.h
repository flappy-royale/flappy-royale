//
//  GADNativeAdMediaAdLoaderOptions.h
//  Google Mobile Ads SDK
//
//  Copyright 2019 Google LLC. All rights reserved.
//

#import <GoogleMobileAds/GADAdLoader.h>
#import <GoogleMobileAds/GoogleMobileAdsDefines.h>

/// Media aspect ratio.
typedef NS_ENUM(NSInteger, GADMediaAspectRatio) {
  /// Unknown media aspect ratio.
  GADMediaAspectRatioUnknown = 0,
  /// Any media aspect ratio.
  GADMediaAspectRatioAny = 1,
  /// Landscape media aspect ratio.
  GADMediaAspectRatioLandscape = 2,
  /// Portrait media aspect ratio.
  GADMediaAspectRatioPortrait = 3,
  /// Close to square media aspect ratio. This is not a strict 1:1 aspect ratio.
  GADMediaAspectRatioSquare = 4
};

/// Ad loader options for native ad media settings.
@interface GADNativeAdMediaAdLoaderOptions : GADAdLoaderOptions

/// Image and video aspect ratios. Defaults to GADMediaAspectRatioUnknown. Portrait, landscape, and
/// square aspect ratios are returned when this property is GADMediaAspectRatioUnknown or
/// GADMediaAspectRatioAny.
@property(nonatomic, assign) GADMediaAspectRatio mediaAspectRatio;

@end
