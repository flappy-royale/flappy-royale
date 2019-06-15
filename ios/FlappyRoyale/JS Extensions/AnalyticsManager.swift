import Foundation
import FirebaseAnalytics
import WebKit

class AnalyticsPresentor : NSObject, WebViewInteropProvider {
    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "analyticsEvent")
        controller.add(self, name: "analyticsUserProperty")
        controller.add(self, name: "analyticsSetID")
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let jsonString = message.body as? String else { return }
        guard let json = try? JSONSerialization.jsonObject(with: jsonString.data(using: .utf8)!, options: []) else { return }
        guard let dictionary = json as? [String: Any] else { return }
        
        if message.name == "analyticsEvent" {
            if let name = dictionary["name"] as? String, let params = dictionary["params"] as? [String: Any] {
                Analytics.logEvent(name, parameters: params)
            }

        } else if message.name == "analyticsUserProperty" {
            if let name = dictionary["name"] as? String, let value = dictionary["name"] as? String {
                Analytics.setUserProperty(value, forName: name)
            }
        } else if message.name == "analyticsSetID" {
            if let name = dictionary["id"] as? String {
                Analytics.setUserID(name)
            }
        }
    }
}
