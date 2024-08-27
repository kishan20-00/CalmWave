import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAskTZb0n86kn6lICyNsqu_m05NaS5P-5Q",
  authDomain: "calmwave-6c9ae.firebaseapp.com",
  projectId: "calmwave-6c9ae",
  storageBucket: "calmwave-6c9ae.appspot.com",
  messagingSenderId: "963313266312",
  appId: "1:963313266312:web:2c1842f53c82fc7a22393d",
  measurementId: "G-EDVQ43L81D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
