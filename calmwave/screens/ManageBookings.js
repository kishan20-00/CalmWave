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
      <Text>{`Appointment with ${item.therapistFullName}`}</Text>
      <Text>{`Date: ${item.appointmentDate}`}</Text>
      <Text>{`User: ${item.userFullName}`}</Text>
      <Text>{`Contact: ${item.userContact}`}</Text>
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
        zIndex={statusPickerOpen[item.id] ? 2000 : 1} // Ensures dropdown is above other elements
        zIndexInverse={statusPickerOpen[item.id] ? 2000 : 1} // Ensures dropdown is above other elements
      />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 90,
  },
  bookingContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    zIndex: 0, // Default zIndex for booking items
  },
  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    height: 50,
    backgroundColor: '#fafafa', // Solid background color
    zIndex: 2000, // Ensures dropdown is above other elements
  },
  dropdownContainer: {
    borderColor: '#ccc',
    backgroundColor: '#fafafa', // Solid background color for the dropdown container
    zIndex: 2000, // Ensures dropdown container is on top of other elements
  },
});

export default ManageBookings;
