<div align="center">

# 🚄 Lavial

### Aplicație modernă de cumpărare bilete pentru transport

**O experiență premium de cumpărare bilete, cu design luxos, animații fluide și funcționalități avansate**

[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-0.37-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

</div>

---

## ✨ Caracteristici

### 🎯 Funcționalități Principale

- **🔍 Căutare Rută Avansată**
  - Selectare din listă de orașe disponibile
  - Validare automată pentru destinații
  - Istoric recent pentru selecții rapide
  - Buton swap pentru inversarea rutelor
  - Validare date (nu poți selecta date trecute)

- **📅 Detalii Cursă**
  - Informații complete despre călătorie
  - Prețuri transparente (toate taxele incluse)
  - Suport multi-currency (RON, EUR, etc.)
  - Ora plecare și sosire
  - Animații moderne și fluide

- **👤 Date Pasager**
  - Formular intuitiv pentru date personale
  - Validare în timp real
  - Design modern și accesibil

- **💳 Checkout & Plată**
  - Integrare completă Stripe
  - Plăți securizate cu card
  - Discount pentru studenți (25% cu ID student)
  - Rezumat comanda detaliat
  - Suport pentru promo codes

- **🎫 Gestionare Bilete**
  - Salvare offline automată
  - QR code generat pentru fiecare bilet
  - Export PDF sau imagine
  - Acces rapid la "Biletele Mele"
  - Ștergere individuală sau în masă

### 🎨 Design & UX

- **Design Luxos & Modern**
  - Gradient-uri premium
  - Animații fluide și responsive
  - Paletă de culori sofisticată
  - Tipografie Clash Grotesk
  - Shadow-uri și efecte de blur

- **Experiență Utilizator**
  - Navigation intuitivă
  - Feedback vizual (vibrații, animații)
  - Loading states elegante
  - Error handling friendly
  - Suport complet pentru dark mode ready

- **Accesibilitate**
  - Scrollable pe toate ecranele
  - Keyboard avoiding views
  - Touch targets optimizate
  - Suport pentru toate dimensiunile de ecrane

---

## 🏗️ Arhitectură

### Structura Proiectului

```
Lavial/
├── src/
│   ├── screens/              # Ecrane principale
│   │   ├── SearchScreen.tsx          # Căutare rută
│   │   ├── TripDetailsScreen.tsx    # Detalii cursă
│   │   ├── PassengerScreen.tsx      # Date pasager
│   │   ├── CheckoutScreen.tsx       # Checkout & plată
│   │   ├── TicketsScreen.tsx        # Lista bilete
│   │   └── TicketDetailScreen.tsx   # Detalii bilet
│   │
│   ├── navigation/           # Configurație navigare
│   │   └── AppNavigator.tsx
│   │
│   ├── api/                  # API calls
│   │   ├── backend.ts        # Backend API
│   │   └── payments.ts       # Stripe integration
│   │
│   ├── utils/                # Utilități
│   │   ├── storage.ts        # Local storage (bilete)
│   │   ├── recentCities.ts  # Istoric orașe
│   │   └── ticketPdf.ts     # Generare PDF
│   │
│   └── styles/               # Stiluri globale
│       └── theme.ts          # Paletă, gradients, shadows
│
├── assets/                   # Resurse statice
│   ├── fonts/               # Clash Grotesk font family
│   ├── images/              # Imagini și iconuri
│   └── animation.json       # Lottie animations
│
├── App.tsx                   # Entry point
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
└── package.json              # Dependencies
```

### Flow Aplicație

```
Search Screen
    ↓ (selectează ruta, data)
Trip Details Screen
    ↓ (confirma cursă)
Passenger Screen
    ↓ (completează date)
Checkout Screen
    ↓ (plată Stripe)
Ticket Saved Locally
    ↓
Tickets Screen / Ticket Detail Screen
```

---

## 🛠️ Tech Stack

### Core Technologies
- **React Native 0.74.5** - Framework mobile
- **Expo SDK 51** - Development platform
- **TypeScript 5.3** - Type safety
- **React Navigation 6** - Navigation system

### Key Libraries
- **@stripe/stripe-react-native** - Payment processing
- **@react-navigation/native-stack** - Stack navigation
- **@react-native-community/datetimepicker** - Date selection
- **expo-print** - PDF generation
- **expo-sharing** - File sharing
- **react-native-qrcode-svg** - QR code generation
- **@react-native-async-storage/async-storage** - Local storage
- **expo-linear-gradient** - Gradient effects
- **lottie-react-native** - Animations
- **date-fns** - Date utilities

### Development Tools
- **EAS Build** - Cloud builds
- **Expo CLI** - Development server
- **TypeScript** - Static typing

---

## 📦 Instalare

### Pre-requisite

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 sau **yarn**
- **Expo CLI** (global)
- **EAS CLI** (pentru builds)

### Setup

1. **Clonează repository-ul**
```bash
git clone <repository-url>
cd Lavial
```

2. **Instalează dependențele**
```bash
npm install --legacy-peer-deps
```

3. **Configurează environment variables**

Creează un fișier `.env` în root:
```env
EXPO_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
EXPO_SERVER_URL=https://your-backend-url.com/api
```

4. **Pornește development server**
```bash
npm start
# sau
expo start
```

5. **Rulează pe device/simulator**

Pentru iOS:
```bash
npm run ios
# sau
expo run:ios
```

Pentru Android:
```bash
npm run android
# sau
expo run:android
```

---

## ⚙️ Configurare

### Environment Variables

Aplicația folosește următoarele variabile de mediu:

| Variable | Descriere | Exemplu |
|----------|-----------|---------|
| `EXPO_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` sau `pk_live_...` |
| `EXPO_SERVER_URL` | Backend API URL | `https://api.example.com/api` |

### Configurare pentru Production

Vezi [BUILD_GUIDE.md](./BUILD_GUIDE.md) pentru instrucțiuni detaliate despre build și deploy.

### EAS Secrets

Pentru production, folosește EAS Secrets în loc de variabile hardcodate:

```bash
# Setare secret Stripe
eas secret:create --scope project --name EXPO_STRIPE_PUBLISHABLE_KEY --value pk_live_...

# Setare secret Backend
eas secret:create --scope project --name EXPO_SERVER_URL --value https://api.example.com/api
```

---

## 🚀 Utilizare

### Development

1. **Start Metro Bundler**
```bash
npm start
```

2. **Scan QR code** cu Expo Go app sau
3. **Run pe simulator/emulator**
```bash
npm run ios
npm run android
```

### Build pentru Production

#### Android
```bash
# Build AAB pentru Google Play
eas build --platform android --profile production
```

#### iOS
```bash
# Build pentru App Store
eas build --platform ios --profile production
```

Pentru mai multe detalii, vezi [BUILD_GUIDE.md](./BUILD_GUIDE.md).

---

## 📱 Funcționalități Detaliate

### 1. Căutare Rută

- **Selectare Oraș**: Modal cu listă completă de orașe
- **Validare Destinații**: Doar destinații valide pentru orașul selectat
- **Istoric Recent**: Acces rapid la selecții recente
- **Swap Button**: Inversare rapidă între origine și destinație
- **Date Picker**: Validare automată (nu permite date trecute)

### 2. Detalii Cursă

- **Informații Complete**: Preț, timpuri, stații
- **Multi-Currency**: Suport pentru RON, EUR, etc.
- **Animații**: Card slide-up și fade-in
- **Design Modern**: Gradient-uri și shadow-uri

### 3. Date Pasager

- **Formular Intuitiv**: Nume, prenume, email, telefon
- **Validare Real-time**: Feedback imediat
- **Design Responsive**: Scrollable pe toate ecranele

### 4. Checkout & Plată

- **Integrare Stripe**: Payment Sheet complet
- **Discount Studenți**: 25% discount cu ID student
- **Rezumat Comandă**: Breakdown detaliat al prețului
- **Securitate**: Plăți securizate prin Stripe

### 5. Gestionare Bilete

- **Salvare Offline**: Bilete salvate local
- **QR Code**: Generare automată pentru validare
- **Export PDF**: Export bilet ca PDF sau imagine
- **Gestionare**: Ștergere individuală sau în masă

---

## 🎨 Design System

### Paletă Culori

Aplicația folosește o paletă modernă și sofisticată:

- **Primary**: Gradient-uri premium
- **Background**: `#f8fafc` (light mode)
- **Text**: `#1e293b` (dark gray)
- **Accent**: Culori dinamice bazate pe context

### Tipografie

- **Font Family**: Clash Grotesk
  - Regular, Medium, Semibold, Bold
  - Extralight, Light pentru text secundar

### Componente

- **Cards**: Rounded corners, shadows, gradients
- **Buttons**: Gradient backgrounds, press animations
- **Inputs**: Modern design cu icons
- **Modals**: Blur backgrounds, slide animations

---

## 🔐 Securitate

- **Stripe Integration**: Plăți procesate securizat
- **Environment Variables**: Nu sunt hardcodate în cod
- **Local Storage**: Bilete stocate local, nu pe server
- **API Security**: Toate request-urile prin HTTPS

---

## 📊 Performance

- **Optimizări**:
  - Lazy loading pentru imagini
  - Memoization pentru liste
  - Native animations
  - Optimizare re-renders

- **Bundle Size**: Optimizat pentru production
- **Load Time**: Fast initial load
- **Smooth Animations**: 60fps animations

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Căutare rută funcționează corect
- [ ] Validare date (nu permite date trecute)
- [ ] Plăți Stripe funcționează
- [ ] Bilete se salvează offline
- [ ] QR code se generează corect
- [ ] PDF export funcționează
- [ ] Multi-currency display corect
- [ ] Student discount se aplică corect

---

## 🐛 Troubleshooting

### Probleme comune

**Metro bundler nu pornește**
```bash
# Clear cache
npm start -- --clear
```

**Dependențe conflict**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**iOS build fails**
```bash
cd ios
pod install
cd ..
```

**Android build fails**
```bash
cd android
./gradlew clean
cd ..
```

**TypeScript errors**
- Verifică că `tsconfig.json` este configurat corect
- Reîncarcă TypeScript Server în IDE (Cmd+Shift+P → "TypeScript: Restart TS Server")

---

## 📝 Scripts Disponibile

| Script | Descriere |
|--------|-----------|
| `npm start` | Pornește Expo dev server |
| `npm run ios` | Rulează pe iOS simulator |
| `npm run android` | Rulează pe Android emulator |
| `npm run web` | Rulează pe web |

---

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru a contribui:

1. Fork repository-ul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

---

## 📄 Licență

Acest proiect este proprietar. Toate drepturile rezervate.

---

## 👥 Echipa

Dezvoltat cu ❤️ de echipa Lavial

---

## 📞 Contact & Support

Pentru întrebări sau suport:
- **Email**: support@lavial.com
- **Website**: https://lavial.com

---

## 🙏 Mulțumiri

- **Expo** pentru platforma excelentă
- **Stripe** pentru soluția de plăți
- **React Native Community** pentru librăriile utile

---

<div align="center">

**Made with ❤️ using React Native & Expo**

[⬆ Back to Top](#-lavial)

</div>

