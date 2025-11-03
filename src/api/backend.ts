// src/api/backend.ts
const API_URL = process.env.EXPO_SERVER_URL;

export type City = string;

// GET /api/cities
export const getCities = async (): Promise<City[]> => {
  try {
    const response = await fetch(`${API_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data.cities;
  } catch (error) {
    return [];
  }
};

// GET /api/destinations/:from
export const getDestinationsFor = async (from: City): Promise<City[]> => {
  try {
    const response = await fetch(`${API_URL}/destinations/${encodeURIComponent(from)}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    const data = await response.json();
    return data.destinations;
  } catch (error) {
    return [];
  }
};

// POST /api/trips/search
export const getTripInfo = async (from: City, to: City, dateISO: string) => {
  try {
    const response = await fetch(`${API_URL}/trips/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, date: dateISO })
    });
    
    if (!response.ok) throw new Error('Failed to fetch trip info');
    const data = await response.json();
    
    return {
      price: data.price,
      currency: data.currency,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      fromStation: data.fromStation,
      toStation: data.toStation
    };
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (bookingData: any) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create booking: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
};


