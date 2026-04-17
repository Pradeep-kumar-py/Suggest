# 📚 Suggest — Book & Course Recommendation App

> **Discover amazing books through real video reviews, AI summaries, and community recommendations.**

Suggest is a fully-functional React Native (Expo) mobile application that lets users browse book and course recommendations shared by the community. Users can explore content as guests, or sign up to contribute their own reviews — complete with photos, videos, star ratings, and links.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **Browse Books & Courses** | Paginated feed of community recommendations, filterable by genre |
| 🎥 **Video Reviews** | Upload and watch short video reviews of books and courses |
| 📷 **Photo Uploads** | Share book covers, notes, or snapshots alongside written reviews |
| 🤖 **AI Summaries** | Get instant AI-powered summaries and insights for books |
| ⭐ **Star Ratings** | Rate books from 1–5 stars |
| 🔍 **Genre Filter** | Filter the feed by 15+ genres (Fiction, Technology, Science, Business, etc.) |
| 👤 **Guest Mode** | Browse all content without creating an account |
| 🔐 **Auth System** | Sign up, log in, OTP verification, and secure JWT token management |
| 🔗 **External Links** | Attach purchase/resource links to any recommendation |
| 🔄 **Offline Fallback** | Demo data is shown automatically if the network is unavailable |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev) ~53 / React Native 0.79 |
| **Routing** | [Expo Router](https://expo.github.io/router/) v5 (file-based) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) v5 |
| **Styling** | [NativeWind](https://www.nativewind.dev/) v4 (Tailwind CSS for RN) |
| **List Rendering** | [@shopify/flash-list](https://shopify.github.io/flash-list/) |
| **Image Rendering** | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| **Video Playback** | [expo-video](https://docs.expo.dev/versions/latest/sdk/video/) |
| **Media Picking** | [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| **Secure Storage** | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) |
| **Auth** | JWT (access + refresh token) via [jwt-decode](https://github.com/auth0/jwt-decode) |
| **Build & Deploy** | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## 📁 Project Structure

```
Suggest/
├── app/
│   ├── index.tsx              # Welcome/landing screen
│   ├── _layout.tsx            # Root layout
│   ├── global.css             # Global styles
│   ├── (auth)/
│   │   ├── index.tsx          # Login screen
│   │   ├── signup.tsx         # Sign-up screen
│   │   └── otpVerification.tsx# OTP verification screen
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab bar layout
│   │   ├── index.tsx          # Home feed (posts + videos)
│   │   ├── upload.tsx         # Upload recommendation screen
│   │   └── profile.tsx        # User profile screen
│   └── page/
│       └── [id].tsx           # Book detail page
├── Component/
│   ├── BookCard.tsx           # Book card with image/video support
│   ├── AnimatedButton.tsx     # Animated submit button
│   └── ShowMoreText.tsx       # Expandable text component
├── store/
│   ├── authStore.ts           # Auth + book API state (Zustand)
│   └── playerStore.ts         # Video player state
├── utils/
│   ├── secureStore.ts         # Token storage & JWT helpers
│   ├── refreshAccessToken.ts  # Silent token refresh logic
│   ├── types.ts               # Shared TypeScript types
│   ├── constant.ts            # App-wide constants (API base URL etc.)
│   └── DemoData.ts            # Offline fallback demo books
├── assets/                    # Icons, images, splash screen
├── app.json                   # Expo app config
├── eas.json                   # EAS Build config
├── tailwind.config.js         # NativeWind/Tailwind config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas-update/introduction/) — `npm install -g eas-cli`
- Android Studio / Xcode (for device simulators) or the **Expo Go** app on your phone

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Suggest.git
cd Suggest

# Install dependencies
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in browser
npm run web
```

---

## 🏗 Building with EAS

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) with three profiles:

| Profile | Distribution | Use Case |
|---|---|---|
| `development` | Internal | Dev client with hot reload |
| `preview` | Internal | QA / internal testing APK |
| `production` | Store | App store submission |

```bash
# Build a preview APK (Android)
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

---

## 📱 Screens Overview

### 🏠 Welcome Screen (`app/index.tsx`)
The landing page shown to unauthenticated users. Highlights key features (Video Reviews, AI Summaries, Photo Upload, Books) and provides options to **Browse as Guest** or **Join the Community**.

### 📚 Home Feed (`app/(tabs)/index.tsx`)
The main discovery screen. Features:
- Toggle between **Posts** (photo reviews) and **Videos** (video reviews)
- Genre filter dropdown with 15+ categories
- Infinite-scroll pagination via `FlashList`
- Pull-to-refresh
- Offline fallback to demo data

### ⬆️ Upload (`app/(tabs)/upload.tsx`)
Form to submit a new book or course recommendation:
- Title, caption/review, star rating, genre picker
- Photo or video attachment (up to 20 MB)
- Optional external link (Amazon, Goodreads, course URL, etc.)

### 👤 Profile (`app/(tabs)/profile.tsx`)
View and manage your own recommendations and account details.

### 🔐 Auth Flow (`app/(auth)/`)
- **Login** — email / password with JWT
- **Sign Up** — register and trigger OTP verification
- **OTP Verification** — confirm email before accessing the app

---

## 🔑 Authentication

- Access and refresh tokens are stored securely using `expo-secure-store`.
- On app launch, the refresh token is checked for expiry. If expired, the store is cleared and the user is redirected to the welcome screen.
- Silent token refresh is handled automatically before API calls via `refreshAccessToken.ts`.

---

## 🤝 Contributing

1. Fork the repo and create your feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m 'feat: add my feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Open a pull request

---

## 📄 License

This project is private. All rights reserved © Pradeep Kumar.

---

<p align="center">
  Made with ❤️ using Expo & React Native
</p>
