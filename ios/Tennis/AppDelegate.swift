import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import FirebaseCore
import FBSDKCoreKit
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // Google Maps
    GMSServices.provideAPIKey("AIzaSyCzFAQMTJeY2LjTmF5AuGyczMc6mh9Zs6U")

    // Firebase
    FirebaseApp.configure()

    // Facebook SDK
    ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Tennis Robin",
      in: window,
      launchOptions: launchOptions
    )

    // Bootsplash
    RNBootSplash.initWithStoryboard("LaunchScreen", rootView: window?.rootViewController?.view)

    return true
  }

  // Deep Linking (URL Schemes)
  func application(_ app: UIApplication, open url: URL,
                   options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    if ApplicationDelegate.shared.application(app, open: url, options: options) {
      return true
    }

    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  func application(_ application: UIApplication,
                   continue userActivity: NSUserActivity,
                   restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
