import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, ScrollView, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { AirbnbRating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    setDatePickerVisible(false);
    if (event.type === 'set') {
      setSelectedDate(selectedDate || new Date());
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setTimePickerVisible(false);
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
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: therapist.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{therapist.fullName}</Text>
        <Text style={styles.heading}>{therapist.hospitalName}</Text>
        <Text style={styles.experience}>{therapist.experience} years of experience</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Icon name="phone" size={20} color="#3452a3ef" />
        <Text style={styles.contact}>{therapist.contactNumber}</Text>
      </View>
      
      <View style={styles.ratingContainer}>
        <AirbnbRating
          count={5}
          reviews={[]} // No review text
          defaultRating={averageRating}
          size={20}
          isDisabled={true}
          showRating={false} // Hide the default review text
        />
        <Text style={styles.replyCount}>({replyCount} replies)</Text>
      </View>

      <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
        <Icon name="calendar" size={20} color="#FFFFFF" />
        <Text style={styles.dateButtonText}>Select Date</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.timeButton} onPress={() => setTimePickerVisible(true)}>
        <Icon name="clock-outline" size={20} color="#FFFFFF" />
        <Text style={styles.timeButtonText}>Select Time</Text>
      </TouchableOpacity>
      
      <Text style={styles.selectedDate}>
        {selectedDate ? `Selected Date: ${selectedDate.toDateString()}` : 'No Date Selected'}
      </Text>
      <Text style={styles.selectedTime}>
        {selectedTime ? `Selected Time: ${selectedTime.toLocaleTimeString()}` : 'No Time Selected'}
      </Text>
      
      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Icon name="check-circle" size={20} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>

      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

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
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#b9e0eb',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginTop: 35,
    marginBottom: 15,
    borderColor: '#807070ef',
    borderWidth: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003D4D',
    textAlign: 'center',
    marginBottom: 5,
  },
  heading: {
    fontSize: 20,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 10,
  },
  experience: {
    fontSize: 16,
    color: '#3452a3ef',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  contact: {
    fontSize: 16,
    color: '#3452a3ef',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  replyCount: {
    fontSize: 16,
    color: '#3452a3ef',
    marginLeft: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3452a3ef',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3452a3ef',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  selectedDate: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginTop: 10,
  },
  selectedTime: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginTop: 5,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c925aef',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default BookingPage;
