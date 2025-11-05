import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Easing, ScrollView, KeyboardAvoidingView, Modal, FlatList, TextInput, Vibration, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { getCities, getDestinationsFor, getRouteAvailableDays } from '../api/backend';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { gradients, palette, shadow } from '../styles/theme';
import { addRecentFrom, addRecentTo, getRecentFrom, getRecentTo } from '../utils/recentCities';


type Props = NativeStackScreenProps<AppStackParamList, 'Search'>;

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const hintPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(hintPulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(hintPulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [fade, hintPulse]);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  const [cities, setCities] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const fetchedCities = await getCities();
      setCities(fetchedCities);
    })();
  }, []);
  
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [availableDays, setAvailableDays] = useState<{ availableDaily: boolean; availableDays: number[] | null } | null>(null);
  const [loadingDays, setLoadingDays] = useState(false);

  // Today (start of day) used to clamp and as minimumDate
  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  // Modals for selection
  const [fromModal, setFromModal] = useState(false);
  const [toModal, setToModal] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const filteredFrom = useMemo(
    () => cities.filter(c => c.toLowerCase().includes(searchFrom.toLowerCase())),
    [cities, searchFrom]
  );
  const [destinations, setDestinations] = useState<string[]>([]);
  useEffect(() => {
    if (from) {
      (async () => {
        const dests = await getDestinationsFor(from);
        setDestinations(dests);
      })();
    } else {
      setDestinations([]);
    }
  }, [from]);

  // Helper function to find next available date
  const findNextAvailableDate = (startDate: Date, availableDaysArray: number[]): Date => {
    const minAvailableDate = new Date(2025, 10, 20); // November 20, 2025
    minAvailableDate.setHours(0, 0, 0, 0);
    
    // Start from minimum available date if startDate is before it
    const result = startDate < minAvailableDate ? new Date(minAvailableDate) : new Date(startDate);
    
    for (let i = 0; i < 30; i++) { // Check up to 30 days ahead
      const day = result.getDay();
      if (availableDaysArray.includes(day) && result >= minAvailableDate) {
        return result;
      }
      result.setDate(result.getDate() + 1);
    }
    return result; // Return the date we found (or last checked date)
  };

  // Check if a date is available
  const isDateAvailable = (checkDate: Date): boolean => {
    if (!availableDays) return true; // If no route selected, allow all dates
    if (availableDays.availableDaily) return true; // If daily available, allow all dates
    if (!availableDays.availableDays) return true; // Safety check
    const dayOfWeek = checkDate.getDay();
    return availableDays.availableDays.includes(dayOfWeek);
  };

  // Helper function to get day of week from date string (YYYY-MM-DD) - avoids timezone issues
  const getDayOfWeekFromDateString = (dateString: string): number => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone to avoid UTC conversion issues
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getDay();
  };

  // Generate marked dates for calendar - disable unavailable days
  const markedDates = useMemo(() => {
    const marked: any = {};
    
    // Mark selected date - use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    marked[dateStr] = { selected: true, selectedColor: '#6366f1' };

    // If route is selected and has restrictions, mark unavailable days
    if (availableDays && !availableDays.availableDaily && availableDays.availableDays) {
      // Minimum date for restricted routes (2025-11-20)
      const minAvailableDate = new Date(2025, 10, 20); // November 20, 2025 (month is 0-indexed)
      minAvailableDate.setHours(0, 0, 0, 0);
      const minAvailableDateStr = '2025-11-20';
      
      // Generate dates for next 2 years to ensure all dates in calendar are properly marked
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setFullYear(endDate.getFullYear() + 2); // Extend to 2 years ahead

      const currentDate = new Date(today);
      
      while (currentDate <= endDate) {
        // Use local date string, not ISO string, to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        // Calculate day of week from date string (not from Date object to avoid timezone issues)
        const dayOfWeek = getDayOfWeekFromDateString(dateKey);
        
        // Check if date is before minimum available date
        const isBeforeMinDate = currentDate < minAvailableDate;
        
        // Only mark dates that are NOT the selected date
        if (dateKey !== dateStr) {
          // If date is before minimum available date, disable it
          if (isBeforeMinDate) {
            marked[dateKey] = { 
              disabled: true, 
              disableTouchEvent: true,
              selectable: false,
              textColor: '#cbd5e1',
              selected: false
            };
          }
          // If date is on or after minimum date, check if day of week is available
          else if (!availableDays.availableDays.includes(dayOfWeek)) {
            marked[dateKey] = { 
              disabled: true, 
              disableTouchEvent: true,
              selectable: false,
              textColor: '#cbd5e1',
              selected: false
            };
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return marked;
  }, [date, availableDays]);

  // Fetch available days when both from and to are selected
  useEffect(() => {
    if (from && to) {
      (async () => {
        setLoadingDays(true);
        try {
          const daysData = await getRouteAvailableDays(from, to);
          
          setAvailableDays({
            availableDaily: daysData.availableDaily,
            availableDays: daysData.availableDays
          });
          
          // If current date is not available, find next available date
          if (!daysData.availableDaily && daysData.availableDays) {
            const minAvailableDate = new Date(2025, 10, 20); // November 20, 2025
            minAvailableDate.setHours(0, 0, 0, 0);
            
            setDate(currentDate => {
              const currentDay = currentDate.getDay();
              
              // Check if current date is before minimum date OR day of week is not available
              if (currentDate < minAvailableDate || !daysData.availableDays!.includes(currentDay)) {
                const nextAvailable = findNextAvailableDate(currentDate, daysData.availableDays!);
                return nextAvailable;
              }
              return currentDate;
            });
          }
        } catch (error) {
          // Default to daily available on error
          setAvailableDays({ availableDaily: true, availableDays: null });
        } finally {
          setLoadingDays(false);
        }
      })();
    } else {
      setAvailableDays(null);
    }
  }, [from, to]);
  const filteredTo = useMemo(
    () => destinations.filter(c => c.toLowerCase().includes(searchTo.toLowerCase())),
    [destinations, searchTo]
  );

  const [recentFrom, setRecentFrom] = useState<string[]>([]);
  const [recentTo, setRecentTo] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setRecentFrom(await getRecentFrom());
      setRecentTo(await getRecentTo());
    })();
  }, []);

  const onSelectFrom = async (city: string) => {
    setFrom(city);
    setTo('');
    setFromModal(false);
    setSearchFrom('');
    setRecentFrom(await addRecentFrom(city));
    Vibration.vibrate(5);
  };

  const onSelectTo = async (city: string) => {
    setTo(city);
    setToModal(false);
    setSearchTo('');
    setRecentTo(await addRecentTo(city));
    Vibration.vibrate(5);
  };

  const swap = () => {
    if (!from || !to) return;
    const nf = to; const nt = from;
    setFrom(nf); setTo(nt);
    Vibration.vibrate(10);
  };

  const modalSlide = useRef(new Animated.Value(60)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const startModalAnim = () => {
    modalSlide.setValue(60); modalOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(modalSlide, { toValue: 0, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { if (fromModal || toModal) startModalAnim(); }, [fromModal, toModal]);

  const onContinue = () => {
    if (!from || !to || !date) return;
    navigation.navigate('TripDetails', { from, to, date: date.toISOString() });
  };

  const hintOpacity = hintPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const hintTranslate = hintPulse.interpolate({ inputRange: [0, 1], outputRange: [4, 0] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#60a5fa", "#818cf8", "#a78bfa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroRow}>
            <Ionicons name="bus" size={28} color="#fff" />
            <Text style={styles.heroTitle}>Lavial</Text>
          </View>
        </View>
        <Text style={styles.heroSubtitle}>Călătorii premium, reinventate</Text>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.container, { opacity: fade }]}>
            <View style={[styles.card, shadow.card]}>
              <Text style={styles.sectionTitle}>Planifică-ți călătoria</Text>

              {/* From selector */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.inputRow, { flex: 1 }]} onPress={() => setFromModal(true)}>
                  <Ionicons name="navigate-outline" size={18} color={palette.textMuted} />
                  <Text style={[styles.input, styles.inputTextOnly, { color: from ? '#0f172a' : palette.textMuted }]}>
                    {from || 'Selectează orașul de plecare'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.swapBtn} onPress={swap} disabled={!from || !to}>
                  <Ionicons name="swap-vertical" size={18} color={(!from || !to) ? '#cbd5e1' : '#111827'} />
                </TouchableOpacity>
              </View>

              {/* To selector */}
              <TouchableOpacity style={styles.inputRow} onPress={() => from && setToModal(true)} disabled={!from}>
                <Ionicons name="location-outline" size={18} color={palette.textMuted} />
                <Text style={[styles.input, styles.inputTextOnly, { color: to ? '#0f172a' : palette.textMuted }]}>
                  {to || (from ? 'Selectează orașul de destinație' : 'Alege mai întâi orașul de plecare')}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={styles.label}>Data plecării</Text>
                {availableDays && !availableDays.availableDaily && availableDays.availableDays && (
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                    <Ionicons name="information-circle-outline" size={14} color="#64748b" />
                    <Text style={styles.availableDaysHint}>
                      {availableDays.availableDays.map(d => {
                        const dayNames = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'];
                        return dayNames[d];
                      }).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.inputRow} onPress={() => setShowPicker(true)} disabled={!from || !to}>
                <Ionicons name="calendar-outline" size={18} color={(!from || !to) ? '#cbd5e1' : palette.textMuted} />
                <Text style={[styles.input, styles.inputTextOnly, { color: (!from || !to) ? '#cbd5e1' : '#0f172a' }]}>
                  {new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <Modal
                  visible={showPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowPicker(false)}
                >
                  <View style={styles.calendarModalOverlay}>
                    <View style={styles.calendarModalContent}>
                      <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>Selectează data</Text>
                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                          <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>
                      </View>
                      <Calendar
                        current={(() => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        })()}
                        minDate={(() => {
                          const year = todayStart.getFullYear();
                          const month = String(todayStart.getMonth() + 1).padStart(2, '0');
                          const day = String(todayStart.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        })()}
                        markedDates={markedDates}
                        disableAllTouchEventsForDisabledDays={true}
                        onDayPress={(day) => {
                          // Parse date string to avoid timezone issues
                          const [year, month, dayNum] = day.dateString.split('-').map(Number);
                          
                          // Calculate day of week using the same helper function as markedDates
                          const dayOfWeek = getDayOfWeekFromDateString(day.dateString);
                          
                          // Check if this day is marked as disabled
                          const markedDate = markedDates[day.dateString];
                          
                          // Check if explicitly disabled in markedDates first
                          if (markedDate?.disabled) {
                            return; // Don't allow selection
                          }
                          
                          // Check if date is before minimum available date for restricted routes
                          if (availableDays && !availableDays.availableDaily && availableDays.availableDays) {
                            const minAvailableDate = new Date(2025, 10, 20); // November 20, 2025
                            minAvailableDate.setHours(0, 0, 0, 0);
                            const selectedDateObj = new Date(year, month - 1, dayNum);
                            selectedDateObj.setHours(0, 0, 0, 0);
                            
                            if (selectedDateObj < minAvailableDate) {
                              Alert.alert(
                                'Dată indisponibilă',
                                'Rutele cu restricții sunt disponibile doar începând cu 20 noiembrie 2025.',
                                [{ text: 'OK' }]
                              );
                              return;
                            }
                          }
                          
                          // Check availability directly from availableDays
                          let isAvailable = true;
                          if (availableDays && !availableDays.availableDaily && availableDays.availableDays) {
                            isAvailable = availableDays.availableDays.includes(dayOfWeek);
                            
                            if (!isAvailable) {
                              return;
                            }
                          }
                          
                          if (isAvailable) {
                            // Create date object for setting state (keep local time)
                            const selectedDate = new Date(year, month - 1, dayNum);
                            selectedDate.setHours(0, 0, 0, 0);
                            setDate(selectedDate);
                            setShowPicker(false);
                          }
                        }}
                        theme={{
                          backgroundColor: '#ffffff',
                          calendarBackground: '#ffffff',
                          textSectionTitleColor: '#64748b',
                          selectedDayBackgroundColor: '#6366f1',
                          selectedDayTextColor: '#ffffff',
                          todayTextColor: '#6366f1',
                          dayTextColor: '#0f172a',
                          textDisabledColor: '#cbd5e1',
                          dotColor: '#6366f1',
                          selectedDotColor: '#ffffff',
                          arrowColor: '#6366f1',
                          monthTextColor: '#0f172a',
                          textDayFontWeight: '500',
                          textMonthFontWeight: '800',
                          textDayHeaderFontWeight: '600',
                          textDayFontSize: 16,
                          textMonthFontSize: 18,
                          textDayHeaderFontSize: 13,
                        }}
                        enableSwipeMonths={true}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  style={[styles.button, (!from || !to || !date) && styles.buttonDisabled]}
                  disabled={!from || !to || !date}
                  onPress={onContinue}
                >
                  <LinearGradient colors={gradients.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGrad}>
                    <Ionicons name="search" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Vezi detalii</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating My Tickets button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Tickets')} activeOpacity={0.9}>
        <LinearGradient colors={["#6366f1", "#06b6d4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabGrad}>
          <Ionicons name="ticket-outline" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <Animated.View style={[styles.fabHint, { opacity: hintOpacity, transform: [{ translateY: hintTranslate }] }]}>
        <Text style={styles.fabHintText}>Biletele Mele</Text>
      </Animated.View>

      {/* From Modal */}
      <Modal visible={fromModal} animationType="none" transparent onRequestClose={() => setFromModal(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ translateY: modalSlide }] }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Selectează orașul de plecare</Text>
              <TouchableOpacity onPress={() => setFromModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            {recentFrom.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#64748b', marginBottom: 6 }}>Recent</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recentFrom.map(c => (
                    <TouchableOpacity key={c} onPress={() => onSelectFrom(c)}>
                      <Text style={styles.hint}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#6b7280" />
              <TextInput
                placeholder="Caută oraș"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={searchFrom}
                onChangeText={setSearchFrom}
              />
            </View>
            <FlatList
              data={filteredFrom}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cityItem} onPress={() => onSelectFrom(item)}>
                  <Ionicons name="navigate-outline" size={18} color="#111827" />
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>

      {/* To Modal */}
      <Modal visible={toModal} animationType="none" transparent onRequestClose={() => setToModal(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ translateY: modalSlide }] }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Selectează orașul de destinație</Text>
              <TouchableOpacity onPress={() => setToModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            {recentTo.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#64748b', marginBottom: 6 }}>Recent</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recentTo.map(c => (
                    <TouchableOpacity key={c} onPress={() => onSelectTo(c)}>
                      <Text style={styles.hint}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#6b7280" />
              <TextInput
                placeholder="Caută oraș"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={searchTo}
                onChangeText={setSearchTo}
              />
            </View>
            <FlatList
              data={filteredTo}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cityItem} onPress={() => onSelectTo(item)}>
                  <Ionicons name="location-outline" size={18} color="#111827" />
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyDest}>Nu sunt destinații disponibile. Alege un alt oraș de plecare.</Text>}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7fb' },
  hero: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 28, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: '#f8fafc', opacity: 0.95, marginTop: 12 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  container: { },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  label: { color: '#64748b', fontSize: 12, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, marginTop: 8, backgroundColor: '#fff' },
  input: { flex: 1, color: '#0f172a' },
  inputTextOnly: { paddingVertical: 0 },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hint: { backgroundColor: '#eef2ff', color: '#1e293b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  button: { marginTop: 18, borderRadius: 16, overflow: 'hidden' },
  buttonGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800' },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 28, overflow: 'hidden' },
  fabGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabHint: { position: 'absolute', bottom: 92, right: 24, backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  fabHintText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '70%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 10 },
  searchInput: { flex: 1, color: '#111827' },
  cityItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  cityText: { color: '#111827', fontSize: 16 },
  emptyDest: { color: '#6b7280', textAlign: 'center', marginTop: 10 },
  swapBtn: { padding: 8 },
  availableDaysHint: { color: '#64748b', fontSize: 11 },
  calendarModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarModalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, width: '90%', maxWidth: 400 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
});

export default SearchScreen;
