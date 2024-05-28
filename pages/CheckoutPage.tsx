import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { RootStackParamList, TravelDetailsType, Passenger, TravelDetails } from '../App'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {EXPO_STRIPE_PUBLISHABLE_KEY, EXPO_STRIPE_RETURN_URL , EXPO_SERVER_URL } from '@env'
type CheckoutProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const CheckoutPage: React.FC<CheckoutProps> = ({ navigation, route }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const { from, to, outboundDate, returnDate, passengers } = route.params;

  const fetchPaymentSheetParams = async () => {
    try {
      console.log('Fetching payment sheet params...');
      const totalAmount = calculateTotalPrice() * 100;
      const response = await fetch(`${EXPO_SERVER_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmount }),
      });
  
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch payment sheet params');
      }
  
      const { paymentIntent, ephemeralKey, customer } = await response.json();
  
      if (!paymentIntent || !ephemeralKey || !customer) {
        throw new Error('Missing parameters from payment sheet response');
      }
  
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      Alert.alert('Error', 'Could not fetch payment sheet parameters. Please try again.');
      throw error;
    }
  };
  
  const testFetch = async () => {
    try {
      const response = await fetch(`${EXPO_SERVER_URL}/health`);
      const data = await response.json();
      console.log('Test fetch response:', data);
    } catch (error) {
      console.error('Test fetch error:', error);
    }
  };
  
  useEffect(() => {
    testFetch();
  }, []);
  
  
  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
  
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Lavial",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        returnURL: `${EXPO_STRIPE_RETURN_URL}`,
        defaultBillingDetails: {
          name: 'Chiril Gorbenco',
          email: 'chiril.gorbenco@icloud.com',
        }
      });
  
      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', 'Could not initialize payment sheet. Please try again.');
      } else {
        setLoading(true);
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
    }
  };
  

  useEffect(() => {
    initializePaymentSheet();
   
  }, [from, to, returnDate]);

  console.log(process.env.EXPO_SERVER_URL); 
  console.log(process.env.EXPO_STRIPE_PUBLISHABLE_KEY); 
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      navigateToFinalPage();
    }
  };

  const studentDiscounts: Record<string, number> = {
    "Chișinău-Timișoara": 50,
    "Timișoara-Chișinău": 50,
    "Chișinău-Deva": 45,
    "Deva-Chișinău": 45,
    "Chișinău-Sibiu": 35,
    "Sibiu-Chișinău": 35,
    "Chișinău-Alba Iulia": 40,
    "Alba Iulia-Chișinău": 40,
    "Chișinău-Brașov": 25,
    "Brașov-Chișinău": 25,
  };

  const destinationPrices: Record<string, number> = {
    "Chișinău-Timișoara": 200,
    "Chișinău-Deva": 175,
    "Chișinău-Sibiu": 140,
    "Chișinău-Alba Iulia": 150,
    "Chișinău-Brașov": 125,
    "Chișinău-Onești": 90,
    "Chișinău-Adjud": 75,
    "Chișinău-Tecuci": 75,
    "Chișinău-Bârlad": 50,
    "Chișinău-Huși": 50,
    "Chișinău-Lugoj": 200,
  };

  // Ensure reverse direction has the same prices
  Object.keys(destinationPrices).forEach(key => {
    const [start, end] = key.split('-');
    const reverseKey = `${end}-${start}`;
    if (!destinationPrices[reverseKey]) {
      destinationPrices[reverseKey] = destinationPrices[key];
    }
  });

  const calculateTotalPrice = () => {
    return passengers.reduce((total: number, passenger: Passenger) => {
      const basePrice = destinationPrices[`${from}-${to}`] || 0;
      let totalPrice = basePrice;

      if (returnDate) {
        totalPrice += destinationPrices[`${to}-${from}`] || 0;
      }

      if (passenger.isStudent) {
        totalPrice -= studentDiscounts[`${from}-${to}`] || 0;
        if (returnDate) {
          totalPrice -= studentDiscounts[`${to}-${from}`] || 0;
        }
      }

      return total + totalPrice;
    }, 0);
  };

  const navigateToFinalPage = () => {
    const travelDetails: TravelDetailsType = {
      from,
      to,
      outboundDate,
      returnDate,
      passengers,
      outbound: travelDetailsOutbound,
      return: travelDetailsReturn,
    };
   
    navigation.navigate('Final', { travelDetails });
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const timeAndPlace: TravelDetails[] = [
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Huși', 
      toStation: 'În fața la BCR, strada Alexandru Ioan Cuza 3',
      departureTime: '16:00', 
      arrivalTime: '19:00' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Bârlad', 
      toStation: 'Pe Traseu',
      departureTime: '16:00', 
      arrivalTime: '19:30' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Adjud', 
      toStation: 'După sensul giratoriu spre Onești, vizavi de magazinul PROFI',
      departureTime: '16:00', 
      arrivalTime: '20:45' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Onești', 
      toStation: 'După sensul giratoriu spre Onești, vizavi de magazinul PROFI',
      departureTime: '16:00', 
      arrivalTime: '21:30' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Brașov', 
      toStation: 'Autogara Internationala Stadionul Municipal din Brasov, peronul nr. 7',
      departureTime: '16:00', 
      arrivalTime: '23:59' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Sibiu', 
      toStation: 'Autogara Transmixt,Piața 1 Decembrie 1918, 6',
      departureTime: '16:00', 
      arrivalTime: '02:30' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Alba Iulia', 
      toStation: 'Autogara Transmixt, Adresă Piața 1 Decembrie 1918, 6',
      departureTime: '16:00', 
      arrivalTime: '03:45' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Deva', 
      toStation: 'Langa gara, Carrefour Market',
      departureTime: '16:00', 
      arrivalTime: '05:00' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Lugoj', 
      toStation: 'Benzinaria PETROM de pe centura Lugoj',
      departureTime: '16:00', 
      arrivalTime: '06:00' 
    },
    { 
      from: 'Chișinău', 
      fromStation: 'Autogara NORD, platforma 9',
      to: 'Timișoara', 
      toStation: 'Autogara Normandia',
      departureTime: '16:00', 
      arrivalTime: '07:00' 
    },
  ];

  const getReturnDepartureTime = (city: string) => {
    const departureTimes: Record<string, string> = {
      'Timișoara': '16:00',
      'Lugoj': '17:00',
      'Deva': '18:00',
      'Alba Iulia': '19:15',
      'Sibiu': '20:30',
      'Brașov': '23:01',
      'Onești': '01:30',
      'Adjud': '02:15',
      'Bârlad': '03:30',
      'Huși': '04:00',
    };
    
    return departureTimes[city] || '16:00'; // Default time if city not found
  };

  timeAndPlace.forEach(detail => {
    const reverseDetail: TravelDetails = {
      from: detail.to,
      fromStation: detail.toStation,
      to: detail.from,
      toStation: detail.fromStation,
      departureTime: getReturnDepartureTime(detail.to),
      arrivalTime: '07:00', // Assuming the return arrival time is the same
    };
    timeAndPlace.push(reverseDetail);
  });

  const getTravelDetails = (from: string, to: string): TravelDetails | undefined => {
    const details = uniqueTimeAndPlace.find((details) => details.from === from && details.to === to);
    return details;
  };

  const uniqueTimeAndPlace = Array.from(new Set(timeAndPlace.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));

  const travelDetailsOutbound = getTravelDetails(from, to);
  const travelDetailsReturn = returnDate ? getTravelDetails(to, from) : undefined;

  return (
    <StripeProvider
      publishableKey={EXPO_STRIPE_PUBLISHABLE_KEY}
      urlScheme={EXPO_STRIPE_RETURN_URL}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Detalii despre călătorie</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalii cursă (Tur)</Text>
          <View style={styles.detailsRow}>
            <FontAwesome name="calendar" size={18} color="#333" />
            <Text style={styles.detailsTime}>{formatDate(outboundDate)}</Text>
          </View>
          <Text style={styles.detailsRoute}>
            <FontAwesome name="location-arrow" size={16} color="#333" /> {from} <FontAwesome name="long-arrow-right" size={16} color="#333" /> {to}
          </Text>
          {travelDetailsOutbound && (
            <>
              <View style={styles.detailsRow}>
                <FontAwesome name="clock-o" size={18} color="#333" />
                <Text style={styles.detailsTime}>Plecare: {travelDetailsOutbound.departureTime}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="clock-o" size={18} color="#333" />
                <Text style={styles.detailsTime}>Sosire: {travelDetailsOutbound.arrivalTime}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="map-marker" size={18} color="#333" />
                <Text style={styles.detailsTime}>Stație plecare: {travelDetailsOutbound.fromStation}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="map-marker" size={18} color="#333" />
                <Text style={styles.detailsTime}>Stație sosire: {travelDetailsOutbound.toStation}</Text>
              </View>
            </>
          )}
        </View>

        {returnDate && travelDetailsReturn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalii cursă (Retur)</Text>
            <View style={styles.detailsRow}>
              <FontAwesome name="calendar" size={18} color="#333" />
              <Text style={styles.detailsTime}>{formatDate(returnDate)}</Text>
            </View>
            <Text style={styles.detailsRoute}>
              <FontAwesome name="location-arrow" size={16} color="#333" /> {to} <FontAwesome name="long-arrow-right" size={16} color="#333" /> {from}
            </Text>
            <>
              <View style={styles.detailsRow}>
                <FontAwesome name="clock-o" size={18} color="#333" />
                <Text style={styles.detailsTime}>Plecare: {travelDetailsReturn.departureTime}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="clock-o" size={18} color="#333" />
                <Text style={styles.detailsTime}>Sosire: {travelDetailsReturn.arrivalTime}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="map-marker" size={18} color="#333" />
                <Text style={styles.detailsTime}>Stație plecare: {travelDetailsReturn.fromStation}</Text>
              </View>
              <View style={styles.detailsRow}>
                <FontAwesome name="map-marker" size={18} color="#333" />
                <Text style={styles.detailsTime}>Stație sosire: {travelDetailsReturn.toStation}</Text>
              </View>
            </>
          </View>
        )}

        {passengers.map((passenger: Passenger, index: number) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>Informații personale despre pasagerul {index + 1}</Text>
            <Text style={styles.detailsName}>
              <FontAwesome name="user-circle-o" size={20} color="#333" /> {passenger.name} {passenger.surname}
            </Text>
            <View style={styles.detailsRow}>
              <FontAwesome name="phone" size={20} color="#333" />
              <Text style={styles.detailsSeat}>{passenger.phone}</Text>
            </View>
            <View style={styles.detailsRow}>
              <FontAwesome name="envelope-o" size={20} color="#333" />
              <Text style={styles.detailsExtras}>{passenger.email}</Text>
            </View>
            <View style={styles.detailsRow}>
              <FontAwesome name="id-card-o" size={18} color="#333" />
              <Text style={styles.detailsExtras}>{passenger.passportSerial}</Text>
            </View>
            {passenger.isStudent && (
              <View style={styles.detailsRow}>
                <FontAwesome name="graduation-cap" size={18} color="#333" />
                <Text style={styles.detailsExtras}>{passenger.studentIdSerial}</Text>
              </View>
            )}
          </View>
        ))}
        
        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Total de plată</Text>
          <Text style={styles.totalPrice}>RON {calculateTotalPrice()}</Text>
        </View>
        
        <TouchableOpacity style={styles.payButton} disabled={!loading} onPress={openPaymentSheet}>
          <Text style={styles.payButtonText}>Plată cu cardul</Text>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </StripeProvider>
  );
};

export default CheckoutPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0', // fundal gri deschis
  },
  headerText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#FFFFFF', // fundal alb pentru secțiune
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // umbră mai subtilă
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsTime: {
    fontSize: 16,
    color: '#555',
    margin: 8,
  },
  detailsRoute: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    margin: 8,
  },
  detailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsSeat: {
    fontSize: 16,
    margin: 8,
    color: '#555',
  },
  detailsExtras: {
    fontSize: 16,
    color: '#666',
    margin: 8,
  },
  totalSection: {
    backgroundColor: '#FFFFFF', // fundal alb pentru secțiunea totală
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // umbră mai subtilă
    shadowRadius: 2,
    elevation: 3,
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E90FF', // fundal albastru deschis
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#fff', // culoarea textului alb
  },
});