import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const BusTicketPro = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo-lavial.png')} style={styles.logo}/>
      <Text style={styles.title}>Lavial</Text>
      <Text style={styles.subtitle}>Cauta destinatia ta</Text>

      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#000" />
        <TextInput
          style={styles.input}
          placeholder="De unde pleci? "
        />
      </View>

      <View style={styles.chooseSeatSection}>
        <MaterialIcons name="event-seat" size={20} color="#000" />
        <TextInput
          style={styles.input}
          placeholder="Destinatia ta"
        />
      </View>

      <TouchableOpacity style={styles.buttonContainer} onPress={() => {}}>
        <Text style={styles.buttonText}>Cauta bilet</Text>
      </TouchableOpacity>

      {/* <View style={styles.signIn}>
        <Text>New to BusTicketPro?</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 120, // Set the size of your image
    marginLeft:40,
  },
  title: {
    color: '#030303',
    fontSize: 34,
    fontFamily: 'Roboto',
    fontWeight: "800",
    lineHeight: 48,
    textAlign: 'center',
  },
  subtitle: {
    color: '#030303',
    fontSize: 16,
    fontFamily: 'Roboto',
    lineHeight: 24,
    textAlign: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  
    borderWidth: 1,
    shadowColor: 'rgba(64,60,67,0.24)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3, // You might need to adjust this to get the desired effect
    backgroundColor: '#ffffff',
    borderColor: '#000',
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    marginTop: 20, 
  },
  chooseSeatSection: {
    flexDirection: 'row',
    alignItems: 'center',
  
    borderWidth: 1,
    shadowColor: 'rgba(64,60,67,0.24)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3, // You might need to adjust this to get the desired effect
    backgroundColor: '#ffffff',
    borderColor: '#000',
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: '#268df5',
    paddingVertical: 10, // Adjust the padding as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Roboto',
    fontWeight: '600', // Make sure '600' is a valid weight for Roboto on the platform
    lineHeight: 22, // lineHeight is a number
  },
  signInButtonText: {
    color: '#007AFF', // Use the same blue color as the default Button
    fontSize: 18, // Choose an appropriate font size
    fontFamily: 'Roboto',
    fontWeight: '500', // Choose a weight that suits your design
    // Add other styling as needed
  },
});

export default BusTicketPro;
