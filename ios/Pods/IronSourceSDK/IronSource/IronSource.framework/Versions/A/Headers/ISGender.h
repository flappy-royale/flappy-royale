//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_GENDER_H
#define IRONSOURCE_GENDER_H

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, ISGender) {
    IRONSOURCE_USER_UNKNOWN,
    IRONSOURCE_USER_MALE,
    IRONSOURCE_USER_FEMALE
};

#define kISGenderString(enum) [@[@"unknown",@"male",@"female"] objectAtIndex:enum]
#endif
