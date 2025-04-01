import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

import { RootStackParamList } from '../App';
import { EXPO_SERVER_URL } from '@env';

type FinalProps = NativeStackScreenProps<RootStackParamList, 'Final'>;

const FinalPage: React.FC<FinalProps> = ({ navigation, route }) => {
  const { travelDetails } = route.params;
  const [qrData, setQrData] = useState<string[]>([]);
  const [dataSent, setDataSent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userIdLoaded, setUserIdLoaded] = useState(false);

  // 1. Obținem userId din AsyncStorage (dacă e cazul)
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('DEBUG: userId din AsyncStorage:', storedUserId);
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error retrieving userId:', error);
      } finally {
        setUserIdLoaded(true);
      }
    };
    getUserId();
  }, []);

  // 2. Generez datele de tip Bilet (QR) după ce am userId
  useEffect(() => {
    if (!travelDetails || !userIdLoaded) return;
    
    // Obținem info “static” (stații, ore) pentru tur și retur, dacă există
    const { outbound, return: returnTrip } = travelDetails;

    // Aici vei construi un array cu bilete
    const qrDataArray: string[] = [];

    // [A] EXEMPLU: dacă *NU* ai o listă de occupant info, dar ai un array comun de seats
    // ( ex.: selectedOutboundSeats = [7,8], selectedReturnSeats = [7,8] ) și un array de passengers
    // atunci putem "împărți" locurile pe pasageri în ordinea indexului:
    const { selectedOutboundSeats = [], selectedReturnSeats = [], passengers = [] } = travelDetails;

   
    // - Bilete TUR:
    selectedOutboundSeats.forEach((seatNumber, idx) => {
      // Fiecare seatNumber -> 1 bilet
      const passenger = passengers[idx] || passengers[0]; 
      // fallback: dacă ai 3 locuri și doar 2 pasageri, pui primul pasager iar

      const ticketObj = {
        uniq_id: uuidv4(),
        // Info pasager
        name: passenger.name,
        surname: passenger.surname,
        phone: passenger.phone,
        email: passenger.email,
        isStudent: passenger.isStudent,
        studentIdSerial: passenger.studentIdSerial,
        // Info călătorie
        from: travelDetails.from, // ex. Chișinău
        to: travelDetails.to,     // ex. Timișoara
        date: travelDetails.outboundDate,
        fromStation: outbound?.fromStation || '',
        toStation: outbound?.toStation || '',
        departureTime: outbound?.departureTime || '',
        arrivalTime: outbound?.arrivalTime || '',
        tripType: 'tur',
        price: travelDetails.outboundSinglePrice,
        seats: [seatNumber],  // un singur loc
        userId: userId,
      };

      qrDataArray.push(JSON.stringify(ticketObj));
    });

    // - Bilete RETUR (dacă există retur)
    if (travelDetails.returnDate && returnTrip) {
      selectedReturnSeats.forEach((seatNumber, idx) => {
        const passenger = passengers[idx] || passengers[0];
        const ticketObj = {
          uniq_id: uuidv4(),
          // Info pasager
          name: passenger.name,
          surname: passenger.surname,
          phone: passenger.phone,
          email: passenger.email,
          isStudent: passenger.isStudent,
          studentIdSerial: passenger.studentIdSerial,
          // Info călătorie
          from: travelDetails.to,
          to: travelDetails.from,
          date: travelDetails.returnDate,
          fromStation: returnTrip?.fromStation || '',
          toStation: returnTrip?.toStation || '',
          departureTime: returnTrip?.departureTime || '',
          arrivalTime: returnTrip?.arrivalTime || '',
          tripType: 'retur',
          price: travelDetails.returnSinglePrice,
          seats: [seatNumber],
          userId: userId,
        };
        qrDataArray.push(JSON.stringify(ticketObj));
      });
    }

   
    

    setQrData(qrDataArray);
  }, [travelDetails, userIdLoaded]);

  // 3. Trimitem datele la back-end
  useEffect(() => {
    if (qrData.length === 0) return;
    if (dataSent) return; // ne asigurăm să trimitem o singură dată

    // De exemplu, luăm mailul primului pasager, dacă e același pt. tot grupul
    let emailToSend = '';
    if (travelDetails.passengers && travelDetails.passengers.length > 0) {
      emailToSend = travelDetails.passengers[0].email;
    }

    console.log('Trimitere date cu userId:', userId);
    sendDataToBackend(qrData, emailToSend);
    setDataSent(true);
  }, [qrData, dataSent]);

  const encryptData = (data: string) => {
    const passphrase = 'back-end-lavial-encrypted-data';
    return CryptoJS.AES.encrypt(data, passphrase).toString();
  };

  const sendDataToBackend = async (qrDataArray: string[], email: string) => {
    try {
      const encryptedDataArray = qrDataArray.map(encryptData);
      const requestData = JSON.stringify({ qrData: encryptedDataArray, email, userId });
      console.log('Trimite către server:', requestData);

      const response = await fetch(`https://lavial.icu/qr/send-qr`, {
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
      console.log('Server response:', responseData);
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Tranzacție finalizată cu succes!</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentCard}>
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../assets/animation.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
              speed={0.8}
            />
          </View>
          <Text style={styles.ticketText}>
            Biletele vor fi trimise pe mail sau pot fi găsite în contul tău.
          </Text>

          <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
            
              <Text style={styles.buttonText}>Mergi la pagina principală</Text>
      
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: '#3D87E4',
    fontWeight: '600',
  },
  contentCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  ticketText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  homeButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 8,
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinalPage;