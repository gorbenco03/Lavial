import 'react-native-reanimated';
import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirstPage from './pages/FirstPage'; 
import SecondPage from './pages/SecondPage'; 
import CheckoutPage from './pages/CheckoutPage';
import FinalPage from './pages/FinalPage';
import { StripeProvider } from '@stripe/stripe-react-native';

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
  return (
    <StripeProvider
      publishableKey='${STRIPE_PUBLISHABLE_KEY}' 
      urlScheme="your-url-scheme"  // required for 3D Secure and bank redirects
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Acasa">
          <Stack.Screen 
            name="Acasa" 
            component={FirstPage}
            options={{
              headerTitle: () => (
                <Image 
                  source={require('./assets/logo-lavial.png')}
                  style={{ width: 168, height: 56, marginTop:-10}}
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
                  style={{ width: 168, height: 56, marginTop:-10}}
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
                  style={{ width: 168, height: 56, marginTop:-10}}
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
                  style={{ width: 168, height: 56, marginTop:-10}}
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

export default App;
