//
//  ISLoggersSettings.h
//  IronSource
//
//  Created by Yotam Ohayon on 08/01/2016.
//  Copyright © 2016 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ISLoggersSettings : NSObject

@property (nonatomic, readonly) NSInteger server;
@property (nonatomic, readonly) NSInteger publisher;
@property (nonatomic, readonly) NSInteger console;

- (instancetype)initWithServer:(NSInteger)server
                     publisher:(NSInteger)publisher
                       console:(NSInteger)console;

@end
