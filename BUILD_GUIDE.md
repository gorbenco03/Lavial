# Build Guide pentru Production

## 📋 Pre-requisite

1. **Instalează EAS CLI** (dacă nu este deja instalat):
```bash
npm install -g eas-cli
```

2. **Login în contul Expo**:
```bash
eas login
```

3. **Configurează environment variables**:
   - Creează fișierul `.env` în root-ul proiectului:
   ```env
   EXPO_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key_here
   EXPO_SERVER_URL=https://lavial-backend-production.up.railway.app/api
   ```

## 🔧 Build pentru Android

### Build APK (pentru testare):
```bash
eas build --platform android --profile preview
```

### Build AAB (pentru Google Play Store):
```bash
eas build --platform android --profile production
```

### Build local Android (dacă ai Android Studio):
```bash
cd android
./gradlew assembleRelease
```

APK-ul va fi în: `android/app/build/outputs/apk/release/app-release.apk`

## 🍎 Build pentru iOS

### Build pentru TestFlight/App Store:
```bash
eas build --platform ios --profile production
```

### Build local iOS (dacă ai Xcode):
1. Deschide proiectul în Xcode:
```bash
open ios/Lavial.xcworkspace
```

2. În Xcode:
   - Selectează "Any iOS Device" sau un device fizic
   - Product → Archive
   - După archive, folosește "Distribute App"

## 🌐 Environment Variables pentru EAS Build

Environment variables sunt configurate în `eas.json`. Pentru a adăuga variabile noi sau să le schimbi:

1. Editează `eas.json` și adaugă în secțiunea `env`:
```json
"production": {
  "autoIncrement": true,
  "env": {
    "EXPO_SERVER_URL": "https://lavial-backend-production.up.railway.app/api",
    "EXPO_STRIPE_PUBLISHABLE_KEY": "pk_live_your_key"
  }
}
```

**ATENȚIE**: Nu pune cheile Stripe direct în `eas.json` dacă este în Git. Folosește EAS Secrets:

```bash
# Setare secret pentru Stripe
eas secret:create --scope project --name EXPO_STRIPE_PUBLISHABLE_KEY --value pk_live_your_key

# Setare secret pentru Backend URL
eas secret:create --scope project --name EXPO_SERVER_URL --value https://lavial-backend-production.up.railway.app/api
```

Apoi, în `eas.json`, folosește:
```json
"env": {
  "EXPO_STRIPE_PUBLISHABLE_KEY": "${EXPO_STRIPE_PUBLISHABLE_KEY}",
  "EXPO_SERVER_URL": "${EXPO_SERVER_URL}"
}
```

## 📱 Submit la App Stores

### Google Play Store:
```bash
eas submit --platform android --profile production
```

### Apple App Store:
```bash
eas submit --platform ios --profile production
```

## 🔍 Verificare Build

După ce build-ul este finalizat:
1. Verifică în dashboard-ul EAS: https://expo.dev
2. Descarcă build-ul și testează-l pe device
3. Verifică că environment variables sunt setate corect în aplicație

## ⚠️ Note importante

1. **Stripe Keys**:
   - Pentru development: folosește `pk_test_...`
   - Pentru production: folosește `pk_live_...`

2. **Backend URL**:
   - Asigură-te că backend-ul este disponibil și accesibil
   - Verifică CORS settings dacă ai probleme

3. **Version Management**:
   - Version-ul din `app.json` este incrementat automat pentru production builds
   - Version code pentru Android și build number pentru iOS sunt gestionate automat

## 🐛 Troubleshooting

### Build-ul eșuează din cauza environment variables:
- Verifică că variabilele sunt setate în `eas.json` sau ca EAS secrets
- Verifică că variabilele sunt accesibile în `App.tsx` și API files

### Build-ul eșuează din cauza dependențelor:
```bash
# Șterge node_modules și reinstalează
rm -rf node_modules
npm install

# Pentru iOS, reinstalează pods
cd ios
pod install
cd ..
```

### Build local nu funcționează:
- Asigură-te că ai toate tools instalate (Xcode pentru iOS, Android Studio pentru Android)
- Verifică că proiectul native este configurat corect:
```bash
npx expo prebuild
```

