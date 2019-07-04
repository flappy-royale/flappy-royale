package com.lazerwalker.flappyroyale

import android.app.Activity
import android.content.Context
import android.os.Build
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.jaredrummler.android.device.DeviceName

class PlayfabAuthData(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun data() : String {
        val deviceId = Settings.Secure.ANDROID_ID
        val device = DeviceName.getDeviceName();

        val osVersion = Build.VERSION.RELEASE
        val apiVersion = Build.VERSION.SDK_INT
        val os = "$osVersion ($apiVersion)"

        // TODO: This is very silly instead of using a library to construct JSON.
        return "{ method: 'LoginWithAndroidDeviceID', payload: { AndroidDeviceId: '$deviceId', AndroidDevice: '$device', OS: '$os'}};"
    }
}