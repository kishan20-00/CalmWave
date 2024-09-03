import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert, Modal, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { Rating } from 'react-native-ratings';
import { useFocusEffect } from '@react-navigation/native';

const UserBookingsPage = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Fetch bookings from Firestore
  const fetchBookings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const bookingsCollection = collection(firestore, 'booking');
        const q = query(bookingsCollection, where('userEmail', '==', user.email));
        const querySnapshot = await getDocs(q);
        const userBookings = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Use focus effect to refetch bookings when the page is navigated to
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (rating === 0 && feedback.trim() === '') {
      Alert.alert('Error', 'Please provide a rating or feedback.');
      return;
    }

    try {
      const bookingDocRef = doc(firestore, 'booking', selectedBooking.id);

      const updateData = {};
      if (rating > 0) updateData.rating = rating;
      if (feedback.trim()) updateData.feedback = feedback;

      // Ensure that at least one of the fields is updated
      if (Object.keys(updateData).length > 0) {
        await updateDoc(bookingDocRef, {
          ...updateData,
          feedbackProvided: true,
        });
      }

      Alert.alert('Success', 'Feedback submitted successfully.');
      setFeedbackModalVisible(false);
      setRating(0);
      setFeedback('');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback.');
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingContainer}>
      <Text style={styles.therapistName}>Therapist: {item.therapistFullName}</Text>
      <Text style={styles.bookingDetail}>Appointment Date: {item.appointmentDate}</Text>
      <Text style={styles.bookingDetail}>Status: {item.status}</Text>
      {item.feedbackProvided ? (
        <Text style={styles.feedbackText}>Feedback: {item.feedback} (Rating: {item.rating} ⭐)</Text>
      ) : (
        <Button title="Give Feedback" onPress={() => {
          setSelectedBooking(item);
          setFeedbackModalVisible(true);
        }} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      {/* Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => {
          setFeedbackModalVisible(false);
          setRating(0);
          setFeedback('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Provide Feedback</Text>
            <Rating
              showRating
              onFinishRating={setRating}
              style={{ paddingVertical: 10 }}
            />
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback here..."
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleFeedbackSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#B0D0D3',
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
  therapistName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookingDetail: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 5,
  },
  feedbackText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackInput: {
    height: 80,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelText: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default UserBookingsPage;
