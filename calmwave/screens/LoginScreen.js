import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth, firestore } from '../firebaseConfig'; // Ensure firebaseConfig is correctly configured
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/Logo.png'; // Adjust the path as necessary

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;

          if (userRole === 'therapist') {
            navigation.navigate('TherapistHome');
          } else {
            navigation.navigate('Home');
          }
        } else {
          setError('User data not found');
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logoImage} />
      </View>
      <Text style={styles.title}>LOGIN</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In ➔</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>OR</Text>
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupButtonText}>Sign Up ➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B0D0D3',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoImage: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    resizeMode: 'contain', // Ensures the image scales correctly
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    color: '#34495E',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    backgroundColor: '#227093',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  link: {
    color: '#2980B9',
    marginBottom: 30,
  },
  orText: {
    color: '#34495E',
    fontSize: 16,
    marginBottom: 20,
  },
  signupButton: {
    borderColor: '#2980B9',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  signupButtonText: {
    color: '#2980B9',
    fontSize: 18,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;
