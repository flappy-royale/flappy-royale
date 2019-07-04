//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_OFFERWALL_DELEGATE_H
#define IRONSOURCE_OFFERWALL_DELEGATE_H

#import <Foundation/Foundation.h>

@protocol ISOfferwallDelegate <NSObject>

@required
/**
 Called after the offerwall has changed its availability.
 
 @param available The new offerwall availability. YES if available and ready to be shown, NO otherwise.
 */
- (void)offerwallHasChangedAvailability:(BOOL)available;

/**
 Called after the offerwall has been displayed on the screen.
 */
- (void)offerwallDidShow; 

/**
 Called after the offerwall has attempted to show but failed.
 
 @param error The reason for the error.
 */
- (void)offerwallDidFailToShowWithError:(NSError *)error;

/**
 Called after the offerwall has been dismissed.
 */
- (void)offerwallDidClose;

/**
 @abstract Called each time the user completes an offer.
 @discussion creditInfo is a dictionary with the following key-value pairs:
 
 "credits" - (int) The number of credits the user has Earned since the last didReceiveOfferwallCredits event that returned YES. Note that the credits may represent multiple completions (see return parameter).
 
 "totalCredits" - (int) The total number of credits ever earned by the user.
 
 "totalCreditsFlag" - (BOOL) In some cases, we won’t be able to provide the exact amount of credits since the last event (specifically if the user clears the app’s data). In this case the ‘credits’ will be equal to the "totalCredits", and this flag will be YES.
 
 @param creditInfo Offerwall credit info.
 
 @return The publisher should return a BOOL stating if he handled this call (notified the user for example). if the return value is NO, the 'credits' value will be added to the next call.
 */
- (BOOL)didReceiveOfferwallCredits:(NSDictionary *)creditInfo;

/**
 Called after the 'offerwallCredits' method has attempted to retrieve user's credits info but failed.
 
 @param error The reason for the error.
 */
- (void)didFailToReceiveOfferwallCreditsWithError:(NSError *)error;

@end

#endif
