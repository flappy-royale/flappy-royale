package com.lazerwalker.flappyroyale

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.android.gms.auth.api.Auth
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInResult
import com.lazerwalker.flappyadconstants.AdConstants

class GooglePlayGames(private val context: Context, val webview: WebView, val activity: Activity) {
    private var serverAuthCode: String? = null

    /** Google explicitly recommends against using the ID for server authentication purposes.
     * However, right now we're blocked on serverAuthCode not working, so this is a mediocre – but hopefully passable – workaround for now
     * (See https://community.playfab.com/questions/31628/loginlink-with-google-invalid-grant-token-issueinv.html) */
    private var googleId: String? = null

    private var waitingOnData: Boolean = false
    private var loginWasValid: Boolean? = null

    private val googleSignInClient = GoogleSignIn.getClient(
        activity,
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_GAMES_SIGN_IN)
            .requestProfile()
            .requestId()
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
            Log.i("AUTH", "is successFinish")
            serverAuthCode = result.signInAccount!!.serverAuthCode
            googleId = result.signInAccount!!.id
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
                serverAuthCode = task.result!!.serverAuthCode
                googleId = task.result!!.id
                loginWasValid = true
                sendData()
            } else {
                Log.d("AUTH", "signInSilently(): failure", task.exception)
                val intent = googleSignInClient?.signInIntent
                activity.startActivityForResult(intent, GOOGLE_SIGNIN_MAGIC_NUMBER)
            }
        }
    }

    fun logIn() {
        val intent = googleSignInClient?.signInIntent
        activity.startActivityForResult(intent, GOOGLE_SIGNIN_MAGIC_NUMBER)
    }

    private fun sendData() {
        if (loginWasValid == false) {
            waitingOnData = false
            Handler(Looper.getMainLooper()).post(Runnable {
                webview.evaluateJavascript("window.dispatchEvent(new Event('googlePlayLogin'))") { _ -> }
            })
            return
        }

        if (serverAuthCode == null) {
            waitingOnData = true
            return
        }

        waitingOnData = false

        Handler(Looper.getMainLooper()).post(Runnable {
            webview.evaluateJavascript("window.dispatchEvent(new CustomEvent('googlePlayLogin', { detail: { serverAuthCode: '$serverAuthCode', googleId: '$googleId' }}))") { _ -> }
            webview.evaluateJavascript("window.googlePlay = { serverAuthCode: '$serverAuthCode', googleId: '$googleId' };") { _ -> }
        })
    }
}