import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { getTripInfo } from '../api/backend';
import { Ionicons } from '@expo/vector-icons';
import { gradients, palette, shadow } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AppStackParamList, 'TripDetails'>;

const TripDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { from, to, date } = route.params;
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const slide = useRef(new Animated.Value(20)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const tripInfo = await getTripInfo(from, to, date);
        setInfo(tripInfo);
      } catch (error) {
        Alert.alert('Eroare', 'Nu s-au putut încărca detaliile călătoriei');
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to, date]);

  useEffect(() => {
    if (!loading && info) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, info, slide, fade]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.container}>
        <Text>Călătoria nu a fost găsită</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{from} → {to}</Text>
      <Text style={styles.meta}>Data: {new Date(date).toLocaleDateString('ro-RO')}</Text>
      <Animated.View style={[styles.card, shadow.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={styles.rowLine}><Ionicons name="time-outline" size={18} color={palette.textMuted} /><Text style={styles.row}>Plecare: <Text style={styles.bold}>{info.departureTime}</Text></Text></View>
        <View style={styles.rowLine}><Ionicons name="flag-outline" size={18} color={palette.textMuted} /><Text style={styles.row}>Sosire: <Text style={styles.bold}>{info.arrivalTime}</Text></Text></View>
        <View style={styles.rowLine}><Ionicons name="navigate-outline" size={18} color={palette.textMuted} /><Text style={styles.row}>Stație plecare: <Text style={styles.bold}>{info.fromStation}</Text></Text></View>
        <View style={styles.rowLine}><Ionicons name="location-outline" size={18} color={palette.textMuted} /><Text style={styles.row}>Stație sosire: <Text style={styles.bold}>{info.toStation}</Text></Text></View>
        <View style={styles.priceChip}><Text style={styles.priceText}>{info.price} {info.currency}</Text></View>
      </Animated.View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Passenger', {
          from, to, date,
          price: info.price,
          currency: info.currency,
          departureTime: info.departureTime,
          arrivalTime: info.arrivalTime,
        })}
      >
        <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGrad}>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
          <Text style={styles.buttonText}>Continuă</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6f7fb' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  meta: { color: '#64748b', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, gap: 12 },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { fontSize: 16, color: '#1f2937' },
  bold: { fontWeight: '700' },
  priceChip: { alignSelf: 'flex-start', backgroundColor: '#eef2ff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 },
  priceText: { color: '#111827', fontWeight: '800' },
  button: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  buttonGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '800' },
});

export default TripDetailsScreen;
