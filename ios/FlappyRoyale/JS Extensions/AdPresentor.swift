import Foundation
import WebKit
import MoPub

class AdPresentor : NSObject, WebViewInteropProvider, MPRewardedVideoDelegate {
    public var presentationVC: UIViewController!
    var webView: WKWebView?
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        webView = message.webView
        
        guard let currentState = message.body as? Int else { return }
        var adUnitID = AdConstants.testRewardMoPub
        if (currentState == 0) {
//            adUnitID = AdConstants.fiveLivesMoPub

        } else if (currentState == 1) {
//            adUnitID = AdConstants.tenLivesMoPub
            
        } else if (currentState == 2) {
//            adUnitID = AdConstants.fifteenLivesMobPub
            
        } else {
            assert(currentState == 4, "Somehow ended up sending for too many ads")
            print("Got into a bad state")
            return
        }
        
        let reward = MPRewardedVideo.availableRewards(forAdUnitID:adUnitID)
        if reward != nil {
            MPRewardedVideo.setDelegate(self, forAdUnitId: adUnitID)
            MPRewardedVideo.presentAd(forAdUnitID: AdConstants.testRewardMoPub, from: presentationVC, with: reward?.first! as! MPRewardedVideoReward)
        } else {
            // Fallback for when ads fails (just add it anyway?)
        }

        
        
    }
    
    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "adManager")
    }
    
    func rewardedVideoAdShouldReward(forAdUnitID adUnitID: String!, reward: MPRewardedVideoReward!) {
        guard let adWebView = webView else { return }
        adWebView.evaluateJavaScript("window.currentGame.scene.scenes[0].adsHaveBeenUnlocked()", completionHandler: nil)
    }
}
