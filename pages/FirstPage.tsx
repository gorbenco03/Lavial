import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const cities = [
  'Chișinău', 'Huși', 'Tecuci', 'Adjud', 'Onești',
  'Brașov', 'Alba Iulia', 'Sibiu', 'Deva', 'Lugoj', 'Timișoara'
];

const FirstPage = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [outboundDate, setOutboundDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [currentSelectingDate, setCurrentSelectingDate] = useState<'outbound' | 'return'>('outbound');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [settingCityFor, setSettingCityFor] = useState<'from' | 'to'>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>(cities);
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date(); // Data de azi

  const isValid = () => from !== '' && to !== '' && outboundDate;

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    setOutboundDate(undefined);
    setReturnDate(undefined);
    setNumberOfPeople(1);
  };

  const goToPersonalDetails = async () => {
    if (isValid()) {
      try {
        const response = await fetch('https://lavial.icu/get-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from, to }),
        });
        const data = await response.json();

        if (data.routePrice === 0) {
          Alert.alert("Eroare", "Această rută nu este disponibilă.");
        } else {
          navigation.navigate('Detalii', {
            from: from,
            to: to,
            outboundDate: outboundDate?.toDateString(),
            returnDate: returnDate?.toDateString(),
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
        const response = await fetch('https://lavial.icu/get-routes');
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
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.headerText}>Călătorii comfortabile împreună cu noi!</Text>
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={() => { setIsModalVisible(true); setSettingCityFor('from'); }} style={styles.modalTrigger}>
            <Text style={styles.destination}>{from || 'Pornire de la '}</Text>
            <MaterialIcons name="arrow-drop-down" size={24} style={styles.dropdownIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSwap}>
            <MaterialIcons name="swap-horiz" size={24} style={styles.swapIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsModalVisible(true); setSettingCityFor('to'); }} style={styles.modalTrigger}>
            <Text style={styles.destination}>{to || 'Destinație la '}</Text>
            <MaterialIcons name="arrow-drop-down" size={24} style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        {(from || to) && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Resetează</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => showDatePicker('outbound')}>
            <Text style={styles.dateText}>Tur</Text>
            <Text style={styles.dateValue}>{outboundDate ? formatDate(outboundDate) : 'Selectează data'}</Text>
          </TouchableOpacity>
          {outboundDate && (
            <TouchableOpacity onPress={() => setOutboundDate(undefined)} style={styles.clearButton}>
              <MaterialIcons name="close" size={16} color="black" />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.dateRow, { backgroundColor: outboundDate ? '#E0E0E0' : '#F5F5F5' }]}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => showDatePicker('return')}
            disabled={!outboundDate}
          >
            <Text style={styles.dateText}>Retur</Text>
            <Text style={styles.dateValue}>{returnDate ? formatDate(returnDate) : 'Selectează data'}</Text>
          </TouchableOpacity>
          {returnDate && (
            <TouchableOpacity onPress={() => setReturnDate(undefined)} style={styles.clearButton}>
              <MaterialIcons name="close" size={16} color="black" />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          <View style={styles.datePickerWrapper}>
            <DateTimePicker
              value={currentSelectingDate === 'outbound' ? outboundDate || today : returnDate || today}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={currentSelectingDate === 'outbound' ? today : outboundDate ? new Date(outboundDate.getTime() + 24 * 60 * 60 * 1000) : today}
              onChange={handleDateChange}
            />
            <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.passengerPickerRow}>
          <MaterialIcons name="person" size={24} style={styles.personIcon} />
          <Text style={styles.passengerText}>{`Pasageri: ${numberOfPeople}`}</Text>
          <TouchableOpacity onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}>
            <MaterialIcons name="remove" size={24} style={styles.iconButton} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNumberOfPeople(Math.min(10, numberOfPeople + 1))}>
            <MaterialIcons name="add" size={24} style={styles.iconButton} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={goToPersonalDetails}>
          <Text style={styles.searchButtonText}>Merg mai departe</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => { setIsModalVisible(false); }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeModalButton}>
              <MaterialIcons name="close" size={24} />
            </TouchableOpacity>
            <View style={styles.modalItemSearch}>
              <MaterialIcons name="search" style={styles.cityIcon} size={24} />
              <TextInput
                placeholder="Caută oraș"
                placeholderTextColor="#999"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={updateSearch}
              />
            </View>
            <ScrollView>
              {filteredCities.map((city, index) => (
                <TouchableOpacity key={index} onPress={() => {
                  setCity(city);
                  setIsModalVisible(false);
                }} style={styles.modalItem}>
                  <MaterialIcons name="location-city" size={24} style={styles.cityIcon} />
                  <Text style={styles.modalText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default FirstPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
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
  resetButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 0,
    marginTop: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'ClashGrotesk-Bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: "black",
    fontFamily: 'ClashGrotesk-Regular',
  },
  dateValue: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'ClashGrotesk-Regular',
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  swapIcon: {
    paddingHorizontal: 10,
    color: "black",
  },
  destination: {
    fontFamily: 'ClashGrotesk-Regular',
  },
  datePickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 20,
  },
  clearButton: {
    marginLeft: 10,
  },
  passengerPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  personIcon: {
    marginRight: 10,
    color: "black"
  },
  passengerText: {
    flex: 1,
    fontFamily: 'ClashGrotesk-Regular',
    fontSize: 16,
    color: "#000"
  },
  iconButton: {
    padding: 10,
    color: "black"
  },
  searchButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 0,
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
  searchButtonText: {
    color: '#fff',
    fontFamily: 'ClashGrotesk-Semibold',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: "center",
  },
  modalTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: 10,
    width: '40%',
    fontFamily: 'ClashGrotesk-Semibold',
    padding: 10,
    backgroundColor: '#E0E0E0',
  },
  closeModalButton: {
    alignSelf: 'flex-end',
  },
  modalView: {
    width: '100%',
    height: '70%',
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItem: {
    fontSize: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    fontFamily: 'ClashGrotesk-Regular',
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  modalItemSearch: {
    fontSize: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    fontFamily: 'ClashGrotesk-Regular',
    alignItems: 'center',
    width: '100%',
  },
  cityIcon: {
    marginRight: 15,
    color: '#000',
  },
  modalText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'ClashGrotesk-Regular',
  },
  searchInput: {
    fontSize: 18,
    paddingVertical: 0,
    flexDirection: 'row',
    fontFamily: 'ClashGrotesk-Regular',
    alignItems: 'center',
    width: '100%',
  },
});