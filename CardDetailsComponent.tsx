import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

const CardDetailsComponent = ({ onConfirmPayment }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  return (
    <View style={styles.cardContainer}>
      <TextInput
        style={styles.input}
        placeholder="Numărul cardului"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="number-pad"
        maxLength={16} // Majoritatea cardurilor au 16 cifre
      />
      <TextInput
        style={styles.input}
        placeholder="Data expirării MM/YY"
        value={expiryDate}
        onChangeText={setExpiryDate}
        keyboardType="number-pad"
        maxLength={5} // Format MM/YY
      />
      <TextInput
        style={styles.input}
        placeholder="CVC"
        value={cvc}
        onChangeText={setCvc}
        keyboardType="number-pad"
        maxLength={4} // CVC/CCV poate avea până la 4 cifre
      />
      <TextInput
        style={styles.input}
        placeholder="Numele posesorului"
        value={cardHolderName}
        onChangeText={setCardHolderName}
      />
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => onConfirmPayment(cardNumber, expiryDate, cvc, cardHolderName)}
      >
        <Text style={styles.confirmButtonText}>Confirmă plata</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#005f73',
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardDetailsComponent;
