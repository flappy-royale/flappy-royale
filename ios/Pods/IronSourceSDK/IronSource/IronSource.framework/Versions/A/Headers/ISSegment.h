//
//  ISSegment.h
//  IronSource
//
//  Created by Gili Ariel on 06/07/2017.
//  Copyright © 2017 Supersonic. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ISGender.h"

@interface ISSegment : NSObject

@property (nonatomic) int                             age;
@property (nonatomic) int                             level;
@property (nonatomic) double                          iapTotal;
@property (nonatomic) BOOL                            paying;
@property (nonatomic) ISGender                        gender;
@property (nonatomic, strong) NSDate                  *userCreationDate;
@property (nonatomic, strong) NSString                *segmentName;
@property (nonatomic, strong, readonly) NSDictionary  *customKeys;

- (void)setCustomValue:(NSString *)value forKey:(NSString *)key;
@end
