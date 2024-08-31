import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';
import defaultProfilePic from '../assets/profile.jpg'; // Add your default profile icon image path here

const HomeScreen = ({ navigation }) => {
  const [emotionData, setEmotionData] = useState([]);
  const [daysWithoutAlcohol, setDaysWithoutAlcohol] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserEmail(userData.email.split('@')[0]); // Extract first part of email
        setProfileImage(userData.profileImage || defaultProfilePic); // Use default if no image
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

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

  const calculateDaysWithoutAlcohol = (emotions) => {
    let daysCounter = 0;
    let foundLastYes = false;

    for (let i = 0; i < emotions.length; i++) {
      if (emotions[i].alcoholConsumption === 'yes') {
        foundLastYes = true;
        daysCounter = 0;
      } else if (foundLastYes && emotions[i].alcoholConsumption === 'no') {
        daysCounter++;
      }
    }

    setDaysWithoutAlcohol(daysCounter);
  };

  useEffect(() => {
    fetchUserData();
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

  const emotionEmojiMap = {
    worst: '😞',
    worse: '😕',
    medium: '😐',
    happy: '😊',
    happier: '😁',
  };

  const chartData = {
    labels: emotionData.map((data) => moment(data.timestamp).format('MM/DD HH:mm')),
    datasets: [
      {
        data: emotionData.map((data) => emotionValueMap[data.emotion] || 0),
      },
    ],
  };

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
      <View style={styles.headerContainer}>
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Hey..{userEmail}.! 👋</Text>
          <Image source={profileImage ? { uri: profileImage } : defaultProfilePic} style={styles.profileImage} />
        </View>
      </View>

      {daysWithoutAlcohol !== null && (
        <View style={styles.analyticsContainer}>
          <Text style={styles.analyticsText}>Analytics</Text>
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
      )}

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Days Without Alcohol</Text>
          <Text style={styles.infoValue}>{daysWithoutAlcohol}</Text>
          <Text style={styles.infoSubtitle}>Awesome!</Text>
        </View>

        {latestEmotion && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Emotion</Text>
            <Text style={styles.infoValue}>{emotionEmojiMap[latestEmotion.emotion]}</Text>
            <Text style={styles.infoSubtitle}>Great!</Text>
          </View>
        )}
      </View>

      <View style={styles.articleContainer}>
        <Text style={styles.articleTitle}>Today's Article</Text>
        <TouchableOpacity style={styles.articleContent}>
          <View style={styles.articleTextContainer}>
            <Text style={styles.articleHeadline}>Handling Emotions!!!</Text>
            <Text style={styles.articleDescription}>
              Emotions are an integral part of our daily lives, influencing our thoughts, behaviors, and interactions.
            </Text>
          </View>
          <Image source={require('../assets/images.jpg')} style={styles.articleImage} />
        </TouchableOpacity>
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
  headerContainer: {
    backgroundColor: '#2d8da5',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
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
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 5,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#009688',
  },
  articleContainer: {
    backgroundColor: '#746f6f',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 30,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleTextContainer: {
    flex: 1,
    color: '#fff',
  },
  articleHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  articleDescription: {
    fontSize: 14,
    color: '#fff',
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
  },
});

export default HomeScreen;
