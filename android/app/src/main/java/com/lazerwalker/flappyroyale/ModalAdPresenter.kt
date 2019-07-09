package com.lazerwalker.flappyroyale

import android.app.AlertDialog
import android.content.Context
import android.os.Handler
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import com.ironsource.mediationsdk.IronSource
import com.ironsource.mediationsdk.logger.IronSourceError
import com.ironsource.mediationsdk.model.Placement
import com.ironsource.mediationsdk.sdk.RewardedVideoListener
import com.lazerwalker.flappyadconstants.AdConstants
import android.os.Looper

class ModalAdPresenter(private val mContext: Context, val webview: WebView) : RewardedVideoListener {
    @JavascriptInterface
    fun prepareAd(currentState: Int) {

    }

    @JavascriptInterface
    fun prepareAdWithID(adUnitID: String) {
    
    }

    @JavascriptInterface
    fun requestAd(currentState: Int) {
        val adUnitID = adUnitForState(currentState) ?: return
        requestAdWithID(adUnitID)
    }

    @JavascriptInterface
    fun requestAdWithID(adUnitID: String) {
        val hasAd = IronSource.isRewardedVideoAvailable()

        if (hasAd) {
            IronSource.showRewardedVideo(adUnitID)
        } else {
            AlertDialog.Builder(mContext)
                .setTitle("Sorry!")
                .setMessage("We couldn't fetch any video ads for you. Try again later?")
                .setNeutralButton("OK", null)
                .show()

            return
        }
    }

    private fun adUnitForState(state: Int): String? {
        if (state == 0) {
            return AdConstants.ironSrcFiveLives

        } else if (state == 1) {
            return AdConstants.ironSrcTenLives

        } else if (state == 2) {
            return AdConstants.ironSrcFifteenLives

        } else {
            assert(state == 4) {  -> "Somehow ended up sending for too many ads" }
            print("Got into a bad state")
            return null
        }
    }

    /** IronSource rewarded video ad listener */

    override fun onRewardedVideoAdOpened() {
        Log.i("IronSource", "Rewarded video ad opened")
    }
    override fun onRewardedVideoAdClosed() {
        Log.i("IronSource", "Rewarded video ad closed")
    }

    override fun onRewardedVideoAvailabilityChanged(available: Boolean) {
        Log.i("IronSource", "Rewarded video ad avalability changed ${available}")
    }

    override fun onRewardedVideoAdStarted(){
        Log.i("IronSource", "Rewarded video ad started")
    }

    override fun onRewardedVideoAdEnded(){
        Log.i("IronSource", "Rewarded video ad ended")
    }

    override fun onRewardedVideoAdRewarded(placement: Placement) {
        Log.i("IronSource", "Rewarded video ad rewarded!")
        // Web view must evaluate on main thread
        Handler(Looper.getMainLooper()).post(Runnable { webview.evaluateJavascript("window.currentGame.adsHaveBeenUnlocked();") { _ -> } })
    }

    override fun onRewardedVideoAdShowFailed(p0: IronSourceError?) {
        Log.i("IronSource", "Rewarded video ad error")
        Log.i("IronSource", p0?.errorMessage)
    }

    override fun onRewardedVideoAdClicked(placement: Placement) {
        Log.i("IronSource", "Rewarded video ad clicked")
    }
}
