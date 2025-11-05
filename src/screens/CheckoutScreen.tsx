import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { saveTicket } from '../utils/storage';
import { useStripe } from '@stripe/stripe-react-native';
import { fetchPaymentSheetParams } from '../api/payments';
import { generateTicketPDF } from '../utils/ticketPdf';

type Props = NativeStackScreenProps<AppStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, total, currency, from, to, date, departureTime, arrivalTime, passengerName } = route.params;
  
  // Fallback pentru currency dacă lipsește
  const finalCurrency = currency || 'RON';
  
  
  const scale = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(false);
  const paymentSheetInitializedRef = useRef<string | null>(null); // Track last initialized total
  const paymentSheetInitTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track timeout to cancel it
  const paymentSheetInitCounterRef = useRef<number>(0); // Counter to track initialization order
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Prețul primit de la backend include deja toate taxele, comisionele și discount-ul de student (dacă există)
  const grandTotal = total;

  // Reset payment sheet ref when bookingId changes
  useEffect(() => {
    paymentSheetInitializedRef.current = null;
    paymentSheetInitCounterRef.current = 0;
    if (paymentSheetInitTimeoutRef.current) {
      clearTimeout(paymentSheetInitTimeoutRef.current);
      paymentSheetInitTimeoutRef.current = null;
    }
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Eroare', 'Rezervarea nu a fost găsită. Te rugăm să încerci din nou.');
      return;
    }

    // Cancel any pending initialization
    if (paymentSheetInitTimeoutRef.current) {
      clearTimeout(paymentSheetInitTimeoutRef.current);
      paymentSheetInitTimeoutRef.current = null;
    }

    // Skip if we just initialized with this exact total (prevent duplicate initializations)
    const grandTotalKey = `${bookingId}-${grandTotal}`;
    if (paymentSheetInitializedRef.current === grandTotalKey) {
      return;
    }

    const init = async () => {
      // Increment counter to mark this initialization attempt
      const initId = ++paymentSheetInitCounterRef.current;
      
      // Final check - if another initialization is pending or a newer one started, skip this one
      if (paymentSheetInitTimeoutRef.current) {
        return;
      }

      if (initId !== paymentSheetInitCounterRef.current) {
        return;
      }

      try {
        setLoading(true);
        const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(bookingId, grandTotal);

        if (initId !== paymentSheetInitCounterRef.current) {
          setLoading(false);
          return;
        }

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Lavial',
          paymentIntentClientSecret: paymentIntent,
          customerEphemeralKeySecret: ephemeralKey,
          customerId: customer,
          allowsDelayedPaymentMethods: false,
        });

        if (initError) {
          throw initError;
        }
        
        // Only mark as initialized if this is still the latest init
        if (initId === paymentSheetInitCounterRef.current) {
          const finalKey = `${bookingId}-${grandTotal}`;
          paymentSheetInitializedRef.current = finalKey;
          paymentSheetInitTimeoutRef.current = null;
        }
      } catch (e: any) {
        if (initId === paymentSheetInitCounterRef.current) {
          Alert.alert('Plata indisponibilă', e?.message || 'Te rugăm să încerci mai târziu.');
        }
      } finally {
        if (initId === paymentSheetInitCounterRef.current) {
          setLoading(false);
        }
        paymentSheetInitTimeoutRef.current = null;
      }
    };
    
    // Add a delay to ensure state is fully updated
    paymentSheetInitTimeoutRef.current = setTimeout(() => {
      paymentSheetInitTimeoutRef.current = null;
      init();
    }, 250);

    return () => {
      if (paymentSheetInitTimeoutRef.current) {
        clearTimeout(paymentSheetInitTimeoutRef.current);
        paymentSheetInitTimeoutRef.current = null;
      }
    };
  }, [bookingId, grandTotal, initPaymentSheet]);
  
  const onPayStripe = async () => {
    try {
      const { error } = await presentPaymentSheet();
      
      if (error) {
        Alert.alert('Plata a eșuat', error.message);
        return;
      }

      const ticketId = bookingId || `ticket-${Date.now()}`;
      const qrData = bookingId || ticketId;
      
      let pdfUri: string | undefined;
      try {
        const ticketForPdf = {
          id: ticketId,
          from,
          to,
          date,
          departureTime,
          arrivalTime,
          price: grandTotal,
          currency: finalCurrency,
          qrData,
          passengerName,
          createdAt: Date.now(),
        };
        pdfUri = await generateTicketPDF(ticketForPdf);
      } catch (pdfError: any) {
        // Continuăm chiar dacă generarea PDF eșuează
      }

      const ticketToSave = {
        id: ticketId,
        from,
        to,
        date,
        departureTime,
        arrivalTime,
        price: grandTotal,
        currency: finalCurrency,
        qrData,
        passengerName,
        createdAt: Date.now(),
        pdfUri,
      };

      try {
        await saveTicket(ticketToSave);
      } catch (saveError: any) {
        // Continuăm chiar dacă salvarea locală eșuează - backend-ul va trimite email
      }

      Alert.alert(
        'Plată reușită!', 
        'Biletul poate fi găsit în aplicație în secțiunea "Biletele Mele".',
        [
          { 
            text: 'OK',
            onPress: () => navigation.reset({ 
              index: 0, 
              routes: [{ name: 'Search' }] 
            })
          }
        ]
      );
    } catch (e: any) {
      Alert.alert('Plata a eșuat', e?.message || 'Te rugăm să încerci din nou.');
    }
  };

  const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <View style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepsRow}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepDone]}><Ionicons name="checkmark" size={12} color="#fff" /></View>
          <Text style={styles.stepText}>Detalii</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <Text style={styles.stepTextActive}>Plată</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>Bilete</Text>
        </View>
      </View>

      {/* Order summary */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Rezumat comandă</Text>
        </View>
        <Text style={styles.tripLine}>{from} → {to}</Text>
        <Text style={styles.tripMeta}>{new Date(date).toLocaleDateString('ro-RO')} • {departureTime} → {arrivalTime}</Text>
        {!!passengerName && <Text style={styles.tripMeta}>Pasager: {passengerName}</Text>}
        <View style={styles.divider} />
        <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{grandTotal.toFixed(2)} {finalCurrency}</Text></View>
      </View>

      {/* Payment methods - Card only */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Metodă de plată</Text>
        <View style={styles.methodsRow}>
          <View style={[styles.methodChip, styles.methodActive]}>
            <Ionicons name="card-outline" size={16} color="#111827" />
            <Text style={styles.methodText}>Card</Text>
          </View>
        </View>
      </View>

      {/* Secure badge */}
      <View style={styles.secureRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#16a34a" />
        <Text style={styles.secureText}>Plățile sunt criptate și conforme cu PCI-DSS</Text>
      </View>

      {/* Pay CTA */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} style={styles.button} onPress={onPayStripe} disabled={loading}>
          <LinearGradient colors={["#6366f1", "#06b6d4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGrad}>
            <Ionicons name="lock-closed-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>{loading ? 'Se pregătește…' : `Plătește ${grandTotal.toFixed(2)} ${finalCurrency}`}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.terms}>Prin plată, ești de acord cu Termenii și Politica de Confidențialitate.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e5e7eb' },
  stepActive: { backgroundColor: '#6366f1' },
  stepDone: { backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  stepTextActive: { fontSize: 12, color: '#111827', marginTop: 6, fontWeight: '700' },
  stepLine: { width: 40, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 8 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  orderId: { fontSize: 12, color: '#6b7280' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryLabel: { color: '#6b7280' },
  summaryValue: { color: '#111827', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#111827' },

  methodsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  methodChip: { flexDirection: 'row', gap: 6, backgroundColor: '#f1f5f9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  methodActive: { backgroundColor: '#e0e7ff' },
  methodText: { color: '#111827', fontWeight: '700' },
  methodTextMuted: { color: '#6b7280', fontWeight: '700' },

  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 8, justifyContent: 'center' },
  secureText: { color: '#16a34a', fontWeight: '700' },

  button: { borderRadius: 16, overflow: 'hidden' },
  buttonGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '800' },
  terms: { textAlign: 'center', color: '#94a3b8', marginTop: 8, fontSize: 12 },
  tripLine: { marginTop: 6, fontWeight: '800', color: '#111827' },
  tripMeta: { color: '#6b7280', marginTop: 2 },
});

export default CheckoutScreen;
