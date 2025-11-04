#!/usr/bin/env node
// ^^^ asigură‑te că fișierul e executabil: chmod +x eas-hooks/pre-install-android.js

const { execSync } = require('child_process');
const path = require('path');

console.log('Installing Android SDK 35 and Build Tools 35.0.0...');

const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!androidHome) {
  console.error('ANDROID_HOME nu este definit');
  process.exit(1);
}

const sdkmanager = path.join(
  androidHome,
  'cmdline-tools',
  'latest',
  'bin',
  'sdkmanager'
);

try {
  // Acceptă licențele
  execSync(`yes | "${sdkmanager}" --licenses`, { stdio: 'inherit' });

  // Instalează pachetele
  execSync(
    `"${sdkmanager}" ` +
      `"platforms;android-35" ` +
      `"build-tools;35.0.0" ` +
      `"platform-tools"`,
    { stdio: 'inherit' }
  );

  console.log('Android SDK 35 installed successfully');
} catch (err) {
  console.error('Instalarea SDK‑ului a eșuat', err);
  process.exit(1);
}