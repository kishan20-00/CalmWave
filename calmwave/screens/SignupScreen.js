import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('User signed up:', userCredential.user.email);

        // Save additional fields to Firestore
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          email,
          age,
          role,
          contactNumber,
        });

        // Navigate to the appropriate home screen based on role
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
          value={email}
          onChangeText={setEmail}
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
    flex: 1, // Ensure the container takes up the whole screen
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
