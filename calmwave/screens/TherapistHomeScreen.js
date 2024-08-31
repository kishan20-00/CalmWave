import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TherapistHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Therapist Home Screen!</Text>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('TherapistProfile')}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bookingsButton}
        onPress={() => navigation.navigate('ManageBookings')}
      >
        <Text style={styles.bookingsButtonText}>Bookings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  profileButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 18,
  },
  bookingsButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#28A745',
    borderRadius: 5,
  },
  bookingsButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default TherapistHomeScreen;
