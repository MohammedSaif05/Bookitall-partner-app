# Production Deployment Checklist

## Pre-Deployment

### ✅ New Architecture Configuration
- [x] Android: `newArchEnabled=true` in `gradle.properties`
- [x] Android: MainActivity uses `fabricEnabled`
- [x] Android: MainApplication uses `ReactHost` pattern
- [x] iOS: AppDelegate uses `RCTReactNativeFactory`
- [x] iOS: Podfile configured with `use_react_native!`
- [x] Hermes enabled on both platforms

### ✅ Code Quality
- [x] Error Boundaries implemented
- [x] TypeScript strict mode enabled
- [x] ESLint configured with production rules
- [x] Path aliases configured for clean imports
- [x] Test coverage thresholds set (70%)

### ✅ Build Configuration
- [x] Production build scripts added
- [x] Android build optimizations configured
- [x] iOS build configuration verified
- [x] Clean scripts for both platforms

## Before Production Release

### Android
- [ ] Generate production keystore (replace debug keystore)
- [ ] Update `android/app/build.gradle` signing config for release
- [ ] Enable ProGuard if needed (`enableProguardInReleaseBuilds = true`)
- [ ] Test release build: `npm run android:release`
- [ ] Generate signed APK/AAB
- [ ] Test on multiple Android versions (API 24+)

### iOS
- [ ] Configure proper code signing in Xcode
- [ ] Set up App Store Connect certificates
- [ ] Test release build: `npm run ios:release`
- [ ] Archive and validate build in Xcode
- [ ] Test on multiple iOS versions (minimum supported version)

### General
- [ ] Update app version in `package.json` and native configs
- [ ] Update app name and bundle ID if needed
- [ ] Configure environment variables for production
- [ ] Set up error monitoring (Sentry, Crashlytics, etc.)
- [ ] Set up analytics (if needed)
- [ ] Review and update `Info.plist` permissions
- [ ] Review and update `AndroidManifest.xml` permissions
- [ ] Test on physical devices (not just simulators/emulators)
- [ ] Performance testing
- [ ] Security audit
- [ ] Privacy policy and terms of service (if required)

### Dependencies
- [ ] Verify all dependencies are production-ready
- [ ] Check for known vulnerabilities: `npm audit`
- [ ] Update dependencies to latest stable versions
- [ ] Verify New Architecture compatibility of all libraries

### Testing
- [ ] All tests passing: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Manual testing on both platforms
- [ ] Test error scenarios
- [ ] Test offline scenarios
- [ ] Test on slow networks

### Documentation
- [ ] README.md updated
- [ ] NEW_ARCHITECTURE.md reviewed
- [ ] API documentation (if applicable)
- [ ] Deployment guide for team

## Post-Deployment

- [ ] Monitor error rates
- [ ] Monitor app performance
- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Plan for hotfixes if needed

---

**Note**: This checklist should be reviewed and updated before each production release.

