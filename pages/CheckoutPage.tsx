import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import CardDetailsComponent from '../CardDetailsComponent';

const CheckoutPage = ({navigation,  route } : any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { from, to, outboundDate, returnDate,   name, surname, email, phone, passportSerial, isStudent, studentIdSerial, studentIdImage } = route.params;

  const handlePaymentPress = () => {
    setModalVisible(true);
  };
  const navigateToFinalPage = (paymentDetails : any) => {
    // Prepare the details to be passed to the FinalPage
    const travelDetails = {
      from,
      to,
      name,
      surname,
      email,
      phone,
      passportSerial,
      outboundDate, 
      returnDate, 
      isStudent,
      studentIdSerial,
      ...paymentDetails // Include payment details like card number, etc.
    };
    // Navigate to the Final Page after payment confirmation
    navigation.navigate('Final', { travelDetails });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Detalii despre calatorie</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalii cursa</Text>
        <View style={styles.detailsRow}>
          {/* <Text style={styles.detailsTime}>{outboundDate}</Text>
          <MaterialCommunityIcons name="arrow-right-bold" size={20} />
          <Text style={styles.detailsTime}>{returnDate}</Text> */}
        </View>
        <Text style={styles.detailsRoute}>{from} → {to}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informații personale</Text>
        <Text style={styles.detailsName}>{name} {surname}</Text>
        <View style={styles.detailsRow}>
          <FontAwesome name="user-o" size={20} />
          <Text style={styles.detailsSeat}>Numărul de telefon: {phone}</Text>
        </View>
        <Text style={styles.detailsExtras}>Email: {email}</Text>
        <Text style={styles.detailsExtras}>Seria pasaportului: {passportSerial}</Text>
        {isStudent && (
          <Text style={styles.detailsExtras}>Seria legitimatiei de student: {studentIdSerial}</Text>
        )}
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalTitle}>Total de plată</Text>
        <Text style={styles.totalPrice}>€15</Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePaymentPress}>
        <Text style={styles.payButtonText}>Plată cu cardul</Text>
        <MaterialCommunityIcons name="credit-card-outline" size={24} />
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
              onConfirmPayment={({cardNumber, expiryDate, cvc, cardHolderName} : any) => {
                // Logic for confirming payment with your payment processor (e.g., Stripe)
                console.log('Detaliile cardului:', cardNumber, expiryDate, cvc, cardHolderName);
                // After payment is confirmed, navigate to the Final Page:
                navigateToFinalPage({ cardNumber, expiryDate, cvc, cardHolderName });
              }}
            />
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  totalSection: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailsTime: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  detailsRoute: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  detailsName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsSeat: {
    fontSize: 14,
    marginLeft: 5,
  },
  detailsExtras: {
    fontSize: 14,
    color: '#666',
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
