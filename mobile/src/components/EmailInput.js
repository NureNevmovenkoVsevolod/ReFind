import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const EmailInput = ({ value, onChangeText }) => {
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    let errorMessage = '';
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email) {
      errorMessage = 'Email обов\'язковий';
    } else if (!emailRegex.test(email)) {
      errorMessage = 'Невірний формат email';
    }
    setError(errorMessage);
  };

  const handleTextChange = (text) => {
    onChangeText(text);
    validateEmail(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Введіть ваш email"
          value={value}
          onChangeText={handleTextChange}
          keyboardType="email-address"
          autoCapitalize="none"
          onBlur={() => validateEmail(value)} // Validate on blur
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
});

export default EmailInput; 