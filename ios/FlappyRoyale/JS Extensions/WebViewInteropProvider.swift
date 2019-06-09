//
//  WebViewInteropProvider.swift
//  FlappyRoyale
//
//  Created by Mike Lazer-Walker on 07.06.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import Foundation
import WebKit

protocol WebViewInteropProvider : WKScriptMessageHandler {
    func inject(_: WKUserContentController)
}
