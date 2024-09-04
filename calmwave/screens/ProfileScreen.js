import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  const emotionData = {
    happy: {
      quote: "Happiness is not something ready made. It comes from your own actions.",
      activity: "Go for a walk in nature to embrace your happiness!",
      icon: "nature-people" // Updated icon
    },
    happier: {
      quote: "Even the darkest night will end and the sun will rise.",
      activity: "Write down your thoughts to help process your feelings.",
      icon: "pencil-outline"
    },
    worse: {
      quote: "For every minute you are angry you lose sixty seconds of happiness.",
      activity: "Try some deep breathing exercises to calm down.",
      icon: "meditation"
    },
    worst: {
      quote: "Do one thing every day that scares you.",
      activity: "Talk to a friend about your fears; it might help!",
      icon: "phone-outline"
    },
    medium: {
      quote: "Every day may not be good, but there is something good in every day.",
      activity: "Read a book or listen to some calming music.",
      icon: "book-outline"
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
            setLatestEmotion('medium');
          }
        }
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (latestEmotion) {
      const emotionInfo = emotionData[latestEmotion] || emotionData['medium'];
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
      <ScrollView contentContainerStyle={styles.container}>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{`Profile`}</Text>
          <Text style={styles.subtitle}>@{fullName}</Text>
        </View>
        
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Upload Image</Text>
          )}
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name :</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email :</Text>
          <TextInput
            style={styles.input}
            value={email}
            editable={false}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age :</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number :</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.motivationalContainer}>
          <Text style={styles.sectionTitle}>Motivational Quote</Text>
          <View style={styles.separator} />
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
        </View>
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Suggested Activity</Text>
          <View style={styles.separator} />
          <View style={styles.activityRow}>
            <Text style={styles.activityText}>{suggestedActivity}</Text>
            <Icon name={suggestedIcon} size={40} color="#4CAF50" style={styles.activityIcon} />
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#B0D0D3',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003D4D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#003D4D',
    textAlign: 'center',
    marginTop: 5,
  },
  saveButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2b4898ef',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#003D4D',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333',
    padding: 5,
  },
  motivationalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003D4D',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    color: '#333333',
  },
  activityContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  activityIcon: {
    marginLeft: 10,
  },
});

export default ProfileScreen;
