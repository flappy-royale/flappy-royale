//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef ISRewardedInterstitialDelegate_h
#define ISRewardedInterstitialDelegate_h

#import <Foundation/Foundation.h>

@protocol ISRewardedInterstitialDelegate <NSObject>

@required
- (void)didReceiveRewardForInterstitial;

@end


#endif
