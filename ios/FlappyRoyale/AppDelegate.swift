import UIKit
import Firebase
import UserNotifications

@UIApplicationMain

class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?


    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        FirebaseApp.configure()

        registerForPushNotifs()

        let notificationOption = launchOptions?[.remoteNotification]
        if let notification = notificationOption as? [String: AnyObject],
            let aps = notification["aps"] as? [String: AnyObject] {

            // Launched via push notif!
            (window?.rootViewController as? ViewController)?.pushNotifs.receivedNotification(aps)
        }

        return true
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler:
        @escaping (UIBackgroundFetchResult) -> Void
        ) {
        guard let aps = userInfo["aps"] as? [String: AnyObject] else {
            completionHandler(.failed)
            return
        }
        (window?.rootViewController as? ViewController)?.pushNotifs.openedAppViaNotification(aps)
    }

    func registerForPushNotifs() {
            UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge]) {
                    [weak self] granted, error in

                    print("Permission granted: \(granted)")
                    guard granted else { return }

                    self?.getNotificationSettings()
        }
    }

    func getNotificationSettings() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            print("Notification settings: \(settings)")
            guard settings.authorizationStatus == .authorized else { return }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
        ) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()

        print("Device Token: \(token)")

        guard let vc = window?.rootViewController as? ViewController else { return }
        vc.pushNotifs.token = token
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register: \(error)")
    }

}

