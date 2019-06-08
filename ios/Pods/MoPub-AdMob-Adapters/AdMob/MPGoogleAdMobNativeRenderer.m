#import "MPGoogleAdMobNativeRenderer.h"

#if __has_include("MoPub.h")
#import "MPLogging.h"
#import "MPNativeAdAdapter.h"
#import "MPNativeAdConstants.h"
#import "MPNativeAdError.h"
#import "MPNativeAdRendererConfiguration.h"
#import "MPNativeAdRendererImageHandler.h"
#import "MPNativeAdRendering.h"
#import "MPNativeAdRenderingImageLoader.h"
#import "MPNativeView.h"
#import "MPStaticNativeAdRendererSettings.h"
#endif
#import "MPGoogleAdMobNativeAdAdapter.h"
#import "UIView+MPGoogleAdMobAdditions.h"

@interface MPGoogleAdMobNativeRenderer () <MPNativeAdRendererImageHandlerDelegate>

/// Publisher adView which is rendering.
@property(nonatomic, strong) UIView<MPNativeAdRendering> *adView;

/// MPGoogleAdMobNativeAdAdapter instance.
@property(nonatomic, strong) MPGoogleAdMobNativeAdAdapter *adapter;

/// YES if adView is in view hierarchy.
@property(nonatomic, assign) BOOL adViewInViewHierarchy;

/// MPNativeAdRendererImageHandler instance.
@property(nonatomic, strong) MPNativeAdRendererImageHandler *rendererImageHandler;

/// Class of renderingViewClass.
@property(nonatomic, strong) Class renderingViewClass;

/// GADUnifiedNativeAdView instance.
@property(nonatomic, strong) GADUnifiedNativeAdView *unifiedNativeAdView;

@end

@implementation MPGoogleAdMobNativeRenderer

@synthesize viewSizeHandler;

/// Construct and return an MPNativeAdRendererConfiguration object, you must set all the properties
/// on the configuration object.
+ (MPNativeAdRendererConfiguration *)rendererConfigurationWithRendererSettings:
    (id<MPNativeAdRendererSettings>)rendererSettings {
  MPNativeAdRendererConfiguration *config = [[MPNativeAdRendererConfiguration alloc] init];
  config.rendererClass = [self class];
  config.rendererSettings = rendererSettings;
  config.supportedCustomEvents = @[ @"MPGoogleAdMobNativeCustomEvent" ];

  return config;
}

/// Renderer settings are objects that allow you to expose configurable properties to the
/// application. MPGoogleAdMobNativeRenderer renderer will be initialized with these settings.
- (instancetype)initWithRendererSettings:(id<MPNativeAdRendererSettings>)rendererSettings {
  if (self = [super init]) {
    MPStaticNativeAdRendererSettings *settings =
        (MPStaticNativeAdRendererSettings *)rendererSettings;
    _renderingViewClass = settings.renderingViewClass;
    viewSizeHandler = [settings.viewSizeHandler copy];
    _rendererImageHandler = [MPNativeAdRendererImageHandler new];
    _rendererImageHandler.delegate = self;
  }

  return self;
}

/// Returns an ad view rendered using provided |adapter|. Sets an |error| if any error is
/// encountered.
- (UIView *)retrieveViewWithAdapter:(id<MPNativeAdAdapter>)adapter error:(NSError **)error {
  if (!adapter || ![adapter isKindOfClass:[MPGoogleAdMobNativeAdAdapter class]]) {
    if (error) {
      *error = MPNativeAdNSErrorForRenderValueTypeError();
    }

    return nil;
  }

  self.adapter = (MPGoogleAdMobNativeAdAdapter *)adapter;

  if ([self.renderingViewClass respondsToSelector:@selector(nibForAd)]) {
    self.adView = (UIView<MPNativeAdRendering> *)[[[self.renderingViewClass nibForAd]
        instantiateWithOwner:nil
                     options:nil] firstObject];
  } else {
    self.adView = [[self.renderingViewClass alloc] init];
  }

  self.adView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
  MPLogAdEvent([MPLogEvent adShowAttemptForAdapter:NSStringFromClass(self.class)], nil);
  MPLogAdEvent([MPLogEvent adWillAppearForAdapter:NSStringFromClass(self.class)], nil);    
  [self renderUnifiedAdViewWithAdapter:self.adapter];
  return self.adView;
}

/// Creates Unified Native AdView with adapter. We added GADUnifiedNativeAdView assets on
/// top of MoPub's adView, to track impressions & clicks.
- (void)renderUnifiedAdViewWithAdapter:(id<MPNativeAdAdapter>)adapter {
  // We only load text here. We're creating the GADUnifiedNativeAdView and preparing text
  // assets.
  
  GADUnifiedNativeAdView *gadUnifiedNativeAdView = [self.adapter adMobUnifiedNativeAdView];
  [self.adView addSubview:gadUnifiedNativeAdView];
  [gadUnifiedNativeAdView gad_fillSuperview];

  if ([self.adView respondsToSelector:@selector(nativeTitleTextLabel)]) {
    [self.adView.nativeTitleTextLabel addSubview:gadUnifiedNativeAdView.headlineView];
    self.adView.nativeTitleTextLabel.text = adapter.properties[kAdTitleKey];
    [gadUnifiedNativeAdView.headlineView gad_fillSuperview];
  }

  if ([self.adView respondsToSelector:@selector(nativeMainTextLabel)]) {
    [self.adView.nativeMainTextLabel addSubview:gadUnifiedNativeAdView.bodyView];
    self.adView.nativeMainTextLabel.text = adapter.properties[kAdTextKey];
    [gadUnifiedNativeAdView gad_fillSuperview];
  }

  if ([self.adView respondsToSelector:@selector(nativeCallToActionTextLabel)] &&
      self.adView.nativeCallToActionTextLabel) {
    [self.adView.nativeCallToActionTextLabel addSubview:gadUnifiedNativeAdView.callToActionView];
    [gadUnifiedNativeAdView.callToActionView gad_fillSuperview];
    self.adView.nativeCallToActionTextLabel.text = adapter.properties[kAdCTATextKey];
  }

  if ([self.adView respondsToSelector:@selector(nativeIconImageView)]) {
    [self.adView.nativeIconImageView addSubview:gadUnifiedNativeAdView.iconView];
    [gadUnifiedNativeAdView.iconView gad_fillSuperview];
  }

  // See if the ad contains a star rating and notify the view if it does.
  if ([self.adView respondsToSelector:@selector(layoutStarRating:)]) {
    NSNumber *starRatingNum = adapter.properties[kAdStarRatingKey];
    if ([starRatingNum isKindOfClass:[NSNumber class]] &&
        starRatingNum.floatValue >= kStarRatingMinValue &&
        starRatingNum.floatValue <= kStarRatingMaxValue) {
      [self.adView layoutStarRating:starRatingNum];
    }
  }

  // See if the ad contains the nativePrivacyInformationIconImageView and add GADAdChoicesView
  // as its subview if it does.
  if ([self.adView respondsToSelector:@selector(nativePrivacyInformationIconImageView)]) {
    [self.adView.nativePrivacyInformationIconImageView
        addSubview:gadUnifiedNativeAdView.adChoicesView];
    [gadUnifiedNativeAdView.adChoicesView gad_fillSuperview];
  }

  // See if the ad contains the nativeVideoView and add GADMediaView as its
  // subview if it does. If not see if the ad contains the nativeMainImageView
  // and add GADMediaView as its subview if it does.
  if ([self.adView respondsToSelector:@selector(nativeVideoView)]) {
    [self.adView.nativeVideoView addSubview:gadUnifiedNativeAdView.mediaView];
    [gadUnifiedNativeAdView.mediaView gad_fillSuperview];
  } else if ([self.adView respondsToSelector:@selector(nativeMainImageView)]) {
    [self.adView.nativeMainImageView addSubview:gadUnifiedNativeAdView.mediaView];
    [gadUnifiedNativeAdView.mediaView gad_fillSuperview];
  }
}

/// Checks whether the ad view contains media.
- (BOOL)shouldLoadMediaView {
  return [self.adapter respondsToSelector:@selector(mainMediaView)] &&
         [self.adapter mainMediaView] &&
         [self.adView respondsToSelector:@selector(nativeVideoView)];
}

/// Check the ad view is superView or not, if not adView will move to superView.
- (void)adViewWillMoveToSuperview:(UIView *)superview {
  self.adViewInViewHierarchy = (superview != nil);

  if (superview) {
    // We'll start asychronously loading the native ad images now.
    if (self.adapter.properties[kAdIconImageKey] &&
        [self.adView respondsToSelector:@selector(nativeIconImageView)]) {
      [self.rendererImageHandler
          loadImageForURL:[NSURL URLWithString:self.adapter.properties[kAdIconImageKey]]
            intoImageView:self.adView.nativeIconImageView];
    }

    // Lay out custom assets here as the custom assets may contain images that need to be loaded.
    if ([self.adView respondsToSelector:@selector(layoutCustomAssetsWithProperties:imageLoader:)]) {
      // Create a simplified image loader for the ad view to use.
      MPNativeAdRenderingImageLoader *imageLoader =
          [[MPNativeAdRenderingImageLoader alloc] initWithImageHandler:self.rendererImageHandler];
      [self.adView layoutCustomAssetsWithProperties:self.adapter.properties
                                        imageLoader:imageLoader];
    }
  }
}

#pragma mark - MPNativeAdRendererImageHandlerDelegate

- (BOOL)nativeAdViewInViewHierarchy {
  return self.adViewInViewHierarchy;
}

@end

