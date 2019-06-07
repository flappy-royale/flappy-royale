#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Use the following pre-defined values to log events with the generic logEvent method.
 */

/** Post-install transaction event */
FOUNDATION_EXPORT NSString *const ADCEventTransaction;

/** Post-install credits_spent event */
FOUNDATION_EXPORT NSString *const ADCEventCreditsSpent;

/** Post-install payment_info_added event */
FOUNDATION_EXPORT NSString *const ADCEventPaymentInfoAdded;

/** Post-install achievement_unlocked event */
FOUNDATION_EXPORT NSString *const ADCEventAchievementUnlocked;

/** Post-install level_achieved event */
FOUNDATION_EXPORT NSString *const ADCEventLevelAchieved;

/** Post-install app_rated event */
FOUNDATION_EXPORT NSString *const ADCEventAppRated;

/** Post-install activated event */
FOUNDATION_EXPORT NSString *const ADCEventActivated;

/** Post-install tutorial_completed event */
FOUNDATION_EXPORT NSString *const ADCEventTutorialCompleted;

/** Post-install sharing_event event */
FOUNDATION_EXPORT NSString *const ADCEventSocialSharingEvent;

/** Post-install registration_completed event */
FOUNDATION_EXPORT NSString *const ADCEventRegistrationCompleted;

/** Post-install custom_event event (5 pre-defined events, listed below) */
FOUNDATION_EXPORT NSString *const ADCEventCustomEvent;

/** Post-install add_to_cart event */
FOUNDATION_EXPORT NSString *const ADCEventAddToCart;

/** Post-install add_to_wishlist event */
FOUNDATION_EXPORT NSString *const ADCEventAddToWishlist;

/** Post-install checkout_initiated event */
FOUNDATION_EXPORT NSString *const ADCEventCheckoutInitiated;

/** Post-install content_view event */
FOUNDATION_EXPORT NSString *const ADCEventContentView;

/** Post-install invite event */
FOUNDATION_EXPORT NSString *const ADCEventInvite;

/** Post-install login event */
FOUNDATION_EXPORT NSString *const ADCEventLogin;

/** Post-install reservation event */
FOUNDATION_EXPORT NSString *const ADCEventReservation;

/** Post-install search event */
FOUNDATION_EXPORT NSString *const ADCEventSearch;

/**
 * Use the following pre-defined values for the `logCustomEvent:withDictionary` method's "event" parameter.
 */

FOUNDATION_EXPORT NSString *const ADCCustomEventSlot1;
FOUNDATION_EXPORT NSString *const ADCCustomEventSlot2;
FOUNDATION_EXPORT NSString *const ADCCustomEventSlot3;
FOUNDATION_EXPORT NSString *const ADCCustomEventSlot4;
FOUNDATION_EXPORT NSString *const ADCCustomEventSlot5;

/**
 * Use the following pre-defined values for the `logRegistrationCompletedWithMethod:description` method's "method" parameter.
 */
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodDefault;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodFacebook;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodTwitter;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodGoogle;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodLinkedIn;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodOpenID;
FOUNDATION_EXPORT NSString *const ADCRegistrationMethodCustom;

/**
 * Use the following pre-defined values for the `logLoginWithMethod` method's "method" parameter.
 */
FOUNDATION_EXPORT NSString *const ADCLoginMethodDefault;
FOUNDATION_EXPORT NSString *const ADCLoginMethodFacebook;
FOUNDATION_EXPORT NSString *const ADCLoginMethodTwitter;
FOUNDATION_EXPORT NSString *const ADCLoginMethodGoogle;
FOUNDATION_EXPORT NSString *const ADCLoginMethodLinkedIn;
FOUNDATION_EXPORT NSString *const ADCLoginMethodOpenID;
FOUNDATION_EXPORT NSString *const ADCLoginMethodCustom;

/**
 * Use the following pre-defined values for the `logSocialSharingEventWithNetwork:description` method's "network" parameter.
 */
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodFacebook;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodTwitter;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodGoogle;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodLinkedin;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodPinterest;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodYoutube;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodInstagram;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodTumblr;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodFlickr;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodVimeo;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodFoursquare;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodVine;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodSnapchat;
FOUNDATION_EXPORT NSString *const ADCSocialSharingMethodCustom;

@interface AdColonyEventTracker : NSObject

/**
 @abstract Report a transaction/purchase event.
 @discussion Call this method to track any purchases made by the user.
 @param itemID       Identifier of item purchased
 @param quantity     Quantity of items purchased
 @param price        Total price of the items purchased
 @param currencyCode The real-world three-letter ISO 4217 (e.g. USD) currency code of the transaction
 @param store        The store the purchase was made through
 @param receipt      The receipt number
 @param description  Description of the purchased product. Max 512 characters.
 */
+ (void)logTransactionWithID:(NSString *)itemID quantity:(NSInteger)quantity price:(NSNumber *)price currencyCode:(NSString *)currencyCode receipt:(NSString *)receipt store:(NSString *)store description:(NSString *)description;

/**
 @abstract Report a credits_spent event.
 @description Invoke, for example, when a user applies credits to purchase in app merchandise.
 You can also provide additional information about the transaction like the name, quantity, real-world value and currency code
 @param name         The type of credits the user has spent
 @param quantity     The quantity of the credits spent
 @param value        The real-world value of the credits spent
 @param currencyCode The real-world three-letter ISO 4217 (e.g. USD) currency code of the transaction.
 */
+ (void)logCreditsSpentWithName:(NSString *)name quantity:(NSInteger)quantity value:(NSNumber *)value currencyCode:(NSString *)currencyCode;

/**
 @abstract Report a payment_info_added event, when the user has added payment info for transactions.
 */
+ (void)logPaymentInfoAdded;

/**
  @abstract Report an achievement_unlocked event.
  @discussion Invoke when a user completes some goal, for example, ‘complete 200 deliveries’.
  You can also add a description of the achievement
  @param description A String description of the in-app achievement. Max 512 characters.
 */
+ (void)logAchievementUnlocked:(NSString *)description;

/**
  @abstract Report a level_achieved event.
  @param level The new level reached by the user
 */
+ (void)logLevelAchieved:(NSInteger)level;

/**
  @abstract Report an app_rated event.
  @discussion Invoke when the user has rated the application.
 */
+ (void)logAppRated;

/**
  @abstract Report an activated event.
  @discussion Invoke when the user activates their account within the app.
 */
+ (void)logActivated;

/**
  @abstract Report a tutorial_completed event.
  @discussion Invoke when the user completes an introductory tutorial for the app.
 */
+ (void)logTutorialCompleted;

/**
  @abstract Report a social_sharing event.
  @param network     Associated social network
  @param description Description of the social sharing event. Max 512 characters.
  @discussion Invoke, for example, when user shares an achievement on Facebook, Twitter, etc.. You can also
  provide a description of the social sharing event and denote the network on which the event was shared.
  We recommend using one of the provided constants for the social network:
    ADCSocialSharingMethodFacebook
    ADCSocialSharingMethodTwitter
    ADCSocialSharingMethodGoogle
    ADCSocialSharingMethodLinkedin
    ADCSocialSharingMethodPinterest
    ADCSocialSharingMethodYoutube
    ADCSocialSharingMethodInstagram
    ADCSocialSharingMethodTumblr
    ADCSocialSharingMethodFlickr
    ADCSocialSharingMethodVimeo
    ADCSocialSharingMethodFoursquare
    ADCSocialSharingMethodVine
    ADCSocialSharingMethodSnapchat
    ADCSocialSharingMethodCustom
 */
+ (void)logSocialSharingEventWithNetwork:(NSString *)network description:(NSString *)description;

/**
  @abstract Report a registration_completed event.
  @param method      The registration method used
  @param description Description describing the registration event. Passing a nil value is
                     allowed. Should only pass this in if you are passing in
                     ADCRegistrationMethodCustom for the method. Will be ignored otherwise. Max
                     512 characters
  @discussion Invoke when a user has finished the registration process within the app.
  You can also denote the registration method used: Facebook, Google, etc.
  We recommend using one of the provided constants for the method:
    ADCRegistrationMethodDefault
    ADCRegistrationMethodFacebook
    ADCRegistrationMethodTwitter
    ADCRegistrationMethodGoogle
    ADCRegistrationMethodLinkedIn
    ADCRegistrationMethodOpenID
    ADCRegistrationMethodCustom
 */
+ (void)logRegistrationCompletedWithMethod:(NSString *)method description:(NSString *)description;

/**
  @abstract Report a custom_event.
  @param event       The custom event slot
  @param description The description of the custom event. Max 512 characters.
  @discussion Currently, publishers are allowed up to 5 custom event slots and are required
  to keep track of what each corresponds to on their end.
  We recommend using one of the provided constants for the event:
    ADCCustomEventSlot1
    ADCCustomEventSlot2
    ADCCustomEventSlot3
    ADCCustomEventSlot4
    ADCCustomEventSlot5
 */
+ (void)logCustomEvent:(NSString *)event description:(NSString *)description;

/**
  @abstract Report an add_to_cart event.
  @discussion Invoke when the user adds an item to a shopping cart. You can also report the product
  identifier for the item.
  @param itemID Identifier of item added to cart
 */
+ (void)logAddToCartWithID:(NSString *)itemID;

/**
  @abstract Report an add_to_wishlist event.
  @discussion Invoke when the user adds an item to their wishlist. You can also report the product
  identifier for the item.
  @param itemID Identifier of item added to cart
 */
+ (void)logAddToWishlistWithID:(NSString *)itemID;

/**
  @abstract Report an checkout_initiated event
  @discussion Invoke when a user has begun the final checkout process.
 */
+ (void)logCheckoutInitiated;

/**
  @abstract Report a content_view event.
  @discussion Invoke when the user viewed the contents of a purchasable product
  @param contentID   Identifier of content viewed
  @param contentType Type of content viewed
 */
+ (void)logContentViewWithID:(NSString *)contentID contentType:(NSString *)contentType;

/**
  @abstract Report an invite event.
  @discussion Invoke when a user invites friends or family to install or otherwise re-engage in your app or service.
 */
+ (void)logInvite;

/**
  @abstract Report a login event.
  @param method The login method used.
  @discussion Invoke whenever the user has successfully logged in to the app.
  We recommend using one of the provided constants for the method:
    ADCLoginMethodDefault
    ADCLoginMethodFacebook
    ADCLoginMethodTwitter
    ADCLoginMethodGoogle
    ADCLoginMethodLinkedIn
    ADCLoginMethodOpenID
    ADCLoginMethodCustom
 */
+ (void)logLoginWithMethod:(NSString *)method;

/**
  @abstract Report a reservation event.
 */
+ (void)logReservation;

/**
  @abstract Report a search event.
  @param queryString Search terms, keywords, or queries. As provided by the user.
 */
+ (void)logSearchWithQuery:(NSString *)queryString;

/**
  @abstract Log an event.
  @param name Name of the event
  @param payload Event data, including both required and optional meta information.
  @discussion Provided to allow the construction and logging of events that do not have a predefined method within this class.
  We recommend using one of the provided constants for the event name:
    ADCEventTransaction
    ADCEventCreditsSpent
    ADCEventPaymentInfoAdded
    ADCEventAchievementUnlocked
    ADCEventLevelAchieved
    ADCEventAppRated
    ADCEventActivated
    ADCEventTutorialCompleted
    ADCEventSocialSharingEvent
    ADCEventRegistrationCompleted
    ADCEventCustomEvent
    ADCEventAddToCart
    ADCEventAddToWishlist
    ADCEventCheckoutInitiated
    ADCEventContentView
    ADCEventInvite
    ADCEventLogin
    ADCEventReservation
    ADCEventSearch
 */
+ (void)logEvent:(NSString *)name withDictionary:(NSDictionary *)payload;

@end

NS_ASSUME_NONNULL_END
