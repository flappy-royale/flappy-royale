package com.lazerwalker.flappyroyale

import android.content.Context
import android.os.Build
import android.webkit.JavascriptInterface
import android.webkit.WebView

class NotchOffset(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun offset() : Int? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            // Set notch offset in JS so our client code can read it
            // Inspired by the approach taken by https://github.com/tobspr/cordova-plugin-android-notch

            val cutout = webview.rootView.rootWindowInsets.displayCutout
            val density = context.resources.displayMetrics.density

            if (cutout != null) {
                return cutout.safeInsetTop
            }
        }
        return null
    }
}