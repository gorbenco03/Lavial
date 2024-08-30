import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { RootStackParamList, TravelDetailsType, Passenger, TravelDetails } from '../App'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EXPO_STRIPE_PUBLISHABLE_KEY, EXPO_STRIPE_RETURN_URL, EXPO_SERVER_URL } from '@env';

type CheckoutProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const CheckoutPage: React.FC<CheckoutProps> = ({ navigation, route }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [routePrice, setRoutePrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const { from, to, outboundDate, returnDate, passengers } = route.params;

  const fetchPrice = async () => {
    try {
      console.log("Fetching price with params:", { from, to, returnDate, passengers });
      const response = await fetch(`${EXPO_SERVER_URL}/get-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          returnDate,
          passengers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      const { routePrice, totalPriceWithFee } = await response.json();
      console.log("Received price data:", { routePrice, totalPriceWithFee });
      setRoutePrice(routePrice);
      setTotalPrice(totalPriceWithFee);
    } catch (error) {
      console.error('Error fetching price:', error);
      Alert.alert('Error', 'Could not fetch price. Please try again.');
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const totalAmount = totalPrice * 100;
      console.log("Fetching payment sheet params with totalAmount:", totalAmount);
      const response = await fetch(`${EXPO_SERVER_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmount }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch payment sheet params');
      }
  
      const { paymentIntent, ephemeralKey, customer } = await response.json();
      console.log("Received payment sheet params:", { paymentIntent, ephemeralKey, customer });
  
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
  
  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
      console.log("Initializing payment sheet with:", { paymentIntent, ephemeralKey, customer });
  
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Lavial",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        returnURL: `${EXPO_STRIPE_RETURN_URL}`,
        defaultBillingDetails: {
          name: '',
          email: '',
        }
      });
  
      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', 'Could not initialize payment sheet. Please try again.');
      } else {
        console.log("Payment sheet initialized successfully");
        setLoading(true);
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
    }
  };

  useEffect(() => {
    console.log("Running useEffect with dependencies:", { from, to, returnDate, passengers });
    fetchPrice();
  }, [from, to, returnDate, passengers]);

  useEffect(() => {
    if (totalPrice > 0) {
      console.log("Initializing payment sheet after price fetched...");
      initializePaymentSheet();
    }
  }, [totalPrice]);

  const openPaymentSheet = async () => {
    console.log("Opening payment sheet");
    const { error } = await presentPaymentSheet();

    if (error) {
      console.error("Error in presenting payment sheet:", error);
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      console.log("Payment sheet presented successfully, navigating to final page");
      navigateToFinalPage();
    }
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
    console.log("Navigating to final page with travelDetails:", travelDetails);
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
      arrivalTime: detail.departureTime, // Assuming the return arrival time is the same
    };
    timeAndPlace.push(reverseDetail);
  });

  const uniqueTimeAndPlace = Array.from(new Set(timeAndPlace.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));

  const getTravelDetails = (from: string, to: string): TravelDetails | undefined => {
    const details = uniqueTimeAndPlace.find((details) => details.from === from && details.to === to);
    return details;
  };

  const travelDetailsOutbound = getTravelDetails(from, to);
  const travelDetailsReturn = returnDate ? getTravelDetails(to, from) : undefined;

  return (
    <StripeProvider
      publishableKey='pk_live_51OFFW7L6XuzedjFNJe7O04UUU8PXg1c5OWpkH7Yui9Jork2L3OmwozH02dZZZFAW06csaHwhVpTWLXnhallwuWpX004LqvSxK5'
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
            
            {passenger.isStudent && (
              <View style={styles.detailsRow}>
                <FontAwesome name="graduation-cap" size={18} color="#333" />
                <Text style={styles.detailsExtras}>{passenger.studentIdSerial}</Text>
              </View>
            )}
          </View>
        ))}
        
        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Preț inițial</Text>
          <Text style={styles.totalPrice}>RON {routePrice}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxe suplimentare</Text>
          <View style={styles.detailsRow}>
            <FontAwesome name="info-circle" size={18} color="#333" />
            <Text style={styles.detailsExtras}>Taxă Stripe (2.9%)</Text>
          </View>
          <View style={styles.detailsRow}>
            <FontAwesome name="info-circle" size={18} color="#333" />
            <Text style={styles.detailsExtras}>Taxă fixă: RON 1.3</Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Total de plată</Text>
          <Text style={styles.totalPrice}>RON {totalPrice}</Text>
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