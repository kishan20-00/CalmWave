import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TherapistProfileScreen = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email);
          setFullName(userData.fullName || '');
          setProfileImage(userData.profileImage || null);
          setAge(userData.age || '');
          setContactNumber(userData.contactNumber || '');
          setExperience(userData.experience || '');
          setHospitalName(userData.hospitalName || '');
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName,
        profileImage,
        age,
        contactNumber,
        experience,
        hospitalName,
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
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Therapist Profile</Text>

          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholderContainer}>
                <Icon name="account-circle" size={80} color="#aaa" />
                <Text style={styles.imagePlaceholder}>Upload Profile Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                value={email}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputWrapper}>
              <Icon name="calendar" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="30"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="+1-234-567-890"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Experience (in years)</Text>
            <View style={styles.inputWrapper}>
              <Icon name="star" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="5"
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hospital Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="hospital" size={24} color="#00796B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="General Hospital"
                value={hospitalName}
                onChangeText={setHospitalName}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Update Profile" onPress={handleUpdateProfile} color="#0d674aef" />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#B0D0D3',
  },
  innerContainer: {
    flex: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#00796B',
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imagePlaceholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#00796B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00796B',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default TherapistProfileScreen;
