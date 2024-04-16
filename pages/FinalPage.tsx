import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import QRCode from 'react-native-qrcode-svg';

const FinalPage = ({ route }) => {
  // Extrageți detaliile de călătorie din parametrii rutei
  const { travelDetails } = route.params;

  // Serializați detaliile călătoriei într-un șir JSON pentru a fi utilizat în codul QR
//   const qrData = JSON.stringify(travelDetails);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Rezervare confirmată</Text>
      <View style={styles.ticketContainer}>
        {/* Generați codul QR folosind datele călătoriei */}
        {/* <QRCode value={qrData} size={200} /> */}
        <Text style={styles.ticketText}>Afișați acest cod QR la poarta de îmbarcare.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ticketContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  ticketText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default FinalPage;
