import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirstPage from './pages/FirstPage'; // Componenta ta modificată
import SecondPage from './pages/SecondPage'; // O altă pagină
import CheckoutPage from './pages/CheckoutPage';
import FinalPage from './pages/FinalPage';
import { StripeProvider } from '@stripe/stripe-react-native';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <StripeProvider
      publishableKey="pk_test_51OFFW7L6XuzedjFN3xvFwL6LgwZRwVUDlQmxNCkH8LEMAMDPGudlftiKO8M7GRt2MLbBodBlvvfu960qUIL4d3Ue00tjm9J6v6"
      urlScheme="your-url-scheme"  // required for 3D Secure and bank redirects
      // merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
    >
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Acasa">
        <Stack.Screen 
          name="Acasa" 
          component={FirstPage}
          options={{
            headerTitle: () => (
              <Image 
                source={require('./assets/logo-lavial.png')} // Înlocuiește cu calea corectă către imaginea logo-ului tău
                style={{ width: 168, height: 56, marginTop:-10}} // Ajustează dimensiunile după necesități
              />
            ),
            headerTitleAlign: 'center', // Opțional: centrează logo-ul dacă este necesar
          }}
        />
        <Stack.Screen 
          name="Detalii" 
          component={SecondPage} 
          options={{
            headerTitle: () => (
              <Image 
                source={require('./assets/logo-lavial.png')} // Înlocuiește cu calea corectă către imaginea logo-ului tău
                style={{ width: 168, height: 56, marginTop:-10}} // Ajustează dimensiunile după necesități
              />
            ),
            headerTitleAlign: 'center', // Opțional: centrează logo-ul dacă este necesar
          }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutPage} 
          options={{
            headerTitle: () => (
              <Image 
                source={require('./assets/logo-lavial.png')} // Înlocuiește cu calea corectă către imaginea logo-ului tău
                style={{ width: 168, height: 56, marginTop:-10}} // Ajustează dimensiunile după necesități
              />
            ),
            headerTitleAlign: 'center', // Opțional: centrează logo-ul dacă este necesar
          }}
        />
        <Stack.Screen 
          name="Final" 
          component={FinalPage} 
          options={{
            headerTitle: () => (
              <Image 
                source={require('./assets/logo-lavial.png')} // Înlocuiește cu calea corectă către imaginea logo-ului tău
                style={{ width: 168, height: 56, marginTop:-10}} // Ajustează dimensiunile după necesități
              />

            ),
            headerTitleAlign: 'center', // Opțional: centrează logo-ul dacă este necesar
            gestureEnabled: false, // Aceasta opțiune dezactivează gesturile de navigare
            headerBackVisible :  false,  // Aceasta opțiune ascunde butonul de înapoi
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </StripeProvider>
  );
};

export default App;
