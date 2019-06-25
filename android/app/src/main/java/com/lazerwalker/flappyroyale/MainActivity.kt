package com.lazerwalker.flappyroyale

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.webkit.WebViewClient
import kotlinx.android.synthetic.main.activity_main.*

import com.lazerwalker.flappyadconstants.AdConstants

import com.mopub.common.MoPub
import com.mopub.common.SdkConfiguration
import com.mopub.common.SdkInitializationListener
import com.mopub.common.logging.MoPubLog
import com.mopub.mobileads.MoPubView

class MainActivity : AppCompatActivity() {
    private var moPubView: MoPubView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Without this, our redirect immediately causes the game to be opened in a separate chrome browser
        webview.webViewClient = WebViewClient()

        val settings = webview.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.setAppCacheEnabled(true)
        webview.loadUrl("https://flappyroyale.io/prod")

        webview.addJavascriptInterface(ModalAdPresenter(this, webview), "ModalAdPresenter")
        webview.addJavascriptInterface(AnalyticsManager(this, webview), "Analytics")
        webview.addJavascriptInterface(ShareManager(this, webview, this), "Sharing")
        webview.addJavascriptInterface(URLLoader(this, webview), "URLLoader")

        window.decorView.apply {
            // Hide both the navigation bar and the status bar.
            // SYSTEM_UI_FLAG_FULLSCREEN is only available on Android 4.1 and higher, but as
            // a general rule, you should design your app to hide the status bar whenever you
            // hide the navigation bar.
            systemUiVisibility = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_FULLSCREEN
        }

        setUpMoPub()
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

