//
//  AdColonyGlobalMediationSettings.m
//  MoPubSDK
//
//  Copyright (c) 2016 MoPub. All rights reserved.
//

#import "AdColonyGlobalMediationSettings.h"
#import "AdColonyController.h"

@implementation AdColonyGlobalMediationSettings

+ (void)enableClientSideTestMode {
    [AdColonyController enableClientSideTestMode];
}

+ (void)disableClientSideTestMode {
    [AdColonyController disableClientSideTestMode];
}

@end
