package com.lazerwalker.flappyroyale

import android.content.pm.ActivityInfo
import android.os.Build
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.webkit.WebViewClient
import com.jaredrummler.android.device.DeviceName
import kotlinx.android.synthetic.main.activity_main.*

import com.lazerwalker.flappyadconstants.AdConstants

import com.mopub.common.MoPub
import com.mopub.common.SdkConfiguration
import com.mopub.common.SdkInitializationListener
import com.mopub.common.logging.MoPubLog
import com.mopub.mobileads.MoPubView
import android.text.method.Touch.onTouchEvent
import android.view.MotionEvent
import android.view.GestureDetector
import android.view.WindowInsets
import android.annotation.TargetApi
import android.os.Debug
import android.util.Log
import android.webkit.WebView


class MainActivity : AppCompatActivity() {
    private var moPubView: MoPubView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Force portrait mode
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT)

        // Without this, our redirect immediately causes the game to be opened in a separate chrome browser
        webview.webViewClient = WebViewClient()

        val settings = webview.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.setAppCacheEnabled(true)

        makeFullScreen()

        webview.setClickable(true)
        val clickDetector = GestureDetector(this,
            object : GestureDetector.SimpleOnGestureListener() {
                override fun onSingleTapUp(e: MotionEvent): Boolean {
                    val visible = window.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_HIDE_NAVIGATION == 0
                    if (visible) {
                        makeFullScreen()
                    }
                    return false
                }
            })
        webview.setOnTouchListener(View.OnTouchListener { _, motionEvent ->
            clickDetector.onTouchEvent(
                motionEvent
            )
        })

        setUpMoPub()
    }

    override fun onAttachedToWindow() {
        // Notch offsets aren't available until we attach to window
        // Let's delay loading the game til then

        webview.loadUrl("https://flappyroyale.io/prod")
//        webview.loadUrl("http://192.168.1.6:8085")
//        WebView.setWebContentsDebuggingEnabled(true);

        webview.addJavascriptInterface(ModalAdPresenter(this, webview), "ModalAdPresenter")
        webview.addJavascriptInterface(AnalyticsManager(this, webview), "Analytics")
        webview.addJavascriptInterface(ShareManager(this, webview, this), "Sharing")
        webview.addJavascriptInterface(URLLoader(this, webview), "URLLoader")
        webview.addJavascriptInterface(AndroidStaticData(this, webview), "AndroidStaticData")
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            makeFullScreen()
        }
    }

    fun makeFullScreen() {
        // Give us "full-screen" mode, which hides the bottom navigation bar
        // We need "immersive" mode, which means normal UI taps don't re-trigger it, just swiping from an edege
        window.decorView.apply {
            systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_IMMERSIVE)
        }
    }

    fun setUpMoPub() {
        val moPubConfig = SdkConfiguration.Builder(AdConstants.bottomBannerMoPub)
            .withLogLevel(MoPubLog.LogLevel.DEBUG)
            .build()

        val moPubCompletion = object : SdkInitializationListener {
            override fun onInitializationFinished() {
                /** Set up the bottom banner ad */
                moPubView = findViewById(R.id.adview) as? MoPubView
                moPubView?.adUnitId = AdConstants.bottomBannerMoPub
                moPubView?.loadAd();
            }
        }

        MoPub.initializeSdk(
            this,
            moPubConfig,
            moPubCompletion
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        moPubView?.destroy();
    }
}

