import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import { getToday, getFormatedDate } from "react-native-modern-datepicker";

const cities = [
  'Chisinau', 'Husi', 'Tecuci', 'Adjud', 'Onesti',
  'Brasov', 'Alba Iulia', 'Sibiu', 'Deva', 'Lugoj', 'Timisoara'
];

const Dropdown = ({ items, selectedValue, onValueChange, excludedItems, placeholder }: any) => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const filteredItems = items.filter((item: any) => !excludedItems.includes(item));
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownTrigger}>
        <Text>{selectedValue || placeholder}</Text>
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
  const [outboundDate, setOutboundDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [minDateForReturn, setMinDateForReturn] = useState<string | undefined>(undefined);

  const today = getToday();
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [date, setDate] = useState<string>();
  const [currentSelectingDate, setCurrentSelectingDate] = useState<'outbound' | 'return'>('outbound');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const isValid = () => from !== '' && to !== '' && outboundDate;
  // Tracks the minimum date for the return trip


  const goToPersonalDetails = () => {
    // Verificăm dacă informațiile sunt completate înainte de a naviga
    if (isValid()) {
      navigation.navigate('Detalii', {
        from: from,
        to: to,
        outboundDate: outboundDate?.toDateString(),
        returnDate: returnDate?.toDateString(),
        numberOfPeople: numberOfPeople,
      });
    } else {
      // Altfel, afișăm o alertă sau mesaj pentru a completa informațiile necesare
      Alert.alert("Ai grija", "Te rog completează toate câmpurile pentru a continua.");
    }
  };

  const datePickerPosition = useRef(0);  // Start with 0 or any default suitable for your layout

  const handleDatePress = (dateType: 'outbound' | 'return') => {
    if (dateType === 'return' && !outboundDate) {
      Alert.alert("Atenție", "Selectați mai întâi data de plecare.");
      return; // Exit if there's no outbound date yet
    }

    setCurrentSelectingDate(dateType);
    setIsDatePickerVisible(true);

    if (dateType === 'outbound') {
      setDate(outboundDate ? outboundDate.toISOString().split('T')[0] : getToday());
    } else {
      setDate(returnDate ? returnDate.toISOString().split('T')[0] : minDateForReturn);
    }
  };




  const onDateChange = (selectedDate: string) => {
    const newDate = new Date(selectedDate.replace(/\//g, '-'));

    if (currentSelectingDate === 'outbound') {
      setOutboundDate(newDate);
      const nextDay = new Date(newDate);
      nextDay.setDate(newDate.getDate() + 1); // Increment day by one for return date minimum
      setMinDateForReturn(nextDay.toISOString().split('T')[0]);
      if (returnDate && returnDate < nextDay) {
        setReturnDate(undefined); // Reset if return date is before new minimum
      }
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
            placeholder="Pornire de la "
            onValueChange={(value: any) => setFrom(value)}
            excludedItems={[to]} // Exclude selected destination city
          />
          <TouchableOpacity onPress={handleSwap}>
            <MaterialIcons name="swap-horiz" size={24} style={styles.swapIcon} />
          </TouchableOpacity>
          <Dropdown
            items={cities}
            selectedValue={to}
            placeholder="Destinatie la "
            onValueChange={(value: React.SetStateAction<string>) => setTo(value)}
            excludedItems={[from]} // Exclude selected departure city
          />
        </View>
        <TouchableOpacity style={styles.dateRow} onPress={() => handleDatePress('outbound')}>
          <Text style={styles.dateText}>Tur</Text>
          <Text style={styles.dateValue}>{outboundDate ? outboundDate.toDateString() : 'Selectează data'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: outboundDate ? '#A6E3E9' : '#8CB9BD' }]}
          onPress={() => handleDatePress('return')}
          disabled={!outboundDate}
        >

          <Text style={styles.dateText}>Retur</Text>
          <Text style={styles.dateValue}>{returnDate ? returnDate.toDateString() : 'Selectează data'}</Text>
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
              <Text style={styles.searchButtonText}>Close</Text>
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
    backgroundColor: '#E3FDFD', // fundal alb
    paddingVertical: 20, // adaugă padding vertical
  },
  form: {
    backgroundColor: '#CBF1F5', // fundal pentru formular
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


  },

  datePickerContainer: {
    position: 'relative',
    backgroundColor: '#A6E3E9',
    borderRadius: 22,
    marginVertical: 10,

  },
  closeButton: {
    backgroundColor: '#393E46', // Schimbare la culoarea fundalului
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    color: "white",
    marginBottom: 20,
  },
  CalendarStyle: {
    backgroundColor: '#A6E3E9',
    borderRadius: 22,

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
    borderWidth: 0,
    marginTop: 5,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#A6E3E9', // Background pentru data de tur
  },

  dateText: {
    fontSize: 16,
    color: "black",
  },
  dateValue: {
    fontSize: 16,
    color: 'black',
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
    fontSize: 16,
    color: "#000"
  },
  iconButton: {
    padding: 10,
    color: "black"
  },
  searchButton: {
    backgroundColor: '#393E46', // Schimbare la culoarea fundalului
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

  dropdownContainer: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#A6E3E9",
    color: "white",
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#A6E3E9',
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 0,
    borderColor: '#ddd',
    borderRadius: 10,
    
    backgroundColor: '#A6E3E9',
  },
  dropdownItem: {
    color: "black",
    padding: 10,
  }
  ,


  headerText: {
    textAlign: 'center', // Alinează textul în centru pe orizontală
    fontSize: 24, // sau orice dimensiune preferi
    fontWeight: 'bold',
    marginBottom: 10, // adaugă un spațiu vertical sus și jos pentru estetică
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

