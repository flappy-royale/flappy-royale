package com.lazerwalker.flappyroyale

import android.content.pm.ActivityInfo
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.support.constraint.ConstraintLayout
import android.util.Log
import android.view.View
import android.webkit.WebViewClient
import kotlinx.android.synthetic.main.activity_main.*

import com.lazerwalker.flappyadconstants.AdConstants

import android.view.MotionEvent
import android.view.GestureDetector
import android.webkit.WebSettings
import android.webkit.WebView
import com.ironsource.mediationsdk.ISBannerSize
import com.ironsource.mediationsdk.IronSource
import com.ironsource.mediationsdk.IronSourceBannerLayout
import com.ironsource.mediationsdk.logger.IronSourceError
import com.ironsource.mediationsdk.sdk.BannerListener


class MainActivity : AppCompatActivity() {
    private var adPresenter: ModalAdPresenter? = null
    private var banner: IronSourceBannerLayout? = null

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
        settings.setAppCachePath(this.cacheDir.absolutePath);
        settings.databaseEnabled = true;
        settings.domStorageEnabled = true;
        settings.allowFileAccess = true;
        settings.cacheMode = WebSettings.LOAD_DEFAULT;

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

        this.adPresenter = ModalAdPresenter(this, webview)

        IronSource.setUserId(IronSource.getAdvertiserId(this))
        IronSource.setRewardedVideoListener(this.adPresenter);
        IronSource.shouldTrackNetworkState(this, true);

        IronSource.init(this, AdConstants.ironsrcAppKey, IronSource.AD_UNIT.REWARDED_VIDEO, IronSource.AD_UNIT.BANNER);
        loadIronSourceBanner()
        // This verifies IronSource is set up, including mediation integrations
        // IntegrationHelper.validateIntegration(this);
    }

    override fun onAttachedToWindow() {
        // Notch offsets aren't available until we attach to window
        // Let's delay loading the game til then

        webview.loadUrl("https://flappyroyale.io/prod")
//        webview.loadUrl("http://192.168.1.6:8085")
//        WebView.setWebContentsDebuggingEnabled(true);

        webview.addJavascriptInterface((this.adPresenter as ModalAdPresenter), "ModalAdPresenter")
        webview.addJavascriptInterface(AnalyticsManager(this, webview), "Analytics")
        webview.addJavascriptInterface(ShareManager(this, webview, this), "Sharing")
        webview.addJavascriptInterface(URLLoader(this, webview), "URLLoader")
        webview.addJavascriptInterface(AndroidStaticData(this, webview), "AndroidStaticData")

        webview.evaluateJavascript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: false }}); window.dispatchEvent(evt);") { _ -> }
    }

    override fun onResume() {
        super.onResume()
        webview.evaluateJavascript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: false }}); window.dispatchEvent(evt);") { _ -> }
        IronSource.onResume(this)
    }

    override fun onPause() {
        super.onPause()
        webview.evaluateJavascript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: true }}); window.dispatchEvent(evt);") { _ -> }
        IronSource.onPause(this)
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

    private fun loadIronSourceBanner() {
        this.banner = IronSource.createBanner(this, ISBannerSize.BANNER);
        bannerAdView.addView(banner)

        val bannerListener = object : BannerListener {
            override fun onBannerAdLoaded() {
                Log.i("IronSource", "Banner ad loaded")
            }

            override fun onBannerAdLoadFailed(error: IronSourceError) {
                Log.i("IronSource", "Banner ad load failed")
                Log.i("IronSource", error.errorMessage)

                runOnUiThread({ bannerAdView.removeAllViews() })
            }

            override fun onBannerAdClicked()
            {
                Log.i("IronSource", "Banner ad clicked")
            }

            override fun onBannerAdScreenPresented()
            {
                Log.i("IronSource", "Banner ad presented")
            }

            override fun onBannerAdScreenDismissed()
            {
                Log.i("IronSource", "Banner ad dismissed")
            }

            override fun onBannerAdLeftApplication()
            {
                Log.i("IronSource", "Banner ad left application")
            }
        }
        this.banner?.setBannerListener(bannerListener)
        IronSource.loadBanner(banner);
    }

    override fun onDestroy() {
        super.onDestroy()
        IronSource.destroyBanner(this.banner);
    }
}

