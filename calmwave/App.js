// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './screens/SignupScreen'; // Import the SignupScreen component
import HomeScreen from './screens/HomeScreen'; // Import the HomeScreen component
import LoginScreen from './screens/LoginScreen'; // Import the LoginScreen component
import TherapistHomeScreen from './screens/TherapistHomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import TherapistProfileScreen from './screens/TherapistProfile';
import TherapistListScreen from './screens/TherapistListScreen';
import BookingPage from './screens/BookingPage';
import ManageBookings from './screens/ManageBookings';
import CommunityChat from './screens/CommunityChat';
import EmotionFormScreen from './screens/EmotionFormScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TherapistHome" 
          component={TherapistHomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TherapistProfile" 
          component={TherapistProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TherapistList" 
          component={TherapistListScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingPage} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ManageBookings" 
          component={ManageBookings} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CommunityChat" 
          component={CommunityChat} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmotionForm" 
          component={EmotionFormScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
