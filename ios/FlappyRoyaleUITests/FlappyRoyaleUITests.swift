//
//  FlappyRoyaleUITests.swift
//  FlappyRoyaleUITests
//
//  Created by Em Lazer-Walker on 19.06.19.
//  Copyright © 2019 Mike Lazer-Walker. All rights reserved.
//

import XCTest

func takeSnapshot(name: String) {
    let app = XCUIApplication()
    setupSnapshot(app)

    app.launchArguments += ["SNAPSHOT"]
    app.launchEnvironment["pageToGo"] = name

    app.launch()

    // Our snapshot helpers in JS automatically add this string to the DOM when content is ready to snapshot
    _ = app.webViews.staticTexts["snapshotReady"].waitForExistence(timeout: 5)

    snapshot(name)
}

class FlappyRoyaleUITests: XCTestCase {

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testMainMenu() {
        takeSnapshot(name: "0MainMenu")
    }

    func testRoyaleLobby() {
        takeSnapshot(name: "1RoyaleLobby")
    }

    func testAttire() {
        takeSnapshot(name: "2Attire")
    }

//    func testGame() {
//        takeSnapshot(name: "3Game")
//    }
//
//    func testTrialResults() {
//        takeSnapshot(name: "4TrialResults")
//    }
}
