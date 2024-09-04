import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage, auth } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      
      <View style={styles.inputContainer}>
        <Icon name="title" size={24} color="#555" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <Icon name="description" size={24} color="#555" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Content"
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
        />
      </View>

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Icon name="image" size={24} color="#fff" />
        <Text style={styles.imagePickerButtonText}>Pick an Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={handleSaveArticle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Article</Text>
        )}
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#333',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c925aef',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3452a3ef',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});

export default ResourcePage;
