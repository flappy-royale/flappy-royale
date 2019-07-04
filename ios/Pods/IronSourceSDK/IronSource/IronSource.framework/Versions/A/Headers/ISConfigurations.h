//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_CONFIGURATION_H
#define IRONSOURCE_CONFIGURATION_H

#import <Foundation/Foundation.h>
#import "ISGender.h"
#import "ISSegment.h"


@interface ISConfigurations : NSObject

@property (nonatomic, strong)   NSString            *userId;
@property (nonatomic, strong)   NSString            *appKey;
@property (nonatomic, strong)   NSString            *mediationSegment;
@property (nonatomic, strong)   NSString            *segmentId;
@property (nonatomic, strong)   NSDictionary        *customSegmentParams;
@property (nonatomic, strong)   ISSegment           *segment;
@property (nonatomic, strong)   NSDictionary        *rewardedVideoCustomParameters;
@property (nonatomic, strong)   NSDictionary        *offerwallCustomParameters;
@property (nonatomic, strong)   NSString            *version;
@property (nonatomic, strong)   NSNumber            *adapterTimeOutInSeconds;
@property (nonatomic, strong)   NSNumber            *maxNumOfAdaptersToLoadOnStart;
@property (nonatomic, strong)   NSString            *plugin;
@property (nonatomic, strong)   NSString            *pluginVersion;
@property (nonatomic, strong)   NSString            *pluginFrameworkVersion;
@property (nonatomic, strong)   NSNumber            *maxVideosPerIteration;
@property (nonatomic, assign)   NSInteger           userAge;
@property (nonatomic, assign)   ISGender            userGender;
@property (nonatomic, assign)   BOOL                trackReachability;
@property (nonatomic, strong)   NSString            *dynamicUserId;
@property (nonatomic, assign)   BOOL                adaptersDebug;
@property (nonatomic, strong)   NSString            *mediationType;
@property (nonatomic, strong)   NSNumber            *serr;
@property (nonatomic, strong)   NSString            *categorizeType;
@property (nonatomic, strong)   NSDictionary        *rvServerParams;
@property (nonatomic, assign)   NSInteger           consent;
@property (nonatomic, strong)   NSDictionary        *batchGenricParams;
@property (nonatomic, strong)   NSDictionary        *eventGenricParams;

/*!
 @deprecated This method has been deprecated and will be removed in a future version
 */
+ (ISConfigurations *)configurations DEPRECATED_MSG_ATTRIBUTE("As of version 6.5.2, use class method: getConfigurations");

+ (ISConfigurations *)getConfigurations;

@end

#endif
