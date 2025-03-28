import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserData } from '../../pages/ProfilePage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TravelList from './TravelList';


const { width } = Dimensions.get('window');

interface Props {
  user: UserData;
  onLogout: () => void;
}


const ProfileDisplay = ({ user, onLogout } : any ) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);
  const [avatar, setAvatar] = useState(user.avatar || null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permisiune refuzată', 'Trebuie să acorzi permisiune pentru galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image);
    }
  };

  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:3008/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, avatar }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Eroare', data.message || 'Salvarea a eșuat.');
        return;
      }

      Alert.alert('Succes', 'Profilul a fost actualizat.');
      setEditMode(false);
    } catch (error) {
      console.error('Eroare salvare:', error);
      Alert.alert('Eroare', 'A apărut o problemă.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {formData.name} {formData.surname}
          </Text>
          <Text style={styles.headerSubtitle}>{formData.email}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatar ? { uri: avatar } : require('') // Add a fallback image
              }
              style={styles.avatar}
            />
            {editMode && (
              <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={20} color="#3D87E4" />
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informații personale</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <FontAwesome5 name="user" size={20} color="#3D87E4" />
              </View>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={formData.name}
                editable={editMode}
                placeholder="Nume"
                placeholderTextColor="#B0C4DE"
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <FontAwesome5 name="user" size={20} color="#3D87E4" />
              </View>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={formData.surname}
                editable={editMode}
                placeholder="Prenume"
                placeholderTextColor="#B0C4DE"
                onChangeText={(text) => handleChange('surname', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="email" size={20} color="#3D87E4" />
              </View>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#B0C4DE"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="badge" size={20} color="#3D87E4" />
              </View>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.studentIdSerial}
                editable={false}
                placeholder="Student Id"
                placeholderTextColor="#B0C4DE"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <FontAwesome5 name="phone-alt" size={20} color="#3D87E4" />
              </View>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={formData.phone || ''}
                editable={editMode}
                placeholder="Telefon"
                placeholderTextColor="#B0C4DE"
                onChangeText={(text) => handleChange('phone', text)}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              {editMode ? (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>Anulează</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                    <LinearGradient
                      colors={['#3D87E4', '#6AA9FF']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>Salvează</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditMode(true)}
                >
                  <LinearGradient
                    colors={['#3D87E4', '#6AA9FF']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Editează Profilul</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Travel Section */}
          <View style={styles.travelSection}>
            <Text style={styles.sectionTitle}>Călătoriile mele</Text>
            <TravelList />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Deconectare</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileDisplay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // Light blue background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#3D87E4',
    marginTop: 5,
  },
  profileCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3D87E4',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D87E4',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  inputDisabled: {
    color: '#B0C4DE',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD966',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A617',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  travelSection: {
    width: '100%',
    marginBottom: 20,
  },
  logoutButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
});