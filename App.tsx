import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
// @ts-ignore
import { StripeProvider } from '@stripe/stripe-react-native';
import { EXPO_STRIPE_PUBLISHABLE_KEY } from '@env';

const App = () => {
  const stripeKey = typeof EXPO_STRIPE_PUBLISHABLE_KEY === 'string' ? EXPO_STRIPE_PUBLISHABLE_KEY : '';

  if (!stripeKey) {
    console.error('Stripe publishable key is missing. Please set EXPO_STRIPE_PUBLISHABLE_KEY in .env file');
  }

  return (
    <StripeProvider publishableKey={stripeKey}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </StripeProvider>
  );
};

export default App;