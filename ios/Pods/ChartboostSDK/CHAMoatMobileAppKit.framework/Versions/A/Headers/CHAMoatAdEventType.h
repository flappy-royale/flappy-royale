//
//  CHAMoatAdEventType.h
//  CHAMoatMobileAppKit
//
//  Created by Moat 740 on 3/27/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#ifndef CHAMoatAdEventType_h
#define CHAMoatAdEventType_h

typedef enum CHAMoatAdEventType : NSUInteger {
    CHAMoatAdEventComplete
    , CHAMoatAdEventStart
    , CHAMoatAdEventFirstQuartile
    , CHAMoatAdEventMidPoint
    , CHAMoatAdEventThirdQuartile
    , CHAMoatAdEventSkipped
    , CHAMoatAdEventStopped
    , CHAMoatAdEventPaused
    , CHAMoatAdEventPlaying
    , CHAMoatAdEventVolumeChange
    , CHAMoatAdEventNone
} CHAMoatAdEventType;

#endif /* CHAMoatAdEventType_h */
