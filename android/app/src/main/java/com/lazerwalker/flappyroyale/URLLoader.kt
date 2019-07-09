package com.lazerwalker.flappyroyale

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView

import com.google.firebase.analytics.FirebaseAnalytics
import com.vorlonsoft.android.rate.AppRate
import org.json.JSONObject

class URLLoader(private val context: Context, val webview: WebView, val activity: Activity) {
    @JavascriptInterface
    fun openURL(url: String) {
        val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(i)

        // TODO: Do we need to explicitly handle mailto, or will Android do that for us?
    }

    // This tells Android to definitely open it in the Play Store, rather than popping an app chooser
    @JavascriptInterface
    fun openPlayStoreURL(url: String) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(url)
            setPackage("com.android.vending")
        }
        context.startActivity(intent)
    }

    @JavascriptInterface
    fun requestReview() {
        AppRate.with(context).showRateDialog(activity);
    }
}