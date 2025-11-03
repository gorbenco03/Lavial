import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ScrollView, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { getTickets, saveTicket, StoredTicket } from '../utils/storage';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { generateTicketPDF } from '../utils/ticketPdf';

type Props = NativeStackScreenProps<AppStackParamList, 'TicketDetail'>;

const TicketDetailScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;
  const [ticket, setTicket] = useState<StoredTicket | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const list = await getTickets();
      setTicket(list.find(t => t.id === id) || null);
    };
    load();
  }, [id]);

  if (!ticket) {
    return (
      <View style={styles.container}> 
        <Text style={styles.qrTitle}>Ticket</Text>
        <Text style={{ color: '#888', fontSize: 16, marginTop: 12 }}>Nu a fost găsit</Text>
      </View>
    );
  }

  const onCopy = async () => {
    await Clipboard.setString(ticket.qrData);
    Alert.alert('Copiat!', 'Codul biletului a fost copiat în clipboard');
  };

  const onShare = async () => {
    if (!ticket) return;

    setIsGenerating(true);
    try {
      let pdfUri = ticket.pdfUri;

      if (!pdfUri) {
        pdfUri = await generateTicketPDF(ticket);
        const updatedTicket = { ...ticket, pdfUri };
        await saveTicket(updatedTicket);
        setTicket(updatedTicket);
      }

      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert(
          'PDF Gata',
          `PDF-ul este gata la: ${pdfUri}\n\nPartajarea nu este disponibilă pe acest dispozitiv.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Eroare',
        error?.message || 'Nu s-a putut genera sau partaja PDF-ul. Te rugăm să încerci din nou.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Ticket Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerCol}>
            <Text style={styles.headerLabel}>De la</Text>
            <Text style={styles.headerValue}>{ticket.from}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#6366f1" style={styles.headerArrow} />
          <View style={styles.headerCol}>
            <Text style={styles.headerLabel}>La</Text>
            <Text style={styles.headerValue}>{ticket.to}</Text>
          </View>
        </View>
      </View>

      {/* Ticket Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color="#64748b" />
          <Text style={styles.detailText}>{new Date(ticket.date).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text style={styles.detailText}>Plecare: <Text style={styles.detailBold}>{ticket.departureTime}</Text></Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={18} color="#64748b" />
          <Text style={styles.detailText}>Sosire: <Text style={styles.detailBold}>{ticket.arrivalTime}</Text></Text>
        </View>
        {!!ticket.passengerName && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color="#64748b" />
            <Text style={styles.detailText}>Pasager: <Text style={styles.detailBold}>{ticket.passengerName}</Text></Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Plătit</Text>
          <Text style={styles.priceValue}>{ticket.price.toFixed(2)} {ticket.currency || 'RON'}</Text>
        </View>
      </View>

      {/* QR Code Card */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Cod QR Bilet</Text>
        <Text style={styles.qrSubtitle}>Scanează acest cod pentru a valida biletul tău</Text>
        
        <View style={styles.qrWrapper}>
          <QRCode
            value={ticket.qrData}
            size={240}
            color="#111827"
            backgroundColor="#ffffff"
            logoSize={60}
            logoBackgroundColor="transparent"
            ecl="H"
            quietZone={10}
          />
        </View>

        <Text style={styles.qrCodeText}>{ticket.qrData}</Text>
        <Text style={styles.qrNote}>Acest cod QR corespunde celui din biletul tău trimis pe email</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCopy} activeOpacity={0.8}>
          <Ionicons name="copy-outline" size={20} color="#6366f1" />
          <Text style={styles.actionText}>Copiază Cod</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, isGenerating && styles.actionBtnDisabled]} 
          onPress={onShare} 
          activeOpacity={0.8}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.actionText}>Se generează PDF...</Text>
            </>
          ) : (
            <>
              <Ionicons name="document-attach-outline" size={20} color="#6366f1" />
              <Text style={styles.actionText}>Exportă PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#6366f1" />
        <Text style={styles.infoText}>Păstrează acest bilet accesibil. Poți fi întrebat să îl prezinți înainte de îmbarcare.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 20 },
  
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCol: { flex: 1 },
  headerLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerArrow: { marginHorizontal: 16 },
  
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
  },
  detailBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  qrNote: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  actionText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 15,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eef2ff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4338ca',
    lineHeight: 18,
  },
});

export default TicketDetailScreen;
