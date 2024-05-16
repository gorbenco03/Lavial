// src/components/AnimatedSplashScreen.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const AnimatedSplashScreen = () => {
  useEffect(() => {
    // Ascunde splash screen-ul după 7 secunde
    const timeoutId = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 7000); // 7 secunde

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animationBus.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.text}>Lavial</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  animation: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default AnimatedSplashScreen;
