import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdSerial, setStudentIdSerial] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Eroare', 'Completează numele, email-ul și parola.');
      return;
    }

    if (isStudent && !studentIdSerial.trim()) {
      Alert.alert('Eroare', 'Completează seria legitimației de student.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:3008/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          email,
          password,
          isStudent,
          studentIdSerial: isStudent ? studentIdSerial : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Eroare', data.message || 'Înregistrare eșuată.');
        return;
      }

      Alert.alert('Succes', 'Cont creat cu succes! Te poți autentifica acum.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Eroare la register:', error);
      Alert.alert('Eroare', 'A apărut o problemă la înregistrare.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Înregistrare</Text>
      <TextInput
        style={styles.input}
        placeholder="Nume"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Prenume"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Parolă"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
  
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Ești student?</Text>
        <Switch
          value={isStudent}
          onValueChange={setIsStudent}
        />
      </View>

      {isStudent && (
        <TextInput
          style={styles.input}
          placeholder="Serie legitimație student"
          value={studentIdSerial}
          onChangeText={setStudentIdSerial}
        />
      )}

      {processing ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Înregistrează-te</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Ai deja cont? Autentifică-te</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 14,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '80%',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
});