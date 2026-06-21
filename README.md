# 📱 Appium Mobile Automation Framework

A production-grade mobile automation framework built on **WebdriverIO + Appium** for **native** Android and iOS apps.

> Designed to be readable by every QA engineer on the team.

---

## 📑 Table of Contents

1. [Quick Start](#-quick-start)
2. [Folder Structure](#-folder-structure)
3. [How OOP is Used](#-how-oop-is-used)
4. [Writing a New Test (5-minute guide)](#-writing-a-new-test-5-minute-guide)
5. [Running Tests](#-running-tests)
6. [Reports](#-reports)
7. [Mobile-specific Concerns](#-mobile-specific-concerns)
8. [CI/CD](#-cicd)
9. [Troubleshooting](#-troubleshooting)
10. [FAQ](#-faq)

---

## 🚀 Quick Start

### Prerequisites (one-time setup)

| Requirement     | Why                                            |
|-----------------|------------------------------------------------|
| Node.js ≥ 20    | Runtime for WDIO                               |
| Java JDK 17     | Required by Appium / Android SDK               |
| Android Studio  | Android SDK + emulator + ADB                   |
| Xcode (mac)     | iOS simulator + XCUITest                        |
| Appium 2.x      | Installed via `npm install` from this project  |

> 💡 Run `npm run appium:doctor:android` after install — it catches 90% of environment issues.

### Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd appium-mobile-framework
npm install

# 2. Install Appium drivers (one-time)
npm run appium:install

# 3. Download the sample APK (puts it under apps/android/)
mkdir -p apps/android
curl -L -o apps/android/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk \
  https://github.com/saucelabs/sample-app-mobile/releases/download/2.7.1/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk

# 4. Set up env
cp .env.example .env

# 5. Boot an Android emulator (e.g. from Android Studio AVD Manager)
#    OR connect a real device with USB debugging on:
adb devices       # confirm it shows up

# 6. Run the tests
npm run test:android
```

That's it. The Appium server is auto-started by the WDIO Appium service.

---

## 🗂 Folder Structure

```
appium-mobile-framework/
├── apps/                            # APP BINARIES (gitignored)
│   ├── android/                     # .apk goes here
│   └── ios/                         # .app bundle goes here
│
├── config/                          # WDIO configs - one per run mode
│   ├── wdio.base.conf.js            # Shared settings (DRY foundation)
│   ├── wdio.android.conf.js         # Local Android run
│   ├── wdio.ios.conf.js             # Local iOS run
│   ├── wdio.ci.android.conf.js      # CI Android (retries, longer timeouts)
│   ├── wdio.ci.ios.conf.js          # CI iOS
│   ├── dev.env.json                 # Dev-environment data
│   ├── staging.env.json             # Staging-environment data
│   └── prod.env.json                # Prod-environment data
│
├── test/
│   ├── pages/                       # PAGE OBJECT MODEL
│   │   ├── base.page.js             # Abstract parent class (OOP foundation)
│   │   ├── login.page.js            # extends BasePage
│   │   ├── home.page.js             # extends BasePage + composes a component
│   │   └── components/
│   │       └── menu.component.js    # Reusable UI fragment (side menu)
│   │
│   ├── specs/                       # ACTUAL TESTS (the "what")
│   │   ├── login.spec.js
│   │   └── login-negative.spec.js
│   │
│   ├── data/                        # TEST DATA (decoupled from code)
│   │   └── testdata.js
│   │
│   ├── utils/                       # UTILITIES
│   │   ├── logger.js                # winston-based structured logger
│   │   ├── platform.js              # Android-vs-iOS selector helper
│   │   └── gestures.js              # Swipe / scroll / hide-keyboard
│   │
│   └── hooks/                       # (placeholder for custom hooks)
│
├── .github/workflows/ci.yml         # GitHub Actions pipeline
├── Dockerfile                       # Containerized run (Android emulator)
├── eslint.config.js                 # ESLint v9 flat config
├── .prettierrc                      # Prettier config
├── .env.example                     # Environment variable template
├── reports/                         # Generated: allure, junit (gitignored)
├── screenshots/                     # Generated: failure screenshots (gitignored)
├── logs/                            # Generated: structured run logs (gitignored)
└── package.json
```

---

## 🧱 How OOP is Used

Every page extends a single abstract `BasePage`. Here's how each pillar shows up:

| OOP Concept       | Where to look                       | What it does |
|-------------------|-------------------------------------|--------------|
| **Abstraction**   | `base.page.js` methods              | Specs call `loginPage.loginAs(...)` without seeing waitFor, hideKeyboard, retries, etc. |
| **Encapsulation** | `#pageName` in BasePage             | Internal state is truly private (JS `#` syntax). Selectors are getters — cannot be reassigned by specs. |
| **Inheritance**   | `LoginPage` and `HomePage`          | Both `extends BasePage` and reuse 100+ lines of helper methods for free. |
| **Polymorphism**  | `isLoaded()` override per page      | Each page defines its own "loaded" check. `loginAs()` itself is polymorphic — accepts an object OR two strings. |

**Bonus:** `HomePage` *composes* a `MenuComponent` — composition over inheritance for shared UI fragments (a side menu visible on Products, Cart, Profile, etc.).

---

## ✍️ Writing a New Test (5-minute guide)

### Step 1 — Create the page object

```js
// test/pages/cart.page.js
import BasePage from './base.page.js';

class CartPage extends BasePage {
    constructor() { super('CartPage'); }

    get cartTitle()   { return $('~test-Cart Content'); }
    get checkoutBtn() { return $('~test-CHECKOUT'); }

    async isLoaded() {
        await this.cartTitle.waitForDisplayed({ timeout: 15000 });
    }

    async tapCheckout() {
        await this.tap(this.checkoutBtn, 'Checkout button');
    }
}

export default new CartPage();
```

You did NOT write a single `waitFor`, `try/catch`, or `console.log`. They're all inherited.

### Step 2 — Write the spec

```js
// test/specs/cart.spec.js
import { expect } from 'chai';
import LoginPage from '../pages/login.page.js';
import HomePage from '../pages/home.page.js';
import CartPage from '../pages/cart.page.js';
import { users } from '../data/testdata.js';

describe('Cart', () => {
    it('@smoke navigates to checkout', async () => {
        await LoginPage.loginAs(users.valid);
        await HomePage.waitForPageLoad();

        // ... add a product (left as exercise) ...

        await HomePage.menu.open(); // composed component
        // tap cart icon, etc.

        await CartPage.waitForPageLoad();
        await CartPage.tapCheckout();
    });
});
```

### Step 3 — Run it

```bash
npm run test:android -- --spec ./test/specs/cart.spec.js
```

---

## 🏃 Running Tests

| Command                            | What it does                              |
|------------------------------------|-------------------------------------------|
| `npm run test:android`             | Run all specs on Android (local emulator) |
| `npm run test:ios`                 | Run all specs on iOS (macOS only)         |
| `npm run test:smoke:android`       | Only `@smoke`-tagged tests on Android     |
| `npm run test:regression:android`  | Only `@regression`-tagged tests           |
| `npm run test:login:android`       | Just `login.spec.js`                      |
| `npm run test:ci:android`          | CI mode (retries enabled, longer timeouts)|
| `npm run report`                   | Generate + open Allure HTML report        |
| `npm run lint:fix`                 | Auto-fix lint issues                      |
| `npm run format`                   | Prettier-format the codebase              |
| `npm run clean`                    | Wipe reports / screenshots / logs         |

### Override settings via env vars

```bash
TEST_ENV=prod \
ANDROID_DEVICE_NAME=Pixel_5_API_33 \
LOG_LEVEL=debug \
npm run test:android
```

---

## 📊 Reports

Three reporters run in parallel:

| Reporter | Path                  | Use it for…                              |
|----------|-----------------------|------------------------------------------|
| **Spec**   | terminal              | Quick feedback while developing          |
| **Allure** | `reports/allure-*`    | Rich HTML reports w/ steps + screenshots |
| **JUnit**  | `reports/junit/*.xml` | Jenkins / Azure DevOps / GitLab CI       |

To view Allure locally:

```bash
npm run report
```

Allure shows: every step (`Tap on Login button`, `Type "****" into Password field`), execution time, the device/platform, and failure screenshots auto-attached.

---

## 📱 Mobile-specific Concerns

This is what makes mobile automation different from web — and how this framework handles it:

| Concern                       | How we handle it                                                                 |
|-------------------------------|----------------------------------------------------------------------------------|
| **Slow launch**               | All timeouts bumped (15s element, 2-3 min test, 60s+ Appium server install).      |
| **Soft keyboard covering UI** | `hideKeyboard()` called before tapping submit-style buttons.                      |
| **Animation flakiness**       | `disableWindowAnimation: true` on Android caps; iOS auto-disables in CI.          |
| **Cross-platform selectors**  | `selectFor({ android, ios })` helper in `utils/platform.js`.                      |
| **Gestures**                  | `swipeUp`, `swipeDown`, `scrollUntilVisible` in `utils/gestures.js`.              |
| **Stale sessions**            | `newCommandTimeout: 240` keeps Appium alive between actions.                      |
| **App state between tests**   | `noReset: false` (fresh launch) but `fullReset: false` (no reinstall) — fast + clean. |
| **Permissions popups**        | `autoGrantPermissions: true` on Android.                                          |
| **Real device parallel**      | `MAX_INSTANCES` matches connected device count (set per CI runner).               |

### Flakiness controls

- **Per-test retries** in CI configs (`retries: 1`)
- **Auto-screenshot on failure** attached to Allure
- **`waitForDisplayed` + `waitForEnabled`** before every tap
- **Structured logs** to `logs/test-run.log` for forensic post-mortems
- **Keyboard handling** before form submits

---

## 🔄 CI/CD

`.github/workflows/ci.yml` runs on:

- every push to `main` / `develop`
- every PR
- nightly cron at 02:00 UTC
- manual trigger with environment + platform inputs

It does:

1. Boots a KVM-accelerated Android emulator on Ubuntu (free, fast)
2. Caches the AVD between runs (saves ~5 min)
3. Downloads the sample APK
4. Runs `npm run test:ci:android`
5. Uploads Allure raw results, screenshots, logs, JUnit XML as artifacts
6. Generates and **publishes the Allure HTML report to GitHub Pages**
7. Optional macOS job for iOS — manual trigger only (macOS runners cost ~10× Linux)

For **Jenkins** users: the same `npm run test:ci:android` works inside any pipeline. Just make sure the agent has Java + Android SDK + an emulator booted.

---

## 🛠 Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Could not find a connected Android device` | No emulator booted, or `adb devices` empty | `emulator -avd Pixel_5_API_33 &` and wait |
| `Failed to create session ... ANDROID_HOME not set` | Env var missing | `export ANDROID_HOME=$HOME/Library/Android/sdk` (mac) |
| Tests pass locally, flake in CI | Slow CI runner, animations enabled | Bump `wdaLaunchTimeout`, ensure `disable-animations` flag set |
| Login button can't be tapped | Keyboard covering it | `await hideKeyboard()` before the tap (already done in `LoginPage.loginAs`) |
| `instrumentation backend not started` | UiAutomator2 server install timed out | Increase `appium:uiautomator2ServerInstallTimeout` |
| iOS: `WebDriverAgent failed to start` | Outdated Xcode / wrong simulator | `xcrun simctl list devices`, pin a simulator name in `.env` |

---

## ❓ FAQ

**Q: Why WebdriverIO + Appium and not just plain Appium?**
WDIO gives us auto-waiting, a clean assertion-friendly API, a consistent Page Object model, the Allure reporter, parallel runner, and a service that auto-manages the Appium server.

**Q: Native vs hybrid?**
This framework targets **native** apps only (the requirement). For hybrid/WebView, you'd add `setContext('WEBVIEW_*')` in pages that need it — easy to extend.

**Q: Real devices vs emulators?**
Both work — point `appium:deviceName` at the right device. For real devices in CI, use Sauce Labs, BrowserStack, or AWS Device Farm — set `services` to use their config and remove the local `appium` service.

**Q: Why JavaScript and not Java/Python?**
JS is first-class in the WDIO + Appium ecosystem, shares tooling (ESLint, Prettier, Mocha, Allure) with the rest of the Node.js world, and needs no compilation step.

**Q: How do I test biometrics / push notifications / deep links?**
Add a `utils/native-features.js` helper that wraps `browser.execute('mobile: ...')` Appium-specific commands. Pages call into it.

---

## License

MIT
