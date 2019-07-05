//
//  Copyright © 2017 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ISPlacementInfo : NSObject

- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithPlacement:(NSString *)placementName reward:(NSString *)rewardName rewardAmount:(NSNumber*)rewardAmount NS_DESIGNATED_INITIALIZER;

@property (readonly) NSString *placementName;
@property (readonly) NSString *rewardName;
@property (readonly) NSNumber *rewardAmount;


@end
