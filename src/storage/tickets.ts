import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lavial.tickets.v1';

export type Ticket = {
  ticketId: string;
  createdAt: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  passenger: { name: string; surname: string; email: string; phone: string };
  total: number;
};

export async function getTickets(): Promise<Ticket[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  const all = await getTickets();
  const updated = [ticket, ...all];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function getTicket(ticketId: string): Promise<Ticket | undefined> {
  const all = await getTickets();
  return all.find(t => t.ticketId === ticketId);
}

export async function clearTickets() {
  await AsyncStorage.removeItem(KEY);
}
