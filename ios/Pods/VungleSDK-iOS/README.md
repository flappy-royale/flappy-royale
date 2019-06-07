
# Vungle's iOS-SDK
[![Version](https://img.shields.io/cocoapods/v/VungleSDK-iOS.svg?style=flat)](http://cocoapods.org/pods/VungleSDK-iOS)
[![License](https://img.shields.io/cocoapods/l/VungleSDK-iOS.svg?style=flat)](http://cocoapods.org/pods/VungleSDK-iOS)
[![Platform](https://img.shields.io/cocoapods/p/VungleSDK-iOS.svg?style=flat)](http://cocoapods.org/pods/VungleSDK-iOS)

## Getting Started
Please refer to https://support.vungle.com/hc/en-us/articles/360014624231


### Version Info
The Vungle iOS SDK supports iOS 8.0 and above, including iOS 12, both 32bit and 64bit apps.  

Our newest iOS SDK (6.3.2) will be generally available in November 8th, 2018. Please ensure you are using Xcode 10 or later
to ensure smooth integration.
Please Note: Xcode 8 does not include support for iPhone X.

## Release Notes
### 6.3.2
* Support for iOS 12
* StoreKit support for fullscreen MRAID ads
* Improved Moat viewability tracking
* Publishers can now track custom GDPR consent message versions
* MRAID ads now mute according to SDK option

### 6.3.1
* iOS 12 Compatibility
* Improved ad display on iPhone X
* Improved ad handling for placements
* Bug Fixes

### 6.3.0
* StoreKit support for MRAID ads
* Extend additional Moat support for our exchange
* Stability improvements

### 6.2.0
* GDPR compliance.
* Removed the requirement to have an auto-cached placement.
* Removed the requirement to initialize Vungle SDK with all placements.
* Bug fixes.

### 5.4.0
* Fixed crashes on iOS 7
* Fixed crashes around Flex View layout logic
* Improved Flex View and Flex Feed stability
* Resolved duplicate symbol error on zipOpen4

### 5.3.2
* Sleep code to be enforced at placement level
* Ordinal data reporting
* iOS 11 API for safeAreaLayoutGuide for iPhone X
* Ability to close Flex-View ads through API or timer
* Bug fixes and performance improvements

### 5.3.0
* Allow cached ad to play when other placements are downloading.
* Allow cached ad to play when there is no reception.
* Fixed Flex View (ad unit) scaling issue.
* Removed background dim in an interactive ad unit.

### 5.2.0
* Fixed a regression of clickedThrough in internal reporting. Advertiser will see accurate clicks in dashboard.
* Fixed user agent format for internal reporting.
* Fixed an issue with application lifecycle that can result in black screens.

### 5.1.1
* Made cache improvements
* Updated MOAT framework
* Added code to prevent SDK from initializing in iOS 7

### 5.1.0
* Launched new Placements feature.
* Added Native Flex View ad unit.
* Added Moat Viewability technology.
* Added GZIP for faster network transfers.
* Migrate MRAID to WKWebView on iOS 9 and 10 to address memory leak in UIWebView.
* Disabled iOS 7 support.

### 4.1.0
* Fix for occurrence of a black screen at the end of video
* Cache improvements
* Migrate to UIWebView for end cards on iOS 9 and 10 to address memory leak in UIWebView
* Set user-agent in HTTP header to platform user agent for all external requests
* StoreKit support for MRAID ads

### 4.0.9
* Fix wrong behavior for the willCloseAdWithViewInfo: delegate method
* Improved SDK initialization
* Minor fixes and performance improvements
* Fix user-agent field on requests

### 4.0.8
* Refresh the IDFA when app comes to foreground
* Minor fixes

### 4.0.6
* Add cache early check to initial operation chain
* Prefix 3rd party zip/unzip lib functions
* Track and use the didDownload state for legacy ads

### 4.0.5
* Bug fixes
* Performance improvement

### 4.0.4
* iOS 10 OS performance optimizations
* CloudUX functionality support
* Vungle unique id implementation to maintain publisher frequency capping
* Fix click area around CTA button


## License
The Vungle iOS-SDK is available under a commercial license. See the LICENSE file for more info.
