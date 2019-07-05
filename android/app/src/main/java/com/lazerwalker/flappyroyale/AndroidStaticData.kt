package com.lazerwalker.flappyroyale

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView

/**
 * As far as I can tell, webview.evaluateJavascript() calls in Android don't work the way we want them to.
 * And JavascriptInterface only extends to FUNCTIONS, not properties.
 *
 * My workaround: this is a function that returns an object containing all the shit we want shoved on window.
 * When the JS client loads, if this function exists, it'll call it and do the work for us.
 * */
class AndroidStaticData(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun fetch(): String {
        var string = "{";

        val playfabAuth = PlayfabAuthData(context, webview)
        string += "\"playfabAuth\": " + playfabAuth.data() + ", "

        val notchOffset = NotchOffset(context, webview)
        string += "\"notchOffset\": " + notchOffset.offset()

        string += "}"

        return string
    }
}