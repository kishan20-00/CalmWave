// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgB3p0B3alcKo4G6ZNnRGBHv2TjJu0hv0",
  authDomain: "calmwave-fd31b.firebaseapp.com",
  projectId: "calmwave-fd31b",
  storageBucket: "calmwave-fd31b.appspot.com",
  messagingSenderId: "772521458657",
  appId: "1:772521458657:web:b8f3e16e8a141062b8b0a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
