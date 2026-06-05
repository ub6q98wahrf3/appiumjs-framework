# Android App Binary

This folder is where the **APK under test** lives.

The framework targets the **Sauce Labs Sample Mobile App** (open-source).

## Download

```bash
curl -L -o Android.SauceLabs.Mobile.Sample.app.2.7.1.apk \
  https://github.com/saucelabs/sample-app-mobile/releases/download/2.7.1/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk
```

Or grab the latest release from:
👉 https://github.com/saucelabs/sample-app-mobile/releases

## Why this app?

- Open-source, public — no auth needed
- Has a **native login screen** (matches the requirement)
- Same accessibility IDs across Android and iOS — clean cross-platform tests
- Active community examples — easy to debug

## Default credentials (visible in the app)

| User       | Username           | Password   |
|------------|--------------------|------------|
| Standard   | `bob@example.com`  | `10203040` |
| Locked     | `alice@example.com`| `10203040` |

## Custom app

Point `APP_PATH` env var to any other `.apk` and the framework will use it:

```bash
APP_PATH=/full/path/to/your.apk npm run test:android
```

Just remember to update `ANDROID_APP_PACKAGE` and `ANDROID_APP_ACTIVITY` to match.
