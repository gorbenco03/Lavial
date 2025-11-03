import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredTicket = {
  id: string; // backend ticketId (or local fallback)
  from: string;
  to: string;
  date: string; // ISO
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string; // currency code (e.g., 'RON', 'EUR', 'USD')
  qrData: string; // the exact payload used for QR (e.g., ticketId or signed token)
  passengerName?: string; // primary passenger for quick reference
  createdAt: number;
  pdfUri?: string; // path to saved PDF file (optional)
};

const KEY = 'tickets';

export async function getTickets(): Promise<StoredTicket[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredTicket[];
  } catch {
    return [];
  }
}

export async function saveTicket(ticket: StoredTicket): Promise<void> {
  const list = await getTickets();
  const next = [ticket, ...list.filter(t => t.id !== ticket.id)];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function deleteTicket(id: string): Promise<void> {
  const list = await getTickets();
  const next = list.filter(t => t.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearTickets(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
