import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import debounce from 'lodash.debounce';

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
        <Text style={styles.title}>Sign Up</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={debouncedSetEmail} // Use debounced function for email
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Retype Password"
          value={retypePassword}
          onChangeText={setRetypePassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
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
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
        <Button title="Sign Up" onPress={handleSignup} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
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
  error: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SignupScreen;
