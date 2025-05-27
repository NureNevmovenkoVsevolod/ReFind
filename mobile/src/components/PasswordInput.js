import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PasswordInput = ({ value, onChangeText }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    let errorMessage = "";
    if (!password) {
      errorMessage = "Пароль обов'язковий";
    } else if (password.length < 6) {
      errorMessage = "Пароль має містити мінімум 6 символів";
    } else if (!/[A-Z]/.test(password)) {
      errorMessage = "Пароль має містити хоча б одну велику літеру";
    } else if (!/[a-z]/.test(password)) {
      errorMessage = "Пароль має містити хоча б одну малу літеру";
    } else if (!/[0-9]/.test(password)) {
      errorMessage = "Пароль має містити хоча б одну цифру";
    }
    setError(errorMessage);
  };

  const handleTextChange = (text) => {
    onChangeText(text);
    validatePassword(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Пароль</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Введіть ваш пароль"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={handleTextChange}
          onBlur={() => validatePassword(value)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="#ccc"
          />
        </TouchableOpacity>
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

export default PasswordInput;
