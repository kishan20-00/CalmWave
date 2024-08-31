import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ScrollView, TextInput } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { TouchableOpacity } from 'react-native-gesture-handler';

const TherapistListScreen = ({ navigation }) => {
  const [therapists, setTherapists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTherapistsAndRatings = async () => {
      try {
        // Fetching therapists from 'users' collection
        const therapistsCollection = collection(firestore, 'users');
        const therapistSnapshot = await getDocs(therapistsCollection);
        const therapistList = therapistSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doc => doc.role === 'therapist'); // Filter only therapists

        // Fetching bookings from 'booking' collection
        const bookingsCollection = collection(firestore, 'booking');
        const bookingSnapshot = await getDocs(bookingsCollection);
        const bookingsList = bookingSnapshot.docs.map(doc => doc.data());

        // Map therapists to their ratings
        const therapistsWithRatings = therapistList.map(therapist => {
          // Filter bookings related to this therapist
          const therapistBookings = bookingsList.filter(
            booking => booking.therapistEmail === therapist.email
          );

          // Calculate mean rating if there are any ratings available
          const meanRating =
            therapistBookings.length > 0
              ? therapistBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0) / therapistBookings.length
              : 'N/A';

          return { ...therapist, rating: meanRating };
        });

        setTherapists(therapistsWithRatings);
      } catch (error) {
        console.error('Error fetching therapists and ratings:', error);
      }
    };

    fetchTherapistsAndRatings();
  }, []);

  const filteredTherapists = therapists.filter(therapist =>
    therapist.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const profileImage = item.profileImage 
      ? { uri: item.profileImage } 
      : require('../assets/thdefauldimg.jpg'); // Use a default image if profileImage is not available

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Booking', { therapist: item })}
      >
        <Image source={profileImage} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.hospitalName}>{item.hospitalName}</Text>
          <Text style={styles.experience}>{item.experience ? `${item.experience} years of experience` : 'Experience Not Available'}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{item.rating !== 'N/A' ? item.rating : 'N/A'}</Text>
            <Image source={require('../assets/star.png')} style={styles.starIcon} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>THERAPY SCHEDULING</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Doctor"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredTherapists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        scrollEnabled={false} // Disable FlatList's internal scroll to let ScrollView handle it
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#b9e0eb',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  searchBar: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  list: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    width: Dimensions.get('window').width / 2 - 20, // Two cards per row
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  hospitalName: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 8,
  },
  experience: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginLeft: 5,
  },
  seeAll: {
    textAlign: 'right',
    fontSize: 16,
    color: '#168269',
    marginTop: 20,
    padding: 15,
  },
});

export default TherapistListScreen;
