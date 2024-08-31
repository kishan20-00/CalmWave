import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore'; 
import { firestore as db, auth } from '../firebaseConfig'; 
import DefaultProfileImage from '../assets/profile.jpg'; // Import the default profile image

const EmotionFormScreen = ({ navigation }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [alcoholConsumption, setAlcoholConsumption] = useState(null);
  const [userData, setUserData] = useState({ username: '', age: '', profileImage: null });

  const emotions = [
    { label: '😢', value: 'worst' },
    { label: '😟', value: 'worse' },
    { label: '😐', value: 'medium' },
    { label: '😊', value: 'happy' },
    { label: '😁', value: 'happier' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const username = data.fullName;
          setUserData({
            username,
            age: data.age || '',
            profileImage: data.profileImage || null,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const saveEmotion = async () => {
    if (!selectedEmotion) {
      Alert.alert('Please select an emotion');
      return;
    }

    if (alcoholConsumption === null) {
      Alert.alert('Please answer the alcohol consumption question');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    const emotionData = {
      timestamp,
      emotion: selectedEmotion,
      alcoholConsumption,
      email: user.email,
    };

    try {
      await addDoc(collection(db, 'emotions'), emotionData);
      Alert.alert('Success', 'Emotion saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving emotion:', error);
      Alert.alert('Error', 'Failed to save emotion to the database');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.userInfoContainer}>
        <View style={styles.imageFrame}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <Image source={DefaultProfileImage} style={styles.profileImage} />
          )}
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>Dear, {userData.username}.!</Text>
          {userData.age && <Text style={styles.age}>(Age: {userData.age})</Text>}
        </View>
      </View>
      <Text style={styles.header}>How do you feel today?</Text>
      <Text style={styles.adviceText}>
        Remember, acknowledging your feelings is the first step towards managing them.
      </Text>
      <View style={styles.emotionsContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.value}
            style={[
              styles.emotionButton,
              selectedEmotion === emotion.value && styles.selectedEmotion,
            ]}
            onPress={() => setSelectedEmotion(emotion.value)}
          >
            <Text style={styles.emotionText}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.subHeader}>Did you consume alcohol yesterday?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            alcoholConsumption === 'yes' && styles.selectedOption,
          ]}
          onPress={() => setAlcoholConsumption('yes')}
        >
          <Text style={styles.optionText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            alcoholConsumption === 'no' && styles.selectedOption,
          ]}
          onPress={() => setAlcoholConsumption('no')}
        >
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveEmotion}>
        <Text style={styles.saveButtonText}>Save Emotion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#B0D0D3',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageFrame: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#28ad8e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    marginLeft: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003D4D',
  },
  age: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
  header: {
    fontSize: 26,
    marginTop: 25,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  adviceText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emotionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emotionButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedEmotion: {
    borderColor: '#30e2b3',
    backgroundColor: '#d1f2eb',
  },
  emotionText: {
    fontSize: 36,
  },
  subHeader: {
    fontSize: 20,
    marginTop: 15,
    marginBottom: 25,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginHorizontal: 10,
  },
  selectedOption: {
    borderColor: '#30e2b3',
    backgroundColor: '#d1f2eb',
  },
  optionText: {
    fontSize: 22,
  },
  saveButton: {
    backgroundColor: '#0e5280',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 50,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default EmotionFormScreen;
