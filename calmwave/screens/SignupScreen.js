import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import debounce from 'lodash.debounce';
import logo from '../assets/Logo.png'; // Adjust the path as necessary

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('user');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');

  // DropDownPicker state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'User', value: 'user' },
    { label: 'Therapist', value: 'therapist' }
  ]);

  // Debounced function to handle email input
  const debouncedSetEmail = useCallback(
    debounce((text) => setEmail(text), 300),
    []
  );

  const handleSignup = () => {
    if (password !== retypePassword) {
      setError('Passwords do not match');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('User signed up:', userCredential.user.email);

        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          email,
          age,
          role,
          contactNumber,
        });

        if (role === 'therapist') {
          navigation.navigate('TherapistHome');
        } else {
          navigation.navigate('Home');
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>SIGN UP</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={debouncedSetEmail} // Assuming debouncing for the Name field
        />
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
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholderTextColor="#888"
        />
        <DropDownPicker
          open={open}
          value={role}
          items={items}
          setOpen={setOpen}
          setValue={setRole}
          setItems={setItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={retypePassword}
          onChangeText={setRetypePassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up ➔</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>OR</Text>
        <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signinButtonText}>Sign In ➔</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B0D0D3', // Background color matching the design
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    resizeMode: 'contain', // Ensures the image scales correctly
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10, // Adds space between the logo image and the text
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#34495E',
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
  signupButton: {
    width: '100%',
    backgroundColor: '#227093',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  orText: {
    color: '#34495E',
    fontSize: 16,
    marginVertical: 10,
  },
  dropdown: {
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    height: 50,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  signinButton: {
    borderColor: '#227093',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  signinButtonText: {
    color: '#227093',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignupScreen;
