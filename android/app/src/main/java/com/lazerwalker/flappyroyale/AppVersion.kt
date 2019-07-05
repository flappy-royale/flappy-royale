package com.lazerwalker.flappyroyale

import android.content.Context
import android.os.Build
import android.webkit.JavascriptInterface
import android.webkit.WebView

class AppVersion(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun appVersion() : String {
        return BuildConfig.VERSION_NAME
    }

    fun buildVersion() : String {
        return "${BuildConfig.VERSION_CODE}"
    }

}
