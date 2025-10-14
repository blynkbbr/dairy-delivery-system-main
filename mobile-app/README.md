# 📱 DairyFresh Mobile App

A comprehensive React Native mobile application for the Dairy Supply & Delivery System, built with Expo and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator
- Physical device with Expo Go app (recommended for testing)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator (Mac only)
npm run android # Android Emulator
npm run web     # Web browser
```

## 📱 App Overview

### 🎯 Purpose
DairyFresh mobile app provides customers and delivery agents with a seamless dairy product ordering and delivery management experience.

### 👥 User Types
- **Customers**: Browse products, place orders, manage subscriptions, track deliveries
- **Delivery Agents**: Manage routes, update delivery status, upload proof of delivery

## 🏗 Architecture

### 📁 Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # Custom button component
│   ├── TextInput.tsx    # Custom input component
│   └── Screen.tsx       # Screen wrapper component
├── constants/           # App constants and configuration
│   └── index.ts         # Colors, fonts, API endpoints, etc.
├── navigation/          # Navigation setup
│   ├── index.tsx        # Root navigator
│   ├── CustomerTabNavigator.tsx
│   └── AgentTabNavigator.tsx
├── screens/             # Screen components
│   ├── SplashScreen.tsx
│   ├── AuthScreen.tsx
│   ├── LoginScreen.tsx
│   ├── OTPVerificationScreen.tsx
│   ├── customer/        # Customer-specific screens
│   └── agent/           # Agent-specific screens
├── services/            # API and external services
│   └── api.ts           # Axios-based API client
├── store/               # State management (Zustand)
│   └── index.ts         # Auth, Cart, App state
├── types/               # TypeScript definitions
│   └── index.ts         # All interface definitions
└── utils/               # Utility functions
    └── index.ts         # Formatters, validators, helpers
```

## 🎨 Design System

### 🎨 Color Palette
- **Primary**: `#2563EB` (Blue) - Main brand color
- **Secondary**: `#FDE047` (Dairy Yellow) - Accent color
- **Success**: `#10B981` (Fresh Green) - Success states
- **Error**: `#EF4444` (Red) - Error states

### 🔤 Typography
- **Font Family**: Inter (System default with fallbacks)
- **Sizes**: xs(12) | sm(14) | md(16) | lg(18) | xl(20) | 2xl(24) | 3xl(30) | 4xl(36) | 5xl(48)

### 📏 Spacing System
- **xs**: 4px | **sm**: 8px | **md**: 16px | **lg**: 24px | **xl**: 32px | **2xl**: 48px | **3xl**: 64px

## 🔧 Features Implemented

### ✅ Core Infrastructure
- [x] **TypeScript Setup**: Complete type safety with 280+ interface definitions
- [x] **Navigation System**: Stack and tab navigation with role-based routing  
- [x] **State Management**: Zustand with AsyncStorage persistence
- [x] **API Integration**: Comprehensive axios client with interceptors
- [x] **Error Handling**: User-friendly error messages and retry logic

### ✅ Authentication System
- [x] **Splash Screen**: Animated loading with brand introduction
- [x] **Welcome Screen**: Feature overview and app introduction
- [x] **Phone Login**: OTP-based authentication with validation
- [x] **OTP Verification**: 6-digit code input with timer and resend
- [x] **Role Detection**: Automatic navigation based on user role

### ✅ UI Components
- [x] **Custom Button**: Multiple variants, sizes, and loading states
- [x] **Custom TextInput**: Icons, validation, and secure text entry
- [x] **Screen Wrapper**: Consistent layout and keyboard handling
- [x] **Navigation Tabs**: Role-specific tab navigation with badges

### ✅ API & State Integration
- [x] **Authentication Store**: Login, logout, token management
- [x] **Cart Store**: Shopping cart with persistence
- [x] **API Service**: All backend endpoints typed and implemented
- [x] **Notification System**: Toast notifications for user feedback

## 📱 Screen Flow

### Customer Journey
1. **Splash Screen** → App initialization and branding
2. **Auth Screen** → Feature introduction and welcome
3. **Login Screen** → Phone number input and validation
4. **OTP Verification** → 6-digit code verification with timer
5. **Customer Tabs** → Main app with 6 tabs:
   - 🏠 **Home**: Dashboard and quick actions
   - 🛍 **Products**: Browse dairy product catalog
   - 🛒 **Cart**: Shopping cart with checkout
   - 📋 **Orders**: Order history and tracking
   - 📅 **Subscriptions**: Recurring delivery management
   - 👤 **Profile**: Account settings and preferences

### Agent Journey
1. **Authentication** → Same login flow as customers
2. **Agent Tabs** → Delivery management with 4 tabs:
   - 📊 **Dashboard**: Delivery metrics and overview
   - 🗺 **Routes**: Daily route planning and navigation
   - 🚛 **Deliveries**: Delivery status and proof upload
   - 👤 **Profile**: Agent profile and settings

## 🔌 Backend Integration

### 🌐 API Configuration
```typescript
// Development
BASE_URL: 'http://localhost:3000/api'

// Production  
BASE_URL: 'https://your-production-api.com/api'
```

### 🔑 Authentication
- **Token Storage**: Secure AsyncStorage with auto-refresh
- **Interceptors**: Automatic token attachment and error handling
- **Session Management**: Auto-logout on token expiration

### 📡 Endpoints Integrated
- ✅ **Auth**: Login, OTP verification, logout
- ✅ **Users**: Profile, addresses, preferences
- ✅ **Products**: Catalog browsing, search, categories
- ✅ **Orders**: Placement, tracking, history
- ✅ **Subscriptions**: CRUD operations, delivery management
- ✅ **Deliveries**: Agent operations, status updates
- ✅ **Routes**: Route planning, optimization
- ✅ **Billing**: Invoices, payments, balance management

## 📋 Development Status

### ✅ Completed
- [x] Project setup and dependencies
- [x] TypeScript configuration and types
- [x] Navigation system with authentication flow
- [x] State management with Zustand stores
- [x] API client with complete endpoint coverage
- [x] Common UI components (Button, TextInput, Screen)
- [x] Authentication screens (Splash, Auth, Login, OTP)
- [x] Utility functions and helpers
- [x] Constants and configuration

### ✅ Recently Completed
- [x] Customer screens (Home, Products, Cart, Orders, Subscriptions, Profile)
- [x] Agent screens (Dashboard, Routes, Deliveries, Profile)
- [x] Push notifications setup with Expo Notifications
- [x] Notification settings management screen
- [x] Complete app configuration and dependencies
- [x] Final mobile app documentation

### 🚧 Ready for Enhancement
- [ ] Camera integration for delivery photos
- [ ] Location services for real-time tracking
- [ ] Offline support and data synchronization
- [ ] Advanced search and filtering
- [ ] Payment gateway integration
- [ ] In-app chat support
- [ ] Analytics and crash reporting

## 🛠 Technical Stack

### 📱 Core Technologies
- **React Native**: 0.74.5 (via Expo SDK 51)
- **TypeScript**: Full type safety
- **Expo**: Development platform and build tools

### 🧭 Navigation
- **@react-navigation/native**: Core navigation
- **@react-navigation/native-stack**: Stack navigation
- **@react-navigation/bottom-tabs**: Tab navigation

### 🗃 State Management
- **Zustand**: Lightweight state management
- **@react-native-async-storage/async-storage**: Persistent storage

### 🌐 API & HTTP
- **Axios**: HTTP client with interceptors
- **React Hook Form**: Form validation and management

### 🔔 Push Notifications
- **Expo Notifications**: Native push notifications
- **Expo Device**: Device information for notifications
- **Expo Constants**: App constants and configuration
- **Custom Notification Service**: Comprehensive notification management
- **Notification Context**: React context for app-wide notification handling
- **Settings Management**: User-controlled notification preferences

### 🎨 UI & Styling
- **@expo/vector-icons**: Icon library
- **expo-linear-gradient**: Gradient backgrounds
- **react-native-modal**: Enhanced modals

### 📱 Device APIs
- **expo-notifications**: Push notifications
- **expo-location**: GPS and location services
- **expo-image-picker**: Camera and photo library
- **expo-secure-store**: Secure token storage

## 🚀 Getting Started for Development

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### 2. Backend Connection
Ensure the backend API server is running on `http://localhost:3000` or update the `API_CONFIG.BASE_URL` in `src/constants/index.ts`.

### 3. Testing
```bash
# Run on iOS Simulator (Mac only)
npm run ios

# Run on Android Emulator
npm run android

# Run on physical device
npm start
# Then scan QR code with Expo Go app
```

## 📱 Demo Credentials

### For Testing
- **Phone Number**: Any 10-digit number (e.g., 9876543210)
- **OTP**: Check backend console for the generated OTP code
- **User Role**: Automatically determined by backend (customer/agent)

### Backend Setup Required
Make sure the backend server is running with:
```bash
cd ../backend
npm run dev  # Backend should be on http://localhost:3000
```

---

**DairyFresh Mobile App** - Fresh dairy delivery at your fingertips! 🥛📱