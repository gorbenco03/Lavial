// pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient';

import AuthPage from '../components/profile/AuthPage';
import ProfileDisplay from '../components/profile/ProfileDisplay';

export interface UserData {
  surname: string;
  avatar: string | null;
  userId: string;
  email: string;
  name: string;
  phone: string;
  isStudent: boolean;
  studentIdSerial: string;
}
const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const res = await fetch('http://localhost:3008/user-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Eroare la încărcarea profilului');
        }
  
        // adaugăm userId separat, din JWT
        const decoded: any = jwtDecode(token);
        const completeUser = {
          ...data,
          userId: decoded.userId,
          avatar: data.avatar || null,
        };
  
        setUser(completeUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#F0F0F0', '#F0F0F0']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4158D0" />
        <Text>Se încarcă...</Text>
      </LinearGradient>
    );
  }

  return user ? (
    <ProfileDisplay user={user} onLogout={handleLogout} />
  ) : (
    <AuthPage onLoginSuccess={loadUser} navigation={undefined} />
  );
};

export default ProfilePage;