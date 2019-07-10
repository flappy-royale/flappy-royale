package com.lazerwalker.flappyroyale

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.android.gms.auth.api.Auth
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.lazerwalker.flappyadconstants.AdConstants

class GooglePlayGames(private val context: Context, val webview: WebView, val activity: Activity) {
    private var serverAuthCode: String? = null
    private var waitingOnData: Boolean = false
    private var loginWasValid: Boolean = false

    private val googleSignInClient = GoogleSignIn.getClient(
            activity,
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_GAMES_SIGN_IN)
                .requestServerAuthCode(AdConstants.googlePlayGamesServerClientId, false)
                .build()
        )

    @JavascriptInterface
    fun auth() {
        sendData()
    }

    fun finishSignIn(data: Intent?) {
        val result = Auth.GoogleSignInApi.getSignInResultFromIntent(data)
        if (result.isSuccess) {
            Log.i("AUTH", "is success")
            serverAuthCode = result.signInAccount!!.serverAuthCode
            loginWasValid = true


        } else {
            Log.i("AUTH", "is not success, ${result.status}")
            serverAuthCode = null
            loginWasValid = false
        }

        if (waitingOnData) {
            sendData()
            waitingOnData = false
        }
    }

    fun signInSilently() {
        Log.d("AUTH", "signInSilently()")

        googleSignInClient.silentSignIn().addOnCompleteListener(activity)  { task ->
            if (task.isSuccessful) {
                Log.d("AUTH", "signInSilently(): success")
                //onConnected(task.result)
                // TODO: Get the data?
            } else {
                Log.d("AUTH", "signInSilently(): failure", task.exception)
                val intent = googleSignInClient?.signInIntent
                activity.startActivityForResult(intent, GOOGLE_SIGNIN_MAGIC_NUMBER)
            }
        }
    }

    private fun sendData() {
        if (!loginWasValid) {
            waitingOnData = false
            webview.evaluateJavascript("window.dispatchEvent(new Event('googlePlayLogin'))") { _ -> }
            return
        }

        if (serverAuthCode == null) {
            waitingOnData = true
            return
        }

        waitingOnData = false

        webview.evaluateJavascript("window.dispatchEvent(new CustomEvent('googlePlayLogin', { detail: { serverAuthCode: '$serverAuthCode' }}))") { _ -> }
        webview.evaluateJavascript("window.googlePlay = { serverAuthCode: '$serverAuthCode' };") { _ -> }
    }
}
