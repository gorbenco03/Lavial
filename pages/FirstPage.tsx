import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, TextInput, Platform, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_SERVER_URL } from '@env';

const cities = [
  'Chișinău', 'Huși', 'Tecuci', 'Adjud', 'Onești',
  'Brașov', 'Alba Iulia', 'Sibiu', 'Deva', 'Lugoj', 'Timișoara'
];

const FirstPage = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [outboundDate, setOutboundDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [currentSelectingDate, setCurrentSelectingDate] = useState<'outbound' | 'return'>('outbound');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [settingCityFor, setSettingCityFor] = useState<'from' | 'to'>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>(cities);
  const [showPicker, setShowPicker] = useState(false);
  const formatDateForBackend = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };
  const today = new Date(); // Data de azi

  const isValid = () => from !== '' && to !== '' && outboundDate;

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };


    const checkUserAuthentication = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      // Verificăm validitatea token-ului
      const response = await fetch(`https://lavial.icu/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
};

  const handleReset = () => {
    setFrom('');
    setTo('');
    setOutboundDate(undefined);
    setReturnDate(undefined);
    setNumberOfPeople(1);
  };

  const [userInfo, setUserInfo] = useState(null);
  
  // Verifică dacă utilizatorul este autentificat la încărcarea paginii
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Obține informațiile utilizatorului folosind token-ul
          const response = await fetch(`https://lavial.icu/auth/user-info`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserInfo(userData);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuth();
  }, []);

  const checkReservationStatus = async (date: Date) => {
    try {
      // Extragem anul, luna și ziua
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`; // "YYYY-MM-DD"
      const formatDateForBackend = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // "YYYY-MM-DD" în UTC
      };
      const response = await fetch(`https://lavial.icu/reservations/check-reservation-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: formattedDate }),
      });
      const data = await response.json();
      return data.stopped;
    } catch (error) {
      console.error('Error checking reservation status:', error);
      Alert.alert("Eroare", "A apărut o eroare la verificarea statusului rezervărilor.");
      return false;
    }
  };

  const goToPersonalDetails = async () => {
    if (isValid()) {
      try {
        // Verifică statusul rezervărilor
        const isStopped = await checkReservationStatus(outboundDate!);
        if (isStopped) {
          Alert.alert("Avertisment", "Rezervările sunt oprite pentru această dată.");
          return;
        }
  
        // Dacă rezervările nu sunt oprite, continuăm cu verificarea prețului
        const response = await fetch(`https://lavial.icu/tickets/get-price`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            from, 
            to, 
            date: formatDateForBackend(outboundDate!), // Add outbound date here
            returnDate: returnDate?.toISOString(), 
            passengers: Array(numberOfPeople).fill({ isStudent: false }) 
          }),
        });
        const data = await response.json();
  
        if (data.message && data.message === 'Rezervările sunt oprite pentru această dată.') {
          Alert.alert("Avertisment", "Rezervările sunt oprite pentru această dată.");
          return;
        }
  
        if (data.routePrice === 0) {
          Alert.alert("Eroare", "Această rută nu este disponibilă.");
        } else {
          navigation.navigate('Detalii', {
            from: from,
            to: to,
            outboundDate: outboundDate?.toISOString(), // Păstrează formatul ISO
            returnDate: returnDate?.toISOString(),
            numberOfPeople: numberOfPeople,
        
          });
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        Alert.alert("Eroare", "A apărut o eroare la verificarea prețului rutei.");
      }
    } else {
      Alert.alert("Ai grijă", "Te rog completează toate câmpurile pentru a continua.");
    }
  };

  const formatDate = (date: any) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPicker(false);
    if (selectedDate) {
      if (currentSelectingDate === 'outbound') {
        setOutboundDate(selectedDate);
        if (returnDate && returnDate <= selectedDate) {
          setReturnDate(undefined);
        }
      } else {
        setReturnDate(selectedDate);
      }
    }
  };

  const showDatePicker = (dateType: 'outbound' | 'return') => {
    setCurrentSelectingDate(dateType);
    setShowPicker(true);
  };

  const setCity = (city: string) => {
    if (settingCityFor === 'from') {
      setFrom(city);
      if (city === to || (city !== 'Chișinău' && to !== 'Chișinău')) {
        setTo('');
      }
    } else if (settingCityFor === 'to') {
      if (city === from) {
        Alert.alert("Eroare", "Nu poți selecta același oraș pentru plecare și destinație.");
      } else {
        setTo(city);
      }
    }
  };

  const updateSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    setSearchQuery(lowercaseQuery);
    if (!query) {
      updateFilteredCities();
      return;
    }
    const filtered = filteredCities.filter(city => city.toLowerCase().includes(lowercaseQuery));
    setFilteredCities(filtered);
  };

  const updateFilteredCities = async () => {
    if (from) {
      try {
        const response = await fetch(`https://lavial.icu/tickets/get-routes`);
        const routes = await response.json();

        if (routes[from]) {
          setFilteredCities(routes[from]);
        } else {
          setFilteredCities([]);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        setFilteredCities([]);
      }
    } else {
      setFilteredCities(cities);
    }
  };

  useEffect(() => {
    updateFilteredCities();
  }, [from]);

 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
      
          <Text style={styles.headerText}>Călătorii confortabile împreună cu noi!</Text>
        </View>
        
        <View style={styles.formCard}>
          {/* Origin & Destination */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Rută de călătorie</Text>
            
            <View style={styles.routeContainer}>
              <TouchableOpacity 
                style={styles.citySelector}
                onPress={() => { setIsModalVisible(true); setSettingCityFor('from'); }}
              >
                <View style={styles.cityIconContainer}>
                  <MaterialIcons name="place" size={20} color="#3D87E4" />
                </View>
                <View style={styles.cityTextContainer}>
                  <Text style={styles.cityLabel}>Plecare din</Text>
                  <Text style={styles.cityValue}>{from || 'Selectați orașul'}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                <Feather name="repeat" size={16} color="#FFD966" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.citySelector}
                onPress={() => { setIsModalVisible(true); setSettingCityFor('to'); }}
              >
                <View style={styles.cityIconContainer}>
                  <MaterialIcons name="place" size={20} color="#3D87E4" />
                </View>
                <View style={styles.cityTextContainer}>
                  <Text style={styles.cityLabel}>Sosire la</Text>
                  <Text style={styles.cityValue}>{to || 'Selectați orașul'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Date Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Perioada călătoriei</Text>
            
            <View style={styles.dateContainer}>
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => showDatePicker('outbound')}
              >
                <View style={styles.dateIconContainer}>
                  <MaterialIcons name="event" size={20} color="#3D87E4" />
                </View>
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Data plecării</Text>
                  <Text style={styles.dateValue}>
                    {outboundDate ? formatDate(outboundDate) : 'Selectați data'}
                  </Text>
                </View>
                {outboundDate && (
                  <TouchableOpacity 
                    style={styles.clearDateButton}
                    onPress={() => setOutboundDate(undefined)}
                  >
                    <Feather name="x" size={16} color="#3D87E4" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.dateSelector, 
                  !outboundDate && styles.disabledDateSelector
                ]}
                onPress={() => outboundDate && showDatePicker('return')}
                disabled={!outboundDate}
              >
                <View style={styles.dateIconContainer}>
                  <MaterialIcons name="event" size={20} color={outboundDate ? "#3D87E4" : "#B0C4DE"} />
                </View>
                <View style={styles.dateTextContainer}>
                  <Text style={[styles.dateLabel, !outboundDate && styles.disabledText]}>
                    Data întoarcerii
                  </Text>
                  <Text style={[styles.dateValue, !outboundDate && styles.disabledText]}>
                    {returnDate ? formatDate(returnDate) : 'Selectați data'}
                  </Text>
                </View>
                {returnDate && (
                  <TouchableOpacity 
                    style={styles.clearDateButton}
                    onPress={() => setReturnDate(undefined)}
                  >
                    <Feather name="x" size={16} color="#3D87E4" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Passengers */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Pasageri</Text>
            
            <View style={styles.passengerContainer}>
              <View style={styles.passengerIconContainer}>
                <MaterialIcons name="people" size={20} color="#3D87E4" />
              </View>
              
              <Text style={styles.passengerCount}>
                {numberOfPeople} {numberOfPeople === 1 ? 'pasager' : 'pasageri'}
              </Text>
              
              <View style={styles.passengerControls}>
                <TouchableOpacity 
                  style={[styles.passengerButton, numberOfPeople <= 1 && styles.disabledButton]}
                  onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                >
                  <Feather name="minus" size={16} color={numberOfPeople <= 1 ? "#B0C4DE" : "#3D87E4"} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.passengerButton}
                  onPress={() => setNumberOfPeople(Math.min(10, numberOfPeople + 1))}
                >
                  <Feather name="plus" size={16} color="#3D87E4" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Actions */}
          <View style={styles.formActions}>
            {(from || to || outboundDate || returnDate) && (
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Resetează</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.continueButton, 
                (!from || !to || !outboundDate) && styles.disabledContinueButton
              ]}
              onPress={goToPersonalDetails}
              disabled={!from || !to || !outboundDate}
            >
              <Text style={styles.continueButtonText}>Continuă</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* City Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {settingCityFor === 'from' ? 'Selectează orașul de plecare' : 'Selectează destinația'}
              </Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={20} color="#3D87E4" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#3D87E4" />
              <TextInput
                style={styles.searchInput}
                placeholder="Caută oraș"
                placeholderTextColor="#B0C4DE"
                value={searchQuery}
                onChangeText={updateSearch}
              />
            </View>
            
            <ScrollView style={styles.cityList}>
              {filteredCities.map((city, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.cityItem}
                  onPress={() => {
                    setCity(city);
                    setIsModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <MaterialIcons name="location-city" size={20} color="#3D87E4" />
                  <Text style={styles.cityItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Date Picker */}
      {showPicker && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContent}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>
                  {currentSelectingDate === 'outbound' ? 'Selectează data plecării' : 'Selectează data întoarcerii'}
                </Text>
                <TouchableOpacity style={styles.closeDatePickerButton} onPress={() => setShowPicker(false)}>
                  <Feather name="x" size={20} color="#3D87E4" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={currentSelectingDate === 'outbound' ? outboundDate || today : returnDate || today}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={currentSelectingDate === 'outbound' ? today : outboundDate || today}
                onChange={handleDateChange}
                style={styles.datePicker}
              />
              
              <TouchableOpacity 
                style={styles.confirmDateButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.confirmDateButtonText}>Confirmă data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FirstPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // Fundal albastru foarte deschis
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D87E4', // Albastru deschis
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
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
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D87E4', // Albastru deschis
    marginBottom: 10,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  citySelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF', // Albastru foarte deschis
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF', // Bordură albastru deschis
  },
  cityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cityTextContainer: {
    flex: 1,
  },
  cityLabel: {
    fontSize: 12,
    color: '#3D87E4', // Albastru deschis
  },
  cityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  dateContainer: {
    gap: 10,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF', // Albastru foarte deschis
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D6E8FF', // Bordură albastru deschis
  },
  disabledDateSelector: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#3D87E4', // Albastru deschis
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  disabledText: {
    color: '#B0C4DE', // Albastru foarte deschis pentru text dezactivat
  },
  clearDateButton: {
    padding: 5,
    borderRadius: 12,
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  passengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  passengerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  passengerCount: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passengerButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E8FF', // Bordură albastru deschis
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  formActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A617', // Galben mai închis
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#3D87E4', // Albastru deschis
    shadowColor: '#3D87E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  disabledContinueButton: {
    backgroundColor: '#B0C4DE', // Albastru foarte deschis pentru buton dezactivat
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '70%',
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
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF', // Albastru foarte deschis
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333333',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeDatePickerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1', // Galben foarte deschis
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD966', // Bordură galben palid
  },
  datePicker: {
    marginBottom: 20,
  },
  confirmDateButton: {
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#3D87E4', // Albastru deschis
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

