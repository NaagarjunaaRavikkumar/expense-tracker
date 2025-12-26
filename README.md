# FinTrack Hub

A serverless, local-first React Native mobile app for tracking home loans and expenses.

## Features

### 🏡 Multi-Home-Loan Tracker
- **Loan Management**: Track multiple loans with reducing balance.
- **Variable Interest Rates**: Handle interest rate changes over time.
- **Pre-Payments**: Record lump-sum payments to reduce tenure or EMI.
- **Amortization**: View detailed monthly schedules and charts.

### 💸 Expense Manager
- **Transactions**: Track expenses, income, and transfers.
- **Accounts**: Manage multiple accounts (Cash, Bank, etc.).
- **Offline First**: All data stored locally using MMKV (encrypted).

### ☁️ Backup & Sync
- **Google Drive**: Optional backup and restore to your personal Google Drive.
- **Secure**: Data is encrypted before upload (implementation pending key management).

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Setup**
   - Ensure Android Studio is installed and an emulator is running.

4. **Google Sign-In Configuration**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/).
   - Enable **Google Drive API** and **Google Sign-In API**.
   - Create OAuth 2.0 credentials:
     - **Android Client**: 
       - Package name: `com.fintrackhub`
       - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (debug)
     - The Web Client ID is already configured in `src/services/auth/googleAuth.ts`.

5. **Run the App**
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Architecture
- **State Management**: Zustand with MMKV persistence.
- **Navigation**: React Navigation (Bottom Tabs + Native Stack).
- **UI**: React Native Paper.
- **Charts**: React Native Gifted Charts.
