#include <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * UnityAdsBannerDelegate is a delegate class for callbacks from Unity Ads Banner operations.
 */
@protocol UnityAdsBannerDelegate <NSObject>

/**
 Called when the banner is loaded and ready to be placed in the view hierarchy.
 
 @param placementId The ID of the placement of the banner that is loaded.
 @param view View that is to be placed in the view hierarchy.
*/
-(void)unityAdsBannerDidLoad:(NSString *)placementId view:(UIView *)view;

/**
 Called when the banner is unloaded and references to it should be discarded.
 The view provided in unityAdsBannerDidLoad will be removed from the view hierarchy before
 this method is called.
 */
-(void)unityAdsBannerDidUnload:(NSString *)placementId;

/**
 * Called when the banner is shown.
 *
 * @param placementId The ID of the placement that has shown.
 */
-(void)unityAdsBannerDidShow:(NSString *)placementId;

/**
 * Called when the banner is hidden.
 *
 * @param placementId the ID of the that has hidden.
 */
-(void)unityAdsBannerDidHide:(NSString *)placementId;

/**
 * Called when the user clicks the banner.
 *
 * @param placementId the ID of the placement that has been clicked.
 */
-(void)unityAdsBannerDidClick:(NSString *)placementId;

/**
 *  Called when `UnityAdsBanner` encounters an error. All errors will be logged but this method can be used as an additional debugging aid. This callback can also be used for collecting statistics from different error scenarios.
 *
 *  @param message A human readable string indicating the type of error encountered.
 */
-(void)unityAdsBannerDidError:(NSString *)message;
@end

/**
 * UnityAdsBanner is a static class for handling showing and hiding the Unity Ads banner.
 */
@interface UnityAdsBanner : NSObject

/**
 * Loads the banner with the default banner placement.
 */
+(void)loadBanner;

/**
 * Loads the banner with the given placement.
 * @param placementId The placement ID, as defined in the Unity Ads admin tools.
 */
+(void)loadBanner:(NSString *)placementId;

/**
 * Destroys the banner.
 */
+(void)destroy;

/**
 *  Provides the currently assigned `UnityAdsBannerDelegate`.
 *
 *  @return The current `UnityAdsBannerDelegate`.
 */
+(nullable id <UnityAdsBannerDelegate>)getDelegate;

/**
 *  Asigns the banner delegate.
 *
 *  @param delegate The new `UnityAdsBannerDelegate' for UnityAds to send banner callbacks to.
 */
+(void)setDelegate:(id <UnityAdsBannerDelegate>)delegate;
@end

NS_ASSUME_NONNULL_END
