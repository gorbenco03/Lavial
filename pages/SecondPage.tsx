import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const SecondPage = ({navigation, route  } : any) => {
  const { from, to, outboundDate, returnDate } = route.params;
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportSerial, setPassportSerial] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdSerial, setStudentIdSerial] = useState('');
  const [studentIdImage, setStudentIdImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // if (!result.canceled) {
    //   setStudentIdImage(result.uri=);
    // }
  };

  
  const goToCheckout = () => {
    navigation.navigate('Checkout', {
      from: from,
      to: to,
      outboundDate: outboundDate,
      returnDate: returnDate,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      passportSerial: passportSerial,
      isStudent: isStudent,
      studentIdSerial: studentIdSerial,
      studentIdImage: studentIdImage
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
     
      <TextInput
        style={styles.input}
        placeholder="Nume"
        onChangeText={setName}
        value={name}
      />
      <TextInput
        style={styles.input}
        placeholder="Prenume"
        onChangeText={setSurname}
        value={surname}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Numarul de telefon"
        onChangeText={setPhone}
        value={phone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Seria Pasaport"
        onChangeText={setPassportSerial}
        value={passportSerial}
      />
       <View style={styles.switchContainer}>
          <Switch
            value={isStudent}
            onValueChange={(value) => setIsStudent(value)}
          />
          <Text style={styles.switchLabel}>Sunt student</Text>
        </View>
        {isStudent && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Seria legitimatiei de student"
              onChangeText={setStudentIdSerial}
              value={studentIdSerial}
            />
            <TouchableOpacity style={styles.imageUploader} onPress={pickImage}>
              {studentIdImage ? (
                <Image source={{ uri: studentIdImage }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imageUploadText}>Încarcă poza carnetului de student</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      <TouchableOpacity style={styles.button} onPress={goToCheckout}>
        <Text style={styles.buttonText}>Continua</Text>

      </TouchableOpacity>
      </View>
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  imageUploader: {
    alignItems: 'center',
    backgroundColor: '#ededed',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  headerText: {
    textAlign: 'center', // Alinează textul în centru pe orizontală
    fontSize: 24, // sau orice dimensiune preferi
    fontWeight: 'bold',
    marginVertical: 20, // adaugă un spațiu vertical sus și jos pentru estetică
    // Dacă ai nevoie să centrezi textul și pe verticală într-un View cu 'flex: 1'
    // și nu există alte elemente pe acel ax, ai putea adăuga:
    // justifyContent: 'center' pe stilul 'container'
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  imageUploadText: {
    fontSize: 16,
    color: '#268df5',
  },
  formLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#268df5',
      paddingVertical: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Restul stilurilor rămân neschimbate dacă nu sunt folosite în componenta nouă
});

export default SecondPage;
