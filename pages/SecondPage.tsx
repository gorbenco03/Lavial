import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, Modal, Button, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import DropDownPicker from 'react-native-dropdown-picker';

const SecondPage = ({ navigation, route }: any) => {
  const { from, to, outboundDate, returnDate, numberOfPeople } = route.params;

  // Create an array of passenger objects
  interface Passenger {
    name: string;
    surname: string;
    email: string;
    emailError: boolean;
    phone: string;
    phoneError: boolean;
    phonePrefix: string;
    passportSerial: string;
    isStudent: boolean;
    studentIdSerial: string;
  }

  const initialPassengers: Passenger[] = Array.from({ length: numberOfPeople }, () => ({
    name: '',
    surname: '',
    email: '',
    emailError: false,
    phone: '',
    phoneError: false,
    phonePrefix: '+40',
    passportSerial: '',
    isStudent: false,
    studentIdSerial: '',
  }));

  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState<boolean[]>(Array(numberOfPeople).fill(false));
  const [prefixItems, setPrefixItems] = useState([
    { label: '🇷🇴 +40', value: '+40' },
    { label: '🇲🇩 +373', value: '+373' }
  ]);

  const setPassengerField = <K extends keyof Passenger>(
    index: number,
    field: K,
    value: Passenger[K]
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;

    if (field === 'email') {
      updatedPassengers[index].emailError = !validateEmail(value as string);
    }

    if (field === 'phone') {
      updatedPassengers[index].phoneError = !validatePhone(value as string, updatedPassengers[index].phonePrefix);
    }

    setPassengers(updatedPassengers);
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePhone = (phone: string, prefix: string) => {
    if (phone.startsWith('0')) {
      return false;
    }
    if (prefix === '+40' && phone.length === 9) {
      return /^[0-9]{9}$/.test(phone);
    } else if (prefix === '+373' && phone.length === 8) {
      return /^[0-9]{8}$/.test(phone);
    }
    return false;
  };

  const validatePassenger = (passenger: Passenger) => {
    const { name, surname, email, phone, passportSerial, isStudent, studentIdSerial } = passenger;
    if (!name || !surname || !email || !phone || !passportSerial || (isStudent && !studentIdSerial)) {
      return false;
    }
    return true;
  };

  const goToCheckout = () => {
    if (passengers.some(passenger => !validatePassenger(passenger))) {
      Alert.alert('Eroare', 'Te rog completează toate câmpurile corect pentru toți pasagerii înainte de a continua.');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Eroare', 'Trebuie să fii de acord cu prelucrarea datelor cu caracter personal.');
      return;
    }

    const passengersWithFullPhone = passengers.map(passenger => ({
      ...passenger,
      phone: passenger.phonePrefix + passenger.phone
    }));

    navigation.navigate('Checkout', {
      from,
      to,
      outboundDate,
      returnDate,
      numberOfPeople,
      passengers: passengersWithFullPhone,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={passengers}
        keyExtractor={(item, index) => index.toString()}
        style={styles.container}
        renderItem={({ item, index }) => (
          <View key={index} style={[styles.section, { zIndex: numberOfPeople - index }]}>
            <Text style={styles.sectionTitle}>Detalii despre pasager {index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nume"
              onChangeText={(text) => setPassengerField(index, 'name', text)}
              value={item.name}
            />
            <TextInput
              style={styles.input}
              placeholder="Prenume"
              onChangeText={(text) => setPassengerField(index, 'surname', text)}
              value={item.surname}
            />
            <TextInput
              style={[styles.input, item.emailError ? styles.inputError : {}]}
              placeholder="Email"
              onChangeText={(text) => setPassengerField(index, 'email', text)}
              value={item.email}
            />
            {item.emailError && <Text style={styles.errorText}>Format email invalid</Text>}
            <View style={styles.phoneRow}>
              <DropDownPicker
                open={open[index]}
                value={item.phonePrefix}
                items={prefixItems}
                setOpen={(callback) => {
                  const newOpen = [...open];
                  newOpen[index] = typeof callback === 'function' ? callback(open[index]) : callback;
                  setOpen(newOpen);
                }}
                setValue={(callback) => {
                  const value = typeof callback === 'function' ? callback(item.phonePrefix) : callback;
                  setPassengerField(index, 'phonePrefix', value);
                }}
                setItems={setPrefixItems}
                containerStyle={[styles.dropdownContainer, { zIndex: 1000 }]}
                style={styles.dropdown}
                textStyle={styles.dropdownText}
              />
              <TextInput
                style={[styles.input, styles.phoneInput, item.phoneError ? styles.inputError : {}]}
                placeholder="Numarul de telefon"
                onChangeText={(text) => setPassengerField(index, 'phone', text)}
                keyboardType="phone-pad"
                value={item.phone}
              />
            </View>
            {item.phoneError && <Text style={styles.errorText}>Format numar de telefon invalid</Text>}
            <TextInput
              style={styles.input}
              placeholder="Seria Pasaport"
              onChangeText={(text) => setPassengerField(index, 'passportSerial', text)}
              value={item.passportSerial}
            />
            <View style={styles.detailsRow}>
              <Switch
                value={item.isStudent}
                onValueChange={(value) => setPassengerField(index, 'isStudent', value)}
              />
              <Text style={styles.detailsRoute}>Sunt student</Text>
            </View>
            {item.isStudent && (
              <TextInput
                style={styles.input}
                placeholder="Seria legitimatiei de student"
                onChangeText={(text) => setPassengerField(index, 'studentIdSerial', text)}
                value={item.studentIdSerial}
              />
            )}
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={styles.termsRow}>
              <Checkbox
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
              />
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={[styles.detailsRoute, { textDecorationLine: 'underline' }]}>Sunt de acord cu prelucrarea datelor cu caracter personal</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={goToCheckout}>
              <Text style={styles.payButtonText}>Continua</Text>
            </TouchableOpacity>
          </>
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalText}>Informații despre prelucrarea datelor personale:</Text>
            <ScrollView style={modalStyles.scrollView}>
              <Text style={modalStyles.modalContent}>
                {personalDataInfo}
              </Text>
            </ScrollView>
            <Button onPress={() => setModalVisible(false)} title="Închide" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SecondPage;

const modalStyles = StyleSheet.create({
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 400,
  },
  modalContent: {
    textAlign: 'left',
  },
});

const personalDataInfo = `
  Compania TUDO-LAVIAL S.R.L. (LAVIAL) prelucrează datele dumneavoastră personale în conformitate cu legislația în vigoare privind protecția datelor cu caracter personal. 

  Colectăm și prelucrăm datele personale ale pasagerilor pentru a asigura serviciile de transport, inclusiv rezervarea biletelor, comunicarea informațiilor relevante despre călătorie și gestionarea cerințelor legale și de securitate.

  Datele prelucrate includ, dar nu se limitează la: numele, prenumele, adresa de email, numărul de telefon, seria pașaportului și, în cazul studenților, seria legitimației de student. 

  Aceste date sunt colectate direct de la dumneavoastră atunci când efectuați o rezervare și sunt utilizate strict în scopurile menționate mai sus. LAVIAL asigură măsuri de securitate adecvate pentru protecția datelor dumneavoastră personale și nu le divulgă terților fără consimțământul dumneavoastră explicit, cu excepția cazurilor prevăzute de lege.

  Aveți dreptul de a accesa, rectifica, șterge sau restricționa prelucrarea datelor dumneavoastră personale, precum și dreptul de a vă opune prelucrării sau de a solicita portabilitatea datelor. Pentru exercitarea acestor drepturi, ne puteți contacta la adresa de email: contact@lavial.ro.

  Utilizând serviciile noastre, confirmați că ați luat cunoștință și sunteți de acord cu prelucrarea datelor dumneavoastră personale conform acestei politici.
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0', // fundal gri deschis
    paddingVertical: 20,
  },
  section: {
    backgroundColor: '#FFFFFF', // fundal alb pentru secțiune
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // umbră mai subtilă
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
    borderColor: '#ddd', // culoarea bordurii gri deschis
    backgroundColor: '#E0E0E0', // fundal gri foarte deschis
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: 'black', // culoarea textului negru
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdownContainer: {
    width: 100,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#E0E0E0',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 1000,
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    zIndex: 1,
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
  termsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // fundal alb pentru secțiune
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // umbră mai subtilă
    shadowRadius: 2,
    elevation: 3,
  },
  payButton: {
    backgroundColor: '#1E90FF', // fundal albastru deschis
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
    color: '#fff', // culoarea textului alb
  },
});
