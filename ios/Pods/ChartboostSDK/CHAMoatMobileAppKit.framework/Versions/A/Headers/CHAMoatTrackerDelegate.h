//
//  CHAMoatTrackerDelegate.h
//  CHAMoatMobileAppKit
//
//  Created by Moat 740 on 3/27/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#import "CHAMoatAdEventType.h"

#ifndef CHAMoatTrackerDelegate_h
#define CHAMoatTrackerDelegate_h

typedef enum : NSUInteger {
    CHAMoatStartFailureTypeNone = 0, //Default none value
    CHAMoatStartFailureTypeActive,   //The tracker was already active
    CHAMoatStartFailureTypeRestart,  //The tracker was stopped already
    CHAMoatStartFailureTypeBadArgs,  //The arguments provided upon initialization or startTracking were invalid.
} CHAMoatStartFailureType;

@class CHAMoatBaseTracker;
@class CHAMoatBaseVideoTracker;

@protocol CHAMoatTrackerDelegate <NSObject>

@optional

/**
 Notifies delegate that the tracker has started tracking.
 */

- (void)trackerStartedTracking:(CHAMoatBaseTracker *)tracker;

/**
 Notifies delegate that the tracker has stopped tracking.
 */

- (void)trackerStoppedTracking:(CHAMoatBaseTracker *)tracker;

/**
 Notifies delegate that the tracker failed to start.
 
 @param type Type of startTracking failure.
 @param reason A human readable string on why the tracking failed.
 */

- (void)tracker:(CHAMoatBaseTracker *)tracker failedToStartTracking:(CHAMoatStartFailureType)type reason:(NSString *)reason;

@end

#pragma mark

@protocol CHAMoatVideoTrackerDelegate <NSObject>

@optional

/**
 Notifies delegate an ad event type is being dispatched (i.e. start, pause, quarterly events).
 
 @param adEventType The type of event fired.
 */
- (void)tracker:(CHAMoatBaseVideoTracker *)tracker sentAdEventType:(CHAMoatAdEventType)adEventType;

@end

#endif /* CHAMoatTrackerDelegate_h */
