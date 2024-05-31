import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirstPage from './pages/FirstPage';
import SecondPage from './pages/SecondPage';
import CheckoutPage from './pages/CheckoutPage';
import FinalPage from './pages/FinalPage';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { EXPO_STRIPE_PUBLISHABLE_KEY } from '@env';
import { useFonts } from 'expo-font';

export interface Passenger {
  name: string;
  surname: string;
  phone: string;
  email: string;
  passportSerial: string;
  isStudent: boolean;
  studentIdSerial: string;
}

export interface TravelDetails {
  from: string;
  fromStation: string;
  to: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
}

export interface RouteParams {
  from: string;
  to: string;
  outboundDate: string;
  returnDate?: string;
  passengers: Passenger[];
}

export type RootStackParamList = {
  Splash: undefined;
  Acasa: undefined;
  Detalii: undefined;
  Checkout: RouteParams;
  Final: { travelDetails: TravelDetailsType };
};

export interface TravelDetailsType {
  from: string;
  to: string;
  outboundDate: string;
  returnDate?: string;
  passengers: Passenger[];
  outbound: TravelDetails | undefined;
  return: TravelDetails | undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [fontsLoaded] = useFonts({
    'ClashGrotesk-Regular': require('./assets/fonts/ClashGrotesk-Regular.otf'),
    'ClashGrotesk-Semibold': require('./assets/fonts/ClashGrotesk-Semibold.otf'),
    'ClashGrotesk-Medium': require('./assets/fonts/ClashGrotesk-Medium.otf'),
    'ClashGrotesk-Light': require('./assets/fonts/ClashGrotesk-Light.otf'),
    'ClashGrotesk-Extralight': require('./assets/fonts/ClashGrotesk-Extralight.otf'),
    'ClashGrotesk-Bold': require('./assets/fonts/ClashGrotesk-Bold.otf'),
  });
  useEffect(() => {
    async function prepare() {
      try {
        // Prevent splash screen from auto hiding
        await SplashScreen.preventAutoHideAsync();
        // Artificial delay for the splash screen (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <StripeProvider
      publishableKey={EXPO_STRIPE_PUBLISHABLE_KEY}
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Acasa">
          <Stack.Screen
            name="Splash"
            component={SplashScreenComponent}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Acasa"
            component={FirstPage}
            options={{
              headerTitle: () => (
                <Image
                  source={require('./assets/logo-lavial.png')}
                  style={{ width: 168, height: 56, marginTop: -10 }}
                />
              ),
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Detalii"
            component={SecondPage}
            options={{
              headerTitle: () => (
                <Image
                  source={require('./assets/logo-lavial.png')}
                  style={{ width: 168, height: 56, marginTop: -10 }}
                />
              ),
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutPage}
            options={{
              headerTitle: () => (
                <Image
                  source={require('./assets/logo-lavial.png')}
                  style={{ width: 168, height: 56, marginTop: -10 }}
                />
              ),
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Final"
            component={FinalPage}
            options={{
              headerTitle: () => (
                <Image
                  source={require('./assets/logo-lavial.png')}
                  style={{ width: 168, height: 56, marginTop: -10 }}
                />
              ),
              headerTitleAlign: 'center',
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
};

const SplashScreenComponent = () => {
  useEffect(() => {
    const prepare = async () => {
      // This is where you can load resources before hiding the splash screen
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/splashScreen.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
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
});

export default App;
