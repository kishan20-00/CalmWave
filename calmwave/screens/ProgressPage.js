import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ProgressPage = () => {
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const bookingsCollection = collection(firestore, 'booking');
          const q = query(bookingsCollection, where('userEmail', '==', user.email));
          const querySnapshot = await getDocs(q);
          const bookings = [];
          querySnapshot.forEach((doc) => {
            bookings.push(doc.data());
          });
          setBookingData(bookings);
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  // Function to format dates into "YYYY-MM-DD" format for marking
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Prepare marked dates data
  const getMarkedDates = (dates) => {
    return dates.reduce((acc, date) => {
      acc[formatDate(date)] = { marked: true, dotColor: 'blue' };
      return acc;
    }, {});
  };

  // Group bookings by therapist and prepare data for the calendar
  const therapistBookings = bookingData.reduce((acc, booking) => {
    const { therapistFullName, appointmentDate } = booking;
    const date = formatDate(appointmentDate);
    if (!acc[therapistFullName]) {
      acc[therapistFullName] = { count: 0, dates: [] };
    }
    acc[therapistFullName].count += 1;
    acc[therapistFullName].dates.push(date);
    return acc;
  }, {});

  // Get today's date in "YYYY-MM-DD" format
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {Object.keys(therapistBookings).map((therapist) => (
            <View key={therapist} style={styles.therapistContainer}>
              <Text style={styles.therapistName}>{therapist}</Text>
              <Text style={styles.sessionCount}>
                Sessions: {therapistBookings[therapist].count}
              </Text>
              <Calendar
                current={today} // Set current date as a string
                markedDates={getMarkedDates(therapistBookings[therapist].dates)}
                style={styles.calendar}
              />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#f3f3f3',
  },
  therapistContainer: {
    marginBottom: 30,
  },
  therapistName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sessionCount: {
    fontSize: 16,
    marginBottom: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
});

export default ProgressPage;
