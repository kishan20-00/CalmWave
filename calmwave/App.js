import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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
import BookingPage from './screens/BookingPage';
import TherapistProfileScreen from './screens/TherapistProfile'
import ResourcePage from './screens/AddResource';
import ArticleListPage from './screens/ArticleList';
import ArticleDetailPage from './screens/ArticleDetails';
import ProgressPage from './screens/ProgressPage';

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
          const userName = data.fullName;
          setUserData({
            name: userName || '',
            email: data.email || '',
            profileImage: data.profileImage || null,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      props.navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <Image
            source={userData.profileImage ? { uri: userData.profileImage } : defaultProfileImage}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Icon name="logout" color={color} size={size} />
        )}
        onPress={handleLogout}
      />
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
        name="Main Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Your Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Therapist List"
        component={TherapistListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Community Chat"
        component={CommunityChat}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chat" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Emotion Form"
        component={EmotionFormScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="emoticon" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="User Bookings"
        component={UserBookingsPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Add Resource"
        component={ResourcePage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="read" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Resources"
        component={ArticleListPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="printer" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Progress"
        component={ProgressPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="progress-check" color={color} size={size} />
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
        <Stack.Screen
          name="ManageBookings"
          component={ManageBookings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TherapistHome"
          component={TherapistHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TherapistProfile"
          component={TherapistProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailPage}
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
