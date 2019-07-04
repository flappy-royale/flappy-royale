//
//  ISServerResponseParser.h
//  IronSource
//
//  Created by Yotam Ohayon on 08/01/2016.
//  Copyright © 2016 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "ISProductSettings.h"
#import "ISEventsSettings.h"
#import "ISLoggersSettings.h"

@interface ISServerResponseParser : NSObject

/* ProvidersConfig Array's Hold 'ISAdapterConfig' obj */
@property (nonatomic, strong) NSArray                             *rewardedVideoProvidersConfig;
@property (nonatomic, strong) NSArray                             *interstitialProvidersConfig;
@property (nonatomic, strong) NSArray                             *offerwallProvidersConfig;
@property (nonatomic, strong) NSArray                             *bannerProvidersConfig;

@property (nonatomic, strong) ISProductSettings                   *rewardedVideoProductSettings;
@property (nonatomic, strong) ISProductSettings                   *interstitialProductSettings;
@property (nonatomic, strong) ISProductSettings                   *offerwallProductSettings;
@property (nonatomic, strong) ISProductSettings                   *bannerProductSettings;

@property (nonatomic, strong) ISEventsSettings                    *rewardedVideoEvents;
@property (nonatomic, strong) ISEventsSettings                    *interstitialEvents;
@property (nonatomic, strong) ISEventsSettings                    *offerwallEvents;
@property (nonatomic, strong) ISEventsSettings                    *bannerEvents;

@property (nonatomic, strong) ISLoggersSettings                   *loggers;

@property (nonatomic, strong) NSString                            *segmentName;
@property (nonatomic, strong) NSString                            *segmentId;
@property (nonatomic, strong) NSDictionary                        *customSegmentParams;

@property (nonatomic,assign) BOOL                                 showIntegrationHelper;

+ (ISServerResponseParser *)sharedInstance;
-  (void)parseObject:(id)object;

- (NSArray *)getConfigForProvider:(NSString *)provider withKey:(NSString *)key;
@end
