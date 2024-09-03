// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { firestore, auth } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Dimensions } from 'react-native';

const DashboardPage = () => {
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const user = auth.currentUser;
  
        if (!user) {
          console.error('User not authenticated');
          return;
        }
  
        const emotionsCollection = collection(firestore, 'emotions');
        const emotionsQuery = query(
          emotionsCollection,
          where('email', '==', user.email),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
  
        const unsubscribe = onSnapshot(emotionsQuery, (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              ...docData,
              id: doc.id,
              timestamp: docData.timestamp.toDate ? docData.timestamp.toDate() : new Date(docData.timestamp),
            };
          });
  
          setEmotionData(data.reverse());
          calculateDaysWithoutAlcohol(data);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error('Failed to fetch emotions:', error);
      }
    };
    fetchEmotions();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />;
  }

  if (emotionData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available for the last 30 days.</Text>
      </View>
    );
  }

  // Prepare data for the chart
  const chartData = {
    labels: emotionData.map((data) => {
      const date = new Date(data.timestamp);
      return `${date.getDate()}/${date.getMonth() + 1}`;  // Format date as day/month
    }),
    datasets: [{
      data: emotionData.map(data => data.emotionScore)  // Assume 'emotionScore' is the field in your Firestore data
    }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotion Data for {auth.currentUser.email}</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 16}  // Adjust width for padding
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#333333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardPage;
