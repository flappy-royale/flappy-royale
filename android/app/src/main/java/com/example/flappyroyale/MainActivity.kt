package com.example.flappyroyale

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebViewClient
import com.lazerwalker.flappyadconstants.AdConstants
import kotlinx.android.synthetic.main.activity_main.*
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

        /** Swift initialization:
         FirebaseApp.configure()

        let sdk:VungleSDK = VungleSDK.shared()
        do {
        try sdk.start(withAppId: AdConstants.vungleAppID)
        }
        catch let error as NSError {
        print("Error while starting VungleSDK : \(error.domain)")
        }

        let config = MPMoPubConfiguration(adUnitIdForAppInitialization: AdConstants.bottomBannerMoPub)
        config.loggingLevel = .debug
        MoPub.sharedInstance().initializeSdk(with: config) {
        GADMobileAds.sharedInstance().start(completionHandler: nil)
        ALSdk.initializeSdk()
        }
         */
        moPubView = findViewById(R.id.adview) as? MoPubView
        moPubView?.adUnitId = AdConstants.bottomBannerMoPub
        moPubView?.loadAd();
    }

    override fun onDestroy() {
        super.onDestroy()
        moPubView?.destroy();
    }
}
