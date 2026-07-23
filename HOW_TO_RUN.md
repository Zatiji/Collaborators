# How to Run & Build (iOS)

Two different things, don't confuse them:

- **Running** = starting Metro and loading JS into an already-installed app. Do this constantly while coding. Fast, no Apple involvement.
- **Building** = compiling native code into a new app binary and installing it on the phone. Only needed when *native* dependencies change (new package with native code, native config changes in `app.config.js`, etc).

You have Xcode + a paid Apple Developer account + your iPhone connected via USB — that's the easiest setup. Use it for building instead of EAS cloud builds whenever possible.

---

## Day-to-day: running your code (do this every time you code)

```
npx expo start --dev-client
```

Starts the Metro bundler. Then open the **Collaborators** dev-client app already installed on your phone — it'll auto-connect (same Wi-Fi network) or scan the QR code shown in the terminal.

No rebuild, no Apple login, nothing — just edit code and it hot-reloads.

If auto-discovery doesn't find your Mac (flaky Wi-Fi, VPN, etc):

```
npx expo start --dev-client --tunnel
```

Routes the connection through an internet tunnel instead of local Wi-Fi. Slower, but works almost anywhere.

---

## Building locally via cable (your setup — recommended)

Only needed when native code changes (e.g. you added `expo-linking`, `expo-router`, or any package with native modules).

```
npx expo run:ios --device
```

What it does:
1. Generates the native `ios/` Xcode project from your Expo config (`expo prebuild`, runs automatically).
2. Builds the app natively using Xcode.
3. Installs it directly on your connected iPhone over USB.

First run: Xcode will ask you to pick your team (`David Mosquera (Individual)`) for code signing — select it once. Xcode then creates/manages the provisioning profile itself, using your Apple Developer account already signed into Xcode. No cloud step, no export-compliance question (that's an App Store/EAS-specific prompt, not part of local Xcode builds).

Requirements:
- Xcode installed (you have 26.4.1).
- iPhone connected via USB and already trusted ("Trust This Computer?" accepted once).
- Signed into your Apple ID inside Xcode (Xcode → Settings → Accounts).

After installing once, go back to `npx expo start --dev-client` for regular coding — you only re-run `expo run:ios --device` when native code changes again.

---

## Building wirelessly / in the cloud (EAS) — alternative, not required with your setup

Use this if you're not near the Mac+phone combo, want to share a build with someone else, or want a build that doesn't need your Mac plugged in at all.

```
eas build --profile development --platform ios
```

What it does:
1. Uploads your project to Expo's cloud build servers.
2. Builds the native app remotely (using your stored Apple Distribution Certificate + provisioning profile on your EAS account).
3. Gives you a link/QR code to install the resulting `.ipa` on your phone directly (no cable, no Mac needed at install time).

This is slower (queue + cloud build time, several minutes) and is what triggered the Apple login / export-compliance prompts you saw before — those only happen on this cloud path, not on `expo run:ios --device`.

To rebuild/reinstall an existing dev-client build without cable:
1. Run the `eas build` command above.
2. Open the link EAS gives you on your iPhone (Safari) and install — replaces the existing dev-client app.
3. Then go back to `npx expo start --dev-client` (with or without `--tunnel`) for regular coding.

---

## Quick reference

| Task | Command |
|---|---|
| Code daily (JS/TS changes only) | `npx expo start --dev-client` |
| Code daily, flaky/no shared Wi-Fi | `npx expo start --dev-client --tunnel` |
| Native code changed, phone on cable | `npx expo run:ios --device` |
| Native code changed, no cable / cloud build | `eas build --profile development --platform ios` |
