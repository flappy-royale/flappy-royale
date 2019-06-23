import Foundation
import WebKit
import SafariServices
import MessageUI

class URLManager : NSObject, WebViewInteropProvider {
    public var presentationVC: UIViewController!
    
    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "openURL")
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let url = message.body as? String else { return }
        
        if message.name == "openURL" {
            if (url.starts(with: "http")) {
                let sfVC = SFSafariViewController(url: URL(string:url)!)
                presentationVC.present(sfVC, animated: true, completion: nil)
            }

        } else if url.starts(with: "mail") {
            let composeVC = MFMailComposeViewController()
            let emails = url.components(separatedBy: "mailto:")[1].components(separatedBy: ",")
            
            composeVC.setToRecipients(emails)
            composeVC.setSubject("Flappy Feedback")

            presentationVC.present(composeVC, animated: true, completion: nil)
        } else {
            UIApplication.shared.open(URL(string:url)!, options: [:], completionHandler: nil)
        }
    }
}
