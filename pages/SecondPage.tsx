import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, Modal, Button, TouchableOpacity, Switch, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import DropDownPicker from 'react-native-dropdown-picker';

const SecondPage = ({ navigation, route }: any) => {
  const { from, to, outboundDate, returnDate, numberOfPeople } = route.params;

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
    nameError: boolean;
    surnameError: boolean;
    passportSerialError: boolean;
    studentIdSerialError: boolean;
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
    nameError: false,
    surnameError: false,
    passportSerialError: false,
    studentIdSerialError: false,
  }));

  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToTermsError, setAgreeToTermsError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState<boolean[]>(Array(numberOfPeople).fill(false));
  const [prefixItems, setPrefixItems] = useState([
    { label: '🇷🇴 +40', value: '+40' },
    { label: '🇲🇩 +373', value: '+373' },
    { label: '🇺🇸 +1', value: '+1' },
    { label: '🇬🇧 +44', value: '+44' },
    { label: '🇩🇪 +49', value: '+49' },
    { label: '🇫🇷 +33', value: '+33' },
    { label: '🇮🇹 +39', value: '+39' },
    { label: '🇪🇸 +34', value: '+34' },
    { label: '🇨🇳 +86', value: '+86' },
    { label: '🇮🇳 +91', value: '+91' }
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
    let isValid = true;
    const updatedPassenger = { ...passenger };

    if (!passenger.name) {
      updatedPassenger.nameError = true;
      isValid = false;
    } else {
      updatedPassenger.nameError = false;
    }

    if (!passenger.surname) {
      updatedPassenger.surnameError = true;
      isValid = false;
    } else {
      updatedPassenger.surnameError = false;
    }

    if (!passenger.email) {
      updatedPassenger.emailError = true;
      isValid = false;
    } else if (!validateEmail(passenger.email)) {
      updatedPassenger.emailError = true;
      isValid = false;
    } else {
      updatedPassenger.emailError = false;
    }

    if (!passenger.phone) {
      updatedPassenger.phoneError = true;
      isValid = false;
    } else if (!validatePhone(passenger.phone, passenger.phonePrefix)) {
      updatedPassenger.phoneError = true;
      isValid = false;
    } else {
      updatedPassenger.phoneError = false;
    }

    if (!passenger.passportSerial) {
      updatedPassenger.passportSerialError = true;
      isValid = false;
    } else {
      updatedPassenger.passportSerialError = false;
    }

    if (passenger.isStudent && !passenger.studentIdSerial) {
      updatedPassenger.studentIdSerialError = true;
      isValid = false;
    } else {
      updatedPassenger.studentIdSerialError = false;
    }

    return { updatedPassenger, isValid };
  };

  const goToCheckout = () => {
    const updatedPassengers = passengers.map(passenger => validatePassenger(passenger).updatedPassenger);
    setPassengers(updatedPassengers);

    const isAllPassengersValid = !updatedPassengers.some(passenger => !validatePassenger(passenger).isValid);

    if (!isAllPassengersValid || !agreeToTerms) {
      if (!agreeToTerms) {
        setAgreeToTermsError(true);
      }
      return;
    }

    setAgreeToTermsError(false);

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
            <Text style={styles.sectionTitle}>INFORMATII DESPRE CALATOR</Text>
            <TextInput
              style={[styles.input, item.nameError ? styles.inputError : {}]}
              placeholder="Nume"
              onChangeText={(text) => setPassengerField(index, 'name', text)}
              value={item.name}
            />
            {item.nameError && <Text style={styles.errorText}>Acest camp este obligatoriu</Text>}
            <TextInput
              style={[styles.input, item.surnameError ? styles.inputError : {}]}
              placeholder="Prenume"
              onChangeText={(text) => setPassengerField(index, 'surname', text)}
              value={item.surname}
            />
            {item.surnameError && <Text style={styles.errorText}>Acest camp este obligatoriu</Text>}
            <TextInput
              style={[styles.input, item.emailError ? styles.inputError : {}]}
              placeholder="Email"
              onChangeText={(text) => setPassengerField(index, 'email', text)}
              value={item.email}
            />
            {item.emailError && <Text style={styles.errorText}>Format email invalid</Text>}
            <View style={styles.phoneRow}>
              <View style={styles.phoneContainer}>
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
                  containerStyle={styles.dropdownContainer}
                  style={styles.dropdown}
                  textStyle={styles.dropdownText}
                  dropDownContainerStyle={styles.dropDownBox}
                />
                <TextInput
                  style={[styles.phoneInput, item.phoneError ? styles.inputError : {}]}
                  placeholder="Numarul de telefon"
                  onChangeText={(text) => setPassengerField(index, 'phone', text)}
                  keyboardType="phone-pad"
                  value={item.phone}
                />
              </View>
            </View>
            {item.phoneError && <Text style={styles.errorText}>Format numar de telefon invalid</Text>}
            <TextInput
              style={[styles.input, item.passportSerialError ? styles.inputError : {}]}
              placeholder="Seria Pasaport"
              onChangeText={(text) => setPassengerField(index, 'passportSerial', text)}
              value={item.passportSerial}
            />
            {item.passportSerialError && <Text style={styles.errorText}>Acest camp este obligatoriu</Text>}
            <View style={styles.detailsRow}>
              <Switch
                value={item.isStudent}
                onValueChange={(value) => setPassengerField(index, 'isStudent', value)}
              />
              <Text style={styles.detailsRoute}>Sunt student</Text>
            </View>
            {item.isStudent && (
              <TextInput
                style={[styles.input, item.studentIdSerialError ? styles.inputError : {}]}
                placeholder="Seria legitimatiei de student"
                onChangeText={(text) => setPassengerField(index, 'studentIdSerial', text)}
                value={item.studentIdSerial}
              />
            )}
            {item.isStudent && item.studentIdSerialError && <Text style={styles.errorText}>Acest camp este obligatoriu</Text>}
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={styles.section}>
              <View style={styles.termsRow}>
                <Checkbox
                  value={agreeToTerms}
                  onValueChange={(value) => {
                    setAgreeToTerms(value);
                    if (value) setAgreeToTermsError(false);
                  }}
                />
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text style={styles.detailsRoute}>Sunt de acord cu prelucrarea datelor cu caracter personal</Text>
                </TouchableOpacity>
              </View>
              {agreeToTermsError && <Text style={styles.errorTextTerms}>Te rog sa accepti termenii si conditiile</Text>}
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
    backgroundColor: '#F0F0F0', // light grey background
    paddingVertical: 20,
  },
  section: {
    backgroundColor: '#FFFFFF', // white background for section
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // more subtle shadow
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ddd', // light grey border color
    backgroundColor: '#E0E0E0', // very light grey background
    padding: 10,
    borderRadius: 10,
    height: 50, 
    marginTop: 20,
    fontSize: 16,
    color: 'black', // black text color
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 10,
  },
  errorTextTerms: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 20,
    marginRight: 20,
  }, 
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, 
    zIndex: 1000,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: 110,
  },
  dropdown: {
    backgroundColor: '#E0E0E0',
    borderColor: '#ddd',
    borderTopEndRadius: 0,
    borderEndEndRadius: 0,
    borderRightColor:'black',
    alignContent: 'center'
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  phoneInput: {
    borderColor: '#ddd', // light grey border color
    backgroundColor: '#E0E0E0', // very light grey background
    borderTopEndRadius: 10,
    borderEndEndRadius: 10,
    flex: 1,
    marginLeft: 0,
    paddingLeft: 10 ,
    fontSize: 16,
    color: 'black',
    height:50, 
  },
  dropDownBox: {
    backgroundColor: '#E0E0E0',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop : 20, 
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
    alignItems: 'center',
    marginHorizontal: 20,
  },
  payButton: {
    backgroundColor: '#1E90FF', // light blue background
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
    color: '#fff', // white text color
  },
});
