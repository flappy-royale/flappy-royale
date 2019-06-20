package com.example.flappyroyale

import android.app.AlertDialog
import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import com.lazerwalker.flappyadconstants.AdConstants
import com.mopub.mobileads.MoPubRewardedVideo
import com.mopub.mobileads.MoPubRewardedVideos
import com.mopub.common.MoPubReward
import com.mopub.mobileads.MoPubErrorCode
import com.mopub.mobileads.MoPubRewardedVideoListener



class ModalAdPresenter(private val mContext: Context, val webview: WebView) {
    @JavascriptInterface
    fun prepareAd(currentState: Int) {
        val adUnitID = adUnitForState(currentState) ?: return

        MoPubRewardedVideos.loadRewardedVideo(adUnitID);
    }

    @JavascriptInterface
    fun requestAd(currentState: Int) {
        val adUnitID = adUnitForState(currentState) ?: return

        val hasReward = MoPubRewardedVideos.hasRewardedVideo(adUnitID)

        if (hasReward) {
            val rewardedVideoListener = object : MoPubRewardedVideoListener {
                override fun onRewardedVideoLoadSuccess(adUnitId: String) {
                    // Called when the video for the given adUnitId has loaded. At this point you should be able to call MoPubRewardedVideos.showRewardedVideo(String) to show the video.
                }

                override fun onRewardedVideoLoadFailure(adUnitId: String, errorCode: MoPubErrorCode) {
                    // Called when a video fails to load for the given adUnitId. The provided error code will provide more insight into the reason for the failure to load.
                }

                override fun onRewardedVideoStarted(adUnitId: String) {
                    // Called when a rewarded video starts playing.
                }

                override fun onRewardedVideoPlaybackError(adUnitId: String, errorCode: MoPubErrorCode) {
                    //  Called when there is an error during video playback.
                }

                override fun onRewardedVideoClosed(adUnitId: String) {
                    // Called when a rewarded video is closed. At this point your application should resume.
                }

                override fun onRewardedVideoClicked(adUnitId: String) {
                    TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
                }

                override fun onRewardedVideoCompleted(adUnitIds: Set<String>, reward: MoPubReward) {
                    if(reward.isSuccessful()) {
                        webview.evaluateJavascript("window.currentGame.adsHaveBeenUnlocked();") { _ -> }
                    }
                }
            }

            MoPubRewardedVideos.setRewardedVideoListener(rewardedVideoListener)
            MoPubRewardedVideos.showRewardedVideo(adUnitID)

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
        return AdConstants.testRewardMoPub

        if (state == 0) {
            return AdConstants.fiveLivesMoPub

        } else if (state == 1) {
            return AdConstants.tenLivesMoPub

        } else if (state == 2) {
            return AdConstants.fifteenLivesMobPub

        } else {
            assert(state == 4) {  -> "Somehow ended up sending for too many ads" }
            print("Got into a bad state")
            return null
        }
    }
}