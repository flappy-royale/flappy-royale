import UIKit
import SafariServices
import WebKit
import MoPub

//import AppLovinSDK


class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, UIScrollViewDelegate, SFSafariViewControllerDelegate {
    let haptics = HapticManager()
    let storeReviews = AppStoreReviewer()

    override func viewDidLoad() {
        super.viewDidLoad()

        let userScript = WKUserScript(source: "window.isAppleApp = true;",
                                      injectionTime: .atDocumentStart,
                                      forMainFrameOnly: true)


        let userContentController = WKUserContentController()
        userContentController.addUserScript(userScript)

        let interopProviders: [WebViewInteropProvider] = [haptics, storeReviews]
        interopProviders.forEach({ $0.inject(userContentController) })

        let configuration = WKWebViewConfiguration()

        // Play audio/video inline instead of popping a full-screen modal player
        configuration.allowsInlineMediaPlayback = true

        // Disable Safari's requirement for user input before playing audio/video
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Allow local
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        // Load our JS
        configuration.userContentController = userContentController

        let webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.delegate = self
        webView.bounds = CGRect(x: 0, y: 0, width: 320, height: 240)
        view.addSubview(webView)
        
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.heightAnchor.constraint(equalTo: self.view.heightAnchor, constant: -60),
            webView.widthAnchor.constraint(equalTo: self.view.widthAnchor),
            webView.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            webView.centerYAnchor.constraint(equalTo: self.view.centerYAnchor),
        ])

        let adView = MPAdView(adUnitId: AdConstants.testBannerMoPub, size: MOPUB_BANNER_SIZE)!
        view.addSubview(adView)
        adView.loadAd()

        adView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            adView.heightAnchor.constraint(equalToConstant: 50),
            adView.widthAnchor.constraint(equalToConstant: 320),
            adView.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            adView.bottomAnchor.constraint(equalTo: self.view.bottomAnchor, constant: -20),
        ])
        
        let button = UIButton(type: .roundedRect)
        view.addSubview(button)
        button.frame = CGRect(x: 20,y: 620, width: 60, height: 60)
        button.setTitle("5 Lives", for: .normal)
        button.backgroundColor = .green
        button.addTarget(self, action: #selector(show5ad), for: .touchUpInside)
        
//        let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist")!
//        webView.loadFileURL(url, allowingReadAccessTo: url)

//        guard let url = URL(string: "https://flappy-royale-3377a.firebaseapp.com") else { return }
        guard let url = URL(string: "http://localhost:8085") else { return }
        webView.load(URLRequest(url: url))

        // Dispatch app pause/resume events to JS, so we can manually pause/resume gameplay
        NotificationCenter.default.addObserver(forName: UIApplication.didEnterBackgroundNotification, object: nil, queue: nil) {_ in
            webView.evaluateJavaScript("var evt = new Event('appPause'); window.dispatchEvent(evt);", completionHandler: nil)
        }

        NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: nil) {_ in
            webView.evaluateJavaScript("var evt = new Event('appResume'); window.dispatchEvent(evt);", completionHandler: nil)
        }

        MPRewardedVideo.loadAd(withAdUnitID: AdConstants.testRewardMoPub, withMediationSettings: [])

    }

    @objc func show5ad() {

        let reward = MPRewardedVideo.availableRewards(forAdUnitID:AdConstants.testRewardMoPub)
        if reward != nil {
            MPRewardedVideo.presentAd(forAdUnitID: AdConstants.testRewardMoPub, from: self, with: reward?.first! as! MPRewardedVideoReward)
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print(error)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("Did start provisional")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("Finished")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("Fail provisional", error)
    }

    // Open `target="_blank"` links in Safari
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        guard let url = navigationAction.request.url else { return nil }
        if navigationAction.targetFrame == nil {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
        return nil
    }

    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
        return nil
    }

    // Pass through alert() blocks
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        present(alert, animated: true, completion: nil)
        completionHandler()
    }

    // Open normal links in a modal SFSafariViewContrller
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            return decisionHandler(.allow)
        }

        if navigationAction.navigationType == .linkActivated {
            let safariVC = SFSafariViewController(url: url)
            safariVC.delegate = self

            self.present(safariVC, animated: true, completion: nil)

            decisionHandler(.cancel)
        } else {
            decisionHandler(.allow)
        }
    }


    func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true, completion: nil)
    }
}
//
//extension ViewController : ALAdLoadDelegate
//{
//    func adService(_ adService: ALAdService, didLoad ad: ALAd) {
//        // We now have an interstitial ad we can show!
////        self.ad = ad
//        ALInterstitialAd.shared().show(ad)
//    }
//
//    func adService(_ adService: ALAdService, didFailToLoadAdWithError code: Int32) {
//        // Look at ALErrorCodes.h for list of error codes.
//        print("Error with applovin: \(code)")
//    }
//}


extension ViewController: MPAdViewDelegate {
    func viewControllerForPresentingModalView() -> UIViewController! {
        return self
    }
}
