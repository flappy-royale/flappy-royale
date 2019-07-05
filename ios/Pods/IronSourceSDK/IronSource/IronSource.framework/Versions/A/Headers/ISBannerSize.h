//
//  ISBannerSize.h
//  IronSource
//
//  Created by Dor Alon on 12/09/2018.
//  Copyright © 2018 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>

#define ISBannerSize_BANNER [[ISBannerSize alloc] initWithDescription:@"BANNER"]
#define ISBannerSize_LARGE [[ISBannerSize alloc] initWithDescription:@"LARGE"]
#define ISBannerSize_RECTANGLE [[ISBannerSize alloc] initWithDescription:@"RECTANGLE"]
#define ISBannerSize_SMART [[ISBannerSize alloc] initWithDescription:@"SMART"]

@interface ISBannerSize : NSObject

- (instancetype)initWithWidth:(NSInteger)width andHeight:(NSInteger)height;
- (instancetype)initWithDescription:(NSString *)description;

@property (readonly) NSString* sizeDescription;
@property (readonly) NSInteger width;
@property (readonly) NSInteger height;

@end
