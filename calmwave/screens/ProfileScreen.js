import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon library

const ProfileScreen = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [latestEmotion, setLatestEmotion] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [suggestedActivity, setSuggestedActivity] = useState('');
  const [suggestedIcon, setSuggestedIcon] = useState('');

  // Define motivational quotes and activities for each emotion
  const emotionData = {
    happy: {
      quote: "Happiness is not something ready made. It comes from your own actions.",
      activity: "Go for a walk in nature to embrace your happiness!",
      icon: "smile-o" // Example icon
    },
    happier: {
      quote: "Even the darkest night will end and the sun will rise.",
      activity: "Write down your thoughts to help process your feelings.",
      icon: "pencil" // Example icon
    },
    worse: {
      quote: "For every minute you are angry you lose sixty seconds of happiness.",
      activity: "Try some deep breathing exercises to calm down.",
      icon: "medkit" // Example icon
    },
    worst: {
      quote: "Do one thing every day that scares you.",
      activity: "Talk to a friend about your fears; it might help!",
      icon: "phone" // Example icon
    },
    medium: {
      quote: "Every day may not be good, but there is something good in every day.",
      activity: "Read a book or listen to some calming music.",
      icon: "book" // Example icon
    },
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullName(userData.fullName || '');
          setProfileImage(userData.profileImage || null);
          setAge(userData.age || '');
          setContactNumber(userData.contactNumber || '');
          
          // Fetch the latest emotion from the 'emotions' collection
          const emotionsRef = collection(firestore, 'emotions');
          const emotionsQuery = query(
            emotionsRef,
            where('email', '==', user.email),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(emotionsQuery);
          if (!querySnapshot.empty) {
            const latestEmotionData = querySnapshot.docs[0].data();
            const emotion = latestEmotionData.emotion || 'medium';
            setLatestEmotion(emotion);
          } else {
            setLatestEmotion('neutral');
          }
        }
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    // Update motivational quote, suggested activity, and icon based on the latest emotion
    if (latestEmotion) {
      const emotionInfo = emotionData[latestEmotion] || emotionData['neutral'];
      setMotivationalQuote(emotionInfo.quote);
      setSuggestedActivity(emotionInfo.activity);
      setSuggestedIcon(emotionInfo.icon);
    }
  }, [latestEmotion]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName,
        profileImage,
        age,
        contactNumber,
      });
      alert('Profile updated successfully!');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Profile Image +</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
        {/* Motivational Quote Section */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteTitle}>Motivational Quote:</Text>
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
        </View>
        {/* Suggested Activity Section */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>Suggested Activity:</Text>
          <View style={styles.activityRow}>
            <Text style={styles.activityText}>{suggestedActivity}</Text>
            <Icon name={suggestedIcon} size={30} color="#007BFF" style={styles.activityIcon} />
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#B0D0D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#003D4D',
  },
  input: {
    height: 50,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  imagePicker: {
    height: 150,
    width: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#28ad8e',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: '#28ad8e',
    textAlign: 'center',
    fontSize: 16,
  },
  quoteContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003D4D',
  },
  quoteText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  activityContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003D4D',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  activityText: {
    fontSize: 16,
    color: '#003D4D',
    marginRight: 10,
    flex: 1,
  },
  activityIcon: {
    marginLeft: 10,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
