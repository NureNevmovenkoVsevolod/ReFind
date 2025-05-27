import React, { useState } from "react";
import { View, Text, TextInput as RNTextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const OurTextInput = ({ value, onChangeText, placeholder, label, icon = "person" }) => {
  const [error, setError] = useState("");

  const validateText = (text) => {
    let errorMessage = "";
    if (!text) {
      errorMessage = `${label} обов'язковий`;
    }
    setError(errorMessage);
  };

  const handleTextChange = (text) => {
    onChangeText(text);
    validateText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name={icon}
          size={20}
          color="#999"
          style={styles.icon}
        />
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          onBlur={() => validateText(value)}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
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
    color: "red",
    marginTop: 4,
  },
});

export default OurTextInput;