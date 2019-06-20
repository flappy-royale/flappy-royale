package com.example.flappyroyale

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
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

        webview.webViewClient = WebViewClient()
        val settings = webview.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.setAppCacheEnabled(true)
        webview.loadUrl("https://flappyroyale.io/prod")

        // TODO: setUpFirebase()
        setUpMoPub()

        /** Set up the bottom banner ad */
        moPubView = findViewById(R.id.adview) as? MoPubView
        moPubView?.adUnitId = AdConstants.bottomBannerMoPub
        moPubView?.loadAd();


    }

    fun setUpMoPub() {
        val moPubConfig = SdkConfiguration.Builder(AdConstants.bottomBannerMoPub)
            .withLogLevel(MoPubLog.LogLevel.DEBUG)
            .build()


        val moPubCompletion = object : SdkInitializationListener {
            override fun onInitializationFinished() {}
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

