import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ScrollView, TextInput } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { TouchableOpacity } from 'react-native-gesture-handler';

const TherapistListScreen = ({ navigation }) => {
  const [therapists, setTherapists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTherapists = async () => {
      const therapistsCollection = collection(firestore, 'users');
      const therapistSnapshot = await getDocs(therapistsCollection);
      const therapistList = therapistSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.role === 'therapist'); // Filter only therapists
      setTherapists(therapistList);
    };

    fetchTherapists();
  }, []);

  const filteredTherapists = therapists.filter(therapist =>
    therapist.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { therapist: item })}
    >
      <Image source={{ uri: item.profileImage }} style={styles.image} />
      <Text style={styles.name}>{item.fullName}</Text>
      <Text>{item.hospitalName}</Text>
      <Text>{item.experience} years of experience</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Therapists</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name"
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
    padding: 10,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,  // Adjust this value to lower the heading further
    marginBottom: 20,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  list: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    width: Dimensions.get('window').width / 2 - 20, // Two cards per row
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TherapistListScreen;
