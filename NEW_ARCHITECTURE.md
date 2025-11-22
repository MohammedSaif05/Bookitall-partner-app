# React Native New Architecture - Production Setup Guide

## Overview

This project is fully configured with React Native's **New Architecture** (Fabric + TurboModules), which provides:
- **Better Performance**: Improved rendering with Fabric
- **Type Safety**: Strongly typed native modules with Codegen
- **Concurrent Features**: Support for React 18+ concurrent features
- **Future-Proof**: The architecture that React Native is moving towards

## ✅ Configuration Status

### Android Configuration

**Location**: `android/gradle.properties`

```properties
newArchEnabled=true
hermesEnabled=true
```

**Key Files**:
- `android/app/src/main/java/com/bookitallpartner/MainActivity.kt` - Uses `fabricEnabled` flag
- `android/app/src/main/java/com/bookitallpartner/MainApplication.kt` - Uses new `ReactHost` pattern
- `android/app/build.gradle` - Configured for New Architecture with production optimizations

### iOS Configuration

**Key Files**:
- `ios/Bookitallpartner/AppDelegate.swift` - Uses `RCTReactNativeFactory` (New Architecture pattern)
- `ios/Podfile` - Uses `use_react_native!` which automatically enables New Architecture
- `react_native_post_install` hook is configured

The iOS New Architecture is automatically enabled through the Podfile configuration. No additional flags needed.

## 📦 Dependencies Compatibility

All current dependencies are New Architecture compatible:

- ✅ `react-native-safe-area-context@^5.6.2` - Fully compatible
- ✅ `react-native-screens@^4.18.0` - Fully compatible (with C++ linking fix)
- ✅ `@react-navigation/native@^7.1.21` - Fully compatible
- ✅ `@react-navigation/native-stack@^7.7.0` - Fully compatible
- ✅ `react-native-svg@^15.15.0` - Fully compatible
- ✅ `react-native-bootsplash@^6.3.11` - Fully compatible
- ✅ `react@19.1.1` - Compatible with New Architecture
- ✅ `react-native@0.82.1` - Latest version with full New Architecture support

### Adding New Dependencies

When adding new React Native libraries, verify they support New Architecture:
1. Check the library's documentation
2. Look for "Fabric" or "New Architecture" support
3. Libraries without support may still work but won't benefit from New Architecture features

## 🏗️ Project Structure

```
Bookitallpartner/
├── src/
│   ├── assets/                   # Images, fonts, etc.
│   │   ├── webp/                 # WebP images
│   │   └── svg/                   # SVG assets
│   ├── components/               # Reusable components
│   │   ├── auth/                 # Auth-related components
│   │   │   ├── DotIndicator.tsx  # Pagination dots
│   │   │   └── PrimaryButton.tsx  # Primary button component
│   │   ├── ErrorBoundary.tsx      # Production error handling
│   │   └── SplashScreen.tsx       # Splash screen component
│   ├── navigation/               # Navigation configuration
│   │   ├── types.ts              # Navigation type definitions
│   │   ├── RootNavigator.tsx     # Root navigation container
│   │   ├── AuthNavigator.tsx     # Auth flow navigator
│   │   └── index.ts              # Barrel exports
│   ├── screens/                  # Screen components
│   │   └── auth/                 # Authentication screens
│   │       ├── GettingStarted.tsx
│   │       └── index.ts
│   ├── theme/                    # Theme configuration
│   │   ├── colors.ts             # Color palette
│   │   ├── fonts.ts              # Typography configuration
│   │   └── scaling.ts            # Responsive scaling utilities
│   ├── utils/                    # Utility functions
│   │   └── constants.ts          # App constants
│   └── types/                    # TypeScript type definitions
│       └── index.ts
├── android/                      # Android native code
│   ├── app/
│   │   └── build.gradle          # App build config (with C++ fix)
│   └── build.gradle              # Root build config (with C++ fix)
├── ios/                          # iOS native code
└── App.tsx                       # Root component with ErrorBoundary
```

## 🚀 Production Builds

### Android

**Debug Build**:
```bash
npm run android
```

**Release Build**:
```bash
npm run android:release
```

**Generate Release Bundle**:
```bash
npm run build:android:bundle
```

**Build APK** (from Android Studio or command line):
```bash
cd android
./gradlew assembleRelease
```

### iOS

**Debug Build**:
```bash
npm run ios
```

**Release Build**:
```bash
npm run ios:release
```

**Generate Release Bundle**:
```bash
npm run build:ios:bundle
```

## 🔧 Development Scripts

- `npm start` - Start Metro bundler
- `npm start:reset` - Start Metro with cache reset
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - TypeScript type checking
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run clean` - Clean all build artifacts
- `npm run clean:android` - Clean Android build
- `npm run clean:ios` - Clean iOS build

## 🛡️ Production-Grade Features

### Error Boundaries

The app includes a production-ready Error Boundary component (`src/components/ErrorBoundary.tsx`) that:
- Catches JavaScript errors in the component tree
- Displays a user-friendly fallback UI
- Logs errors for monitoring (integrate with Sentry, Crashlytics, etc.)
- Allows error recovery

**Usage**:
```tsx
import ErrorBoundary from './src/components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error reporting service
    console.error('App Error:', error, errorInfo);
  }}
>
  <YourApp />
</ErrorBoundary>
```

### TypeScript Configuration

Enhanced TypeScript configuration with:
- Strict mode enabled
- Unused variable/parameter detection
- Path aliases for cleaner imports
- Production-grade type checking

**Path Aliases**:
```typescript
import Component from '@components/Component';
import { utility } from '@utils/helpers';
import { MyType } from '@types/index';
```

### Build Optimizations

**Android**:
- Resource shrinking enabled (when ProGuard is enabled)
- Architecture-specific library handling
- Production build optimizations

**iOS**:
- Automatic New Architecture support via CocoaPods
- Optimized build settings

## 🧪 Testing

The project includes Jest for testing. Run tests with:

```bash
npm test
```

Test files should be placed in `__tests__/` directories or use `.test.ts`/`.test.tsx` extensions.

## 📝 Code Quality

### Linting

ESLint is configured with React Native best practices:
```bash
npm run lint
npm run lint:fix
```

### Type Checking

TypeScript type checking:
```bash
npm run type-check
```

## 🔍 Verifying New Architecture

### Android

1. Check `android/gradle.properties` - `newArchEnabled=true`
2. Build the app and check logs for "Fabric" or "New Architecture" messages
3. Native modules will use TurboModules automatically

### iOS

1. The New Architecture is enabled automatically via Podfile
2. Check Xcode build logs for Fabric-related messages
3. Native modules will use TurboModules automatically

## 🐛 Troubleshooting

### Android Build Issues

1. **Clean build**:
   ```bash
   npm run clean:android
   cd android && ./gradlew clean
   ```

2. **C++ Linking Errors (undefined symbols)**:
   
   **Problem**: Native modules like `react-native-screens`, `react-native-safe-area-context` fail to link with errors like:
   ```
   ld.lld: error: undefined symbol: operator delete(void*)
   ld.lld: error: undefined symbol: std::__ndk1::basic_string<...>
   ```
   
   **Root Cause**: CMake-generated `build.ninja` files don't include `-lc++` (C++ standard library) in the linker flags, causing undefined symbol errors for C++ runtime functions.
   
   **Solution**: This project includes an automatic fix in `android/build.gradle` that patches all `build.ninja` files to add `-lc++` before `-latomic`. The fix:
   - Runs automatically for all subprojects (including `react-native-screens`)
   - Patches files after CMake configuration and before building
   - Works for all architectures (arm64-v8a, armeabi-v7a, x86, x86_64)
   
   **Manual Fix** (if automatic fix doesn't work):
   ```bash
   # Clean CMake cache
   Remove-Item -Recurse -Force "android\app\.cxx"
   Remove-Item -Recurse -Force "node_modules\react-native-screens\android\.cxx"
   
   # Clean Gradle build
   cd android && ./gradlew clean && cd ..
   
   # Rebuild
   npm run android
   ```
   
   **Verify Fix**: During build, you should see messages like:
   ```
   ✅ [react-native-screens] Patched build.ninja to link libc++: [path]
   ```

3. **Invalid cache**:
   ```bash
   npm start:reset
   ```

4. **Check New Architecture flag**:
   Verify `android/gradle.properties` has `newArchEnabled=true`

### iOS Build Issues

1. **Clean build**:
   ```bash
   npm run clean:ios
   cd ios && bundle exec pod install
   ```

2. **Pod issues**:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   bundle exec pod install
   ```

3. **Xcode cache**:
   Clean build folder in Xcode: `Product > Clean Build Folder` (Shift+Cmd+K)

### Metro Bundler Issues

1. **Reset cache**:
   ```bash
   npm start:reset
   ```

2. **Clear watchman**:
   ```bash
   watchman watch-del-all
   ```

## 📚 Additional Resources

- [React Native New Architecture Docs](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Fabric Renderer](https://reactnative.dev/docs/the-new-architecture/landing-page#fabric-renderer)
- [TurboModules](https://reactnative.dev/docs/the-new-architecture/landing-page#turbomodules)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/landing-page#codegen)

## 🧭 Navigation Setup

This project uses **React Navigation v7** with Native Stack Navigator for optimal performance.

### Navigation Structure

- **Root Navigator** (`src/navigation/RootNavigator.tsx`): Top-level navigation container
- **Auth Navigator** (`src/navigation/AuthNavigator.tsx`): Handles authentication flow screens
- **Type Definitions** (`src/navigation/types.ts`): Centralized TypeScript types for type-safe navigation

### Adding New Screens

1. **Add route to type definitions** (`src/navigation/types.ts`):
   ```typescript
   export type AuthStackParamList = {
     GettingStarted: undefined;
     OTP: { phoneNumber: string }; // New screen
   };
   ```

2. **Add screen to navigator** (`src/navigation/AuthNavigator.tsx`):
   ```typescript
   <Stack.Screen
     name="OTP"
     component={OTPScreen}
   />
   ```

3. **Navigate from any screen**:
   ```typescript
   navigation.navigate('OTP', { phoneNumber: '1234567890' });
   ```

### Navigation Features

- ✅ Type-safe navigation with full TypeScript support
- ✅ Centralized navigation configuration
- ✅ Native stack performance (uses native navigation primitives)
- ✅ No C++ linking issues (pure JavaScript/TypeScript)
- ✅ Production-ready and battle-tested

## 🔧 C++ Linking Fix - Technical Details

### The Problem

When using React Native's New Architecture with native modules that use C++ (like `react-native-screens`), CMake generates `build.ninja` files that don't include the C++ standard library (`libc++`) in the linker flags. This causes undefined symbol errors during linking.

### The Solution

We implemented an automatic patch in `android/build.gradle` that:

1. **Hooks into Gradle build lifecycle**: Uses `gradle.projectsEvaluated` to run after all projects are evaluated
2. **Finds all build.ninja files**: Recursively searches `.cxx` directories in all subprojects
3. **Patches linker flags**: Adds `-lc++` before `-latomic` in all `LINK_LIBRARIES` lines
4. **Runs at the right time**: Patches after CMake configuration and before building

### Implementation

**Location**: `android/build.gradle` (lines 23-71)

```groovy
gradle.projectsEvaluated {
    subprojects { project ->
        def patchBuildNinja = { cxxDir ->
            // Recursively find and patch all build.ninja files
            // Adds -lc++ before -latomic in LINK_LIBRARIES
        }
        
        // Patch after CMake configuration
        project.tasks.matching { 
            it.name.matches(".*configureCMake.*")
        }.configureEach { task ->
            doLast { patchBuildNinja(...) }
        }
        
        // Patch before building
        project.tasks.matching {
            it.name.matches(".*buildCMake.*")
        }.configureEach { task ->
            doFirst { patchBuildNinja(...) }
        }
    }
}
```

### Why This Works

- **Automatic**: No manual intervention needed
- **Comprehensive**: Covers all subprojects (app, react-native-screens, etc.)
- **Safe**: Only patches files that need it (checks for `-latomic` and absence of `-lc++`)
- **Reliable**: Runs at the correct build lifecycle stages

### Verification

During build, you'll see confirmation messages:
```
✅ [app] Patched build.ninja to link libc++: [path]
✅ [react-native-screens] Patched build.ninja to link libc++: [path]
```

If you don't see these messages, the fix may not be running. Check:
1. `android/build.gradle` contains the patch code
2. Build cache is cleared
3. Gradle daemon is restarted

## 🎯 Next Steps

1. **Error Monitoring**: Integrate Sentry or similar service in `ErrorBoundary`
2. **Analytics**: Add analytics tracking
3. **Performance Monitoring**: Set up performance monitoring
4. **CI/CD**: Configure continuous integration/deployment
5. **ProGuard**: Enable ProGuard for Android release builds (set `enableProguardInReleaseBuilds = true` in `android/app/build.gradle`)

## ⚠️ Important Notes

1. **Production Keystore**: Replace debug keystore with production keystore for Android releases
2. **App Signing**: Configure proper code signing for iOS production builds
3. **Environment Variables**: Use environment variables for API keys and secrets
4. **ProGuard Rules**: Add ProGuard rules for any native libraries when enabling ProGuard

## 📋 Current Project Setup Summary

### Installed Packages

**Navigation**:
- `@react-navigation/native@^7.1.21`
- `@react-navigation/native-stack@^7.7.0`
- `react-native-screens@^4.18.0` (peer dependency)

**UI/Styling**:
- `nativewind@^4.2.1` - Tailwind CSS for React Native
- `react-native-size-matters@^0.4.2` - Responsive scaling
- `react-native-svg@^15.15.0` - SVG support

**Utilities**:
- `react-native-safe-area-context@^5.6.2` - Safe area handling
- `react-native-bootsplash@^6.3.11` - Splash screen

### Project Features

✅ **New Architecture**: Fully enabled and configured  
✅ **TypeScript**: Strict mode with comprehensive type checking  
✅ **Navigation**: React Navigation v7 with type-safe setup  
✅ **Error Handling**: Production-ready ErrorBoundary  
✅ **C++ Linking Fix**: Automatic fix for all native modules  
✅ **Responsive Design**: Scaling utilities and theme system  
✅ **Code Quality**: ESLint, Prettier, and type checking configured  

### Theme System

**Colors** (`src/theme/colors.ts`):
- Background: `#EBEBEB`
- Text: `#050505`
- Primary Button: `#9334EA`
- Disabled Button: `#A855F7` (60% opacity)

**Typography** (`src/theme/fonts.ts`):
- Manrope font family (all weights)
- Responsive font scaling

**Scaling** (`src/theme/scaling.ts`):
- `ms()` - Moderate scaling
- `vs()` - Vertical scaling
- `hs()` - Horizontal scaling

---

**Last Updated**: React Native 0.82.1 with New Architecture enabled  
**C++ Linking Fix**: Implemented and tested - automatically patches all native modules  
**Navigation**: React Navigation v7 with centralized type-safe setup

