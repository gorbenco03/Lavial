import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Eroare', 'Te rugăm să completezi toate câmpurile.');
      return;
    }
  
    setSubmitting(true);
  
    try {
      // Trimitem datele la back-end
      const response = await fetch('http://localhost:3009/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        // Dacă back-endul a răspuns cu eroare
        const errorData = await response.json();
        Alert.alert('Eroare', errorData.error || 'Nu s-a putut trimite mesajul.');
      } else {
        // Răspuns de succes
        Alert.alert('Succes', 'Mesajul tău a fost trimis!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      // Eroare de rețea sau alt tip de excepție
     
      Alert.alert('Eroare', 'A apărut o problemă la trimiterea mesajului.');
    } finally {
      setSubmitting(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Eroare', 'Nu s-a putut deschide link-ul.'));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Contactează-ne</Text>
         
        </View>

        {/* Contact Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Trimite-ne un mesaj</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <FontAwesome5 name="user" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nume"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholderTextColor="#B0C4DE"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#B0C4DE"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <FontAwesome5 name="tag" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Subiect"
              value={formData.subject}
              onChangeText={(text) => handleChange('subject', text)}
              placeholderTextColor="#B0C4DE"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="chatbox-outline" size={20} color="#3D87E4" />
            </View>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Mesaj"
              value={formData.message}
              onChangeText={(text) => handleChange('message', text)}
              multiline
              numberOfLines={4}
              placeholderTextColor="#B0C4DE"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#3D87E4', '#6AA9FF']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Trimite</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informații de contact</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('tel:+37369175033')}
          >
            <View style={styles.contactIconContainer}>
              <FontAwesome5 name="phone-alt" size={20} color="#3D87E4" />
            </View>
            <Text style={styles.contactText}>MD: +373 69 175 033</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('tel:+40767957579')}
          >
            <View style={styles.contactIconContainer}>
              <FontAwesome5 name="phone-alt" size={20} color="#3D87E4" />
            </View>
            <Text style={styles.contactText}>RO: +40 767 957 579</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('mailto:contact@lavial.ro')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#3D87E4" />
            </View>
            <Text style={styles.contactText}>contact@lavial.ro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('mailto:rezervare@lavial.ro')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#3D87E4" />
            </View>
            <Text style={styles.contactText}>rezervare@lavial.ro</Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <FontAwesome5 name="map-marker-alt" size={20} color="#3D87E4" />
            </View>
            <Text style={styles.contactText}>Bulevardul Republicii nr.6, Reșița 320127</Text>
          </View>
        </View>

        {/* Travel Conditions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Condiții de călătorie</Text>
          <Text style={styles.conditionsText}>
            Transportatorul se obligă să depună eforturi pentru a transporta pasagerul și bagajele cu promptitudine. Rezervările pentru întoarcere se vor face obligatoriu cu 15 zile înainte de data preconizată.{'\n\n'}
            Călătorii vor fi prezenți la autocar cu 30 de minute înainte de plecarea în cursă. Orice amânare sau renunțare la biletul de călătorie se va anunța cu 24 de ore înainte de ora plecării. În această situație se va reține 20€ din contravaloarea biletului de călătorie achitat. În caz de renunțare la biletul de călătorie în ziua plecării, se restituie 50% din valoarea biletului de călătorie achitat. În cazul în care călătorul nu mai folosește biletul de retur, restituirea se va calcula conform formulei: Preț bilet Tur/Retur – Preț bilet Tur – 20€.{'\n\n'}
            Nicio plecare în cursă nu poate fi amânată sau întârziată din cauza întârzierii călătorilor.{'\n\n'}
            Transportatorul nu își asumă răspunderea cu privire la documentele de trecere a frontierei, necorespunzătoare sau incomplete. Asigurarea medicală nu este inclusă în prețul biletului. Transportatorul nu își asumă responsabilitatea asupra conținutului și cantității bagajelor, inclusiv răspunderea vamală. Călătorul este obligat să respecte legislația în vigoare cu privire la acest lucru.{'\n\n'}
            Biletele de călătorie pierdute sau furate nu se pot înlocui. Nu se admit la transport animale. Fumatul și consumul de băuturi alcoolice în autocar sunt strict interzise. Toate pagubele cauzate de călător autocarului, indiferent de motivul legal, obligă călătorul la înlocuirea totală a pagubei.
          </Text>
        </View>

        {/* Social Media Links */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Urmărește-ne</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://www.facebook.com/RomaniaSpaniaPortugalia')}
            >
              <FontAwesome5 name="facebook-f" size={20} color="#3D87E4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://instagram.com/lavial_europa')}
            >
              <FontAwesome5 name="instagram" size={20} color="#3D87E4" />
            </TouchableOpacity>
          
           
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
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
  sectionCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D87E4',
    marginBottom: 15,
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
    marginVertical:5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 10,
  },
  messageInput: {
    height: 50,
    textAlignVertical: 'top',
  },
 
  submitButton: {
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#333333',
  },
  conditionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E8FF',
  },
});