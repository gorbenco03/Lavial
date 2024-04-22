import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';

const FinalPage = ({ route }: any) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    if (travelDetails) {
      const qrString = JSON.stringify(travelDetails);
      setQrData(qrString);
    }
  }, [travelDetails]);

  const saveQRAsImage = () => {
    if (this.qr) {
      this.qr.toDataURL((data: any) => {
        FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'qrCode.png', data, { encoding: FileSystem.EncodingType.Base64 })
          .then((fileUri) => {
            Alert.alert('Save successful', `File saved to: ${fileUri}`);
          })
          .catch(error => {
            console.error(error);
            Alert.alert('Error', 'Failed to save QR code as image.');
          });
      });
    }
  };

  const handleAddToApplePay = () => {
    // Implementare pentru adăugare în Apple Pay
  }

  const handleAddToCalendar = () => {
    // Implementare pentru adăugare în Calendar
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Booking Confirmed</Text>
      {qrData && (
        <View style={styles.section}>
          <QRCode
            getRef={(c) => (this.qr = c)}
            value={qrData}
            size={200}
          />
          <Text style={styles.ticketText}>Show this QR code at the boarding gate.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={saveQRAsImage}>
        <Icon name="payment" size={20} color="#fff" />
        <Text style={styles.searchButtonText}>Add to Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={handleAddToCalendar}>
        <Icon name="event" size={20}  color="#fff" />
        <Text style={styles.searchButtonText}>Add to Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={handleAddToApplePay}>
        <Icon name="apple" size={20} color="#fff" />
        <Text style={styles.searchButtonText}>Add to Calendar</Text>
      </TouchableOpacity>
    </View>
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
    justifyContent: 'center',
    marginBottom: 5, // Spațiu între butoane
    width: '80%',
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
    marginLeft: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  ticketText: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
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
