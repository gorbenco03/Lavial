import React, { useState, useEffect} from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, Modal, Button, TouchableOpacity, Switch, ScrollView, StatusBar } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { EXPO_SERVER_URL } from '@env';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SecondPage = ({ navigation, route }: any) => {
  const { from, to, outboundDate, returnDate, numberOfPeople } = route.params;
  interface UserData {
    name: string;
    surname: string;
    email: string;
    phone: string;
    isStudent :boolean; 
    studentIdSerial: string; 
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  interface Passenger {
    name: string;
    surname: string;
    email: string;
    emailError: boolean;
    phone: string;
    phoneError: boolean;
    phonePrefix: string;
    
    isStudent: boolean;
    studentIdSerial: string;
    nameError: boolean;
    surnameError: boolean;
    
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
    isStudent: false,
    studentIdSerial: '',
    nameError: false,
    surnameError: false,
    studentIdSerialError: false,
  }));
  const [isUserPassenger, setIsUserPassenger] = useState<boolean[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToTermsError, setAgreeToTermsError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState<boolean[]>(Array(numberOfPeople).fill(false));
  const [prefixItems, setPrefixItems] = useState([
    { label: '🇷🇴 +40', value: '+40' },
    { label: '🇲🇩 +373', value: '+373' },
  ]);
  const formatDateForBackend = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`https://lavial.icu/auth/user-profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuth();
  }, []);

  const fillCurrentUserData = (index: number) => {
    if (!userData) return;
    
    const updatedPassengers = [...passengers];
    const { phonePrefix, phone } = splitPhone(userData.phone);

updatedPassengers[index] = {
  ...updatedPassengers[index],
  name: userData.name || '',
  surname: userData.surname || '',
  email: userData.email || '',
  isStudent: userData.isStudent || false, 
  studentIdSerial: userData.studentIdSerial,

  // setezi direct:
  phone,        // ex.: '749859571'
  phonePrefix,  // ex.: '+40'

  nameError: false,
  surnameError: false,
  emailError: false,
  phoneError: false,
};
    
    setPassengers(updatedPassengers);
  };

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
  
    navigation.navigate('Locuri', {
      from,
      to,
      outboundDate: outboundDate ? formatDateForBackend(outboundDate) : null,
      returnDate: returnDate ? formatDateForBackend(returnDate) : null,
      numberOfPeople,
      passengers: passengersWithFullPhone,
    });
  };

  function splitPhone(userPhone: string) {
    // Dacă nu există număr, întoarce valorile default
    if (!userPhone) {
      return { phonePrefix: '+40', phone: '' };
    }
  
    // Curățăm spațiile (dacă există)
    const trimmedPhone = userPhone.trim();
  
    // Verificăm dacă începe cu +40
    if (trimmedPhone.startsWith('+40')) {
      return {
        phonePrefix: '+40',
        // ștergem din string primele 3 caractere (lungimea "+40") => rămâne restul
        phone: trimmedPhone.substring(3),
      };
    }
    // Verificăm dacă începe cu +373
    if (trimmedPhone.startsWith('+373')) {
      return {
        phonePrefix: '+373',
        // ștergem primele 4 caractere (lungimea "+373")
        phone: trimmedPhone.substring(4),
      };
    }
  
    // Dacă nu începe nici cu +40, nici cu +373, îl considerăm default +40
    // și ștergem orice alte caractere de +\d
    return {
      phonePrefix: '+40',
      phone: trimmedPhone.replace(/^\+\d*/, ''),
    };
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <FlatList
        data={passengers}
        keyExtractor={(item, index) => index.toString()}
        style={styles.scrollContent}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informații despre pasager</Text>
            
            {isAuthenticated && (
              <View style={styles.checkmarkContainer}>
                <TouchableOpacity
                  onPress={() => {
                    const updated = [...isUserPassenger];
                    updated[index] = !updated[index];
                    setIsUserPassenger(updated);
              
                    if (updated[index]) {
                      fillCurrentUserData(index);
                    }
                  }}
                  style={styles.checkmarkButton}
                >
                  <View style={styles.checkIconContainer}>
                    <Ionicons
                      name={isUserPassenger[index] ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isUserPassenger[index] ? '#4CAF50' : '#ccc'}
                    />
                  </View>
                  <Text style={styles.checkmarkLabel}>Eu sunt pasagerul</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.formSection}>
              <TextInput
                style={[styles.input, item.nameError ? styles.inputError : {}]}
                placeholder="Nume"
                onChangeText={(text) => setPassengerField(index, 'name', text)}
                value={item.name}
                maxLength={20}
              />
              {item.nameError && <Text style={styles.errorText}>Acest câmp este obligatoriu</Text>}
              
              <TextInput
                style={[styles.input, item.surnameError ? styles.inputError : {}]}
                placeholder="Prenume"
                onChangeText={(text) => setPassengerField(index, 'surname', text)}
                value={item.surname}
                maxLength={20}
              />
              {item.surnameError && <Text style={styles.errorText}>Acest câmp este obligatoriu</Text>}
              
              <TextInput
                autoCapitalize="none"
                style={[styles.input, item.emailError ? styles.inputError : {}]}
                placeholder="Email"
                onChangeText={(text) => setPassengerField(index, 'email', text)}
                value={item.email}
                maxLength={50}
              />
              {item.emailError && <Text style={styles.errorText}>Format email invalid</Text>}
              
              <View style={styles.phoneSection}>
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
                    placeholder="Numărul de telefon"
                    onChangeText={(text) => setPassengerField(index, 'phone', text)}
                    keyboardType="phone-pad"
                    value={item.phone}
                  />
                </View>
              </View>
              {item.phoneError && <Text style={styles.errorText}>Format număr de telefon invalid</Text>}
              
              <View style={styles.studentContainer}>
                <View style={styles.switchContainer}>
                  <Switch
                    value={item.isStudent}
                    onValueChange={(value) => setPassengerField(index, 'isStudent', value)}
                    trackColor={{ false: '#E0E0E0', true: '#D6E8FF' }}
                    thumbColor={item.isStudent ? '#3D87E4' : '#f4f3f4'}
                  />
                  <Text style={styles.switchLabel}>Sunt student</Text>
                </View>
                
                {item.isStudent && (
                  <>
                    <TextInput
                      style={[styles.input, item.studentIdSerialError ? styles.inputError : {}]}
                      placeholder="Seria legitimației de student"
                      onChangeText={(text) => setPassengerField(index, 'studentIdSerial', text)}
                      value={item.studentIdSerial}
                      maxLength={12}
                    />
                    {item.studentIdSerialError && <Text style={styles.errorText}>Acest câmp este obligatoriu</Text>}
                    
                    <View style={styles.warningContainer}>
                      <Text style={styles.warningText}>
                        Atenție! Legitimația de student trebuie prezentată la șofer la îmbarcare, altfel biletul nu este valid.
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={styles.termsCard}>
              <View style={styles.termsContainer}>
                <Checkbox
                  value={agreeToTerms}
                  onValueChange={(value) => {
                    setAgreeToTerms(value);
                    if (value) setAgreeToTermsError(false);
                  }}
                  color={agreeToTerms ? '#3D87E4' : undefined}
                />
                <TouchableOpacity style={styles.termsTextContainer} onPress={() => setModalVisible(true)}>
                  <Text style={styles.termsText}>
                    Sunt de acord cu prelucrarea  
                    <Text style={styles.termsHighlight}> datelor cu caracter personal</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              {agreeToTermsError && <Text style={styles.errorText}>Te rog să accepți termenii și condițiile</Text>}
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={goToCheckout}
            >
              <Text style={styles.continueButtonText}>Merg mai departe</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informații despre prelucrarea datelor personale</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color="#3D87E4" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalContentText}>
                {personalDataInfo}
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SecondPage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D87E4',
    marginBottom: 15,
  },
  formSection: {
    gap: 15,
  },
  checkmarkContainer: {
    marginBottom: 15,
  },
  checkmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  checkIconContainer: {
    marginRight: 10,
  },
  checkmarkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  input: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF',
    fontSize: 14,
    color: '#333333',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFEEEE',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  phoneSection: {
    marginVertical: 10,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownContainer: {
    width: '30%',
    height: 45,
  },
  dropdown: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333333',
  },
  dropDownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF',
    fontSize: 14,
    color: '#333333',
  },
  studentContainer: {
    gap: 15,
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  warningContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  warningText: {
    fontSize: 14,
    color: '#D4A617',
  },
  termsCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#333333',
  },
  termsHighlight: {
    color: '#3D87E4',
    textDecorationLine: 'underline',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#3D87E4',
    shadowColor: '#3D87E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalContentText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  confirmButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#3D87E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

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