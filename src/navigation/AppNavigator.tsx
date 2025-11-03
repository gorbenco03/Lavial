import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/SearchScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import PassengerScreen from '../screens/PassengerScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import TicketsScreen from '../screens/TicketsScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';

export type AppStackParamList = {
  Search: undefined;
  TripDetails: { from: string; to: string; date: string };
  Passenger: { from: string; to: string; date: string; price: number; currency: string; departureTime: string; arrivalTime: string };
  Checkout: { 
    bookingId: string; 
    total: number; 
    currency: string;
    from: string; 
    to: string; 
    date: string; 
    departureTime: string; 
    arrivalTime: string; 
    passengerName?: string 
  };
  Tickets: undefined;
  TicketDetail: { id: string };
};
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Search"
      screenOptions={{
        headerTitleAlign: 'center',
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Caută o Călătorie' }} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Detalii Călătorie' }} />
      <Stack.Screen name="Passenger" component={PassengerScreen} options={{ title: 'Date Pasager' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizare' }} />
      <Stack.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Biletele Mele' }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Bilet' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
