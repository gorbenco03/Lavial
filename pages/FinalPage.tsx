

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import * as Calendar from 'expo-calendar';


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

  

  const handleAddToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissions required', 'Need calendar permissions to add events');
        return;
      }
  
      // Get all available calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let calendarId;
  
      // Check if there is any writable calendar
      const writableCalendar = calendars.find(cal => cal.allowsModifications);
  
      if (writableCalendar) {
        calendarId = writableCalendar.id;
      } else {
        // Alert if no writable calendar is available
        Alert.alert('No Writable Calendar', 'No writable calendar available. Please check your calendar settings.');
        return;
      }
  
      // Define event details
      const eventDetails = {
        title: 'Trip from ' + travelDetails.from + ' to ' + travelDetails.to,
        startDate: new Date(travelDetails.outboundDate),
        endDate: new Date(new Date(travelDetails.outboundDate).getTime() + 2 * 60 * 60 * 1000), // assuming 2 hours duration
        timeZone: 'GMT+0',
        location: travelDetails.to,
      };
  
      // Add event to the calendar
      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      Alert.alert('Bravo', 'Calatoria ta a fost adaugata in calendar');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
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
            <TouchableOpacity style={styles.closeButton} onPress={() => saveQRAsImage(qrString, `qrCode_${index}.png`)}>
              <Icon name="payment" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Descarca biletul</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleAddToCalendar}>
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
