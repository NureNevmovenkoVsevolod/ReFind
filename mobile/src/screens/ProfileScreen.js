import { useRoute } from '@react-navigation/native';
import React from 'react';
import { View, Text ,StyleSheet, TouchableOpacity } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from "@react-native-async-storage/async-storage";

function ProfileScreen({ navigation }) {
    const route = useRoute();
    const activeScreen = route.name;

    const handleLogout = async () => {
        try {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
    
          navigation.reset({
            index: 0,
            routes: [{ name: "Hello" }],
          });
        } catch (e) {
          console.error("Помилка при виході", e);
          Alert.alert("Помилка", "Не вдалося вийти з облікового запису.");
        }
      };

    return (
    <View style={styles.container}>
      <Text>Ласкаво просимо на Profile сторінку!</Text>  
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Вийти</Text>
      </TouchableOpacity>
      <BottomNavBar activeScreen={activeScreen} navigation={navigation} />
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
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

export default ProfileScreen;