import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    const date = moment(dateString);
    return date.format('YYYY-MM-DD');
  };

  const getMarkedDates = (dates) => {
    return dates.reduce((acc, date) => {
      acc[formatDate(date)] = { selected: true, marked: true, dotColor: '#1e90ff' };
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
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : (
        <>
          {Object.keys(therapistBookings).map((therapist) => (
            <View key={therapist} style={styles.therapistContainer}>
              <View style={styles.therapistHeader}>
                <Icon name="person" size={24} color="#1e90ff" />
                <Text style={styles.therapistName}>{therapist}</Text>
              </View>
              <View style={styles.sessionInfo}>
                <Icon name="event" size={20} color="#555" />
                <Text style={styles.sessionCount}>
                  Sessions: {therapistBookings[therapist].count}
                </Text>
              </View>
              <Calendar
                current={today}
                markedDates={getMarkedDates(therapistBookings[therapist].dates)}
                theme={{
                  selectedDayBackgroundColor: '#1e90ff',
                  todayTextColor: '#1e90ff',
                  arrowColor: '#1e90ff',
                  dotColor: '#1e90ff',
                  selectedDotColor: '#ffffff',
                }}
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
    backgroundColor: '#B0D0D3',
  },
  therapistContainer: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  therapistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionCount: {
    fontSize: 16,
    color: '#555',
    marginLeft: 5,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
});

export default ProgressPage;
