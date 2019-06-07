//
//  ALVariableService.h
//  AppLovinSDK
//
//  Created by Thomas So on 10/7/18.
//

NS_ASSUME_NONNULL_BEGIN

@class ALVariableService;

/**
 * Protocol definition for a callback to be invoked when latest variables are retrieved from the server.
 */
@protocol ALVariableServiceDelegate<NSObject>

/**
 * Called when new variables are retrieved. The initial set of variables will be returned after the AppLovin SDK finishes initializing.
 *
 * @param variableService The instance of ALVariableService that had its variables updated for.
 * @param variables       The dictionary containing the latest variable values. These values may also be retrieved via the various getters in this class.
 */
- (void)variableService:(ALVariableService *)variableService didUpdateVariables:(NSDictionary<NSString *, id> *)variables;

@end

/**
 * This service allows for retrieval of variables pre-defined on AppLovin's dashboard.
 */
@interface ALVariableService : NSObject

/**
 * Register a delegate to be notified when the latest variables are retrieved from the server.
 * The initial set of variables will be returned after the AppLovin SDK finishes initializing.
 */
@property (nonatomic, weak, nullable) id<ALVariableServiceDelegate> delegate;

/**
 * Explicitly retrieve the latest variables to be returned via the delegate. Please make sure that the delegate has been set via -[ALVariableService delegate].
 */
- (void)loadVariables;

/**
 * Returns the variable value associated with the given key, or false if
 * no mapping of the desired type exists for the given key.
 *
 * @param key The variable name to retrieve the value for.
 *
 * @return The variable value to be used for the given key, or nil if no value was found.
 */
- (BOOL)boolForKey:(NSString *)key;

/**
 * Returns the variable value associated with the given key, or the specified default value if
 * no mapping of the desired type exists for the given key.
 *
 * @param key          The variable name to retrieve the value for.
 * @param defaultValue The value to be returned if the variable name does not exist.
 *
 * @return The variable value to be used for the given key, or the default value if no value was found.
 */
- (BOOL)boolForKey:(NSString *)key defaultValue:(BOOL)defaultValue;

/**
 * Returns the variable value associated with the given key, or nil if
 * no mapping of the desired type exists for the given key.
 *
 * @param key The variable name to retrieve the value for.
 *
 * @return The variable value to be used for the given key, or nil if no value was found.
 */
- (nullable NSString *)stringForKey:(NSString *)key;

/**
 * Returns the variable value associated with the given key, or the specified default value if
 * no mapping of the desired type exists for the given key.
 *
 * @param key          The variable name to retrieve the value for.
 * @param defaultValue The value to be returned if the variable name does not exist.
 *
 * @return The variable value to be used for the given key, or the default value if no value was found.
 */
- (nullable NSString *)stringForKey:(NSString *)key defaultValue:(nullable NSString *)defaultValue;


- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
