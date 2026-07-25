# LightTrace Android WebView shell

This Android app displays the existing Next.js site in a native WebView.

The default URL is `http://10.0.2.2:3000/`, which reaches the host computer from the Android Emulator. For a physical phone, edit `app/src/main/res/values/strings.xml` and replace `web_app_url` with the computer's LAN URL or a deployed HTTPS URL.

Open this directory in Android Studio and use **Build > Build APK(s)**. If Gradle is installed on the command line, you can also run:

```powershell
gradle assembleDebug
```

The APK is generated at `app/build/outputs/apk/debug/app-debug.apk`.
