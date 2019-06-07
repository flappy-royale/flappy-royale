//
//  CHAMoatBaseTracker.h
//  CHAMoatMobileAppKit
//
//  Created by Moat on 7/27/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "CHAMoatTrackerDelegate.h"

@interface CHAMoatBaseTracker : NSObject

/**
 Delegate Property for CHAMoatBaseTracker and its subclasses to have to report start tracking, stop tracking, and other events.
 */
@property (weak, nonatomic) id<CHAMoatTrackerDelegate> trackerDelegate;

/*
 * Randomly generated ID to uniquely identify the tracker.
 */
@property (strong, nonatomic, readonly) NSNumber *trackerID;

@end
