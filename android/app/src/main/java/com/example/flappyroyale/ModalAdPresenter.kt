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
    fun requestAd(currentState: Int) {

        val adUnitID: String
        if (currentState == 0) {
            adUnitID = AdConstants.fiveLivesMoPub

        } else if (currentState == 1) {
            adUnitID = AdConstants.tenLivesMoPub

        } else if (currentState == 2) {
            adUnitID = AdConstants.fifteenLivesMobPub

        } else {
            assert(currentState == 4) {  -> "Somehow ended up sending for too many ads" }
            print("Got into a bad state")
            return
        }

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


        /*
        let reward = MPRewardedVideo.availableRewards(forAdUnitID:adUnitID)
        if reward != nil {
            MPRewardedVideo.setDelegate(self, forAdUnitId: adUnitID)
            MPRewardedVideo.presentAd(forAdUnitID: adUnitID, from: presentationVC, with: reward?.first! as! MPRewardedVideoReward)
        } else {
            let alert = UIAlertController(title: "Sorry!", message: "We couldn't fetch any video ads for you. Try again later?", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { (_) in
                    self.presentationVC.dismiss(animated: true, completion: nil)
            }))
            presentationVC.present(alert, animated: true, completion: nil)
        }
        */

        //window.currentGame.adsHaveBeenUnlocked()

    }
}