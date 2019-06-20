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

import com.applovin.sdk.AppLovinSdk

import com.vungle.warren.InitCallback
import com.vungle.warren.Vungle

import com.chartboost.sdk.Chartboost;
import com.chartboost.sdk.CBLocation;
import com.chartboost.sdk.ChartboostDelegate;
import com.mopub.mobileads.GooglePlayServicesAdapterConfiguration

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
        setUpVungle()
        setUpMoPub()

        /** Set up the bottom banner ad */
        moPubView = findViewById(R.id.adview) as? MoPubView
        moPubView?.adUnitId = AdConstants.bottomBannerMoPub
        moPubView?.loadAd();


    }

    fun setUpVungle() {
        val vungleCallback = object : InitCallback {
            override fun onSuccess() {
                // Initialization has succeeded and SDK is ready to load an ad or play one if there
                // is one pre-cached already
            }

            override fun onError(throwable: Throwable) {
                // Initialization error occurred - throwable.getLocalizedMessage() contains error message
            }

            override fun onAutoCacheAdAvailable(placementId: String) {
                // Callback to notify when an ad becomes available for the auto-cached placement
                // NOTE: This callback works only for the auto-cached placement. Otherwise, please use
                // LoadAdCallback with loadAd API for loading placements.
            }
        }
        Vungle.init(AdConstants.vungleAppID, getApplicationContext(), vungleCallback)
    }

    fun setUpMoPub() {
        val admobConfig = HashMap<String,String>() //define empty hashmap
        admobConfig.put("npa", "1");

        val moPubConfig = SdkConfiguration.Builder(AdConstants.bottomBannerMoPub)
            .withLogLevel(MoPubLog.LogLevel.DEBUG)
            .withMediatedNetworkConfiguration(GooglePlayServicesAdapterConfiguration::class.java.name, admobConfig)
            .build()


        val moPubCompletion = object : SdkInitializationListener {
            override fun onInitializationFinished() {
                // Not sure why these are here, but this is our exact flow on iOS

                AppLovinSdk.initializeSdk(applicationContext);

                // We need access to the current Activity, but within this listener "this" isn't that!
                setUpChartboost()
            }
        }

        MoPub.initializeSdk(
            this,
            moPubConfig,
            moPubCompletion
        )
    }

    fun setUpChartboost() {
        Chartboost.startWithAppId(this, AdConstants.chartboostAppId, AdConstants.chartboostAppSignature);
        Chartboost.onCreate(this);
    }

    override fun onDestroy() {
        super.onDestroy()
        moPubView?.destroy();
    }
}

