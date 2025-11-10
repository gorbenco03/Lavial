import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
// @ts-ignore
import { StripeProvider } from '@stripe/stripe-react-native';
import { EXPO_STRIPE_PUBLISHABLE_KEY, EXPO_STRIPE_MERCHANT_ID } from '@env';

const App = () => {
  const stripeKey = typeof EXPO_STRIPE_PUBLISHABLE_KEY === 'string' ? EXPO_STRIPE_PUBLISHABLE_KEY : '';
  const merchantId = typeof EXPO_STRIPE_MERCHANT_ID === 'string' ? EXPO_STRIPE_MERCHANT_ID : '';

  if (!stripeKey) {
    console.error('Stripe publishable key is missing. Please set EXPO_STRIPE_PUBLISHABLE_KEY in .env file');
  }
  if (!merchantId) {
    console.warn('Stripe merchant ID is missing. Apple Pay will be disabled until EXPO_STRIPE_MERCHANT_ID is set.');
  }

  return (
    <StripeProvider
      publishableKey={stripeKey}
      merchantIdentifier={merchantId || undefined}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </StripeProvider>
  );
};

export default App;