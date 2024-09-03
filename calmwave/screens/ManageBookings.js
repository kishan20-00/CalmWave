import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusPickerOpen, setStatusPickerOpen] = useState({});
  const [statusOptions] = useState([
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const therapistEmail = user.email;

        // Fetch bookings for the logged-in therapist
        const bookingsCollection = collection(firestore, 'booking');
        const q = query(bookingsCollection, where('therapistEmail', '==', therapistEmail));
        const querySnapshot = await getDocs(q);
        const bookingsList = [];
        querySnapshot.forEach((doc) => {
          bookingsList.push({ id: doc.id, ...doc.data() });
        });
        setBookings(bookingsList);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, status) => {
    try {
      const bookingDoc = doc(firestore, 'booking', bookingId);
      await updateDoc(bookingDoc, { status });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
      Alert.alert('Success', 'Booking status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingContainer}>
      <Text style={styles.bookingTitle}>{`Appointment with ${item.therapistFullName}`}</Text>
      <Text style={styles.bookingDetail}>{`Date: ${item.appointmentDate}`}</Text>
      <Text style={styles.bookingDetail}>{`User: ${item.userFullName}`}</Text>
      <Text style={styles.bookingDetail}>{`Contact: ${item.userContact}`}</Text>
      
      {/* Wrap the DropDownPicker with a View */}
      <View style={{ zIndex: statusPickerOpen[item.id] ? 2000 : 0, position: 'relative' }}>
        <DropDownPicker
          open={statusPickerOpen[item.id] || false}
          value={selectedStatus[item.id] || item.status}
          items={statusOptions}
          setOpen={(open) => setStatusPickerOpen({ ...statusPickerOpen, [item.id]: open })}
          setValue={(callback) => {
            const value = callback(selectedStatus[item.id] || item.status);
            setSelectedStatus({ ...selectedStatus, [item.id]: value });
            handleStatusChange(item.id, value);
          }}
          setItems={() => {}}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          placeholder="Select status"
        />
      </View>
    </View>
  );
  
  

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Bookings</Text>
      <FlatList
  data={bookings}
  keyExtractor={(item) => item.id}
  renderItem={renderBookingItem}
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 20 }}
  scrollEnabled={!Object.values(statusPickerOpen).includes(true)} // Disable scrolling when dropdown is open
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#B0D0D3',
    marginTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 20,
  },
  bookingContainer: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookingDetail: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 5,
  },
  dropdown: {
    marginTop: 10,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    height: 40,
    backgroundColor: '#FAFAFA',
  },
  dropdownContainer: {
    borderColor: '#B0BEC5',
    backgroundColor: '#FAFAFA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
});



export default ManageBookings;
