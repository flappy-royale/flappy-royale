import UIKit
import SafariServices
import WebKit

class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, UIScrollViewDelegate, SFSafariViewControllerDelegate {
    let haptics = HapticManager()
    let storeReviews = AppStoreReviewer()
    let adPresentor = AdPresentor()
    let analytics = AnalyticsPresentor()
    let share = ShareManager()
    let urlOpener = URLManager()
    let gameCenterAuth = GameCenterAuth()
    let pushNotifs = PushNotificationManager()
    
    var webView: WKWebView?

    var serverOverride: URL? {
        get {
            if let str = ProcessInfo.processInfo.environment["server"] {
                return URL(string: str)
            } else {
                return nil
            }
        }
    }

    override func viewDidLoad() {
        
        ISIntegrationHelper.validateIntegration()

        super.viewDidLoad()

        adPresentor.presentationVC = self
        gameCenterAuth.presentationVC = self

        share.presentationVC = self
        urlOpener.presentationVC = self
        view.backgroundColor = UIColor(red:0.19, green:0.09, blue:0.02, alpha:1.0)

        let userContentController = WKUserContentController()

        let username = NSUserName()
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        let bundleVersion = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        let userScript = WKUserScript(source: """
window.isAppleApp = true;
window.username = '\(username)';
window.appVersion = '\(appVersion)';
window.buildVersion = '\(bundleVersion)';
""",
                                      injectionTime: .atDocumentStart,
                                      forMainFrameOnly: true)
        userContentController.addUserScript(userScript)

        // PlayFab Auth
        let device = UIDevice.current
        let osVersion = ProcessInfo.processInfo.operatingSystemVersion
        let osString = "\(osVersion.majorVersion).\(osVersion.minorVersion).\(osVersion.patchVersion)"

        if let deviceId = device.identifierForVendor {
            // If there's no local device ID, let JS just fall back to web auth
            let playfabAuthUserScript = WKUserScript(source: "window.playfabAuth = { method: 'LoginWithIOSDeviceID', payload: { DeviceId: '\(deviceId)', DeviceModel: '\(device.modelName)', OS: '\(osString)' }};",
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true)
            userContentController.addUserScript(playfabAuthUserScript)
        }


        let interopProviders: [WebViewInteropProvider] = [haptics, storeReviews, adPresentor, analytics, share, urlOpener, gameCenterAuth, pushNotifs]
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
            webView.topAnchor.constraint(equalTo: self.view.topAnchor),
            webView.widthAnchor.constraint(equalTo: self.view.widthAnchor),
            webView.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
        ])

        let adViewContainer = UIView()
        view.addSubview(adViewContainer)
        view.backgroundColor = view.backgroundColor
        
        adPresentor.startUpBannerIntoContainer(container: adViewContainer)

        adViewContainer.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            adViewContainer.heightAnchor.constraint(equalToConstant: 56),
            adViewContainer.widthAnchor.constraint(equalToConstant: 320),
            adViewContainer.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            adViewContainer.topAnchor.constraint(equalTo: webView.bottomAnchor),
            adViewContainer.bottomAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.bottomAnchor),
        ])
        
        self.webView = webView
        pushNotifs.webView = webView

        // WKWebViews don't dispatch visibilitychange events.
        // If we fake support for visibilitychange, pausing the Phaser game will Just Work™
        webView.evaluateJavaScript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: false }}); window.dispatchEvent(evt);", completionHandler: nil)
        NotificationCenter.default.addObserver(forName: UIApplication.didEnterBackgroundNotification, object: nil, queue: nil) {_ in
            webView.evaluateJavaScript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: true }}); window.dispatchEvent(evt);", completionHandler: nil)
        }

        NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: nil) {_ in
            webView.evaluateJavaScript("var evt = new CustomEvent('fake-visibilitychange', { detail: { hidden: false }}); window.dispatchEvent(evt);", completionHandler: nil)
        }

        loadGameURL()
    }

    private func loadGameURL() {
        guard let webView = self.webView else { return }

        guard let url = (serverOverride != nil) ? serverOverride : URL(string: "https://flappyroyale.io/prod")
            else { return }

        webView.load(URLRequest(url: url))
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("[WEBVIEW]: Did fail")
        print(error)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("[WEBVIEW]: Did start provisional")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("[WEBVIEW]: Finished")

        if let page = ProcessInfo.processInfo.environment["pageToGo"] {
            webView.evaluateJavaScript("window.setUpSnapshot('\(page)')", completionHandler: nil)
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("[WEBVIEW]: Fail provisional", error)
        let alert = UIAlertController(title: "Uh oh!", message: "You don't seem to be online. Reconnect in order to download the latest game data!", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Try Again", style: .default, handler: { (_) in
            self.dismiss(animated: true, completion: nil)
            self.loadGameURL()
        }))
        alert.addAction(UIAlertAction(title: "OK", style: .cancel, handler: { (_) in
            self.dismiss(animated: true, completion: nil)
        }))

        self.present(alert, animated: true, completion: nil)
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

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in completionHandler(true) }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in completionHandler(false) }))
        present(alert, animated: true, completion: nil)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        alert.addTextField { (textField : UITextField!) -> Void in
            textField.placeholder = defaultText
        }

        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            let text = alert.textFields![0].text
            completionHandler(text)
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in completionHandler(nil) }))
        present(alert, animated: true, completion: nil)    }

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

// via https://stackoverflow.com/questions/11197509/how-to-get-device-make-and-model-on-ios
extension UIDevice {
    var modelName: String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { identifier, element in
            guard let value = element.value as? Int8, value != 0 else { return identifier }
            return identifier + String(UnicodeScalar(UInt8(value)))
        }
        return identifier
    }
}
