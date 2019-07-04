//
//  Copyright © 2017 IronSource. All rights reserved.
//

#ifndef IRONSOURCE_LOG_DELEGATE_H
#define IRONSOURCE_LOG_DELEGATE_H

#import <Foundation/Foundation.h>

typedef enum LogLevelValues
{
    IS_LOG_NONE = -1,
    IS_LOG_INTERNAL = 0,
    IS_LOG_INFO = 1,
    IS_LOG_WARNING = 2,
    IS_LOG_ERROR = 3,
    IS_LOG_CRITICAL = 4,
    
} LogLevel;

typedef enum LogTagValue
{
    TAG_API,
    TAG_DELEGATE,
    TAG_ADAPTER_API,
    TAG_ADAPTER_DELEGATE,
    TAG_NETWORK,
    TAG_NATIVE,
    TAG_INTERNAL,
    TAG_EVENT
    
} LogTag;

@protocol ISLogDelegate <NSObject>

@required

- (void)sendLog:(NSString *)log level:(LogLevel)level tag:(LogTag)tag;

@end

#endif
