import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { createBooking } from '../api/backend';
type Props = NativeStackScreenProps<AppStackParamList, 'Passenger'>;

const PassengerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { from, to, date, price, currency, departureTime, arrivalTime } = route.params;
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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
    
    try {
      const booking = await createBooking({
        from,
        to,
        date,
        passenger: { name, surname, email, phone }
      });

      if (!booking?.bookingId) {
        Alert.alert('Eroare', 'Rezervarea a fost creată dar nu s-a primit ID-ul rezervării');
        return;
      }

      const finalCurrency = booking?.currency || currency || 'RON';

      const checkoutParams = { 
        bookingId: booking.bookingId,
        total: booking.total,
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
    <View style={styles.container}>
      <Text style={styles.title}>Date pasager</Text>
      <Text style={styles.meta}>{from} → {to} • {new Date(date).toLocaleDateString('ro-RO')}</Text>
      <Text style={styles.meta}>Plecare {departureTime} • Sosire {arrivalTime}</Text>

      <View style={styles.card}>
        <Animated.View style={[styles.inputRow, fieldStyle(f1)]}>
          <Ionicons name="person-circle-outline" size={20} color="#64748b" />
          <View style={styles.inputCol}>
            <Text style={styles.label}>Prenume</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Prenume" placeholderTextColor="#94a3b8" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputRow, fieldStyle(f2)]}>
          <Ionicons name="id-card-outline" size={20} color="#64748b" />
          <View style={styles.inputCol}>
            <Text style={styles.label}>Nume</Text>
            <TextInput style={styles.input} value={surname} onChangeText={setSurname} placeholder="Nume" placeholderTextColor="#94a3b8" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputRow, fieldStyle(f3)]}>
          <Ionicons name="mail-open-outline" size={20} color="#64748b" />
          <View style={styles.inputCol}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#94a3b8" keyboardType="email-address" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputRow, fieldStyle(f4)]}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <View style={styles.inputCol}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="07xxxxxxxx" placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.9}>
        <LinearGradient colors={["#6366f1", "#06b6d4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGrad}>
          <Ionicons name="card-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Continuă la plată</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginTop: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, backgroundColor: '#fff' },
  inputCol: { flex: 1 },
  label: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  input: { color: '#0f172a' },
  button: { marginTop: 22, borderRadius: 16, overflow: 'hidden' },
  buttonGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '800' },
});

export default PassengerScreen;
