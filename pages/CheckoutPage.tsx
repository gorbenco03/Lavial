import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { StripeProvider, useStripe} from '@stripe/stripe-react-native';
const CheckoutPage = ({ navigation, route }: any) => {
  const { initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(false)
  const { from, to, outboundDate, returnDate, passengers } = route.params;
  const fetchPaymentSheetParams = async () => {
    const totalAmount = calculateTotalPrice() * 100;
    const publishableKey = 'pk_test_51OFFW7L6XuzedjFN3xvFwL6LgwZRwVUDlQmxNCkH8LEMAMDPGudlftiKO8M7GRt2MLbBodBlvvfu960qUIL4d3Ue00tjm9J6v6'; 
    const response = await fetch(`http://192.168.1.6:3000/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totalAmount })
    });
    const { paymentIntent, ephemeralKey, customer} = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      publishableKey, 
      customer,
    };
  };
  
  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
      publishableKey,
    } = await fetchPaymentSheetParams();
    
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Lavial",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,

      defaultBillingDetails: {
        name: 'Chiril Gorbenco',
        email: 'chiril.gorbenco@icloud.com', 
      }
    });
    if (!error) {
      setLoading(true);
    }
  };
  useEffect(() => {
    initializePaymentSheet();
  }, []);
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } 
      else {
       
        navigateToFinalPage() ;
    }
  };

  const studentDiscounts: any = {
    "Chisinau-Timisoara": 50,
    "Timisoara-Chisinau": 50,
    "Chisinau-Deva": 45,
    "Deva-Chisinau": 45,
    "Chisinau-Sibiu": 35,
    "Sibiu-Chisinau": 35,
    "Chisinau-Alba Iulia": 40,
    "Alba Iulia-Chisinau": 40,
    "Chisinau-Brasov": 25,
    "Brasov-Chisinau": 25,
    // Ensure to add reverse routes as well 
  };


  const destinationPrices: any = {
    "Chisinau-Timisoara": 200,
    "Chisinau-Deva": 175,
    "Chisinau-Sibiu": 140,
    "Chisinau-Alba Iulia": 150,
    "Chisinau-Brasov": 125,
    "Chisinau-Onești": 90,
    "Chisinau-Adjud": 75,
    "Chisinau-Tecuci": 75,
    "Chisinau-Barlad": 50,
    "Chisinau-Husi": 50,
    // Add other destinations and prices here
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
    return passengers.reduce((total: any, passenger: { isStudent: any; }): any => {
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
    navigation.navigate('Final', {
      travelDetails: {
        from,
        to,
        outboundDate,
        returnDate,
        passengers,
      }
    });
  };

  const formatDate = (date: any) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };
  
  

  return (
    <StripeProvider
      publishableKey="pk_test_51OFFW7L6XuzedjFN3xvFwL6LgwZRwVUDlQmxNCkH8LEMAMDPGudlftiKO8M7GRt2MLbBodBlvvfu960qUIL4d3Ue00tjm9J6v6"


      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
     // required for Apple Pay
    >
    
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Detalii despre călătorie</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalii cursă</Text>
          <View style={styles.detailsRow}>
          <FontAwesome name="calendar" size={18} color="#333" />
  <Text style={styles.detailsTime}>{formatDate(outboundDate)}</Text>
  <FontAwesome name="long-arrow-right" size={16} color="#333" />
  <Text style={styles.detailsTime}>{returnDate ? formatDate(returnDate) : '---'}</Text>
  <FontAwesome name="calendar" size={18} color="#333" />
          </View>
          <Text style={styles.detailsRoute}>
            <FontAwesome name="location-arrow" size={16} color="#333" /> {from} <FontAwesome name="long-arrow-right" size={16} color="#333" /> {to}
          </Text>
        </View>
        {passengers.map((passenger: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; surname: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; phone: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; email: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; passportSerial: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; isStudent: any; studentIdSerial: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>Informații personale despre pasagerul {(index as number) + 1}</Text>
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3FDFD',
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
    backgroundColor: '#CBF1F5',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
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
    backgroundColor: '#CBF1F5',
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
    shadowOpacity: 0.2,
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
    backgroundColor: '#393E46',
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
    color: '#fff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },



});


export default CheckoutPage;


