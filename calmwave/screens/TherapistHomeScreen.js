import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TherapistHomeScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome Back, Therapist!</Text>
      <Text style={styles.infoText}>
        "Your guidance is shaping lives. Review your profile and manage your appointments to continue making a difference."
      </Text>
      
      <View style={styles.boxContainer}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('TherapistProfile')}
        >
          <Icon name="account" size={30} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.boxText}>View Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('ManageBookings')}
        >
          <Icon name="calendar-check" size={30} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.boxText}>Manage Bookings</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.motivationalText}>
        "A therapist’s journey is a blend of knowledge and compassion. Keep moving forward!"
      </Text>
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
    marginBottom: 20,
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
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
  },
});

export default TherapistHomeScreen;
