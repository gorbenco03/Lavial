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
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [routePrice, setRoutePrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const { from, to, outboundDate, returnDate, passengers } = route.params;

  // Format date for backend API (YYYY-MM-DD)
  const formatDateForBackend = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch price from the backend when the component mounts
  const fetchPrice = async () => {
    try {
      const response = await fetch(`${EXPO_SERVER_URL}/get-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          date: formatDateForBackend(outboundDate),
          returnDate: returnDate ? formatDateForBackend(returnDate) : undefined,
          passengers,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch price');
      const { routePrice, totalPriceWithFee } = await response.json();
      setRoutePrice(routePrice);
      setTotalPrice(totalPriceWithFee);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch price. Please try again.');
    }
  };

  // Fetch Stripe payment sheet parameters when "Pay Now" is pressed
  const fetchPaymentSheetParams = async () => {
    const totalAmount = totalPrice * 100; // Convert to cents for Stripe
    const response = await fetch(`${EXPO_SERVER_URL}/payment-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalAmount }),
    });
    if (!response.ok) throw new Error('Failed to fetch payment sheet params');
    const { paymentIntent, ephemeralKey, customer } = await response.json();
    if (!paymentIntent || !ephemeralKey || !customer) {
      throw new Error('Missing parameters from payment sheet response');
    }
    return { paymentIntent, ephemeralKey, customer };
  };

  // Handle payment process when "Pay Now" button is pressed
  const handlePayment = async () => {
    setLoadingPayment(true);
    try {
      // Fetch payment sheet parameters only when the button is pressed
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();

      // Initialize the Stripe payment sheet with fetched parameters
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Lavial',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        returnURL: EXPO_STRIPE_RETURN_URL,
      });
      if (initError) {
        throw new Error('Could not initialize payment sheet');
      }

      // Present the payment sheet to the user
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert('Payment Failed', presentError.message);
      } else {
        // Navigate to the Final screen on successful payment
        navigation.navigate('Final', {
          travelDetails: {
            from,
            to,
            outboundDate,
            returnDate,
            passengers,
            totalPrice,
            outbound: travelDetailsOutbound,
            return: travelDetailsReturn,
            status: 'reserved'
          },
          
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not process payment. Please try again.');
    } finally {
      setLoadingPayment(false);
    }
  };

  // Handle reservation process when "Reserve Ticket" button is pressed
  const handleReservation = async () => {
    setLoadingReservation(true);
    try {
      const response = await fetch(`${EXPO_SERVER_URL}/reserve-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          date: formatDateForBackend(outboundDate),
          returnDate: returnDate ? formatDateForBackend(returnDate) : undefined,
          passengers,
          totalPrice,
        }),
      });
      if (!response.ok) throw new Error('Failed to reserve ticket');
      const { reservationId } = await response.json();

      navigation.navigate('Final', {
        travelDetails: {
          from,
          to,
          outboundDate,
          returnDate,
          passengers,
          totalPrice,
          outbound: travelDetailsOutbound,
          return: travelDetailsReturn,
          status: 'paid'
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Could not reserve ticket. Please try again.');
    } finally {
      setLoadingReservation(false);
    }
  };

  // Fetch price on component mount or when route params change
  useEffect(() => {
    fetchPrice();
  }, [from, to, outboundDate, returnDate, passengers]);

  // Format date for display (DD.MM.YYYY)
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Sample travel details (can be expanded or fetched from backend)
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
      toStation: 'In fata la Petrom, Bulevardul Ferdinand I nr. 76',
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

  // Generate return departure times for cities
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
    return departureTimes[city] || '16:00';
  };

  // Add reverse routes to travel details
  timeAndPlace.forEach(detail => {
    const reverseDetail: TravelDetails = {
      from: detail.to,
      fromStation: detail.toStation,
      to: detail.from,
      toStation: detail.fromStation,
      departureTime: getReturnDepartureTime(detail.to),
      arrivalTime: detail.departureTime,
    };
    timeAndPlace.push(reverseDetail);
  });

  const uniqueTimeAndPlace = Array.from(new Set(timeAndPlace.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));

  // Get travel details for a specific route
  const getTravelDetails = (from: string, to: string): TravelDetails | undefined => {
    const details = uniqueTimeAndPlace.find((details) => details.from === from && details.to === to);
    if (details && details.to === 'Chișinău') {
      return { ...details, arrivalTime: '07:00' };
    }
    return details;
  };

  const travelDetailsOutbound = getTravelDetails(from, to);
  const travelDetailsReturn = returnDate ? getTravelDetails(to, from) : undefined;

  return (
    <StripeProvider
      publishableKey={EXPO_STRIPE_PUBLISHABLE_KEY}
      urlScheme={EXPO_STRIPE_RETURN_URL}
      merchantIdentifier="merchant.com.lavial"
    >
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Detalii despre călătorie</Text>

        {/* Outbound Trip Details */}
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

        {/* Return Trip Details (if applicable) */}
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

        {/* Passenger Information */}
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

        {/* Initial Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Preț inițial</Text>
          <Text style={styles.totalPrice}>RON {routePrice}</Text>
        </View>

        {/* Additional Fees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxe suplimentare</Text>
          <View style={styles.detailsRow}>
            <FontAwesome name="info-circle" size={18} color="#333" />
            <Text style={styles.detailsExtras}>Taxă Stripe (1.5%) + 1.3 RON</Text>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Total de plată</Text>
          <Text style={styles.totalPrice}>RON {totalPrice}</Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.button, styles.payButton]}
          disabled={loadingPayment || !totalPrice}
          onPress={handlePayment}
        >
          <Text style={styles.buttonText}>
            {loadingPayment ? 'Procesare...' : 'Plată cu cardul'}
          </Text>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* Reservation Button */}
        <TouchableOpacity
          style={[styles.button, styles.reserveButton]}
          disabled={loadingReservation || !totalPrice}
          onPress={handleReservation}
        >
          <Text style={styles.buttonText}>
            {loadingReservation ? 'Rezervare...' : 'Rezervă bilet'}
          </Text>
          <MaterialCommunityIcons name="ticket-outline" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </StripeProvider>
  );
};

export default CheckoutPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  payButton: {
    backgroundColor: '#1E90FF', // Blue for payment
  },
  reserveButton: {
    backgroundColor: '#32CD32', // Green for reservation
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});