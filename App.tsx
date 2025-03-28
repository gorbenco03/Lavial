import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider } from '@stripe/stripe-react-native';
import { EXPO_STRIPE_PUBLISHABLE_KEY } from '@env';
import FirstPage from './pages/FirstPage';
import SecondPage from './pages/SecondPage';
import CheckoutPage from './pages/CheckoutPage';
import FinalPage from './pages/FinalPage';

import ContactPage from 'pages/ContactPage';
import SeatSelectionPage from 'pages/SeatSelectionPage';
import ProfilePage from 'pages/ProfilePage';
import {Travel} from './components/profile/TravelList';






// Interfaces
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
  selectedOutboundSeats: number[];
  selectedReturnSeats: number[];
}

export interface TravelDetailsType {
  from: string;
  to: string;
  fromStation: string, 
  toStation: string, 
  outboundDate: string;
  returnDate?: string;
  passengers: Passenger[];
  outbound: TravelDetails | undefined;
  return: TravelDetails | undefined;
  totalPrice: number;
  selectedOutboundSeats: number[];
  selectedReturnSeats: number[];
  outboundSinglePrice : number; 
  returnSinglePrice : number
}

// Stack navigator type
export type RootStackParamList = {
  Splash: undefined;
  Acasa: undefined;
  Detalii: undefined;
  SeatSelection: undefined;
  Locuri: undefined;
  Checkout: RouteParams & {
    outboundReservationId?: string;
    returnReservationId?: string;
  };
  Final: { travelDetails: TravelDetailsType };
  TicketView: { travel: Travel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => (
  <Stack.Navigator initialRouteName="Acasa">
    <Stack.Screen
      name="Acasa"
      component={FirstPage}
      options={{
        headerTitle: () => (
          <Image
            source={require('./assets/logo-lavial.jpeg')}
            style={{ width: 140, height: 35, marginTop: 5 }}
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
            source={require('./assets/logo-lavial.jpeg')}
            style={{ width: 140, height: 35, marginTop: 5 }}
          />
        ),
        headerTitleAlign: 'center',
      }}
    />
       <Stack.Screen
      name="Locuri"
      component={SeatSelectionPage}
      options={{
        headerTitle: () => (
          <Image
            source={require('./assets/logo-lavial.jpeg')}
            style={{ width: 140, height: 35, marginTop: 5 }}
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
            source={require('./assets/logo-lavial.jpeg')}
            style={{ width: 140, height: 35, marginTop: 5 }}
          />
        ),
        headerTitleAlign: 'center',
      }}
    />
    <Stack.Screen
      name="Final"
      component={FinalPage}
      options={{ gestureEnabled: false, headerBackVisible: false, headerTitleAlign: 'center',  headerTitle: () => (
        <Image
          source={require('./assets/logo-lavial.jpeg')}
          style={{ width: 140, height: 35, marginTop: 5 }}
        />    ),}}
    />
   
  </Stack.Navigator>
);

// Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
  // Poți seta stilul general pentru tab bar aici
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: 'help-circle' | 'home' | 'home-outline' | 'person' | 'person-outline' | 'information-circle' | 'information-circle-outline' = 'help-circle'; // fallback

      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'Profile') {
        iconName = focused ? 'person' : 'person-outline';
      } else if (route.name === 'Contact') {
        iconName = focused ? 'information-circle' : 'information-circle-outline';
      }

      // returnăm iconița folosind Ionicons
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    // Alte opțiuni de personalizat:
    tabBarActiveTintColor: '#2B6CB0',  // culoarea iconiței textului când este activ
    tabBarInactiveTintColor: '#555',   // culoarea iconiței / textului inactiv
  })}
>
  <Tab.Screen
    name="Home"
    component={HomeStackNavigator}
    options={{
    headerShown: false,
    }}
  />
  <Tab.Screen
    name="Profile"
    component={ProfilePage}
    options={{
      headerTitle: () => (
        <Image
          source={require('./assets/logo-lavial.jpeg')}
          style={{ width: 140, height: 35, marginTop: 5 }}
        />
      ),
      headerTitleAlign: 'center',
    }}
  />
  <Tab.Screen
    name="Contact"
    component={ContactPage}
    options={{
      headerTitle: () => (
        <Image
          source={require('./assets/logo-lavial.jpeg')}
          style={{ width: 140, height: 35, marginTop: 5 }}
        />
      ),
      headerTitleAlign: 'center',
    }}
  />
</Tab.Navigator>
);

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
        await SplashScreen.preventAutoHideAsync();
        await new Promise(resolve => setTimeout(resolve, 3000));
      } finally {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) return null;

  return (

    <StripeProvider publishableKey={EXPO_STRIPE_PUBLISHABLE_KEY} urlScheme="your-url-scheme">
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </StripeProvider>
    
    
  );
};

// Splash Screen Component
const SplashScreenComponent = () => {
  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
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