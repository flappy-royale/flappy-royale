//
//  PushNotifications.swift
//  FlappyRoyale
//
//  Created by Em Lazer-Walker on 14.07.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import Foundation
import WebKit

/** This gets the APNS deviceToken set via the AppDelegate when/if the user gives permissions.
 * It dispatches an event to the JS client with the token (a) when that gets set and (b) whenever the client requests it */
class PushNotificationManager : NSObject, WebViewInteropProvider {
    var webView: WKWebView?

    var token: String? {
        didSet {
            sendToken()
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        sendToken()
    }

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "apns")
    }

    func sendToken() {
        guard let token = token else { return }
        webView?.evaluateJavaScript("window.apnsDeviceToken=\"\(token)\";", completionHandler: nil)
        webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('apnsDeviceToken', { detail: { token: '\(token)' }}));", completionHandler: nil)
    }
}
