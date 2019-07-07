import StoreKit
import WebKit

class AppStoreReviewer : NSObject, WebViewInteropProvider {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("Request review!")
        SKStoreReviewController.requestReview()
    }

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "requestReview")
    }
}
