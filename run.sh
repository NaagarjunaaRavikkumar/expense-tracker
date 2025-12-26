#!/bin/bash
set -e

echo "=============================="
echo "⚡ Fixing React Native Android Build"
echo "=============================="

# Step 1: Stop Gradle daemons
echo "Stopping any running Gradle daemons..."
cd android
./gradlew --stop || true
cd ..

# Step 2: Clear Gradle caches
echo "Clearing Gradle caches..."
rm -rf ~/.gradle/caches/
rm -rf ~/.gradle/daemon/
rm -rf android/.gradle/

# Step 3: Remove node_modules and lock files
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Step 4: Reinstall dependencies
echo "Installing npm dependencies..."
npm install

# Step 5: Ensure correct React Native Gradle plugin version
echo "Installing @react-native/gradle-plugin@0.82.1..."
npm install --save-dev @react-native/gradle-plugin@0.82.1

# Step 6: Set compatible Kotlin version
echo "Setting Kotlin version to 1.9.24..."
sed -i '/kotlinVersion/d' android/build.gradle
echo 'ext.kotlinVersion = "1.9.24"' >> android/build.gradle

# Step 7: Optional Gradle properties adjustments
echo "Disabling Kotlin incremental compilation temporarily..."
echo 'kotlin.incremental=false' >> android/gradle.properties
echo 'kotlin.daemon.enabled=false' >> android/gradle.properties

# Step 8: Clean Android build
echo "Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Step 9: Build and run on Android
echo "Building and running React Native Android app..."
npx react-native run-android

echo "✅ Build script completed successfully!"
