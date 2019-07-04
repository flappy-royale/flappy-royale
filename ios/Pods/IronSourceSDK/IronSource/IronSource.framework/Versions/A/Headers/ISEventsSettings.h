//
//  ISEventsSettings.h
//  IronSource
//
//  Created by Yotam Ohayon on 08/01/2016.
//  Copyright © 2016 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ISEventsSettings : NSObject

@property (nonatomic, assign, readonly) BOOL        sendUltraEvents;
@property (nonatomic, assign, readonly) BOOL        sendEventsToggle;
@property (nonatomic, strong, readonly) NSURL       *serverEventsURL;
@property (nonatomic, assign, readonly) NSUInteger  backupThreshold;
@property (nonatomic, assign, readonly) NSUInteger 	maxNumberOfEvents;
@property (nonatomic, copy, readonly) NSString      *serverEventsType;
@property (nonatomic, strong, readonly) NSArray     *optOut;
@property (nonatomic, assign)   NSUInteger          maxEventsPerBatch;

- (instancetype)initWithSendUltraEvents:(BOOL)sendEvents
                       sendEventsToggle:(BOOL)eventsToggle
                        serverEventsURL:(NSURL *)serverUrl
                        backupThreshold:(NSUInteger)backupThreshold
                      maxNumberOfEvents:(NSUInteger)maxNumberOfEvents
                       serverEventsType:(NSString *)serverEventsType
                                 optOut:(NSArray *)optOut
                      maxEventsPerBatch:(NSUInteger)maxEventsPerBatch;

@end
