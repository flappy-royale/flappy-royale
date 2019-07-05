import Foundation
import WebKit
//import MoPub

class AdPresentor : NSObject, WebViewInteropProvider, ISRewardedVideoDelegate, ISBannerDelegate {
    
    public var presentationVC: UIViewController!
    
    public var bannerContainerView: UIView?
    public var bannerView: ISBannerView?
    
    var webView: WKWebView?

    override init() {
        super.init()
        
        IronSource.setRewardedVideoDelegate(self)
        IronSource.setBannerDelegate(self)
        
        let userId = IronSource.advertiserId()
        IronSource.setUserId(userId)

        IronSource.initWithAppKey(AdConstants.ironSrcAppKey, adUnits:[IS_REWARDED_VIDEO, IS_BANNER])
    }
    
    // Get a container to put the banner in and start DLing
    func startUpBannerIntoContainer(container: UIView) {
        bannerContainerView = container
        IronSource.loadBanner(with: self.presentationVC, size:ISBannerSize(description: "BANNER"), placement: AdConstants.ironSrcBottomBanner);
        
        ISIntegrationHelper.validateIntegration()
    }
    
    /// -------- Banner Delegate Stuff
    
    func bannerDidLoad(_ bannerView: ISBannerView!) {
        guard let container = bannerContainerView else {
            return print("No banner view set up yet?!")
        }
        
        container.subviews.forEach { $0.removeFromSuperview() }
        container.addSubview(bannerView)
        
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bannerView.heightAnchor.constraint(equalToConstant: bannerView.bounds.height),
            bannerView.widthAnchor.constraint(equalToConstant: bannerView.bounds.width),
            bannerView.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            bannerView.centerYAnchor.constraint(equalTo: container.centerYAnchor),
        ])
    }
    
    func bannerDidFailToLoadWithError(_ error: Error!) {
        
    }
    
    func didClickBanner() {
        
    }
    
    func bannerWillPresentScreen() {
        
    }
    
    func bannerDidDismissScreen() {
        
    }
    
    func bannerWillLeaveApplication() {
     
    }
    
    /// -------- Banner Delegate Stuff
    
    func rewardedVideoHasChangedAvailability(_ available: Bool) {
        print("Availability has changed")
    }
    
    func didReceiveReward(forPlacement placementInfo: ISPlacementInfo!) {
        print("Got reward")
        
        guard let adWebView = webView else { return }
        adWebView.evaluateJavaScript("window.currentGame.adsHaveBeenUnlocked()", completionHandler: nil)
    }
    
    func rewardedVideoDidFailToShowWithError(_ error: Error!) {
        print("Failed to show reward video: \(error!)")
    }
    
    func rewardedVideoDidOpen() {
        print("Reward video opened")
    }
    
    func rewardedVideoDidClose() {
     print("Reward video closed")
    }
    
    func rewardedVideoDidStart() {
        print("Reward video started")
    }
    
    func rewardedVideoDidEnd() {
        print("Reward did end")
    }
    
    func didClickRewardedVideo(_ placementInfo: ISPlacementInfo!) {
        
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        webView = message.webView

        guard let jsonString = message.body as? String else { return }
        guard let json = try? JSONSerialization.jsonObject(with: jsonString.data(using: .utf8)!, options: []) else { return }
        guard let dictionary = json as? [String: Int] else { return }
        
        let preload = dictionary["prepare"] as Int?
        let show = dictionary["show"] as Int?
        
        let id = preload ?? show ?? 0
        
        var adUnitID: String
        if (id == 0) {
            adUnitID = AdConstants.ironSrcFiveLives

        } else if (id == 1) {
            adUnitID = AdConstants.ironSrcTenLives
            
        } else if (id == 2) {
            adUnitID = AdConstants.ironSrcFifteenLives
            
        } else {
            print("Got into a bad state")
            assert(true, "Somehow ended up sending for too many ads")
            return
        }
        
        if preload != nil {
            
            
        }
        
        if show != nil {
            IronSource.showRewardedVideo(with: self.presentationVC, placement: adUnitID)
        }
    }
    
    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "adManager")
    }
}
