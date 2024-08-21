import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, FlatList, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import { getToday, getFormatedDate } from "react-native-modern-datepicker";

const cities = [
  'Chișinău', 'Huși', 'Tecuci', 'Adjud', 'Onești',
  'Brașov', 'Alba Iulia', 'Sibiu', 'Deva', 'Lugoj', 'Timișoara'
]; 

const FirstPage = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [outboundDate, setOutboundDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [minDateForReturn, setMinDateForReturn] = useState<string | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [date, setDate] = useState<string>();
  const [currentSelectingDate, setCurrentSelectingDate] = useState<'outbound' | 'return'>('outbound');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const isValid = () => from !== '' && to !== '' && outboundDate;
  const [settingCityFor, setSettingCityFor] = useState<'from' | 'to'>();
  const datePickerPosition = useRef(0);  // Start with 0 or any default suitable for your layout
  const today = getToday();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>(cities);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const goToPersonalDetails = async () => {
    if (isValid()) {
        try {
            const response = await fetch('https://lavial.icu/check-reservation-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: outboundDate }),
            });
            const data = await response.json();

            if (data.stopped) {
                Alert.alert("Rezervări oprite", "Rezervările sunt oprite pentru data selectată. Te rugăm să alegi o altă dată.");
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
            console.error('Error checking reservation status:', error);
            Alert.alert("Eroare", "A apărut o eroare la verificarea statusului rezervărilor.");
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

  const handleDatePress = (dateType: 'outbound' | 'return') => {
    if (dateType === 'return' && !outboundDate) {
      Alert.alert("Atenție", "Selectați mai întâi data de plecare.");
      return;
    }
    setCurrentSelectingDate(dateType);
    setIsDatePickerVisible(true);

    if (dateType === 'outbound') {
      setDate(outboundDate ? outboundDate.toISOString().split('T')[0] : getToday());
    } else {
      setDate(returnDate ? returnDate.toISOString().split('T')[0] : minDateForReturn);
    }
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

  const onDateChange = (selectedDate: string) => {
    const newDate = new Date(selectedDate.replace(/\//g, '-'));
    if (currentSelectingDate === 'outbound') {
      setOutboundDate(newDate);
      const nextDay = new Date(newDate);
      nextDay.setDate(newDate.getDate() + 1);
      setMinDateForReturn(nextDay.toISOString().split('T')[0]);
      if (returnDate && returnDate < nextDay) {
        setReturnDate(undefined);
      }
    } else {
      setReturnDate(newDate);
    }
    setIsDatePickerVisible(false);
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

  const updateFilteredCities = () => {
    if (from === 'Chișinău') {
      setFilteredCities(cities.filter(city => city !== 'Chișinău'));
    } else if (from) {
      setFilteredCities(['Chișinău']);
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
        <TouchableOpacity style={styles.dateRow} onPress={() => handleDatePress('outbound')}>
          <Text style={styles.dateText}>Tur</Text>
          <Text style={styles.dateValue}>{outboundDate ? formatDate(outboundDate) : 'Selectează data'}</Text>
          {outboundDate && (
            <TouchableOpacity onPress={() => setOutboundDate(undefined)}>
              <MaterialIcons name="close" size={16}  />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: outboundDate ? '#E0E0E0' : '#F5F5Ftyle={styles.clearIcon}5' }]}
          onPress={() => handleDatePress('return')}
          disabled={!outboundDate}
        >
          <Text style={styles.dateText}>Retur</Text>
          <Text style={styles.dateValue}>{returnDate ? formatDate(returnDate) : ''}</Text>
          {returnDate && (
            <TouchableOpacity onPress={() => setReturnDate(undefined)}>
              <MaterialIcons name="close" size={16}  />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {isDatePickerVisible && (
          <View style={[styles.datePickerContainer, { top: datePickerPosition.current }]}>
            <DatePicker
              mode='calendar'
              selected={date}
              style={styles.CalendarStyle}
              minimumDate={currentSelectingDate === 'return' ? minDateForReturn : getToday()}
              onDateChange={onDateChange}
            />
            <TouchableOpacity onPress={() => setIsDatePickerVisible(false)} style={styles.closeButton}>
              <Text style={styles.searchButtonText}>Închide</Text>
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
    backgroundColor: '#F0F0F0', // fundal gri deschis
    paddingVertical: 20, // adaugă padding vertical
  },
  form: {
    backgroundColor: '#FFFFFF', // fundal alb pentru formular
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000', // umbra
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  closeTextButton: {
    fontSize: 16,
    fontFamily: 'ClashGrotesk-Semibold',
   
  },
  datePickerContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 22,
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#1E90FF', // fundal albastru deschis
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 100,
    marginBottom: 10,
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
  formLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'ClashGrotesk-Regular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  CalendarStyle: {
    backgroundColor: 'white',
    borderRadius: 22,
  },
  destination: {
    fontFamily: 'ClashGrotesk-Regular',
  }, 
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  swapIcon: {
    paddingHorizontal: 10,
    color: "black",
  },
  datePickerRow: {
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
    backgroundColor: '#E0E0E0', // fundal gri foarte deschis pentru date
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
    backgroundColor: '#1E90FF', // fundal albastru deschis
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
  dropdownIcon: {
    marginLeft: 'auto',
  },
  headerText: {
    textAlign: 'center', // Alinează textul în centru pe orizontală
    fontSize: 24, // sau orice dimensiune preferi
   fontFamily : 'ClashGrotesk-Bold', 
    marginBottom: 10, // adaugă un spațiu vertical sus și jos pentru estetică
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'ClashGrotesk-Semibold', 
    fontSize : 20 ,
  
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
  closeMoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalView: {
    width: '100%', // Full width to match the screen
    height: '70%',
    backgroundColor: 'white', // Keeping it light as per your original design
    borderTopRightRadius: 20, // Only top corners are rounded
    borderTopLeftRadius: 20,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'flex-start', // Align items to the top
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItem: {
    fontSize: 20, // Increased font size
    paddingVertical: 15, // Increased padding for a larger touch area
    borderBottomWidth: 1,
    fontFamily: 'ClashGrotesk-Regular',
    borderBottomColor: '#ddd', // A light color for the separator
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  modalItemSearch: {
    fontSize: 20, // Increased font size
    paddingBottom: 5, // Increased padding for a larger touch area
    flexDirection: 'row',
    fontFamily: 'ClashGrotesk-Regular',
    alignItems: 'center',
    width: '100%',
  },
  cityIcon: {
    marginRight: 15, // Added some space between the icon and the text
    color: '#000', // Icon color as black
  },
  closeModalButton: {
    alignSelf: 'flex-end', // Align close button to the right
  },
  modalText: {
    fontSize: 18, // Increased font size for modal texts
    color: '#000', // Text color as black
    fontFamily: 'ClashGrotesk-Regular',
  },
  searchInput: {
    fontSize: 18, // Increased font size
    paddingVertical: 0, // Increased padding for a larger touch area
    flexDirection: 'row',
    fontFamily: 'ClashGrotesk-Regular',
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
    color: '#fff', // Icon color to be visible on dark bg
  },
});