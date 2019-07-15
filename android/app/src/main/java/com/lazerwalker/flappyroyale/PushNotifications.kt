package com.lazerwalker.flappyroyale

import android.content.ContentValues.TAG
import android.content.Context
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId

// TODO: This should also explicitly listen for new tokens and dispatch the event when that happens
// see https://firebase.google.com/docs/cloud-messaging/android/client
class PushNotifications(private val context: Context, val webview: WebView) {
    @JavascriptInterface
    fun register() {
        FirebaseInstanceId.getInstance().instanceId
            .addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w("PUSH", "getInstanceId failed", task.exception)
                    return@OnCompleteListener
                }

                // Get new Instance ID token
                val token = task.result?.token
                webview.evaluateJavascript("window.dispatchEvent(new CustomEvent('deviceRegistrationToken', { detail: { token: '$token' }}))") { _ -> }
            })

    }
}