import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Extindem interfața de props pentru a include și navigation (presupunând integrarea cu React Navigation)
interface AuthPageProps {
  onLoginSuccess: () => void;
  navigation: any;
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, navigation }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdSerial, setStudentIdSerial] = useState('');

  // State pentru verificarea prin email
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailForVerification, setEmailForVerification] = useState('');

  // Funcție pentru trimiterea codului de verificare prin email
  const sendVerificationCode = async (emailAddress: string) => {
    try {
      const response = await fetch('http://localhost:3008/sendVerificationCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Cod trimis', 'Un cod de verificare a fost trimis pe email-ul tău.');
        setEmailForVerification(emailAddress);
        setVerificationModalVisible(true);
      } else {
        Alert.alert('Eroare', data.message || 'Nu s-a putut trimite codul de verificare.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      Alert.alert('Eroare', 'A apărut o problemă la trimiterea codului.');
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!verificationCode) {
      Alert.alert('Eroare', 'Te rugăm să introduci codul de verificare.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3008/verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForVerification, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok && data.verified) {
        Alert.alert('Succes', 'Email verificat cu succes!');
        setVerificationModalVisible(false);
        // După verificare, poți naviga către un ecran principal sau actualiza starea aplicației
        onLoginSuccess();
      } else {
        Alert.alert('Eroare', data.message || 'Cod incorect.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Eroare', 'A apărut o problemă la verificare.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eroare', 'Te rugăm să introduci email-ul și parola.');
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch('http://localhost:3008/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Eroare', data.message || 'Autentificare eșuată.');
        setProcessing(false);
        return;
      }
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userId', data.user._id.toString());
      // Resetăm câmpurile și trecem la ecranul principal
      setEmail('');
      setPassword('');
      setName('');
      setSurname('');
      setIsStudent(false);
      setStudentIdSerial('');
      setPhone('');
      onLoginSuccess();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Eroare', 'A apărut o problemă la autentificare.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Eroare', 'Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch('http://localhost:3008/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, isStudent, studentIdSerial, email, password, phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Eroare', data.message || 'Înregistrare eșuată.');
        setProcessing(false);
        return;
      }
      // După înregistrare reușită, trimitem codul de verificare prin email
      await sendVerificationCode(email);
      // Resetăm câmpurile (opțional)
      setAuthMode('login');
      setName('');
      setSurname('');
      setIsStudent(false);
      setStudentIdSerial('');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Eroare', 'A apărut o problemă la înregistrare.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {authMode === 'login' ? 'Bine ai revenit!' : 'Creează un cont nou'}
          </Text>
        </View>

        <View style={styles.authCard}>
          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'login' && styles.activeTab]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.activeTabText]}>
                Autentificare
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'register' && styles.activeTab]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.tabText, authMode === 'register' && styles.activeTabText]}>
                Înregistrare
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          {authMode === 'register' && (
            <>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#3D87E4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Numele"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#B0C4DE"
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#3D87E4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Prenumele"
                  value={surname}
                  onChangeText={setSurname}
                  placeholderTextColor="#B0C4DE"
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#B0C4DE"
            />
          </View>

          {authMode === 'register' && (
            <View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="call-outline" size={20} color="#3D87E4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Număr de telefon"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#B0C4DE"
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Ești student?</Text>
                <Switch value={isStudent} onValueChange={setIsStudent} />
              </View>

              {isStudent && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="reader" size={20} color="#3D87E4" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Serie legitimație student"
                    value={studentIdSerial}
                    onChangeText={setStudentIdSerial}
                    placeholderTextColor="#B0C4DE"
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Parolă"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#B0C4DE"
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#3D87E4"
              />
            </TouchableOpacity>
          </View>

          {authMode === 'login' && (
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Ai uitat parola?</Text>
            </TouchableOpacity>
          )}

          {processing ? (
            <ActivityIndicator size="large" color="#3D87E4" />
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={authMode === 'login' ? handleLogin : handleRegister}
            >
              <LinearGradient
                colors={['#3D87E4', '#6AA9FF']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {authMode === 'login' ? 'Autentificare' : 'Înregistrare'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.switchModeText}>
              {authMode === 'login'
                ? 'Nu ai cont? Înregistrează-te'
                : 'Ai deja un cont? Autentifică-te'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal pentru verificarea codului de email */}
      <Modal
        visible={verificationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Verifică Email-ul</Text>
            <Text style={styles.modalText}>
              Introdu codul primit pe email-ul {emailForVerification}:
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Cod de verificare"
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholderTextColor="#B0C4DE"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleVerifyEmailCode}>
              <Text style={styles.modalButtonText}>Verifică</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVerificationModalVisible(false)}>
              <Text style={styles.modalCancelText}>Anulează</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AuthPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  authCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    width: '90%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  tabText: {
    fontSize: 14,
    color: '#B0C4DE',
  },
  activeTabText: {
    color: '#3D87E4',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  visibilityIcon: {
    padding: 5,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3D87E4',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  switchModeButton: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: '#3D87E4',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  // Stiluri pentru modalul de verificare email
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#3D87E4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelText: {
    color: '#3D87E4',
    fontSize: 16,
    marginTop: 5,
  },
});