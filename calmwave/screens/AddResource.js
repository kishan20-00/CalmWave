import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage, auth } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ResourcePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Updated to match ImagePicker API
    }
  };

  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Both title and content are required.');
      return;
    }

    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    setLoading(true);

    let imageUrl = '';

    if (image) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `articles/${Date.now()}_${userEmail}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(firestore, 'articles'), {
        title,
        content,
        imageUrl,
        email: userEmail,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Article saved successfully!');
      setTitle('');
      setContent('');
      setImage(null);
    } catch (saveError) {
      console.error('Error saving article:', saveError);
      Alert.alert('Error', 'Failed to save article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Write an Article</Text>
      
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Content"
        multiline
        numberOfLines={5}
      />

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      <Button title="Pick an image" onPress={pickImage} />

      <Button title={loading ? "Saving..." : "Save Article"} onPress={handleSaveArticle} disabled={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
});

export default ResourcePage;
