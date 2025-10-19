# 📱 Build Android App - Friends Timetable

Your Android project has been created! Now follow these steps to build the APK.

## Option 1: Build with Android Studio (Recommended) ✨

### Step 1: Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Install it on your Mac
3. Open Android Studio and complete the setup wizard

### Step 2: Open Project in Android Studio
```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends"
npx cap open android
```

This will open your project in Android Studio.

### Step 3: Build APK
1. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete (5-10 minutes first time)
3. Click "locate" in the notification popup
4. You'll find the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Your Phone
1. Copy the APK to your Android phone
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Open "Friends Timetable" app! 🎉

---

## Option 2: Build from Command Line (Requires Android SDK)

If you have Android SDK already installed:

```bash
cd "/Users/ashutoshkumar/Desktop/friends TT/friends/android"
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Option 3: Quick Alternative - Use as Web App 🌐

If you want to use it immediately without building:

1. Deploy to Netlify/Vercel (Free):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. Open the URL on your phone's browser
3. **Add to Home Screen**:
   - **Android**: Chrome menu → "Install app"
   - Works exactly like a native app!

---

## Update the App (After making changes)

Whenever you update your code:

```bash
# 1. Build the web app
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Open in Android Studio and rebuild
npx cap open android
```

---

## Troubleshooting

### Gradle Error
If you get a Java version error, make sure you're using Java 17:
```bash
# Check Java version
java -version

# If not Java 17, download from: https://adoptium.net/
```

### App Not Working
Make sure to run `npm run build` before syncing to Android!

---

## Your APK Location

After building, your APK will be at:
```
/Users/ashutoshkumar/Desktop/friends TT/friends/android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer this file to your Android phone and install it! 📲

---

## Features in Your App ✨

✅ Real-time availability tracking
✅ Emergency Assemble button (calls all friends)
✅ Beautiful UI with animations
✅ Works offline
✅ Native Android app
✅ Fast and responsive

Enjoy your Friends Timetable app! 🎉👫
