# Release Signing — Play upload key

> Gradle wiring is **done and verified** (`android/app/build.gradle`). What's
> left is generating the keystore, which only you can do — it's a credential.
> Unblocks [TODO](./TODO.md) #12, and #12 unblocks #31 (App Links).

## Why the keystore never enters this repo

A committed upload key hands anyone who clones the repo the ability to ship an
update **as you**. Unlike a leaked API key it **cannot be rotated for
already-installed users** — Play identifies your app by that key. `*.jks` and
`keystore.properties` are gitignored; keep the only copies in a password
manager and an offline backup. Losing it means a support ticket with Google,
or in the worst case a new listing.

## 1. Generate the upload key (once)

```bash
cd android
keytool -genkeypair -v \
  -keystore sanctuary-upload-key.jks \
  -alias sanctuary-upload \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=The Sanctuary, O=<your legal entity>, L=<city>, C=DE"
```

`-validity 10000` (~27 years) is deliberate: Play requires a key valid well
past any plausible update. It will prompt for a store password and a key
password — use different, generated values.

## 2. Point Gradle at it

```bash
cp keystore.properties.example keystore.properties
```

Fill in the four values. `storeFile` resolves relative to `android/`.
Both files are gitignored — verify with `git status` before committing anything.

## 3. Build

```bash
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease     # → app/build/outputs/bundle/release/app-release.aab
```

Upload the **`.aab`** to Play (not the APK). If `keystore.properties` is
missing, the build still succeeds but logs a warning and the artifact is
**unsigned** — Play rejects those with an unhelpful error, so heed the warning.

**Verify before uploading:**
```bash
jarsigner -verify -verbose:summary app/build/outputs/bundle/release/app-release.aab   # → "jar verified."
```

## 4. Version discipline

`versionCode` must increase on **every** upload — Play rejects duplicates, and
this is the single most common release-day stumble. `versionName` is the human
string.

```gradle
// android/app/build.gradle → defaultConfig
versionCode 1        // bump every upload: 1, 2, 3…
versionName "1.0"    // user-facing
```

## 5. Play App Signing (and the App Links dependency)

Play re-signs your app for delivery with a key Google holds; yours is the
**upload** key. After the first upload, Play Console shows the **app signing
certificate SHA-256** under *Release → Setup → App signing*.

⚠️ **That fingerprint — not your upload key's — is what
`/.well-known/assetlinks.json` must contain** for Android App Links (TODO #31,
which closes the password-reset deep-link hijack in
[security-audit.md](./security-audit.md) §21). Using the upload key's
fingerprint is a common and confusing failure.

## What's verified vs. what isn't

**Verified** (built with a throwaway keystore, then deleted):
- A signed **AAB** is produced and `jarsigner` reports *"jar verified."*
- The release **APK** signs with both v1 and v2 schemes.
- The release build is **not debuggable** — this matters beyond hygiene:
  Capacitor derives `webContentsDebuggingEnabled` *and* `loggingEnabled` from
  that flag, so a debuggable release would ship an inspectable WebView
  (localStorage holds the Supabase session) and plugin payloads in logcat.
- Builds still work with **no** `keystore.properties` present, so a fresh
  clone isn't broken.

**Not verified:** that a release build *runs correctly on a device*. It has
never been installed — only debug builds have. Worth one on-device smoke test
of the signed build before it goes to a Play track, since release-only
behaviour (no debug logging, different WebView flags) can differ.

## Deliberately not enabled: R8 / minification

`minifyEnabled` is left `false`. R8 needs keep rules for Capacitor's
reflection-based plugin registration, and enabling it blind produces failures
that appear **only in release** — the worst place to find them. If you want the
size win later, enable it as its own change with an on-device pass, not
bundled into the launch.
