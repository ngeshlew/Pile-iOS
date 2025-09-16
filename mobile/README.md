# Pile Mobile (React Native / Expo)

This is the iOS/Android mobile app for Pile, migrated from the Electron/React desktop app.

## Quick start

```bash
cd mobile
npm install
npm run start
```

- iOS: use "i" in Expo CLI to run in Simulator (requires Xcode), or `npm run ios`.
- Add your OpenAI API key in Settings.

## Features
- Offline-first journaling with local storage (AsyncStorage)
- Secure API key storage (Expo SecureStore)
- AI reflections via OpenAI Chat Completions
- Export/Import JSON backups
- Basic tests with jest-expo

## Build
- EAS config included (`eas.json`).
- Login to Expo and run `npm run eas:build:ios`.

## Notes
- Desktop-specific features (Electron fs, multi-window) are replaced with mobile-friendly equivalents.
- Data format: simple JSON store with export/import path to enable migration.