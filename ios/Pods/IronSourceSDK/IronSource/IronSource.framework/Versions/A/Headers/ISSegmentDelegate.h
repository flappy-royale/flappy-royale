//
//  ISSegmentDelegate.h
//  IronSource
//
//  Created by Gili Ariel on 06/07/2017.
//  Copyright © 2017 Supersonic. All rights reserved.
//

#ifndef ISSegmentDelegate_h
#define ISSegmentDelegate_h

@protocol ISSegmentDelegate <NSObject>

@required
/**
 Called after a segment recived successfully 
 */
- (void)didReceiveSegement:(NSString *)segment;

@end
#endif /* ISSegmentDelegate_h */
