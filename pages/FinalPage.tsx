import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TravelDetailsType } from '../App'; 
import {EXPO_SERVER_URL} from '@env'
type FinalProps = NativeStackScreenProps<RootStackParamList, 'Final'>;

const FinalPage: React.FC<FinalProps> = ({ navigation, route }) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<string[]>([]);

  useEffect(() => {
    if (travelDetails) {
      const qrDataArray: string[] = [];
      const { outbound, return: returnDetails } = travelDetails;

      travelDetails.passengers.forEach((passenger) => {
        const qrStringOutbound = JSON.stringify({
          name: passenger.name,
          surname: passenger.surname,
          phone: passenger.phone,
          email: passenger.email,
          passportSerial: passenger.passportSerial,
          isStudent: passenger.isStudent,
          studentIdSerial: passenger.studentIdSerial,
          from: travelDetails.from,
          to: travelDetails.to,
          date: travelDetails.outboundDate,
          fromStation: outbound?.fromStation || '',
          toStation: outbound?.toStation || '',
          departureTime: outbound?.departureTime || '',
          arrivalTime: outbound?.arrivalTime || '',
          tripType: 'tur'
        });

        qrDataArray.push(qrStringOutbound);

        if (travelDetails.returnDate) {
          const qrStringReturn = JSON.stringify({
            name: passenger.name,
            surname: passenger.surname,
            phone: passenger.phone,
            email: passenger.email,
            passportSerial: passenger.passportSerial,
            isStudent: passenger.isStudent,
            studentIdSerial: passenger.studentIdSerial,
            from: travelDetails.to,
            to: travelDetails.from,
            date: travelDetails.returnDate,
            fromStation: returnDetails?.fromStation || '',
            toStation: returnDetails?.toStation || '',
            departureTime: returnDetails?.departureTime || '',
            arrivalTime: returnDetails?.arrivalTime || '',
            tripType: 'retur'
          });

          qrDataArray.push(qrStringReturn);
        }
      });

      setQrData(qrDataArray);
    }
  }, [travelDetails]);

  const sendDataToBackend = async (qrDataArray: string[], email: string) => {
    try {
      const requestData = JSON.stringify({ qrData: qrDataArray, email });
      console.log('Trimite către server:', requestData);
      const response = await fetch(`${EXPO_SERVER_URL}/send-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Data sent to server:', responseData);
    } catch (error) {
      console.error('Failed to send QR data:', error);
    }
  };

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Acasa' }],
    });
  };

  useEffect(() => {
    if (qrData.length > 0 && travelDetails.passengers.length > 0) {
      const emailToSend = travelDetails.passengers[0].email;
      sendDataToBackend(qrData, emailToSend);
    }
  }, [qrData]);

  return (
    <ScrollView style={styles.containerScroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Tranzacție finalizată cu succes!</Text>
        <View style={styles.animationContainer}>
          <LottieView 
            source={require('../assets/animation.json')} 
            autoPlay 
            loop={false} 
            style={styles.lottie}
            speed={0.8} // Adjust the speed here
          />
        </View>
        <Text style={styles.ticketText}>Biletele tale vor fi trimise pe mail.</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={goToHome}>
        <Text style={styles.searchButtonText}>Mergi la pagina principala</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
export default FinalPage;

const styles = StyleSheet.create({
  containerScroll: {
    flex: 1,
    backgroundColor: '#F0F0F0', // fundal gri deschis
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  ticketText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  payButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E90FF', // fundal albastru deschis
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});