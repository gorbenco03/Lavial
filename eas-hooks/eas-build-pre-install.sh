#!/usr/bin/env bash

set -eox pipefail

echo "📦 Installing Android SDK 35 and Build Tools 35.0.0..."

# Accept toate licențele
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true

# Instalează SDK 35
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "platform-tools" || true

echo "✅ Android SDK 35 installed successfully"
