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
        print("Request review!")
//        SKStoreReviewController.requestReview()
    }

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "requestReview")
    }
}
