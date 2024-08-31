import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import TherapistHomeScreen from './screens/TherapistHomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import TherapistListScreen from './screens/TherapistListScreen';
import ManageBookings from './screens/ManageBookings';
import CommunityChat from './screens/CommunityChat';
import EmotionFormScreen from './screens/EmotionFormScreen';
import UserBookingsPage from './screens/UserBookingsPage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const defaultProfileImage = require('./assets/profile.jpg'); // Default profile image

function CustomDrawerContent(props) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profileImage: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const emailUsername = data.email.split('@')[0];
          setUserData({
            name: emailUsername || '',
            email: data.email || '',
            profileImage: data.profileImage || null,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <Image
            source={userData.profileImage ? { uri: userData.profileImage } : defaultProfileImage}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>@{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f0f0f0',
        },
      }}
      initialRouteName="MainHome"
    >
      <Drawer.Screen
        name="MainHome"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="YourProfile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="TherapistHome"
        component={TherapistHomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="doctor" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="TherapistList"
        component={TherapistListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="ManageBookings"
        component={ManageBookings}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="CommunityChat"
        component={CommunityChat}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chat" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="EmotionForm"
        component={EmotionFormScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="emoticon" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="UserBookings"
        component={UserBookingsPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={MyDrawer}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: '#2890ad',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: '#eee',
  },
});
