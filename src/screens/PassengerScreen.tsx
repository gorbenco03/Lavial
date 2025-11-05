import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { createBooking, getRouteStudentDiscount } from '../api/backend';
type Props = NativeStackScreenProps<AppStackParamList, 'Passenger'>;

const PassengerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { from, to, date, price, currency, departureTime, arrivalTime } = route.params;
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentDiscountData, setStudentDiscountData] = useState<{ studentDiscount: number | null; hasStudentDiscount: boolean } | null>(null);
  const [loadingDiscount, setLoadingDiscount] = useState(false);

  const f1 = useRef(new Animated.Value(0)).current;
  const f2 = useRef(new Animated.Value(0)).current;
  const f3 = useRef(new Animated.Value(0)).current;
  const f4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, [f1, f2, f3, f4].map(v =>
      Animated.timing(v, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true })
    )).start();
  }, [f1, f2, f3, f4]);

  const fieldStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  });

  const onContinue = async () => {
    if (!name || !surname || !email || !phone) {
      Alert.alert('Informații lipsă', 'Te rugăm să completezi toate câmpurile');
      return;
    }
    
    if (isStudent && !studentId) {
      Alert.alert('Informații lipsă', 'Te rugăm să introduci ID-ul student');
      return;
    }
    
    try {
      const bookingData: any = {
        from,
        to,
        date,
        passenger: { name, surname, email, phone }
      };

      // Dacă e student și avem discount, trimitem studentDiscount către backend
      if (isStudent && studentDiscountData?.studentDiscount) {
        bookingData.studentDiscount = studentDiscountData.studentDiscount;
      }

      const booking = await createBooking(bookingData);

      if (!booking?.bookingId) {
        Alert.alert('Eroare', 'Rezervarea a fost creată dar nu s-a primit ID-ul rezervării');
        return;
      }

      const finalCurrency = booking?.currency || currency || 'RON';

      const checkoutParams = { 
        bookingId: booking.bookingId,
        total: booking.total, // Backend-ul returnează deja total-ul cu discount aplicat
        currency: finalCurrency,
        from: booking.from,
        to: booking.to,
        date: booking.date,
        departureTime: booking.departureTime,
        arrivalTime: booking.arrivalTime,
        passengerName: `${name} ${surname}`.trim()
      };

      navigation.navigate('Checkout', checkoutParams);
    } catch (error: any) {
      Alert.alert('Eroare', error?.message || 'Nu s-a putut crea rezervarea');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={Platform.OS === 'ios'}
      >
        <Text style={styles.title}>Date pasager</Text>
        <Text style={styles.meta}>{from} → {to} • {new Date(date).toLocaleDateString('ro-RO')}</Text>
        <Text style={styles.meta}>Plecare {departureTime} • Sosire {arrivalTime}</Text>

        <View style={styles.card}>
          <Animated.View style={[styles.inputRow, fieldStyle(f1)]}>
            <Ionicons name="person-circle-outline" size={20} color="#64748b" />
            <View style={styles.inputCol}>
              <Text style={styles.label}>Prenume</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Prenume" 
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.inputRow, fieldStyle(f2)]}>
            <Ionicons name="id-card-outline" size={20} color="#64748b" />
            <View style={styles.inputCol}>
              <Text style={styles.label}>Nume</Text>
              <TextInput 
                style={styles.input} 
                value={surname} 
                onChangeText={setSurname} 
                placeholder="Nume" 
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.inputRow, fieldStyle(f3)]}>
            <Ionicons name="mail-open-outline" size={20} color="#64748b" />
            <View style={styles.inputCol}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                placeholder="email@example.com" 
                placeholderTextColor="#94a3b8" 
                keyboardType="email-address" 
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.inputRow, fieldStyle(f4)]}>
            <Ionicons name="call-outline" size={20} color="#64748b" />
            <View style={styles.inputCol}>
              <Text style={styles.label}>Phone</Text>
              <TextInput 
                style={styles.input} 
                value={phone} 
                onChangeText={setPhone} 
                placeholder="07xxxxxxxx" 
                placeholderTextColor="#94a3b8" 
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
          </Animated.View>
        </View>

        {/* Student Discount */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.studentCheckboxRow}
            onPress={async () => {
              const newIsStudent = !isStudent;
              
              if (!newIsStudent) {
                setIsStudent(false);
                setStudentId('');
                setStudentDiscountData(null);
              } else {
                // Fetch student discount from backend when checkbox is checked
                setIsStudent(true);
                setLoadingDiscount(true);
                
                try {
                  const discountData = await getRouteStudentDiscount(from, to);
                  setStudentDiscountData(discountData);
                } catch (error) {
                  setStudentDiscountData({ studentDiscount: null, hasStudentDiscount: false });
                } finally {
                  setLoadingDiscount(false);
                }
              }
            }}
            activeOpacity={0.7}
            disabled={loadingDiscount}
          >
            <View style={[styles.checkbox, isStudent && styles.checkboxChecked]}>
              {isStudent && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <View style={styles.studentCheckboxContent}>
              <Text style={styles.studentCheckboxLabel}>Sunt student</Text>
              <Text style={styles.studentCheckboxSubtext}>
                {loadingDiscount 
                  ? 'Se verifică discount-ul...' 
                  : studentDiscountData?.hasStudentDiscount 
                    ? `Discount disponibil: ${studentDiscountData.studentDiscount} ${currency || 'RON'}`
                    : 'ID-ul student va fi solicitat la verificare'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {isStudent && (
            <View style={styles.studentInputContainer}>
              <Ionicons name="school-outline" size={18} color="#64748b" />
              <TextInput
                style={styles.studentInput}
                placeholder="Introdu ID-ul student"
                placeholderTextColor="#9ca3af"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.9}>
          <LinearGradient colors={["#6366f1", "#06b6d4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGrad}>
            <Ionicons name="card-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Continuă la plată</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: Platform.OS === 'android' ? 60 : 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginTop: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, backgroundColor: '#fff' },
  inputCol: { flex: 1 },
  label: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  input: { color: '#0f172a', fontSize: 16 },
  button: { marginTop: 22, borderRadius: 16, overflow: 'hidden' },
  buttonGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '800' },
  studentCheckboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  studentCheckboxContent: { flex: 1 },
  studentCheckboxLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  studentCheckboxSubtext: { fontSize: 12, color: '#64748b' },
  studentInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  studentInput: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: '#0f172a' },
});

export default PassengerScreen;
