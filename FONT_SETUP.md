# Manrope Font Setup Guide

## Overview
This guide will help you add Manrope font to your React Native app for both Android and iOS platforms.

## Step 1: Download Manrope Font Files

1. Download Manrope font from [Google Fonts](https://fonts.google.com/specimen/Manrope)
   - Or use this direct link: https://github.com/sharanda/manrope/releases
   
2. You need these font weights:
   - Manrope-ExtraLight.ttf (200)
   - Manrope-Light.ttf (300)
   - Manrope-Regular.ttf (400)
   - Manrope-Medium.ttf (500)
   - Manrope-SemiBold.ttf (600)
   - Manrope-Bold.ttf (700)
   - Manrope-ExtraBold.ttf (800)

## Step 2: Add Font Files to Project

1. Create the fonts directory:
   ```
   assets/
     fonts/
       Manrope-ExtraLight.ttf
       Manrope-Light.ttf
       Manrope-Regular.ttf
       Manrope-Medium.ttf
       Manrope-SemiBold.ttf
       Manrope-Bold.ttf
       Manrope-ExtraBold.ttf
   ```

2. Place all `.ttf` files in `assets/fonts/` folder

## Step 3: Link Fonts (Automatic)

The fonts will be automatically linked via `react-native.config.js` which is already configured:
```javascript
assets: ['./assets/fonts/'],
```

## Step 4: Run Font Linking Command

After adding the font files, run:

```bash
# For React Native 0.70+
npx react-native-asset

# Or if using older version
npx react-native link
```

This will:
- Copy fonts to Android: `android/app/src/main/assets/fonts/`
- Add fonts to iOS: Update Xcode project automatically

## Step 5: Rebuild Apps

After linking fonts, rebuild your apps:

```bash
# Android
npm run android

# iOS (make sure to run pod install first)
cd ios && pod install && cd ..
npm run ios
```

## Usage

### Using in React Native StyleSheet

```tsx
import { fonts, typography } from '@/theme/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.manrope.bold,
    fontSize: 24,
  },
  body: {
    ...typography.body,
  },
  heading: {
    ...typography.h1,
  },
});
```

### Using with NativeWind (Tailwind)

```tsx
<Text className="font-manrope font-bold text-2xl">
  Hello Manrope
</Text>
```

The font is already configured in `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Manrope', 'System', 'sans-serif'],
  manrope: ['Manrope', 'System', 'sans-serif'],
}
```

### Using Typography Presets

```tsx
import { typography } from '@/theme/fonts';

<Text style={typography.h1}>Heading 1</Text>
<Text style={typography.body}>Body text</Text>
<Text style={typography.button}>Button text</Text>
```

## Font Weights Available

- `Manrope-ExtraLight` - 200
- `Manrope-Light` - 300
- `Manrope-Regular` - 400 (default)
- `Manrope-Medium` - 500
- `Manrope-SemiBold` - 600
- `Manrope-Bold` - 700
- `Manrope-ExtraBold` - 800

## NativeWind Font Classes

After setup, you can use these Tailwind classes:

- `font-manrope` - Manrope font family
- `font-light` - Light (300)
- `font-normal` - Regular (400)
- `font-medium` - Medium (500)
- `font-semibold` - SemiBold (600)
- `font-bold` - Bold (700)
- `font-extrabold` - ExtraBold (800)

## Troubleshooting

### Fonts Not Showing on Android
1. Ensure fonts are in `android/app/src/main/assets/fonts/`
2. Rebuild the app: `npm run android`
3. Check font file names match exactly (case-sensitive)

### Fonts Not Showing on iOS
1. Verify `Info.plist` has `UIAppFonts` array with all font files
2. Run `cd ios && pod install && cd ..`
3. Clean and rebuild: `cd ios && xcodebuild clean && cd ..`
4. Rebuild the app: `npm run ios`

### Font Names Not Working
- Ensure font file names match the `fontFamily` name exactly
- On iOS, font family name should match the filename (without .ttf)
- On Android, use the font file name exactly as it appears

## Verification

To verify fonts are loaded, check:
1. Android: Fonts should appear in `android/app/src/main/assets/fonts/`
2. iOS: Fonts should be listed in Xcode under "Copy Bundle Resources"
3. Runtime: Fonts should render correctly in the app

## Production Notes

✅ All font files are automatically included in builds
✅ Fonts are optimized and compressed during build
✅ Works with both development and production builds
✅ Supports all React Native platforms (Android, iOS)

