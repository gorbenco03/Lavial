import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Passenger {
  name: string;
  surname: string;
  phone: string;
  email: string;
  passportSerial: string;
  isStudent: boolean;
  studentIdSerial: string;
}

interface Seat {
  seatNumber: number;
  isAvailable: boolean;
  isSelected: boolean;
}

interface SeatSelectionPageProps {
  navigation: any;
  route: any;
}

const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({ navigation, route }) => {
  // Date primite din ecranul anterior:
  // - from, to, outboundDate, returnDate, numberOfPeople, passengers[]
  const {
    from,
    to,
    outboundDate,
    returnDate,
    numberOfPeople,
    passengers,
  } = route.params;

  // Vom avea 2 array-uri de locuri: tur și retur.
  const [outboundSeats, setOutboundSeats] = useState<Seat[]>([]);
  const [returnSeats, setReturnSeats] = useState<Seat[]>([]);
  const [loadingOutbound, setLoadingOutbound] = useState<boolean>(true);
  const [loadingReturn, setLoadingReturn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  // Numărul total de locuri în autobuz (46)
  const totalSeats = 46;

  // Generăm array cu 46 locuri disponibile, toate setate isAvailable = true inițial
  const generateSeatArray = (): Seat[] => {
    return Array.from({ length: totalSeats }, (_, index) => {
      const seatNumber = index + 1;
      return {
        seatNumber,
        isAvailable: true,
        isSelected: false,
      };
    });
  };

  // Funcție ajutătoare de formatat data pentru backend ("YYYY-MM-DD")
  const formatDateForBackend = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  // Fetch locuri disponibile pentru TUR
  const fetchOutboundSeats = async () => {
    try {
      setLoadingOutbound(true);
      const dateStr = formatDateForBackend(outboundDate);
      const queryParams = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${dateStr}`;

      const response = await fetch(`http://localhost:3006/available-seats${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch outbound seats');
      }

      const data = await response.json();
      const takenSeats: number[] = data.takenSeats || [];

      const seats = generateSeatArray().map((seat) => ({
        ...seat,
        isAvailable: !takenSeats.includes(seat.seatNumber),
      }));

      setOutboundSeats(seats);
    } catch (error) {
      console.error(error);
      Alert.alert('Eroare', 'A apărut o eroare la preluarea locurilor disponibile pentru tur.');
    } finally {
      setLoadingOutbound(false);
    }
  };

  // Fetch locuri disponibile pentru RETUR
  const fetchReturnSeats = async () => {
    if (!returnDate) {
      setReturnSeats(generateSeatArray());
      setLoadingReturn(false);
      return;
    }
    try {
      setLoadingReturn(true);
      const dateStr = formatDateForBackend(returnDate);
      const queryParams = `?from=${encodeURIComponent(to)}&to=${encodeURIComponent(from)}&date=${dateStr}`;

      const response = await fetch(`http://localhost:3006/available-seats${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch return seats');
      }

      const data = await response.json();
      const takenSeats: number[] = data.takenSeats || [];

      const seats = generateSeatArray().map((seat) => ({
        ...seat,
        isAvailable: !takenSeats.includes(seat.seatNumber),
      }));
      setReturnSeats(seats);
    } catch (error: any) {
      console.error('Eroare la fetchReturnSeats:', error.message);
      Alert.alert('Eroare', `A apărut o eroare la preluarea locurilor disponibile pentru retur: ${error.message}`);
      setReturnSeats(generateSeatArray()); // fallback: toate locurile apar disponibile
    } finally {
      setLoadingReturn(false);
    }
  };

  useEffect(() => {
    fetchOutboundSeats();
    fetchReturnSeats();
  }, []);

  // Funcție care “toggle”-ează selecția unui loc.
  const toggleSeatSelection = (
    seatArray: Seat[],
    setSeatArray: React.Dispatch<React.SetStateAction<Seat[]>>,
    seatNumber: number
  ) => {
    setSeatArray(
      seatArray.map((s) =>
        s.seatNumber === seatNumber && s.isAvailable
          ? { ...s, isSelected: !s.isSelected }
          : s
      )
    );
  };

  // Alege un loc pentru TUR, dar limităm la # = numberOfPeople
  const handleOutboundSeatPress = (seatNumber: number) => {
    const selectedCount = outboundSeats.filter((s) => s.isSelected).length;
    const isCurrentlySelected = outboundSeats.find((s) => s.seatNumber === seatNumber)?.isSelected;

    if (!isCurrentlySelected && selectedCount >= numberOfPeople) {
      return Alert.alert(
        'Selectare locuri',
        `Poți selecta maxim ${numberOfPeople} locuri pentru tur.`
      );
    }
    toggleSeatSelection(outboundSeats, setOutboundSeats, seatNumber);
  };

  // Alege un loc pentru RETUR, tot limitat la # = numberOfPeople
  const handleReturnSeatPress = (seatNumber: number) => {
    if (!returnDate) return; // dacă nu e cursă retur, nu facem nimic

    const selectedCount = returnSeats.filter((s) => s.isSelected).length;
    const isCurrentlySelected = returnSeats.find((s) => s.seatNumber === seatNumber)?.isSelected;

    if (!isCurrentlySelected && selectedCount >= numberOfPeople) {
      return Alert.alert(
        'Selectare locuri',
        `Poți selecta maxim ${numberOfPeople} locuri pentru retur.`
      );
    }
    toggleSeatSelection(returnSeats, setReturnSeats, seatNumber);
  };

  // Când utilizatorul confirmă locurile, rezervăm temporar locurile (în Redis) și mergem mai departe
  const handleConfirmSeats = async () => {
    // Obținem locurile selectate pentru TUR / RETUR
    const selectedOutbound = outboundSeats
      .filter((seat) => seat.isSelected)
      .map((seat) => seat.seatNumber);

    const selectedReturn = returnSeats
      .filter((seat) => seat.isSelected)
      .map((seat) => seat.seatNumber);

    // Validări
    if (selectedOutbound.length < numberOfPeople) {
      return Alert.alert(
        'Selectare locuri',
        `Te rugăm să alegi ${numberOfPeople} locuri pentru tur.`
      );
    }
    if (returnDate && selectedReturn.length < numberOfPeople) {
      return Alert.alert(
        'Selectare locuri',
        `Te rugăm să alegi ${numberOfPeople} locuri pentru retur.`
      );
    }

    try {
      // --- Pas 1: Rezervare temporară locuri TUR --- //
      const dateStr = formatDateForBackend(outboundDate);

      // Construim array cu occupant info (pentru tur).
      // Ex.: 2 pasageri, 2 locuri => seat #7 -> passengers[0], seat #8 -> passengers[1]
      const outboundOccupants = selectedOutbound.map((seatNumber, index) => {
        const passenger = passengers[index];
        return {
          seatNumber,
          passengerName: passenger.name,
          passengerSurname: passenger.surname
        };
      });

      const reserveOutbound = await fetch('http://localhost:3006/reserve-seats-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          date: dateStr,
          seats: outboundOccupants, // trimitem array de obiecte cu occupant info
          expiresIn: 15 * 60,       // 15 minute
        }),
      });
      if (!reserveOutbound.ok) {
        const errorData = await reserveOutbound.json();
        throw new Error(errorData.error || 'Eroare la rezervarea temporară a locurilor pentru tur.');
      }
      const { reservationId: outboundReservationId } = await reserveOutbound.json();

      // --- Pas 2: Rezervare temporară locuri RETUR (dacă avem retur) --- //
      let returnReservationId = null;
      if (returnDate) {
        const returnDateStr = formatDateForBackend(returnDate);

        // Analog pentru retur
        const returnOccupants = selectedReturn.map((seatNumber, index) => {
          const passenger = passengers[index];
          return {
            seatNumber,
            passengerName: passenger.name,
            passengerSurname: passenger.surname
          };
        });

        const reserveReturn = await fetch('http://localhost:3006/reserve-seats-temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: to,
            to: from,
            date: returnDateStr,
            seats: returnOccupants,
            expiresIn: 15 * 60,
          }),
        });
        if (!reserveReturn.ok) {
          const errorData = await reserveReturn.json();
          throw new Error(errorData.error || 'Eroare la rezervarea temporară a locurilor pentru retur.');
        }
        returnReservationId = (await reserveReturn.json()).reservationId;
      }

      // --- Pas 3: Navigăm la pagina de Checkout, cu tot ce ne trebuie --- //
      navigation.navigate('Checkout', {
        from,
        to,
        outboundDate,
        returnDate,
        numberOfPeople,
        passengers,
        selectedOutboundSeats: selectedOutbound,
        selectedReturnSeats: selectedReturn,
        outboundReservationId,
        returnReservationId,
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Eroare', error.message);
    }
  };

  // Formatare data pentru afișare (în UI)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Render bus layout (2–2 arrangement)
  const renderBusLayout = (
    seatArray: Seat[],
    onSeatPress: (seatNumber: number) => void
  ) => {
    const rows: JSX.Element[] = [];

    // "Fața" autobuzului
    rows.push(
      <View key="front" style={styles.busFront}>
        <View style={styles.steeringWheel}>
          <MaterialIcons name="airline-seat-recline-normal" size={24} color="#3D87E4" />
        </View>
      </View>
    );

    // 12 rânduri total: primele 11 cu 4 locuri, ultimul cu 2
    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
      if (rowIndex < 11) {
        const seat1 = seatArray[rowIndex * 4];
        const seat2 = seatArray[rowIndex * 4 + 1];
        const seat3 = seatArray[rowIndex * 4 + 2];
        const seat4 = seatArray[rowIndex * 4 + 3];
        if (!seat1 || !seat2 || !seat3 || !seat4) break;

        rows.push(
          <View key={rowIndex} style={styles.seatRow}>
            <View style={styles.rowNumberContainer}>
              <Text style={styles.rowNumber}>{rowIndex + 1}</Text>
            </View>
            {renderSeatButton(seat1, onSeatPress)}
            {renderSeatButton(seat2, onSeatPress)}
            <View style={styles.aisle} />
            {renderSeatButton(seat3, onSeatPress)}
            {renderSeatButton(seat4, onSeatPress)}
          </View>
        );
      } else {
        // ultimul rând doar cu 2 locuri
        const seat1 = seatArray[44];
        const seat2 = seatArray[45];
        if (seat1 && seat2) {
          rows.push(
            <View key={rowIndex} style={styles.seatRow}>
              <View style={styles.rowNumberContainer}>
                <Text style={styles.rowNumber}>{rowIndex + 1}</Text>
              </View>
              {renderSeatButton(seat1, onSeatPress)}
              {renderSeatButton(seat2, onSeatPress)}
            </View>
          );
        }
      }
    }

    return <View style={styles.busContainer}>{rows}</View>;
  };

  // Butonul de loc
  const renderSeatButton = (seat: Seat, onSeatPress: (seatNumber: number) => void) => {
    const seatStyle = [
      styles.seatContainer,
      !seat.isAvailable && styles.seatTaken,
      seat.isSelected && styles.seatSelected,
    ];

    return (
      <TouchableOpacity
        key={seat.seatNumber}
        style={seatStyle}
        onPress={() => onSeatPress(seat.seatNumber)}
        disabled={!seat.isAvailable}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.seatNumber,
            !seat.isAvailable && styles.seatNumberTaken,
            seat.isSelected && styles.seatNumberSelected
          ]}
        >
          {seat.seatNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  // Mic sumar: câte locuri ai selectat pentru TUR și RETUR
  const renderSelectionSummary = () => {
    const selectedOutboundCount = outboundSeats.filter((s) => s.isSelected).length;
    const selectedReturnCount = returnSeats.filter((s) => s.isSelected).length;

    return (
      <View style={styles.selectionSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Plecare:</Text>
          <Text style={styles.summaryValue}>
            {selectedOutboundCount}/{numberOfPeople}
          </Text>
        </View>
        {returnDate && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Întoarcere:</Text>
            <Text style={styles.summaryValue}>
              {selectedReturnCount}/{numberOfPeople}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Selectare Locuri</Text>
        </View>

        {/* Main Card */}
        <View style={styles.formCard}>
          {/* Journey Info */}
          <View style={styles.journeyInfo}>
            <View style={styles.journeyDetail}>
              <MaterialIcons name="directions-bus" size={20} color="#3D87E4" />
              <Text style={styles.journeyText}>{from} → {to}</Text>
            </View>
            <View style={styles.journeyDetail}>
              <MaterialIcons name="event" size={20} color="#3D87E4" />
              <Text style={styles.journeyText}>
                {formatDate(outboundDate)}
                {returnDate ? ` - ${formatDate(returnDate)}` : ''}
              </Text>
            </View>
            <View style={styles.journeyDetail}>
              <MaterialIcons name="people" size={20} color="#3D87E4" />
              <Text style={styles.journeyText}>{numberOfPeople} pasageri</Text>
            </View>
          </View>

          {/* Tabs pentru tur / retur */}
          {returnDate && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'outbound' && styles.activeTab]}
                onPress={() => setActiveTab('outbound')}
              >
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color={activeTab === 'outbound' ? '#FFF' : '#3D87E4'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'outbound' && styles.activeTabText
                  ]}
                >
                  Plecare
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'return' && styles.activeTab]}
                onPress={() => setActiveTab('return')}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={activeTab === 'return' ? '#FFF' : '#3D87E4'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'return' && styles.activeTabText
                  ]}
                >
                  Întoarcere
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.legendAvailable]} />
              <Text style={styles.legendText}>Disponibil</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.legendSelected]} />
              <Text style={styles.legendText}>Selectat</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.legendTaken]} />
              <Text style={styles.legendText}>Ocupat</Text>
            </View>
          </View>

          {/* Selection Summary */}
          {renderSelectionSummary()}

          {/* Seat Layout */}
          {(!returnDate || activeTab === 'outbound') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Locuri Plecare - {formatDateForBackend(outboundDate)}
              </Text>
              {loadingOutbound ? (
                <ActivityIndicator
                  size="large"
                  color="#3D87E4"
                  style={styles.loader}
                />
              ) : (
                renderBusLayout(outboundSeats, handleOutboundSeatPress)
              )}
            </View>
          )}

          {returnDate && activeTab === 'return' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Locuri Întoarcere - {formatDateForBackend(returnDate)}
              </Text>
              {loadingReturn ? (
                <ActivityIndicator
                  size="large"
                  color="#3D87E4"
                  style={styles.loader}
                />
              ) : (
                renderBusLayout(returnSeats, handleReturnSeatPress)
              )}
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSeats}
          >
            <Text style={styles.confirmButtonText}>Confirmă locurile</Text>
            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: '#3D87E4',
    fontWeight: '600',
  },
  formCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  journeyInfo: {
    marginBottom: 10,
  },
  journeyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  journeyText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderColor: '#3D87E4',
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3D87E4',
  },
  tabText: {
    marginLeft: 5,
    color: '#3D87E4',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#999',
  },
  legendAvailable: {
    backgroundColor: '#FFF',
  },
  legendSelected: {
    backgroundColor: '#3D87E4',
  },
  legendTaken: {
    backgroundColor: '#999',
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    marginRight: 5,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#3D87E4',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginTop: 20,
  },
  busContainer: {
    alignItems: 'center',
  },
  busFront: {
    alignItems: 'center',
    marginBottom: 10,
  },
  steeringWheel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D6E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowNumberContainer: {
    width: 30,
    alignItems: 'center',
  },
  rowNumber: {
    fontSize: 14,
    color: '#333',
  },
  aisle: {
    width: 24,
  },
  seatContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D87E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  seatTaken: {
    backgroundColor: '#999',
    borderColor: '#999',
  },
  seatSelected: {
    backgroundColor: '#3D87E4',
  },
  seatNumber: {
    color: '#3D87E4',
    fontSize: 12,
    fontWeight: '600',
  },
  seatNumberTaken: {
    color: '#fff',
  },
  seatNumberSelected: {
    color: '#fff',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#3D87E4',
    borderRadius: 6,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    marginRight: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SeatSelectionPage;