import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import moment from 'moment';  // Importing moment

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
            const data = doc.data();
            // Use moment to parse appointmentDate
            const parsedDate = moment(data.appointmentDate, 'ddd MMM DD YYYY HH:mm:ss', true);
            if (!parsedDate.isValid()) {
              console.warn('Invalid or missing appointmentDate:', data);
            } else {
              bookings.push({ ...data, appointmentDate: parsedDate.toISOString() });
            }
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

  const formatDate = (dateString) => {
    const date = moment(dateString); // Use moment to format date
    return date.format('YYYY-MM-DD');
  };

  const getMarkedDates = (dates) => {
    return dates.reduce((acc, date) => {
      acc[formatDate(date)] = { selected: true, marked: true, dotColor: 'blue' };
      return acc;
    }, {});
  };

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

  const today = moment().format('YYYY-MM-DD');

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
                current={today}
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
