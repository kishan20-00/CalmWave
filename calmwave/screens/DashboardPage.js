import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { LineChart, PieChart } from 'react-native-chart-kit';
import moment from 'moment';

const DashboardScreen = () => {
  const [emotionData, setEmotionData] = useState([]);
  const [alcoholData, setAlcoholData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
        setAlcoholData(data.map((doc) => doc.alcoholConsumption));
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to fetch emotions:', error);
    }
  };

  useEffect(() => {
    fetchEmotions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmotions().finally(() => setRefreshing(false));
  };

  const emotionValueMap = {
    worst: 5,
    worse: 10,
    medium: 15,
    happy: 20,
    happier: 25,
  };

  const chartData = {
    labels: emotionData.map((data) => moment(data.timestamp).format('MM/DD HH:mm')),
    datasets: [
      {
        data: emotionData.map((data) => emotionValueMap[data.emotion] || 0),
      },
    ],
  };

  const alcoholPieData = [
    {
      name: 'Yes',
      population: alcoholData.filter((value) => value === 'yes').length,
      color: '#FF6384',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'No',
      population: alcoholData.filter((value) => value === 'no').length,
      color: '#36A2EB',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  const getActivitySuggestions = () => {
    const yesCount = alcoholData.filter((value) => value === 'yes').length;
    const noCount = alcoholData.filter((value) => value === 'no').length;

    if (yesCount > noCount) {
      return [
        'Reduce alcohol consumption gradually.',
        'Engage in regular physical exercise.',
        'Drink more water to stay hydrated.',
        'Try meditation or yoga to reduce stress.',
        'Consider seeking advice from a healthcare professional.',
      ];
    } else if (noCount > yesCount) {
      return [
        'Maintain a balanced diet.',
        'Continue with regular physical activity.',
        'Ensure you get enough sleep each night.',
        'Keep up with healthy habits like staying hydrated.',
        'Stay socially active and maintain good mental health.',
      ];
    } else {
      return [
        'Keep monitoring your habits.',
        'Aim for a balanced lifestyle with regular exercise.',
        'Ensure you are eating a balanced diet.',
        'Stay hydrated and practice mindfulness.',
        'Seek professional advice if needed.',
      ];
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsText}>Emotion Analytics</Text>
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
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero={true}
          />
        )}
      </View>

      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsText}>Alcohol Consumption</Text>
        {alcoholData.length > 0 && (
          <PieChart
            data={alcoholPieData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Activities</Text>
          {getActivitySuggestions().map((activity, index) => (
            <Text key={index} style={styles.suggestionText}>{`\u2022 ${activity}`}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  analyticsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  analyticsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginRight: 50,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default DashboardScreen;
