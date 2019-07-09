//
//  ISTapjoyAdapter.h
//  ISTapjoyAdapter
//
//  Created by Daniil Bystrov on 4/13/16.
//  Copyright © 2016 IronSource. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "IronSource/ISBaseAdapter+Internal.h"

static NSString * const TapjoyAdapterVersion     = @"4.1.4";

//System Frameworks For Tapjoy Adapter

@import CoreMotion;
@import Security;
@import CoreData;
@import CFNetwork;
@import CoreGraphics;
@import Foundation;
@import MapKit;
@import MediaPlayer;
@import MobileCoreServices;
@import QuartzCore;
@import SystemConfiguration;
@import UIKit;
@import AdSupport;
@import CoreTelephony;
@import StoreKit;
@import ImageIO;
@import WebKit;
@import PassKit;

@interface ISTapjoyAdapter : ISBaseAdapter

@end
