//
//  ALAdUpdateDelegate.h
//  AppLovinSDK
//
//
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

NS_ASSUME_NONNULL_BEGIN

/**
 * Listening to ad updates has been deprecated. The `ALAdView` class for banners, leaderboards, and mrecs no longer automatically refresh contents by itself.
 * You must explicitly call `[ALAdView loadNextAd]` or `[ALAdView renderAd: ...]`. This protocol will be removed in a future SDK version.
 */
__attribute__ ((deprecated))
@protocol ALAdUpdateObserver <NSObject>
- (void)adService:(ALAdService *)adService didUpdateAd:(nullable ALAd *)ad;
- (BOOL)canAcceptUpdate;
@end
NS_ASSUME_NONNULL_END
