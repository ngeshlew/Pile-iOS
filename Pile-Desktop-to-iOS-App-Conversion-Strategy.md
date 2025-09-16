## Pile Desktop to iOS App Conversion — Strategic Analysis

### Executive Summary
Pile can reach iOS in 4–6 weeks by wrapping the existing React app with Capacitor and an Ionic UI layer. This path preserves 80–90% of the web/desktop code, minimizes rework, and enables a progressively native roadmap (gestures, haptics, biometrics, share sheet, widgets) after launch. We recommend the Capacitor + Ionic approach for fastest time-to-market and lowest delivery risk.

### Goals and Success Criteria
- **Time-to-MVP**: 4–6 weeks to TestFlight, ≤ 2 weeks to App Store after beta.
- **Performance**: < 2s cold launch on modern iPhones; 60 fps scrolling; smooth navigation.
- **Size**: < 50 MB IPA for over-the-air installs without friction.
- **Quality**: P0 features parity with desktop, robust offline, crash-free sessions ≥ 99.7%.
- **Security**: Secure API key storage (Keychain), network TLS, least-privilege permissions.

### Approaches Evaluated

1) React Native
- **Pros**: Native UI performance; large ecosystem; good long-term maintainability.
- **Cons**: Requires substantial rewrite of UI/navigation; native modules for advanced features; more complex build and upgrade path.
- **Timeline**: 3–6 months for MVP parity given desktop-first React codebase.
- **Reuse**: 40–60% (business logic, models, some hooks), but UI is mostly reimplemented.

2) Native Swift/SwiftUI
- **Pros**: Best-in-class iOS performance and fidelity; full native capabilities from day one.
- **Cons**: Full rewrite; iOS-only code; reduced shared code with web/desktop.
- **Timeline**: 4–8+ months for MVP parity for a small team.
- **Reuse**: 20–40% (algorithms and services only), UI and navigation are rebuilt.

3) Capacitor + Ionic (Recommended)
- **Pros**: Fastest path; keeps React investment; access to native APIs; excellent iOS polish via Ionic components; incremental native enhancements possible.
- **Cons**: WebView constraints for ultra-high-performance custom graphics; may need targeted native plugins later.
- **Timeline**: 4–6 weeks to TestFlight MVP; 1–2 months conservative.
- **Reuse**: 80–90% of existing React/logic/state; incremental swap-in of Ionic components as needed.

### Why Capacitor + Ionic
- **Speed**: Minimal refactor—wrap current React routes with Ionic navigation; keep store/services.
- **Quality**: Ionic provides iOS-native look/feel (segmented controls, headers, tabs) out of the box.
- **Flexibility**: Direct access to native APIs when needed (Files, Haptics, Share, Biometrics, Widgets via extensions).
- **Future-proof**: If performance constraints emerge, selectively replace screens with native or React Native modules.

### Architecture Overview
- **Web Layer**: Existing React app (components, hooks, Zustand store, services).
- **Mobile Shell**: Ionic React for navigation and iOS styling; Capacitor runtime.
- **Bridges**: Capacitor plugins for Filesystem, Preferences/Keychain, Haptics, Share, Keyboard, App lifecycle, Device.
- **iOS Containers**: Xcode project managed by Capacitor; optional app extensions (Share Extension, Widgets) in phase 2.

### iOS-First Optimizations
- **Gestures/Haptics**: Use Ionic gestures + Capacitor Haptics for tactile interactions.
- **Biometrics**: Gate sensitive views with Face ID/Touch ID via Keychain + biometric auth.
- **Layouts**: Responsive breakpoints for iPhone/iPad; respect safe areas; adapt split views on iPad.
- **Share Sheet**: Implement native share sheet and receiving via Share Extension (phase 2).
- **Offline**: Filesystem-based cache for user data and assets; network-aware sync.
- **Spotlight & Shortcuts (roadmap)**: Index entries for Spotlight; add Siri Shortcuts for quick capture.
- **Handoff (roadmap)**: Enable continuity across devices where feasible.

### Critical Success Factors
- **App Size < 50 MB**: Tree-shake, code-split, compress assets, avoid heavy native libs.
- **< 2s Launch**: Defer heavy initialization; lazy-load routes; warm caches.
- **60 fps**: Virtualize large lists; avoid expensive reflows; leverage Ionic components.
- **Offline Mode**: Filesystem-backed storage adapter mirroring Electron semantics.
- **Secure Secrets**: Store API keys in Keychain; never bundle production keys in app binary.

### Risks and Mitigations
- **WebView Performance Hotspots**: Profile and replace specific views with native plugins or lighter components; leverage CSS containment and virtualization.
- **Plugin Gaps**: Use community plugins short-term; plan native plugin development if needed.
- **Review/Policy**: Adhere to App Store guidelines; avoid hidden features; provide clear privacy disclosures.
- **Team Skills**: Provide Ionic/Capacitor onboarding; pair on Xcode and signing setup.
- **Fallback**: Maintain functional PWA path as contingency if native store approval is delayed.

### Delivery Plan and Timeline (MVP in 4–6 weeks)
Week 1
- Project skeleton with Capacitor + Ionic
- Route mapping from desktop React
- Basic Capacitor config and iOS build opens in Xcode

Week 2
- Storage adapter replacing Electron fs APIs via Capacitor Filesystem
- Replace navigation with Ionic `IonReactRouter`
- Add Haptics, Keyboard handling, StatusBar tuning

Week 3
- Biometrics + Keychain for API key
- Offline caching strategy; background sync
- iOS-specific styling and safe area polish

Week 4
- QA pass on core flows; performance tuning; crash reporting
- Build and sign for TestFlight; internal beta

Weeks 5–6 (buffer)
- Address beta feedback, App Store review prep, marketing assets
- Optional: Share Extension or Widgets if time permits

### Resource & Cost Estimate
- **Team**: 1–2 React engineers, 1 part-time iOS engineer, 1 QA.
- **Effort**: ~3–5 engineer-weeks for MVP if codebase is clean; 1–2 weeks QA.
- **Tools**: Apple Developer Program, optional Fastlane CI, monitoring (Sentry), device lab.

### Go/No-Go Criteria for Launch
- Crash-free rate ≥ 99.7% over 1,000 sessions.
- All P0 use cases validated on iPhone 11–15 and iPad baseline.
- App Store compliance review checklist complete (privacy, data storage, content).
- Performance KPIs met (< 2s launch, 60 fps scroll, smooth modals).

### Roadmap After MVP
- Share Extension for quick capture.
- Home Screen Widgets for pinned items.
- Rich notifications with actions.
- Native modules for any identified performance hotspots.
- Siri Shortcuts for voice journaling and quick actions.
- Spotlight indexing for entries and quick search.
- Handoff support between iPhone and iPad.
- iCloud or cloud sync option (future exploration) if product requires.

### Recommendation
Proceed with Capacitor + Ionic to validate iOS market quickly while preserving React code. Use progressive enhancement to add native features post-launch; reassess deeper native investment only if profiling uncovers systemic WebView limits on priority screens.
