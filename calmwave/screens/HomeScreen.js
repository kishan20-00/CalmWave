import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig'; // Import your Firebase configuration and auth
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const HomeScreen = ({ navigation }) => {
  const [emotionData, setEmotionData] = useState([]);
  const [daysWithoutAlcohol, setDaysWithoutAlcohol] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch emotions from Firestore
  const fetchEmotions = async () => {
    try {
      const user = auth.currentUser; // Get the currently logged-in user

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const emotionsCollection = collection(firestore, 'emotions');
      const emotionsQuery = query(
        emotionsCollection,
        where('email', '==', user.email), // Filter by current user's email
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const unsubscribe = onSnapshot(emotionsQuery, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id,
            timestamp: docData.timestamp.toDate ? docData.timestamp.toDate() : new Date(docData.timestamp), // Handle different timestamp formats
          };
        });

        // Reverse the order to display the oldest first on the chart
        setEmotionData(data.reverse());
        calculateDaysWithoutAlcohol(data); // Calculate days without alcohol
      });

      // Clean up subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to fetch emotions:', error);
    }
  };

  // Function to calculate days without alcohol
  const calculateDaysWithoutAlcohol = (emotions) => {
    let daysCounter = 0;
    let foundLastYes = false;

    for (let i = 0; i < emotions.length; i++) {
      if (emotions[i].alcoholConsumption === 'yes') {
        foundLastYes = true;
        daysCounter = 0; // Reset counter after finding 'yes'
      } else if (foundLastYes && emotions[i].alcoholConsumption === 'no') {
        daysCounter++;
      }
    }

    setDaysWithoutAlcohol(daysCounter);
  };

  useEffect(() => {
    fetchEmotions(); // Initial data fetch
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEmotions().finally(() => setRefreshing(false));
  };

  // Map emotions to specific values and emojis
  const emotionValueMap = {
    worst: 5,
    worse: 10,
    medium: 15,
    happy: 20,
    happier: 25,
  };

  const emotionEmojiMap = {
    worst: '😞',
    worse: '😕',
    medium: '😐',
    happy: '😊',
    happier: '😁',
  };

  // Format the emotion data for the chart
  const chartData = {
    labels: emotionData.map((data) => moment(data.timestamp).format('MM/DD HH:mm')),
    datasets: [
      {
        data: emotionData.map((data) => emotionValueMap[data.emotion] || 0),
      },
    ],
  };

  // Get the most recent emotion
  const latestEmotion = emotionData.length > 0 ? emotionData[emotionData.length - 1] : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Button
        title="Profile"
        onPress={() => navigation.navigate('Profile')}
      />
      <Button
        title="Therapist Booking"
        onPress={() => navigation.navigate('TherapistList')}
      />
      <Button
        title="Community Chat"
        onPress={() => navigation.navigate('CommunityChat')}
      />
      <Button
        title="Add Emotion"
        onPress={() => navigation.navigate('EmotionForm')}
      />
      <Button
        title="Your Bookings"
        onPress={() => navigation.navigate('UserBookings')}
      />
      <Text style={styles.text}>Welcome to the Home Screen!</Text>

      {daysWithoutAlcohol !== null && (
        <View style={styles.alcoholContainer}>
          <Text style={styles.alcoholText}>Days without alcohol: {daysWithoutAlcohol}</Text>
        </View>
      )}

      {latestEmotion && (
        <View style={styles.latestEmotionContainer}>
          <Text style={styles.latestEmotionText}>
            Current Emotion: {emotionEmojiMap[latestEmotion.emotion]} {latestEmotion.emotion}
          </Text>
        </View>
      )}

      {emotionData.length > 0 && (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            },
          }}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={1} // Set interval for the y-axis
          fromZero={true} // Ensure the y-axis starts from zero
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 70,
  },
  text: {
    fontSize: 24,
    marginTop: 20,
  },
  chart: {
    marginVertical: 20,
  },
  alcoholContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  alcoholText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  latestEmotionContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#dfe7fd',
    alignItems: 'center',
  },
  latestEmotionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
