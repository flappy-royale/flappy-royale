fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios beta
```
fastlane ios beta
```
Push a new beta build to TestFlight
### ios appstore
```
fastlane ios appstore
```
Submit a new build and metadata to the App Store
### ios add_device
```
fastlane ios add_device
```

### ios refresh_profiles
```
fastlane ios refresh_profiles
```


----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
