  import React, { useState } from 'react';
  import { View, TextInput, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';

  const SecondPage = ({ navigation, route }: any) => {
    const { from, to, outboundDate, returnDate, numberOfPeople } = route.params;

    // Create an array of passenger objects
    interface Passenger {
      name: string;
      surname: string;
      email: string;
      phone: string;
      passportSerial: string;
      isStudent: boolean;
      studentIdSerial: string;
    }
    
    const initialPassengers: Passenger[] = Array.from({ length: numberOfPeople }, () => ({
      name: '',
      surname: '',
      email: '',
      phone: '',
      passportSerial: '',
      isStudent: false,
      studentIdSerial: '',
    }));
    
    const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
    
    const setPassengerField = <K extends keyof Passenger>(
      index: number,
      field: K,
      value: Passenger[K]
    ) => {
      const updatedPassengers = [...passengers];
      updatedPassengers[index][field] = value;
      setPassengers(updatedPassengers);
    };
    
    

    const goToCheckout = () => {
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.name || !p.surname || !p.email || !p.phone || !p.passportSerial || (p.isStudent && !p.studentIdSerial)) {
          Alert.alert('Eroare', 'Te rog completează toate câmpurile înainte de a continua.');
          return;
        }
      }

      navigation.navigate('Checkout', {
        from,
        to,
        outboundDate,
        returnDate,
        numberOfPeople,
        passengers,
      });
    };
    return (
      <ScrollView style={styles.container}>
        {passengers.map((passenger, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>Detalii despre pasager {index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nume"
              onChangeText={(text) => setPassengerField(index, 'name', text)}
              value={passenger.name}
            />
            <TextInput
              style={styles.input}
              placeholder="Prenume"
              onChangeText={(text) => setPassengerField(index, 'surname', text)}
              value={passenger.surname}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={(text) => setPassengerField(index, 'email', text)}
              value={passenger.email}
            />
            <TextInput
              style={styles.input}
              placeholder="Numarul de telefon"
              onChangeText={(text) => setPassengerField(index, 'phone', text)}
              keyboardType="phone-pad"
              value={passenger.phone}
            />
            <TextInput
              style={styles.input}
              placeholder="Seria Pasaport"
              onChangeText={(text) => setPassengerField(index, 'passportSerial', text)}
              value={passenger.passportSerial}
            />
            <View style={styles.detailsRow}>
              <Switch
                value={passenger.isStudent}
                onValueChange={(value) => setPassengerField(index, 'isStudent', value)}
              />
              <Text style={styles.detailsRoute}>Sunt student</Text>
            </View>
            {passenger.isStudent && (
              <TextInput
                style={styles.input}
                placeholder="Seria legitimatiei de student"
                onChangeText={(text) => setPassengerField(index, 'studentIdSerial', text)}
                value={passenger.studentIdSerial}
              />
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.payButton} onPress={goToCheckout}>
          <Text style={styles.payButtonText}>Continua</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E3FDFD',
      paddingVertical: 20,
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
      textAlign: 'center',
    },
    input: {
      borderColor: '#ccc', // Schimbare la culoarea bordurii
      backgroundColor: '#A6E3E9', // Schimbare la culoarea fundalului
      padding: 10,
      borderRadius: 10,
      marginBottom: 20,
      fontSize: 16,
      color: 'black', // Schimbare la culoarea textului
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      borderRadius: 10, 
    },
    detailsRoute: {
      fontSize: 18,
      color: '#333',
      fontWeight: '500',
      marginLeft: 8,
    },
    payButton: {
      backgroundColor: '#393E46', // Schimbare la culoarea fundalului
      borderRadius: 10,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 70,
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
    payButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff', // Schimbare la culoarea textului
    },
  });


  export default SecondPage;