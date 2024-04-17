import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import { getToday, getFormatedDate } from "react-native-modern-datepicker";
import { Picker } from '@react-native-picker/picker';

const cities = [
  'Chisinau', 'Huși', 'Tecuci', 'Adjud', 'Onești',
  'Brașov', 'Sibiu', 'Deva', 'Lugoj', 'Timișoara'
];

const Dropdown = ({ items, selectedValue, onValueChange, excludedItems }: any) => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const filteredItems = items.filter((item: any)  => !excludedItems.includes(item));

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownTrigger}>
        <Text>{selectedValue}</Text>
        <MaterialIcons name={open ? "arrow-drop-up" : "arrow-drop-down"} size={24} style={styles.dropdownIcon} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {filteredItems.map((item: any) => (
            <TouchableOpacity key={item} onPress={() => { onValueChange(item); setOpen(false); }}>
              <Text style={styles.dropdownItem}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const FirstPage = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [outboundDate, setOutboundDate] = useState<Date>(); // Set default date in YYYY-MM-DD format
  const [returnDate, setReturnDate] = useState<Date>();
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };
  const today = new Date();
  const startDate = getFormatedDate(today, 'YYYY/MM/DD');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [date, setDate] = useState<string>();
  const [currentSelectingDate, setCurrentSelectingDate] = useState('outbound');
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const goToPersonalDetails = () => {
    navigation.navigate('Detalii', {
      from: from,
      to: to,
      outboundDate: outboundDate?.toDateString(),
      returnDate: returnDate?.toDateString(),
    });
  };
  const datePickerPosition = useRef(0);  // Start with 0 or any default suitable for your layout

  const handleDatePress = (dateType: string) => {
    setCurrentSelectingDate(dateType);
    const newPosition = dateType === 'outbound' ? 100 : 160; // Adjust these values as per your UI layout
    datePickerPosition.current = newPosition;
    setIsDatePickerVisible(true);
    setDate(dateType === 'outbound' ? outboundDate?.toDateString() : returnDate?.toDateString()); // Format the date
  };


  const onDateChange = (selectedDate: string | number | Date) => {
    const newDate = new Date(selectedDate); // Create a Date object from the selected date
    

    if (currentSelectingDate === 'outbound') {
      setOutboundDate(newDate);
    } else {
      setReturnDate(newDate);
    }
    setIsDatePickerVisible(false);
  };




  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.headerText}>Rezerva-ti cursa impreuna cu noi!</Text>
        <View style={styles.inputRow}>
        <Dropdown
            items={cities}
            selectedValue={from}
            onValueChange={(value:any) => setFrom(value)}
            excludedItems={[to]} // Exclude selected destination city
          />
          <TouchableOpacity onPress={handleSwap}>
            <MaterialIcons name="swap-horiz" size={24} style={styles.swapIcon} />
          </TouchableOpacity>
          <Dropdown
            items={cities}
            selectedValue={to}
            onValueChange={(value: React.SetStateAction<string>) => setTo(value)}
            excludedItems={[from]} // Exclude selected departure city
          />
        </View>
        <TouchableOpacity style={styles.dateRow} onPress={() => handleDatePress('outbound')}>
          <Text style={styles.dateText}>Tur</Text>
          <Text style={styles.dateValue}>{outboundDate?.toDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateRow} onPress={() => handleDatePress('return')}>
          <Text style={styles.dateText}>Retur</Text>
          <Text style={styles.dateValue}>{returnDate?.toDateString()}</Text>
        </TouchableOpacity>

        {isDatePickerVisible && (
          <View style={[styles.datePickerContainer, { top: datePickerPosition.current }]}>

            <DatePicker
              mode='calendar'
              selected={date}
              minimumDate={startDate}
              onDateChange={onDateChange}
            />
            <TouchableOpacity onPress={() => setIsDatePickerVisible(false)} style={styles.closeButton}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.passengerPickerRow}>
          <MaterialIcons name="person" size={24} style={styles.personIcon} />
          <Text style={styles.passengerText}>{`Pasageri: ${numberOfPeople}`}</Text>
          <TouchableOpacity onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}>
            <MaterialIcons name="remove" size={24} style={styles.iconButton} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNumberOfPeople(numberOfPeople + 1)}>
            <MaterialIcons name="add" size={24} style={styles.iconButton} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={goToPersonalDetails}>
          <Text style={styles.searchButtonText}>Continua</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    margin: 20,
  },
  datePickerContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1 // Ensure it appears above other content
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10
  },
  formLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
  },
  dateValue: {
    fontSize: 16,
    color: 'grey',
  },
  passengerPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  personIcon: {
    marginRight: 10,
  },
  passengerText: {
    flex: 1,
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
  },
  searchButton: {
    backgroundColor: '#268df5',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,

  },

  dropdownContainer: {
    flex: 1,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownItem: {

    padding: 10,},


  headerText: {
    textAlign: 'center', // Alinează textul în centru pe orizontală
    fontSize: 24, // sau orice dimensiune preferi
    fontWeight: 'bold',
    marginVertical: 20, // adaugă un spațiu vertical sus și jos pentru estetică
    // Dacă ai nevoie să centrezi textul și pe verticală într-un View cu 'flex: 1'
    // și nu există alte elemente pe acel ax, ai putea adăuga:
    // justifyContent: 'center' pe stilul 'container'
  },


  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
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
  }
});

export default FirstPage;

