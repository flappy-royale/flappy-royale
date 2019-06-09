//
//  HapticManager.swift
//  FlappyRoyale
//
//  Created by Mike Lazer-Walker on 07.06.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import UIKit
import WebKit

class HapticManager : NSObject {
    let lightManager = UIImpactFeedbackGenerator(style: .light)
    let mediumManager = UIImpactFeedbackGenerator(style: .medium)
    let heavyManager = UIImpactFeedbackGenerator(style: .heavy)
    let selectionManager = UISelectionFeedbackGenerator()
    let notificationManager = UINotificationFeedbackGenerator()

    func prepareLight() {
        lightManager.prepare()
    }

    func prepareMedium() {
        mediumManager.prepare()
    }

    func prepareHeavy() {
        heavyManager.prepare()
    }

    func light() {
        lightManager.impactOccurred()
    }

    func medium() {
        mediumManager.impactOccurred()

    }

    func heavy() {
        heavyManager.impactOccurred()
    }

    func selection() {
        selectionManager.selectionChanged()
    }

    func success() {
        notificationManager.notificationOccurred(.success)
    }

    func error() {
        notificationManager.notificationOccurred(.error)
    }

    func warning() {
        notificationManager.notificationOccurred(.warning)
    }
}

extension HapticManager : WebViewInteropProvider {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {

        var hapticsMap: [String : () -> Void]

        if (message.name == "prepareHaptics") {
            hapticsMap = [
                "light": prepareLight,
                "medium": prepareMedium,
                "heavy": prepareHeavy
            ]
        } else if (message.name == "playHaptics") {
            hapticsMap = [
                "light": light,
                "medium": medium,
                "heavy": heavy,
                "selection": selection,
                "success": success,
                "error": error,
                "warning": warning
            ]
        } else {
            return
        }

        guard let type = message.body as? String else { return }
        hapticsMap[type]?()
    }

    func inject(_ controller: WKUserContentController) {
        controller.add(self, name: "prepareHaptics")
        controller.add(self, name: "playHaptics")
    }
}
