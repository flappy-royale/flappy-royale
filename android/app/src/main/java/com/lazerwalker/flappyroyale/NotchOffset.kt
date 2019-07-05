package com.lazerwalker.flappyroyale

import android.annotation.TargetApi
import android.app.Activity
import android.content.Context
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import kotlinx.android.synthetic.main.activity_main.*

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