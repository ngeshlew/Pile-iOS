# Pile Mobile (Ionic React + Capacitor)

This is the mobile wrapper for Pile, built with Ionic React and Capacitor to target iOS (and Android).

## Prerequisites
- Node 18+
- iOS builds require macOS + Xcode

## Scripts
- `npm start`: Run dev server at http://localhost:5173
- `npm run build`: Build production bundle to `dist/`
- `npm run cap:init`: Initialize Capacitor project metadata
- `npm run cap:add:ios`: Add iOS platform (run on macOS)
- `npm run cap:sync`: Sync web assets and native project
- `npm run ios:build`: Build web and sync iOS
- `npm run ios:open`: Open iOS project in Xcode

## Configure Capacitor
Edit `capacitor.config.ts` to adjust app id/name and plugin options.

## Next Steps
1. On macOS, run `npm run cap:init` then `npm run cap:add:ios`.
2. `npm run ios:build` and `npm run ios:open` to open Xcode.
3. Configure signing and run on a simulator/device.