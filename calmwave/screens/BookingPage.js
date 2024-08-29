import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { AirbnbRating } from 'react-native-ratings';

const BookingPage = ({ route, navigation }) => {
  const { therapist } = route.params;
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email);

        // Fetch additional user info from Firestore if needed
        const usersCollection = collection(firestore, 'users');
        const q = query(usersCollection, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          setUserFullName(userData.fullName);
          setUserContact(userData.contactNumber);
        });
      }
    };

    const fetchRatingsAndReplies = async () => {
      try {
        const bookingsCollection = collection(firestore, 'booking');
        const q = query(bookingsCollection, where('therapistEmail', '==', therapist.email));
        const querySnapshot = await getDocs(q);

        let totalRating = 0;
        let totalReplies = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rating) {
            totalRating += data.rating;
            count += 1;
          }
          if (data.feedback) {
            totalReplies += 1;
          }
        });

        setReplyCount(totalReplies);
        setAverageRating(count > 0 ? totalRating / count : 0);
      } catch (error) {
        console.error('Failed to fetch ratings and replies:', error);
      }
    };

    fetchUserDetails();
    fetchRatingsAndReplies();
  }, [therapist.email]);

  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisible(Platform.OS === 'ios');
    if (event.type === 'set') {
      setSelectedDate(selectedDate || new Date());
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setTimePickerVisible(Platform.OS === 'ios');
    if (event.type === 'set') {
      setSelectedTime(selectedTime || new Date());
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !userEmail || !userFullName || !userContact) {
      alert('Please fill all fields and select date and time');
      return;
    }

    try {
      await addDoc(collection(firestore, 'booking'), {
        therapistEmail: therapist.email,
        therapistFullName: therapist.fullName,
        userEmail,
        userFullName,
        userContact,
        appointmentDate: `${selectedDate.toDateString()} ${selectedTime.toLocaleTimeString()}`,
        status: 'pending', // Default status
      });
      alert('Booking successful');
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      alert('Error making booking: ', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: therapist.profileImage || 'https://via.placeholder.com/150' }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{therapist.fullName}</Text>
      <Text>{therapist.hospitalName}</Text>
      <Text>{therapist.experience} years of experience</Text>
      <Text>Contact: {therapist.contactNumber}</Text>
      
      {/* Rating and Reply Count */}
      <View style={styles.ratingContainer}>
        <AirbnbRating
          count={5}
          reviews={[]} // No review text
          defaultRating={averageRating}
          size={20}
          isDisabled={true}
          showRating={false} // Hide the default review text
        />
        <Text style={styles.replyCount}>Replies: {replyCount}</Text>
      </View>

      <Button title="Select Date" onPress={() => setDatePickerVisible(true)} />
      <Button title="Select Time" onPress={() => setTimePickerVisible(true)} />
      
      <Text style={styles.selectedDate}>{selectedDate ? `Selected Date: ${selectedDate.toDateString()}` : 'No Date Selected'}</Text>
      <Text style={styles.selectedTime}>{selectedTime ? `Selected Time: ${selectedTime.toLocaleTimeString()}` : 'No Time Selected'}</Text>
      
      <Button title="Book Appointment" onPress={handleBooking} />

      {/* Date Picker */}
      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {timePickerVisible && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    marginTop: 70,
    alignSelf: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedDate: {
    fontSize: 16,
    marginTop: 10,
  },
  selectedTime: {
    fontSize: 16,
    marginTop: 10,
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  replyCount: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default BookingPage;
