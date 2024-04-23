

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';

const FinalPage = ({ route }: any) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<Array<string>>([]);

  useEffect(() => {
    if (travelDetails) {
      const qrDataArray: Array<string> = [];

      travelDetails.passengers.forEach((passenger: any) => {
        const qrStringOutbound = JSON.stringify({ ...travelDetails, tripType: 'Outbound', passenger });
        qrDataArray.push(qrStringOutbound);

        if (travelDetails.returnDate) {
          // Invert "from" and "to" for return trip
          const qrStringReturn = JSON.stringify({
            ...travelDetails,
            tripType: 'Return',
            passenger,
            from: travelDetails.to,
            to: travelDetails.from,
          });
          qrDataArray.push(qrStringReturn);
        }
      });

      setQrData(qrDataArray);
    }
  }, [travelDetails]);

  const saveQRAsImage = (data: string, filename: string) => {
    FileSystem.writeAsStringAsync(FileSystem.documentDirectory + filename, data, { encoding: FileSystem.EncodingType.Base64 })
      .then((fileUri) => {
        Alert.alert('Save successful', `File saved to: ${fileUri}`);
        console.log({ fileUri })
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Error', 'Failed to save QR code as image.');
      });
  };

  const handleAddToCalendar = () => {
    // Implementare pentru adăugare în Calendar
  };

  const handleAddToApplePay = () => {
    // Implementare pentru adăugare în Apple Pay
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.headerText}>Booking Confirmed</Text>
        {qrData.map((qrString, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionHeader}>Bilet pentru {travelDetails.passengers[index].name} {travelDetails.passengers[index].surname}</Text>
            <QRCode
              value={qrString}
              size={200}
            />
            <Text style={styles.ticketText}>Prezentati acest QR la sofer.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => saveQRAsImage(qrString, `qrCode_${index}.png`)}>
              <Icon name="payment" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Descarca biletul</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleAddToCalendar}>
              <Icon name="event" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Adauga in calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleAddToApplePay}>
              <Icon name="apple" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Adauga la Apple Pay</Text>
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
  closeButton: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5, // Spațiu între butoane
    width: '70%',
    marginHorizontal:5,
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
    marginHorizontal:10, 

  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333', // sau altă culoare pe care o dorești
  },
  ticketText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 20,
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
});
