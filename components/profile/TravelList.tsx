import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { EXPO_SERVER_URL } from '@env';

export interface Travel {
  _id: string;
  from: string;
  to: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  seats: number[];
  tripType: string;
}

const TravelList = () => {
  const [futureTravels, setFutureTravels] = useState<Travel[]>([]);
  const [todayTravels, setTodayTravels] = useState<Travel[]>([]);
  const [pastTravels, setPastTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'future' | 'past'>('today');

  const groupTravels = (travels: Travel[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const future: Travel[] = [];
    const today: Travel[] = [];
    const past: Travel[] = [];

    travels.forEach((travel) => {
      const travelDate = travel.date.split('T')[0];
      if (travelDate > todayStr) {
        future.push(travel);
      } else if (travelDate === todayStr) {
        today.push(travel);
      } else {
        past.push(travel);
      }
    });

    setFutureTravels(future);
    setTodayTravels(today);
    setPastTravels(past);
  };

  const downloadTicket = async (travelId: string) => {
    try {
      setDownloading(travelId);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`${EXPO_SERVER_URL}/ticket/${travelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Eroare la descărcarea biletului');
      }

      const fileUri = `${FileSystem.documentDirectory}${data.filename}`;
      await FileSystem.writeAsStringAsync(fileUri, data.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: fileUri,
          flags: 1,
          type: 'application/pdf',
        });
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('PDF salvat cu succes.', 'Deschide-l din managerul de fișiere.');
        }
      }
    } catch (err) {
      console.error('Eroare descărcare bilet:', err);
      Alert.alert('Eroare', 'Nu s-a putut deschide biletul.');
    } finally {
      setDownloading(null);
    }
  };

  const loadTravels = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`${EXPO_SERVER_URL}/auth/user-travels`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Eroare la obținerea călătoriilor');
      }

      groupTravels(data);
    } catch (error) {
      console.error('Eroare încărcare călătorii:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravels();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getJourneyDuration = (departure: string, arrival: string) => {
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);
    let durationHours = arrHours - depHours;
    let durationMinutes = arrMinutes - depMinutes;
    if (durationMinutes < 0) {
      durationHours--;
      durationMinutes += 60;
    }
    return `${durationHours}h ${durationMinutes}m`;
  };

  const renderTravel = ({ item: travel }: { item: Travel }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.tripType}>{travel.tripType === 'oneway' ? 'Dus' : 'Dus-Întors'}</Text>
          <View style={styles.dateContainer}>
            <FontAwesome5 name="calendar-alt" size={14} color="#3D87E4" />
            <Text style={styles.date}>{formatDate(travel.date)}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.stationInfo}>
            <Text style={styles.time}>{travel.departureTime}</Text>
            <View style={styles.stationDot} />
            <Text style={styles.station}>{travel.fromStation}</Text>
            <Text style={styles.city}>{travel.from}</Text>
          </View>
          <View style={styles.journeyLine}>
            <View style={styles.line} />   </View>
                 
          <View style={styles.stationInfo}>
            <Text style={styles.time}>{travel.arrivalTime}</Text>
            <View style={styles.stationDot} />
            <Text style={styles.station}>{travel.toStation}</Text>
            <Text style={styles.city}>{travel.to}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <MaterialIcons name="event-seat" size={14} color="#3D87E4" />
          <Text style={styles.details}>
            Loc{travel.seats.length > 1 ? 'uri' : ''}: <Text style={styles.highlightText}>{travel.seats.join(', ')}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => downloadTicket(travel._id)}
          disabled={downloading === travel._id}
        >
          <LinearGradient
            colors={['#3D87E4', '#6AA9FF']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {downloading === travel._id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome5 name="ticket-alt" size={14} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Descarcă biletul</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D87E4" />
        <Text style={styles.loadingText}>Se încarcă călătoriile...</Text>
      </View>
    );
  }

  const activeTravels = activeTab === 'today' ? todayTravels : activeTab === 'future' ? futureTravels : pastTravels;

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Azi ({todayTravels.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'future' && styles.activeTab]}
          onPress={() => setActiveTab('future')}
        >
          <Text style={[styles.tabText, activeTab === 'future' && styles.activeTabText]}>
            Viitoare ({futureTravels.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Trecute ({pastTravels.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Travel Carousel */}
      {activeTravels.length > 0 ? (
        <FlatList
          data={activeTravels}
          renderItem={renderTravel}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={300 + 20} // Card width (300) + margin (20)
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="train-outline" size={50} color="#3D87E4" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            {activeTab === 'today'
              ? 'Nu ai călătorii astăzi.'
              : activeTab === 'future'
              ? 'Nu ai călătorii viitoare.'
              : 'Nu ai călătorii trecute.'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadTravels}>
            <Text style={styles.refreshText}>Reîmprospătează</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TravelList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    paddingVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    marginHorizontal: 20,
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
  carouselContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 10,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tripType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3D87E4',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#333333',
    marginLeft: 6,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stationInfo: {
    flex: 1,
    alignItems: 'center',
    
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  stationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3D87E4',
    marginBottom: 8,
  },
  station: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  city: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  journeyLine: {
    flex: 2,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 25,
  },
  line: {
    height: 2,
    backgroundColor: '#3D87E4',
    width: '100%',
    opacity: 0.4,
  },
  duration: {
    fontSize: 11,
    color: '#3D87E4',
    fontWeight: '500',
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  details: {
    fontSize: 13,
    color: '#333333',
    marginLeft: 6,
  },
  highlightText: {
    fontWeight: '600',
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#3D87E4',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A617',
  },
});