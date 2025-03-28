import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
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
  const [outboundPrice, setOutboundPrice] = useState<number>(0);
  const [returnPrice, setReturnPrice] = useState<number>(0);
  const [outboundSinglePrice, setOutboundSinglePrice] = useState<number>(0);
  const [returnSinglePrice, setReturnSinglePrice] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes
  const {
    from,
    to,
    outboundDate,
    returnDate,
    passengers,
    selectedOutboundSeats = [],
    selectedReturnSeats = [],
    outboundReservationId, // Adăugat
    returnReservationId, // Adăugat
  } = route.params;

  // Utility to format date for the back-end request
  const formatDateForBackend = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };
  

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          Alert.alert('Timp expirat', 'Rezervarea locurilor a expirat. Te rugăm să alegi locurile din nou.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Curăță timer-ul la demontare
  }, []);

  // Format timp rămas
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCancelReservation = async () => {
    try {
      // Anulează rezervarea pentru tur
      const cancelOutbound = await fetch(`${EXPO_SERVER_URL}/seats/cancel-reservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: outboundReservationId }),
      });
      if (!cancelOutbound.ok) {
        const errorData = await cancelOutbound.json();
        throw new Error(errorData.error || 'Eroare la anularea rezervării pentru tur.');
      }

      // Anulează rezervarea pentru retur (dacă există)
      if (returnReservationId) {
        const cancelReturn = await fetch(`${EXPO_SERVER_URL}/seats/cancel-reservation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: returnReservationId }),
        });
        if (!cancelReturn.ok) {
          const errorData = await cancelReturn.json();
          throw new Error(errorData.error || 'Eroare la anularea rezervării pentru retur.');
        }
      }

      Alert.alert('Rezervare anulată', 'Rezervarea locurilor a fost anulată cu succes.');
      navigation.goBack(); // Întoarce-te la SeatSelectionPage
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      Alert.alert('Eroare', error.message);
    }
  };


  // Fetch price from your microservice
  const fetchPrice = async () => {
    try {
      console.log("Fetching price with params:", {
        from,
        to,
        date: formatDateForBackend(outboundDate),
        returnDate,
        passengers,
      });
      const response = await fetch(`${EXPO_SERVER_URL}/tickets/get-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          date: formatDateForBackend(outboundDate),
          returnDate: returnDate ? formatDateForBackend(returnDate) : undefined,
          passengers,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
  
      const {
        routePrice,
        totalPriceWithFee,
        outboundPrice,
        returnPrice,
        outboundSinglePrice,
        returnSinglePrice
      } = await response.json();
      
      setOutboundSinglePrice(outboundSinglePrice);
setReturnSinglePrice(returnSinglePrice);
      setRoutePrice(routePrice);
      setTotalPrice(totalPriceWithFee);
      setOutboundPrice(outboundPrice);
      setReturnPrice(returnPrice || 0);
      setRoutePrice(routePrice);
      setTotalPrice(totalPriceWithFee);
    } catch (error) {
      console.error('Error fetching price:', error);
      Alert.alert('Error', 'Could not fetch price. Please try again.');
    }
  };

  // Prepare Payment Sheet request
  const fetchPaymentSheetParams = async () => {
    try {
      const totalAmount = totalPrice * 100; // convert RON -> cents
      console.log("Fetching payment sheet params with totalAmount:", totalAmount);
      const response = await fetch(`${EXPO_SERVER_URL}/payments/payment-sheet`, {
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
  
  // Initialize Payment Sheet
  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
      console.log("Initializing payment sheet with:", { paymentIntent, ephemeralKey, customer });
  
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Lavial",
        customerId: customer,
        applePay: {
          merchantCountryCode: 'US',
        },
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
    console.log("Fetching price on mount or param changes...", { from, to, returnDate, passengers });
    fetchPrice();
  }, [from, to, returnDate, passengers]);

  // Once we have the total price, we init the payment
  useEffect(() => {
    if (totalPrice > 0) {
      console.log("Initializing payment sheet after price fetched...");
      initializePaymentSheet();
    }
  }, [totalPrice]);

  // Handler to open the Payment Sheet
  const openPaymentSheet = async () => {
    console.log("Opening payment sheet");
    const { error } = await presentPaymentSheet();

    if (error) {
      console.error("Error in presenting payment sheet:", error);
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      console.log("Payment sheet success, navigating to final page");
      navigateToFinalPage();
    }
  };

  // Navigate to final page, passing all travel data + seats
 // Navigate to final page, passing all travel data + seats
const navigateToFinalPage = async () => {
    try {
      // 1. Confirmă rezervarea temporară pentru tur
      if (outboundReservationId) {
        const confirmOutbound = await fetch(`${EXPO_SERVER_URL}/seats/confirm-reservation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: outboundReservationId }),
        });
        if (!confirmOutbound.ok) {
          const errorData = await confirmOutbound.json();
          throw new Error(errorData.error || 'Eroare la confirmarea rezervării pentru tur.');
        }
      }

      // 2. Confirmă rezervarea temporară pentru retur (dacă există)
      if (returnDate && returnReservationId) {
        const confirmReturn = await fetch(`${EXPO_SERVER_URL}/seats/confirm-reservation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: returnReservationId }),
        });
        if (!confirmReturn.ok) {
          const errorData = await confirmReturn.json();
          throw new Error(errorData.error || 'Eroare la confirmarea rezervării pentru retur.');
        }
      }

      // 3. Construim travelDetails
      const travelDetails: TravelDetailsType = {
        from,
        to,
        outboundDate,
        returnDate,
        passengers,
        outbound: {
          fromStation: travelDetailsOutbound?.fromStation || '',
          toStation: travelDetailsOutbound?.toStation || '',
          departureTime: travelDetailsOutbound?.departureTime || '',
          arrivalTime: travelDetailsOutbound?.arrivalTime || '',
          from: '',
          to: ''
        },
        return: travelDetailsReturn ? {
          fromStation: travelDetailsReturn.fromStation || '',
          toStation: travelDetailsReturn.toStation || '',
          departureTime: travelDetailsReturn.departureTime || '',
          arrivalTime: travelDetailsReturn.arrivalTime || '',
          from: to, // return trip starts from destination
          to: from // return trip ends at origin
        } : undefined,
        totalPrice,
        selectedOutboundSeats,
        selectedReturnSeats,
        outboundSinglePrice,
        returnSinglePrice,
        fromStation: '',
        toStation: ''
      };

      // 4. Navigăm la Final
      navigation.navigate('Final', { travelDetails });
    } catch (error: any) {
      console.error('Error confirming reservations:', error);
      Alert.alert('Eroare', error.message);
    }
  };

  // Format date for display
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Hard-coded route info
  const timeAndPlace: TravelDetails[] = [
    { from: 'Chișinău', to: 'Huși', 
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'BCR, Alexandru Ioan Cuza 3',
      departureTime: '16:00', arrivalTime: '19:00'
    },
    { from: 'Chișinău', to: 'Bârlad',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Pe Traseu',
      departureTime: '16:00', arrivalTime: '19:30'
    },
    { from: 'Chișinău', to: 'Adjud',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Sensul giratoriu la Onești, PROFI',
      departureTime: '16:00', arrivalTime: '20:45'
    },
    { from: 'Chișinău', to: 'Onești',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Sensul giratoriu la Onești, PROFI',
      departureTime: '16:00', arrivalTime: '21:30'
    },
    { from: 'Chișinău', to: 'Brașov',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Autogara Brașov, peronul nr. 7',
      departureTime: '16:00', arrivalTime: '23:59'
    },
    { from: 'Chișinău', to: 'Sibiu',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Autogara Transmixt, 1 Decembrie 1918',
      departureTime: '16:00', arrivalTime: '02:30'
    },
    { from: 'Chișinău', to: 'Alba Iulia',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Petrom, Bulevardul Ferdinand I nr. 76',
      departureTime: '16:00', arrivalTime: '03:45'
    },
    { from: 'Chișinău', to: 'Deva',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Langa gara, Carrefour Market',
      departureTime: '16:00', arrivalTime: '05:00'
    },
    { from: 'Chișinău', to: 'Lugoj',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Benzinaria PETROM de pe centura Lugoj',
      departureTime: '16:00', arrivalTime: '06:00'
    },
    { from: 'Chișinău', to: 'Timișoara',
      fromStation: 'Autogara NORD, platforma 9',
      toStation: 'Autogara Normandia',
      departureTime: '16:00', arrivalTime: '07:00'
    },
  ];

  // Return trip departure times
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
    return departureTimes[city] || '16:00'; // fallback
  };

  // Build reversed routes to handle return
  timeAndPlace.forEach(detail => {
    const reverseDetail: TravelDetails = {
      from: detail.to,
      to: detail.from,
      fromStation: detail.toStation,
      toStation: detail.fromStation,
      departureTime: getReturnDepartureTime(detail.to),
      arrivalTime: detail.departureTime,
    };
    timeAndPlace.push(reverseDetail);
  });

  // Make them unique
  const uniqueTimeAndPlace = Array.from(
    new Set(timeAndPlace.map(a => JSON.stringify(a)))
  ).map(a => JSON.parse(a));

  // Grab details from that array
  const getTravelDetails = (fromCity: string, toCity: string): TravelDetails | undefined => {
    const details = uniqueTimeAndPlace.find(
      (item) => item.from === fromCity && item.to === toCity
    );
    if (details && details.to === 'Chișinău') {
      return {
        ...details,
        arrivalTime: '07:00', // special case if destination is Chișinău
      };
    }
    return details;
  };

  const travelDetailsOutbound = getTravelDetails(from, to);
  const travelDetailsReturn = returnDate ? getTravelDetails(to, from) : undefined;

  // UI

  return (
    <StripeProvider
      publishableKey={EXPO_STRIPE_PUBLISHABLE_KEY}
      urlScheme={EXPO_STRIPE_RETURN_URL || 'your-url-scheme'}
      merchantIdentifier="merchant.com.lavial"
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Detalii despre călătorie</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formCard}>
          <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Timp rămas pentru rezervare: {formatTimeLeft(timeLeft)}
              </Text>
            </View>
            {/* Outbound Trip Details */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Detalii cursă (Tur)</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailsRow}>
                  <View style={styles.iconContainer}>
                    <FontAwesome name="calendar" size={18} color="#3D87E4" />
                  </View>
                  <Text style={styles.detailsText}>{formatDate(outboundDate)}</Text>
                </View>
                
                <View style={styles.routeContainer}>
                  <View style={styles.iconContainer}>
                    <FontAwesome name="location-arrow" size={16} color="#3D87E4" />
                  </View>
                  <Text style={styles.detailsText}>{from}</Text>
                  <View style={styles.arrowContainer}>
                    <FontAwesome name="long-arrow-right" size={16} color="#3D87E4" />
                  </View>
                  <Text style={styles.detailsText}>{to}</Text>
                </View>
                
                {travelDetailsOutbound && (
                  <>
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="clock-o" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        Plecare: {travelDetailsOutbound.departureTime}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="clock-o" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        Sosire: {travelDetailsOutbound.arrivalTime}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="map-marker" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        Stație plecare: {travelDetailsOutbound.fromStation}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="map-marker" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        Stație sosire: {travelDetailsOutbound.toStation}
                      </Text>
                    </View>
                  </>
                )}
                
                {selectedOutboundSeats.length > 0 && (
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="ticket" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      Locuri selectate: {selectedOutboundSeats.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Return Trip Details (if any) */}
            {returnDate && travelDetailsReturn && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Detalii cursă (Retur)</Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="calendar" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>{formatDate(returnDate)}</Text>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="location-arrow" size={16} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>{to}</Text>
                    <View style={styles.arrowContainer}>
                      <FontAwesome name="long-arrow-right" size={16} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>{from}</Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="clock-o" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      Plecare: {travelDetailsReturn.departureTime}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="clock-o" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      Sosire: {travelDetailsReturn.arrivalTime}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="map-marker" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      Stație plecare: {travelDetailsReturn.fromStation}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="map-marker" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      Stație sosire: {travelDetailsReturn.toStation}
                    </Text>
                  </View>
                  
                  {selectedReturnSeats.length > 0 && (
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="ticket" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        Locuri selectate: {selectedReturnSeats.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Passenger Info */}
            {passengers.map((passenger, index) => (
              <View key={index} style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  Informații personale despre pasagerul {index + 1}
                </Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="user-circle-o" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>
                      {passenger.name} {passenger.surname}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="phone" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>{passenger.phone}</Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name="envelope-o" size={18} color="#3D87E4" />
                    </View>
                    <Text style={styles.detailsText}>{passenger.email}</Text>
                  </View>
                  
                  {passenger.isStudent && (
                    <View style={styles.detailsRow}>
                      <View style={styles.iconContainer}>
                        <FontAwesome name="graduation-cap" size={18} color="#3D87E4" />
                      </View>
                      <Text style={styles.detailsText}>
                        {passenger.studentIdSerial}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            
            {/* Price Summary */}
<View style={styles.formSection}>
  <Text style={styles.sectionTitle}>Rezumat preț</Text>
  <View style={styles.detailsContainer}>
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>Preț tur (toți pasagerii)</Text>
      <Text style={styles.priceValue}>{outboundPrice} lei</Text>
    </View>

    {returnDate && (
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Preț retur (toți pasagerii)</Text>
        <Text style={styles.priceValue}>{returnPrice} lei</Text>
      </View>
    )}

    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>Taxă Stripe (1.5%) + 1.3 RON</Text>
      <Text style={styles.priceValue}>RON {(totalPrice - routePrice).toFixed(2)}</Text>
    </View>

    <View style={styles.totalRow}>
      <Text style={styles.priceLabel}>Total fără taxe</Text>
      <Text style={styles.priceValue}>{routePrice} lei</Text>
    </View>

    <View style={styles.totalRow}>
      <Text style={styles.priceLabel}>Total cu taxe</Text>
      <Text style={styles.priceValue}>{totalPrice} lei</Text>
    </View>
  </View>
</View>
            
            {/* Payment Button */}
            <TouchableOpacity
              style={styles.payButton}
              disabled={!loading}
              onPress={openPaymentSheet}
            >
              <Text style={styles.payButtonText}>Plată cu cardul</Text>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelReservation}
              disabled={timeLeft <= 0}
            >
              <Text style={styles.cancelButtonText}>Anulează rezervarea</Text>
              <MaterialCommunityIcons name="close-circle-outline" size={24} color="#FF4D4D" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </StripeProvider>
  );
};


export default CheckoutPage;

// -- Styles --

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D87E4',
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 16,
    color: '#FF4D4D',
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderColor: '#FF4D4D',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D87E4',
    marginBottom: 10,
  },
  detailsContainer: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  arrowContainer: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  detailsText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#333333',
  },
  priceValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D6E8FF',
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#3D87E4',
    fontWeight: 'bold',
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#3D87E4',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#3D87E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});