//
//  AppStoreReview.swift
//  FlappyRoyale
//
//  Created by Mike Lazer-Walker on 09.06.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import StoreKit
import WebKit

class AppStoreReviewer : NSObject, WebViewInteropProvider {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if #available(iOS 10.3, *) {
            SKStoreReviewController.requestReview()
        } else {
            // TODO: I don't think we actually care about supporting earlier versions?
        }
    }

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "requestReview")
    }
}
