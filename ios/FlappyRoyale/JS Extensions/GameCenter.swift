//
//  GameCenter.swift
//  FlappyRoyale
//
//  Created by Em Lazer-Walker on 08.07.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import Foundation
import GameKit
import WebKit

struct GameCenterAuthData {
    let playerID: String
    let name: String
    let url: String
    let salt: String
    let signature: String
    let timestamp: UInt64
}

// TODO: We might want/need a method to force new auth if the existing one is expired?
class GameCenterAuth : NSObject, WebViewInteropProvider {
    public var presentationVC: UIViewController!

    var webView: WKWebView?
    var authData: GameCenterAuthData?

    var loginWasValid: Bool?
    var waitingOnData: Bool = false

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "gameCenterLogin")
        auth()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        self.webView = message.webView
        sendData()
    }

    func sendData() {
        if (self.loginWasValid == false) {
            self.waitingOnData = false
            webView?.evaluateJavaScript("window.dispatchEvent(new Event('gameCenterLogin'))", completionHandler: nil)
            return
        }

        guard let data = authData, let webView = webView else {
            self.waitingOnData = true
            return
        }

        self.waitingOnData = false

        print("window.gameCenter = {playerID: '\(data.playerID)', name: '\(data.name)', url: '\(data.url)', salt: '\(data.salt)', signature: '\(data.signature)', timestamp: \(data.timestamp) }")
        webView.evaluateJavaScript("window.dispatchEvent(new CustomEvent('gameCenterLogin', { detail: {playerID: '\(data.playerID)', name: '\(data.name)', url: '\(data.url)', salt: '\(data.salt)', signature: '\(data.signature)', timestamp: \(data.timestamp) }}))", completionHandler: nil)
        webView.evaluateJavaScript("window.gameCenter = {playerID: '\(data.playerID)', name: '\(data.name)', url: '\(data.url)', salt: '\(data.salt)', signature: '\(data.signature)', timestamp: \(data.timestamp) }", completionHandler: nil)
    }

    func auth() {
        let player = GKLocalPlayer.local
        player.authenticateHandler = { vc, error in
            if let vc = vc {
                self.presentationVC.present(vc, animated: true, completion: nil)
            } else if player.isAuthenticated {
                print("Authenticated! \(player.playerID)") // TODO: This is deprecated, newer APIs have gamePlayerID but I don't have the SDK installed
                player.generateIdentityVerificationSignature(completionHandler: { (url, salt, signature, timestamp, error) in
                    print("Generated signature!")
                    if let error = error {
                        print("Signature error: \(error.localizedDescription)")
                        self.loginWasValid = false
                        self.authData = nil
                    } else {
                        print(salt, signature, url, timestamp)

                        if let salt = salt,
                            let signature = signature,
                            let urlString = url?.absoluteString {

                            let saltString = salt.base64EncodedString()
                            let signatureString = signature.base64EncodedString()

                            // Fun fact: player.displayName is "Me" if you're looking at yourself. "Alias" gives us the actual name.
                            let name = player.alias

                            self.authData = GameCenterAuthData(playerID: player.playerID, name: name, url: urlString, salt: saltString, signature: signatureString, timestamp: timestamp)
                            self.loginWasValid = true
                        } else {
                            self.loginWasValid = false
                            self.authData = nil
                        }
                    }

                    if self.waitingOnData {
                        self.sendData()
                    }
                })
            } else {
                print("No game center")
                self.loginWasValid = false
                if self.waitingOnData {
                    self.sendData()
                }
            }
        }
    }
}
