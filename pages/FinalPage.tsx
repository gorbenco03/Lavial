import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  Alert, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FinalPage = ({ route }: any) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<Array<string>>([]);
  useEffect(() => {
    if (travelDetails) {
      const qrDataArray: Array<string> = [];

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
          tripType: 'Outbound'
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
            tripType: 'Return'
          });

          qrDataArray.push(qrStringReturn);
        }
      });

      setQrData(qrDataArray);
    }
  }, [travelDetails]);



  

  const handleSendEmail = async ( passengerIndex: number) => {
    try {
      const passengerEmail = travelDetails.passengers.email ; // Presupunând că obiectul passenger conține câmpul email
      const response = await fetch('http://192.168.3.35:3000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: passengerEmail, // Utilizați adresa de email a pasagerului
          tickets: [
            { type: 'Outbound', data: qrDataItem.outbound.data },
            { type: 'Return', data: qrDataItem.return ? qrDataItem.return.data : null }
          ]
        }),
      });
      const result = await response.text();
      Alert.alert('Email Sent', result.message);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send email');
    }
  };


  return (
    <ScrollView style={styles.containerScroll}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Booking Confirmed</Text>
        {qrData.map((qrString, index) => (
          <View key={index} style={styles.section}>
            {/* <Text style={styles.sectionHeader}>Bilet pentru {travelDetails.passengers[index].name} {travelDetails.passengers[index].surname}</Text> */}
            <QRCode
              value={qrString}
              size={200}
            />
            <Text style={styles.ticketText}>Prezentati acest QR la sofer.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => handleSendEmail(index)}>
              <Icon name="event" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Adauga in calendar</Text>
            </TouchableOpacity>
          </View>
        ))}

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
