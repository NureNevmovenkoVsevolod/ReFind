import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from '../components/BottomNavBar';
import CategoryFilter from '../components/CategoryFilter';
import { useRoute } from '@react-navigation/native';
import OurTextInput from "../components/OurTextInput";

function MainScreen({ navigation }) {
  const route = useRoute();
  const activeScreen = route.name;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);


  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    // Тут викликати функцію для фільтрації оголошень
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <OurTextInput icon="search" placeholder="Введіть локацію, назву або опис"></OurTextInput>
        <CategoryFilter onSelectCategory={handleCategorySelect} />
      </ScrollView>
      <BottomNavBar activeScreen={activeScreen} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 80,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#ff6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainScreen;
