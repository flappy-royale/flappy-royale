//
//  Copyright © 2017 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ISIntegrationHelper : NSObject

/**
 @abstract A tool to verify a successful integration of the IronSource SDK and any additional adapters.
 @discussion The Integration Helper tool portray the compatibility between the SDK and adapter versions, and makes sure all required dependencies and frameworks were added for the various mediated ad networks.
 
 Once you have finished your integration, call the 'validateIntegration' function and confirm that everything in your integration is marked as VERIFIED.
 */
+ (void)validateIntegration;

@end
