import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  Alert, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FinalPage = ({navigation,  route }: any) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<Array<string>>([]);
  useEffect(() => {
    if (travelDetails) {
      const qrDataArray: Array<string> = [];

      travelDetails.passengers.forEach((passenger: any) => {
        console.log('Email-ul pasagerului:', passenger.email);

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
          tripType: 'Plecare'
        });

        qrDataArray.push(qrStringOutbound);

        if (travelDetails.returnDate) {
          // Generează un QR code separat pentru data de întoarcere, dacă există
          const qrStringReturn = JSON.stringify({
            name: passenger.name,
            surname: passenger.surname,
            phone: passenger.phone,
            email: passenger.email,
            passportSerial: passenger.passportSerial,
            isStudent: passenger.isStudent,
            studentIdSerial: passenger.studentIdSerial,
            from: travelDetails.to, // inversăm locurile pentru biletul de întoarcere
            to: travelDetails.from, // inversăm locurile pentru biletul de întoarcere
            date: travelDetails.returnDate,
            tripType: 'Retur'
          });

          qrDataArray.push(qrStringReturn);
        }
      });
     
      setQrData(qrDataArray);
    }
  }, [travelDetails]);

  const sendDataToBackend = async (qrDataArray: any, email:string)=> {
    try {
      const response = await fetch('http://172.20.10.3:3000/send-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData: qrDataArray,
           email: email}), // Make sure this matches what the server expects
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json(); // Try to parse as JSON
      console.log('Data sent to server:', responseData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Failed to parse JSON:', error);
      } else {
        console.error('Failed to send QR data:', error);
      }
    }
  };
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Acasa' }],
    });
  };

  useEffect(() => {
    // Assuming qrData is already populated with QR code data
    if (qrData.length > 0 && travelDetails.passengers.length > 0) {
      const emailToSend = travelDetails.passengers[0].email; 
      sendDataToBackend(qrData, emailToSend);
    }
  }, [qrData]);


  return (
    <ScrollView style={styles.containerScroll}>
      <View style={styles.container}>
      <Text style={styles.headerText}>Success!</Text>
      
          <View  style={styles.section}>
            <Text style={styles.ticketText}>Prezentati acest QR la sofer.</Text>
            <TouchableOpacity style={styles.closeButton}>
              <Icon name="event" size={20} color="#fff" />
              <Text style={styles.searchButtonText} onPress={goToHome}>Mergi la pagina principala </Text>
            </TouchableOpacity>
          </View>
      </View>
    </ScrollView>
  );
};

export default FinalPage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3FDFD',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerScroll: {
    backgroundColor: '#E3FDFD',
  },
  closeButton: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5,
    width: '70%',
    marginHorizontal: 5,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#CBF1F5',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    alignItems: 'center',
  },
  ticketText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 20,
  }
});
