//
//  MAErrorCodes.h
//  AppLovinSDK
//
//  Created by Thomas So on 8/27/18.
//  Copyright © 2019 AppLovin Corporation. All rights reserved.
//

/**
 * Indicates that the system is in unexpected state.
 */
#define kMAErrorCodeUnspecifiedError -1

/**
 * Indicates that no ads are currently eligible for your device.
 */
#define kMAErrorCodeNoFill 204

/**
 * Indicates that AppLovin servers have returned an invalid response
 */
#define kMAErrorCodeInvalidResponse -800

/**
 * Indicates that an attempt to show a fullscreen ad (interstitial or rewarded) was made while another fullscreen ad is still showing.
 */
#define kMAErrorCodeFullscreenAdAlreadyShowing -23

/**
 * Indicates that the mediation adapter has failed to load.
 */
#define kMAErrorCodeMediationAdapterLoadFailed -5001

/**
 * Indicates that the mediation adapter was requested to render an ad that was not marked as ready.
 */
#define kMAErrorCodeMediationAdapterAdNotReady -5002

/**
 * Indicates that the mediated ad has failed due to a timeout.
 */
#define kMAErrorCodeMediationAdapterTimeout -5101

/**
 * Indicates that the mediated ad has failed immediately (due to a 0 timeout).
 */
#define kMAErrorCodeMediationAdapterImmediateTimeout -5102

/**
 * Indicates that the mediation adapter was disabled.
 */
#define kMAErrorCodeMediationAdapterDisabled -5103

/**
 * Indicates that the mediation adapter is not of an expected type.
 */
#define kMAErrorCodeMediationAdapterWrongType -5104

/**
 * Internal state of the SDK is invalid.
 */
#define kMAErrorCodeInvalidInternalState -5201

/**
 * Current ad type is not supported by the mediation framework.
 */
#define kMAErrorCodeFormatTypeNotSupported -5501
