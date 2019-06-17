import Foundation
import FirebaseAnalytics
import WebKit

class ShareManager : NSObject, WebViewInteropProvider {
    public var presentationVC: UIViewController!
    
    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "shareScreenshot")
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let text = message.body as? String else { return }
        
        if message.name == "shareScreenshot" {
            let config = WKSnapshotConfiguration()
            message.webView?.takeSnapshot(with: config) { (image, err) in
                message.webView?.evaluateJavaScript("window.dispatchEvent(new Event('screenshotComplete'));", completionHandler: nil)

                let shareItems =  image != nil ? [image!, text] : [text]
                let activityViewController = UIActivityViewController(activityItems: shareItems, applicationActivities: nil)
                activityViewController.excludedActivityTypes = [.addToReadingList]
                self.presentationVC.present(activityViewController, animated: true, completion: nil)
            }
        }
    }
}
