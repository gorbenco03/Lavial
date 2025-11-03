import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Easing, RefreshControl, Alert } from 'react-native';
import { clearTickets, deleteTicket, getTickets, StoredTicket } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AppStackParamList, 'Tickets'>;

const TicketsScreen: React.FC<Props> = ({ navigation }) => {
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    const list = await getTickets();
    setTickets(list);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onDelete = async (id: string) => {
    await deleteTicket(id);
    await load();
  };

  const onClearAll = () => {
    Alert.alert('Șterge tot', 'Elimină toate biletele de pe acest dispozitiv?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => { await clearTickets(); await load(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Biletele Mele</Text>
        {tickets.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.clearText}>Șterge</Text>
          </TouchableOpacity>
        )}
      </View>
      {tickets.length === 0 ? (
        <View style={styles.empty}>
          <Animated.View style={[styles.emptyCard, { transform: [{ scale: pulse }] }]}>
            <Text style={styles.emptyTitle}>Nu există bilete încă</Text>
            <Text style={styles.emptyText}>Biletele tale cumpărate vor apărea aici</Text>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('TicketDetail', { id: item.id })}>
                <Text style={styles.cardTitle}>{item.from} → {item.to}</Text>
                <Text style={styles.cardMeta}>{new Date(item.date).toLocaleDateString('ro-RO')} • {item.departureTime} → {item.arrivalTime}</Text>
                {!!item.passengerName && <Text style={styles.cardMeta}>Pasager: {item.passengerName}</Text>}
                <Text style={styles.cardPrice}>{item.price.toFixed(2)} {item.currency || 'RON'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12, color: '#0f172a' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearText: { color: '#ef4444', fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptyText: { color: '#475569', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { color: '#6b7280', marginTop: 4 },
  cardPrice: { marginTop: 8, fontWeight: '800', color: '#111827' },
  deleteBtn: { paddingLeft: 6 },
});

export default TicketsScreen;
