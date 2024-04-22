import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import CardDetailsComponent from '../CardDetailsComponent';

const CheckoutPage = ({ navigation, route }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { from, to, outboundDate, returnDate, passengers } = route.params;

  const studentDiscounts: any = {
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
    // Ensure to add reverse routes as well
  };


  const destinationPrices: any = {
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

  const handlePaymentPress = () => {
    setModalVisible(true);
    console.log("Travel details:", { from, to, outboundDate, returnDate, passengers });


  };


  const navigateToFinalPage = (paymentDetails: any) => {
    navigation.navigate('Final', {
      travelDetails: {
        from,
        to,
        outboundDate,
        returnDate,
        passengers,
        ...paymentDetails,
      }
    });
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Detalii despre călătorie</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalii cursă</Text>
        <View style={styles.detailsRow}>
          <FontAwesome name="calendar" size={18} color="#333" />
          <Text style={styles.detailsTime}>{outboundDate}</Text>
          <FontAwesome name="long-arrow-right" size={16} color="#333" />
          <Text style={styles.detailsTime}>{returnDate}</Text>
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

      <TouchableOpacity style={styles.payButton} onPress={handlePaymentPress}>
        <Text style={styles.payButtonText}>Plată cu cardul</Text>
        <MaterialCommunityIcons name="credit-card-outline" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Detalii pentru plată</Text>
            <CardDetailsComponent
              onConfirmPayment={({ cardNumber, expiryDate, cvc, cardHolderName }: any) => {

                navigateToFinalPage({ cardNumber, expiryDate, cvc, cardHolderName });
              }}
            />
            <TouchableOpacity style={styles.buttonClose} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    fontWeight: 'bold',
    color: '#fff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
});


export default CheckoutPage;
