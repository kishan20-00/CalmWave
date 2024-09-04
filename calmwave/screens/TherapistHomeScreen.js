import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from '../firebaseConfig'; // Make sure this path is correct
import { signOut } from 'firebase/auth';

const TherapistHomeScreen = ({ navigation }) => {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.navigate('Login'); // Navigate to login screen or wherever appropriate
    } catch (error) {
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome Back, Therapist!</Text>
      
      {/* Placeholder for an image */}
      <Image
        source={{ uri: 'https://mana.md/wp-content/uploads/2017/08/Mental-Health-e1501689862859.jpg' }} // Replace with your image URL
        style={styles.image}
      />
      
      <Text style={styles.infoText}>
        "Your guidance is shaping lives. Review your profile and manage your appointments to continue making a difference."
      </Text>
      
      <View style={styles.boxContainer}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('TherapistProfile')}
        >
          <Icon name="account-outline" size={30} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.boxText}>View Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('ManageBookings')}
        >
          <Icon name="calendar-clock" size={30} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.boxText}>Manage Bookings</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.motivationalText}>
        "A therapist’s journey is a blend of knowledge and compassion. Keep moving forward!"
      </Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#B0D0D3',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  infoText: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  boxContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  box: {
    backgroundColor: '#0e5280',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  icon: {
    marginBottom: 10,
  },
  boxText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationalText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default TherapistHomeScreen;
