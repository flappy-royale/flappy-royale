package com.lazerwalker.flappyroyale

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView

class LoadingManager(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun gameLoaded() {
        Handler(Looper.getMainLooper()).post(Runnable { webview.visibility = View.VISIBLE })
    }
}