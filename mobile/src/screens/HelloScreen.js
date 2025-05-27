import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import backround from '../../assets/back.jpg';

function HelloScreen({ navigation }) {
    return (
    <ImageBackground 
      source={backround}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.text}>
            <Text style={styles.title}>Знайдіть свої втрачені речі</Text>
            <Text style={styles.subtitle}>Онлайн бюро знахідок</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Увійти</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')} >
            <Text style={styles.registerButtonText}>Зареєструватися</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
    );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between", 
      paddingVertical: 50, 
      width: '100%', 
    },
    text:{
        marginTop: 140
    },
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: '#555', 
      textAlign: 'center',
      marginBottom: 40,
    },
    buttonContainer: {
      width: '80%', 
      alignItems: 'center',
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: '#6200EE', 
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25, 
      marginBottom: 15,
      width: '100%',
      alignItems: 'center',
    },
    loginButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    registerButton: {
      backgroundColor: 'transparent',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: '#6200EE', 
      width: '100%',
      alignItems: 'center',
    },
    registerButtonText: {
      color: '#6200EE', 
      fontSize: 18,
      fontWeight: 'bold',
    },
  });


export default HelloScreen;