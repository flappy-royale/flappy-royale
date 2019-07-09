// Copyright (C) 2014 by Tapjoy Inc.
//
// This file is part of the Tapjoy SDK.
//
// By using the Tapjoy SDK in your software, you agree to the terms of the Tapjoy SDK License Agreement.
//
// The Tapjoy SDK is bound by the Tapjoy SDK License Agreement and can be found here: https://www.tapjoy.com/sdk/license


#define TJC_CONNECT_SUCCESS					@"TJC_Connect_Success"
#define TJC_CONNECT_FAILED					@"TJC_Connect_Failed"

#define TJC_LIMITED_CONNECT_SUCCESS                    @"TJC_Limited_Connect_Success"
#define TJC_LIMITED_CONNECT_FAILED                    @"TJC_Limited_Connect_Failed"

// This notification is fired after getCurrencyBalance has been called, and indicates that user currency amount has been received from the server.
#define TJC_GET_CURRENCY_RESPONSE_NOTIFICATION				@"TJC_GET_CURRENCY_RESPONSE_NOTIFICATION"
// This notification is fired after spendCurrency has been called, and indicates that the user has successfully spent currency.
#define TJC_SPEND_CURRENCY_RESPONSE_NOTIFICATION			@"TJC_SPEND_CURRENCY_RESPONSE_NOTIFICATION"
// This notification is fired after awardCurrency has been called, and indicates that the user has successfully been awarded currency.
#define TJC_AWARD_CURRENCY_RESPONSE_NOTIFICATION			@"TJC_AWARD_CURRENCY_RESPONSE_NOTIFICATION"

// Error notification for getCurrencyBalance
#define TJC_GET_CURRENCY_RESPONSE_NOTIFICATION_ERROR		@"TJC_GET_CURRENCY_RESPONSE_NOTIFICATION_ERROR"
// Error notification for spendCurrency
#define TJC_SPEND_CURRENCY_RESPONSE_NOTIFICATION_ERROR		@"TJC_SPEND_CURRENCY_RESPONSE_NOTIFICATION_ERROR"
// Error notification for awardCurrency
#define TJC_AWARD_CURRENCY_RESPONSE_NOTIFICATION_ERROR		@"TJC_AWARD_CURRENCY_RESPONSE_NOTIFICATION_ERROR"

// Notification that is fired after an event has been logged.
#define TJC_EVENT_TRACKING_RESPONSE_NOTIFICATION			@"TJC_EVENT_TRACKING_RESPONSE_NOTIFICATION"
// Error notification for Event Tracking.
#define TJC_EVENT_TRACKING_RESPONSE_NOTIFICATION_ERROR		@"TJC_EVENT_TRACKING_RESPONSE_NOTIFICATION_ERROR"

// Notification that a user has just successfully completed an offer and earned currency. This only fires on init/resume.
#define TJC_CURRENCY_EARNED_NOTIFICATION					@"TJC_CURRENCY_EARNED_NOTIFICATION"

// Fired when any Tapjoy view is closed.
#define TJC_VIEW_CLOSED_NOTIFICATION						@"TJC_VIEW_CLOSED_NOTIFICATION"

// Fired when a webview fails to load
#define TJC_VIEW_LOADING_ERROR_NOTIFICATION                 @"TJC_VIEW_LOADING_ERROR_NOTIFICATION"

// The keys for the options dictionary when calling requestTapjoyConnect.
#define TJC_OPTION_SERVICE_URL					@"TJC_OPTION_SERVICE_URL"
#define TJC_OPTION_PLACEMENT_URL				@"TJC_OPTION_PLACEMENT_SERVICE_URL"
#define TJC_OPTION_ENABLE_LOGGING				@"TJC_OPTION_ENABLE_LOGGING"
#define TJC_OPTION_USER_ID						@"TJC_OPTION_USER_ID"
#define TJC_OPTION_CLEAR_SHARED_URL_CACHE		@"TJC_OPTION_CLEAR_SHARED_URL_CACHE"
#define TJC_OPTION_DISABLE_GENERIC_ERROR_ALERT  @"TJC_OPTION_DISABLE_GENERIC_ERROR_ALERT"


