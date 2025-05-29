import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import backround from '../../assets/back.jpg';
import logo from '../../assets/logo.png';

function HelloScreen({ navigation }) {
    return (
    <ImageBackground 
      source={backround}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>ReFind</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Увійти</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')} >
            <Text style={styles.registerButtonText}>Зареєструватись</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
    );
}


const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      flex: 1,
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 60,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: '#f3f3f3',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    appName: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#6200EE',
      letterSpacing: 2,
      marginBottom: 10,
    },
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
    },
    loginButton: {
      backgroundColor: '#6200EE',
      paddingVertical: 16,
      borderRadius: 30,
      width: '100%',
      alignItems: 'center',
      marginBottom: 18,
      shadowColor: '#6200EE',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    registerButton: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: '#6200EE',
      paddingVertical: 16,
      borderRadius: 30,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#6200EE',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    registerButtonText: {
      color: '#6200EE',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  });


export default HelloScreen;