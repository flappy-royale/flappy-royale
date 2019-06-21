package com.lazerwalker.flappyroyale

import android.os.Bundle
import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView

import com.google.firebase.analytics.FirebaseAnalytics
import org.json.JSONObject

class AnalyticsManager(private val mContext: Context, val webview: WebView) {
    @JavascriptInterface
    fun event(name: String, params: String) {
        val obj: JSONObject = JSONObject(params)
        val bundle = JSONToBundleConverter.fromJson(obj)

        FirebaseAnalytics.getInstance(mContext).logEvent(name, bundle)
    }

    @JavascriptInterface
    fun userProperty(name: String, value: String) {
        FirebaseAnalytics.getInstance(mContext).setUserProperty(name, value)
    }

    @JavascriptInterface
    fun setId(id: String) {
        FirebaseAnalytics.getInstance(mContext).setUserId(id)
    }
}