# React Native New Architecture Migration Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Critical Fixes and Solutions](#critical-fixes-and-solutions)
5. [Production-Grade Enhancements](#production-grade-enhancements)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview

This guide documents the complete migration of a React Native project to the **New Architecture** (Fabric + TurboModules), including all configuration changes, critical fixes, and production-grade improvements.

### What is New Architecture?

The New Architecture consists of:
- **Fabric**: New rendering system that improves performance and enables concurrent features
- **TurboModules**: Improved native module system with better type safety
- **Codegen**: Automatic generation of native code from TypeScript/Flow specifications
- **JSI (JavaScript Interface)**: Direct communication between JavaScript and native code

### Benefits

- ✅ Better performance and smoother animations
- ✅ Support for React 18+ concurrent features
- ✅ Strongly typed native modules
- ✅ Future-proof architecture
- ✅ Improved developer experience

---

## Prerequisites

Before starting the migration, ensure you have:

- **React Native 0.68+** (This guide uses **0.82.1**)
- **Node.js 20+**
- **Android Studio** with latest SDK and NDK
- **Xcode 14+** (for iOS)
- **CocoaPods** installed (for iOS)

---

## Step-by-Step Migration Process

### Step 1: Update Dependencies

Update your `package.json` to use React Native 0.82.1 or later:

```json
{
  "dependencies": {
    "react": "19.1.1",
    "react-native": "0.82.1",
    "@react-native/new-app-screen": "0.82.1"
  },
  "devDependencies": {
    "@react-native/babel-preset": "0.82.1",
    "@react-native/eslint-config": "0.82.1",
    "@react-native/metro-config": "0.82.1",
    "@react-native/typescript-config": "0.82.1",
    "typescript": "^5.8.3"
  }
}
```

**Install dependencies:**
```bash
npm install
```

---

### Step 2: Android Configuration

#### 2.1 Enable New Architecture in `android/gradle.properties`

Add or update the following properties:

```properties
# Enable New Architecture
newArchEnabled=true

# Enable Hermes (recommended)
hermesEnabled=true

# AndroidX support
android.useAndroidX=true

# Architecture filters
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# JVM memory settings (for better build performance)
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

#### 2.2 Update `android/app/build.gradle`

Add the following configurations:

```gradle
android {
    namespace "com.yourpackage"
    
    defaultConfig {
        // ... existing config ...
        
        // Ensure libc++ is available for all architectures
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
    
    // Production-grade build optimizations
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}

// CRITICAL: Fix for C++ linking issues with New Architecture
// This ensures libc++ is properly linked for autolinked libraries
afterEvaluate {
    tasks.matching { 
        it.name.matches(".*configureCMake.*")
    }.configureEach { task ->
        doLast {
            def cxxBaseDir = file("${project.projectDir}/.cxx")
            if (cxxBaseDir.exists()) {
                cxxBaseDir.eachFileRecurse(groovy.io.FileType.FILES) { file ->
                    if (file.name == "build.ninja") {
                        def content = file.text
                        def modified = false
                        def newContent = content
                        
                        // Patch LINK_LIBRARIES for react_codegen targets to include -lc++
                        if (content.contains("LINK_LIBRARIES") && 
                            content.contains("libreactnative") && 
                            content.contains("-latomic")) {
                            newContent = newContent.replaceAll(
                                /(LINK_LIBRARIES = [^\n]*libreactnative[^\n]*")(\s+-latomic\s+-lm)/,
                                { match ->
                                    if (!match[0].contains("-lc++")) {
                                        modified = true
                                        return match[1] + " -lc++" + match[2]
                                    }
                                    return match[0]
                                }
                            )
                        }
                        
                        if (modified) {
                            file.text = newContent
                            println "✅ Patched build.ninja to link libc++: ${file.path}"
                        }
                    }
                }
            }
        }
    }
}
```

#### 2.3 Update `MainActivity.kt`

Use the New Architecture entry point:

```kotlin
package com.yourpackage

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String = "YourAppName"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

#### 2.4 Update `MainApplication.kt`

Use the new `ReactHost` pattern:

```kotlin
package com.yourpackage

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {
    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}
```

---

### Step 3: iOS Configuration

#### 3.1 Update `ios/Podfile`

The Podfile should use the standard React Native setup:

```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

target 'YourAppName' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
  end
end
```

**Install pods:**
```bash
cd ios && bundle exec pod install && cd ..
```

#### 3.2 Update `AppDelegate.swift`

Use the New Architecture factory pattern:

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()

        reactNativeDelegate = delegate
        reactNativeFactory = factory

        window = UIWindow(frame: UIScreen.main.bounds)

        factory.startReactNative(
            withModuleName: "YourAppName",
            in: window,
            launchOptions: launchOptions
        )

        return true
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
```

---

### Step 4: TypeScript Configuration

Update `tsconfig.json` for production-grade type checking:

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-native",
    "moduleResolution": "bundler",
    "target": "esnext",
    "lib": ["esnext"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "src/**/*"],
  "exclude": ["**/node_modules", "**/Pods", "**/__tests__", "**/__mocks__"]
}
```

---

### Step 5: Babel Configuration

Update `babel.config.js` to support path aliases:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};
```

**Install babel-plugin-module-resolver:**
```bash
npm install --save-dev babel-plugin-module-resolver
```

---

### Step 6: React Native Config

Create or update `react-native.config.js`:

```javascript
/**
 * React Native Configuration
 * For New Architecture, let autolinking handle dependencies automatically
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
    },
    ios: {},
  },
};
```

**⚠️ Important:** Don't override package import paths manually. Let autolinking handle it automatically.

---

### Step 7: Add Error Boundary

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// ... styles ...

export default ErrorBoundary;
```

Update `App.tsx` to use ErrorBoundary:

```typescript
import ErrorBoundary from './src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, send to error reporting service
        console.error('App Error:', error, errorInfo);
      }}
    >
      {/* Your app content */}
    </ErrorBoundary>
  );
}
```

---

### Step 8: Update Package Scripts

Add useful scripts to `package.json`:

```json
{
  "scripts": {
    "android": "react-native run-android",
    "android:release": "react-native run-android --mode=release",
    "ios": "react-native run-ios",
    "ios:release": "react-native run-ios --configuration Release",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "start": "react-native start",
    "start:reset": "react-native start --reset-cache",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "clean": "cd android && ./gradlew clean && cd .. && cd ios && rm -rf build Pods Podfile.lock && cd ..",
    "clean:android": "cd android && ./gradlew clean && cd ..",
    "clean:ios": "cd ios && rm -rf build Pods Podfile.lock && cd ..",
    "postinstall": "cd ios && bundle exec pod install && cd .."
  }
}
```

---

## Critical Fixes and Solutions

### 🔴 Critical Fix: C++ Linking Issue

**Problem:** When building with New Architecture, you may encounter C++ linking errors like:
```
ld.lld: error: undefined symbol: std::__ndk1::basic_string<char, ...>::~basic_string()
```

**Root Cause:** React Native's autolinking doesn't properly configure the C++ standard library (`libc++`) for codegen targets.

**Solution:** The Gradle task in `android/app/build.gradle` (Step 2.2) automatically patches the generated `build.ninja` files to add `-lc++` to the linker command.

**How it works:**
1. After CMake configuration completes, the task finds all `build.ninja` files
2. It patches `LINK_LIBRARIES` lines that link against `libreactnative`
3. Adds `-lc++` before `-latomic -lm` to ensure proper C++ linking

**Verification:** You should see this message during build:
```
✅ Patched build.ninja to link libc++: D:\...\build.ninja
```

---

## Production-Grade Enhancements

### 1. ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
  },
};
```

### 2. Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'App.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
};
```

### 3. Project Structure

Organize your code with a clear structure:

```
src/
├── components/     # Reusable components
│   └── ErrorBoundary.tsx
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API services, external integrations
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
│   └── constants.ts
├── types/          # TypeScript type definitions
│   └── index.ts
└── assets/         # Images, fonts, etc.
```

---

## Verification

### Check New Architecture is Enabled

**Android:**
```bash
# Check gradle.properties
grep newArchEnabled android/gradle.properties
# Should output: newArchEnabled=true
```

**iOS:**
New Architecture is automatically enabled through the Podfile configuration.

### Test the Build

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

### Verify in Code

You can check if New Architecture is active by checking the `fabricEnabled` flag in `MainActivity.kt` (Android) or by using the New Architecture APIs in your code.

---

## Troubleshooting

### Issue: C++ Linking Errors

**Symptoms:**
```
ld.lld: error: undefined symbol: std::__ndk1::basic_string<...>
```

**Solution:**
1. Ensure the C++ linking fix is in `android/app/build.gradle` (see Step 2.2)
2. Clean build: `npm run clean:android`
3. Delete `.cxx` directory: `rm -rf android/app/.cxx`
4. Rebuild: `npm run android`

### Issue: Autolinking Errors

**Symptoms:**
```
error: package io.github.th3rdwave.safeareacontext does not exist
```

**Solution:**
1. Remove custom package import paths from `react-native.config.js`
2. Let autolinking handle dependencies automatically
3. Regenerate autolinking: `cd android && ./gradlew :app:generateAutolinkingPackageList`

### Issue: Build Fails with "CMake Error"

**Solution:**
1. Clean CMake cache: `rm -rf android/app/.cxx`
2. Clean Gradle: `cd android && ./gradlew clean`
3. Rebuild: `npm run android`

### Issue: iOS Pod Installation Fails

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..
```

### Issue: Metro Bundler Cache Issues

**Solution:**
```bash
npm run start:reset
# Or
watchman watch-del-all
```

### Issue: TypeScript Errors

**Solution:**
1. Ensure `tsconfig.json` uses `"moduleResolution": "bundler"` (not "node")
2. Run type check: `npm run type-check`
3. Clear TypeScript cache if needed

---

## Best Practices

### 1. Dependency Management

- ✅ Always check if a library supports New Architecture before adding it
- ✅ Update libraries to their latest versions for better compatibility
- ✅ Use `npm audit` regularly to check for security vulnerabilities

### 2. Code Quality

- ✅ Use TypeScript with strict mode enabled
- ✅ Run linting before commits: `npm run lint`
- ✅ Write tests for critical functionality
- ✅ Use Error Boundaries to catch and handle errors gracefully

### 3. Build Optimization

- ✅ Enable ProGuard for Android release builds (set `enableProguardInReleaseBuilds = true`)
- ✅ Use Hermes for better performance
- ✅ Optimize images and assets
- ✅ Monitor bundle size

### 4. Development Workflow

- ✅ Use path aliases for cleaner imports
- ✅ Follow consistent code style (ESLint + Prettier)
- ✅ Write meaningful commit messages
- ✅ Document complex logic

### 5. Testing

- ✅ Write unit tests for utilities and hooks
- ✅ Write integration tests for critical flows
- ✅ Maintain test coverage above 70%
- ✅ Test on both Android and iOS

---

## Additional Resources

- [React Native New Architecture Docs](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Fabric Renderer](https://reactnative.dev/docs/the-new-architecture/landing-page#fabric-renderer)
- [TurboModules](https://reactnative.dev/docs/the-new-architecture/landing-page#turbomodules)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/landing-page#codegen)

---

## Summary Checklist

Use this checklist to verify your migration:

- [ ] React Native updated to 0.82.1+
- [ ] `newArchEnabled=true` in `android/gradle.properties`
- [ ] C++ linking fix added to `android/app/build.gradle`
- [ ] `MainActivity.kt` uses `fabricEnabled`
- [ ] `MainApplication.kt` uses `ReactHost`
- [ ] iOS `AppDelegate.swift` uses `RCTReactNativeFactory`
- [ ] TypeScript configured with strict mode
- [ ] Babel configured with path aliases
- [ ] Error Boundary implemented
- [ ] ESLint and Jest configured
- [ ] Build succeeds on both platforms
- [ ] App runs without errors

---

## Support

If you encounter issues not covered in this guide:

1. Check the [React Native GitHub Issues](https://github.com/facebook/react-native/issues)
2. Search for similar issues in the React Native community
3. Review the official New Architecture documentation
4. Check library-specific documentation for New Architecture support

---

**Last Updated:** Based on React Native 0.82.1 migration  
**Maintained by:** Your Team

---

## License

This guide is provided as-is for reference purposes.

