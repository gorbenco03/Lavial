import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FinalPage = ({ navigation, route }: any) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<Array<string>>([]);

  useEffect(() => {
    if (travelDetails) {
      const qrDataArray: Array<string> = [];
      const { outbound, return: returnDetails } = travelDetails;

      travelDetails.passengers.forEach((passenger: any) => {
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
          tripType: 'Plecare'
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
            tripType: 'Retur'
          });

          qrDataArray.push(qrStringReturn);
        }
      });

      setQrData(qrDataArray);
    }
  }, [travelDetails]);

  const sendDataToBackend = async (qrDataArray: any, email: string) => {
    try {
      const requestData = JSON.stringify({ qrData: qrDataArray, email });
      console.log('Trimite către server:', requestData);
      const response = await fetch('http://192.168.3.35:3000/send-qr', {
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
    <ScrollView style={styles.containerScroll}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Success!</Text>

        <View style={styles.section}>
          <Text style={styles.ticketText}>Prezentati acest QR la sofer.</Text>
          <TouchableOpacity style={styles.closeButton} onPress={goToHome}>
            <Icon name="event" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>Mergi la pagina principala</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FinalPage;

const styles = StyleSheet.create({
  containerScroll: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  ticketText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 5,
  },
});
