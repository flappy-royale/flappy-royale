package com.lazerwalker.flappyroyale

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView

import com.google.firebase.analytics.FirebaseAnalytics
import org.json.JSONObject

class URLLoader(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun openURL(url: String) {
        val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(i)

        // TODO: Do we need to explicitly handle mailto, or will Android do that for us?
    }
}