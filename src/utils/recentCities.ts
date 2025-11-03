import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_FROM = 'recent_from_cities';
const KEY_TO = 'recent_to_cities';
const LIMIT = 5;

async function pushUnique(key: string, value: string) {
  const raw = await AsyncStorage.getItem(key);
  const list = raw ? JSON.parse(raw) as string[] : [];
  const next = [value, ...list.filter(c => c !== value)].slice(0, LIMIT);
  await AsyncStorage.setItem(key, JSON.stringify(next));
  return next;
}

export async function addRecentFrom(city: string) {
  return pushUnique(KEY_FROM, city);
}
export async function addRecentTo(city: string) {
  return pushUnique(KEY_TO, city);
}

export async function getRecentFrom(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY_FROM);
  return raw ? JSON.parse(raw) as string[] : [];
}
export async function getRecentTo(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY_TO);
  return raw ? JSON.parse(raw) as string[] : [];
}




