import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebaseConfig'; // Import your Firebase configuration
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment'; // Ensure moment is installed with `npm install moment`

const HomeScreen = ({ navigation }) => {
  const [emotionData, setEmotionData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch emotions from Firestore
  const fetchEmotions = async () => {
    try {
      const emotionsCollection = collection(firestore, 'emotions');
      const emotionsQuery = query(emotionsCollection, orderBy('timestamp', 'desc'), limit(5)); // Limit to last 5 emotions
      const unsubscribe = onSnapshot(emotionsQuery, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id,
            timestamp: docData.timestamp.toDate ? docData.timestamp.toDate() : new Date(docData.timestamp), // Handle different timestamp formats
          };
        });
        // Reverse the order to display the oldest first on the chart
        setEmotionData(data.reverse());
      });

      // Clean up subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to fetch emotions:', error);
    }
  };

  useEffect(() => {
    fetchEmotions(); // Initial data fetch
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEmotions().finally(() => setRefreshing(false));
  };

  // Map emotions to specific values
  const emotionValueMap = {
    worst: 5,
    worse: 10,
    medium: 15,
    happy: 20,
    happier: 25,
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
      <Text style={styles.text}>Welcome to the Home Screen!</Text>
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
});

export default HomeScreen;
