import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CallsListScreen from '../screens/calls/CallsListScreen';
import CallDetailScreen from '../screens/calls/CallDetailScreen';
import AddCallScreen from '../screens/calls/AddCallScreen';
import ClientsListScreen from '../screens/clients/ClientsListScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import { useAuth } from '../contexts/AuthContext';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Fallback pre obrazovky, ktoré ešte nie sú implementované
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Screen: {route.name}</Text>
    <Text>Coming soon...</Text>
  </View>
);

// Stack navigator pre sekciu Calls
const CallsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CallsList" 
      component={CallsListScreen} 
      options={{ title: 'Hovory' }}
    />
    <Stack.Screen 
      name="CallDetail" 
      component={CallDetailScreen} 
      options={{ title: 'Detail hovoru' }}
    />
    <Stack.Screen 
      name="AddCall" 
      component={AddCallScreen} 
      options={{ title: 'Nový hovor' }}
    />
  </Stack.Navigator>
);

// Stack navigator pre sekciu Clients
const ClientsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ClientsList" 
      component={ClientsListScreen} 
      options={{ title: 'Klienti' }}
    />
    <Stack.Screen 
      name="ClientDetail" 
      component={ClientDetailScreen} 
      options={{ title: 'Detail klienta' }}
    />
    <Stack.Screen 
      name="AddClient" 
      component={AddClientScreen} 
      options={{ title: 'Nový klient' }}
    />
  </Stack.Navigator>
);

// Navigácia pre prihlásených používateľov (Drawer menu)
const AuthenticatedNavigator = () => (
  <Drawer.Navigator>
    <Drawer.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Domov' }}
    />
    <Drawer.Screen 
      name="Calls" 
      component={CallsStackNavigator} 
      options={{ title: 'Hovory', headerShown: false }}
    />
    <Drawer.Screen 
      name="Clients" 
      component={ClientsStackNavigator} 
      options={{ title: 'Klienti', headerShown: false }}
    />
    <Drawer.Screen 
      name="Calendar" 
      component={PlaceholderScreen} 
      options={{ title: 'Kalendár' }}
    />
    <Drawer.Screen 
      name="Settings" 
      component={PlaceholderScreen} 
      options={{ title: 'Nastavenia' }}
    />
  </Drawer.Navigator>
);

// Hlavná navigácia aplikácie
const AppNavigator = () => {
  const { authState } = useAuth();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authState.isLoggedIn ? (
        <Stack.Screen name="Main" component={AuthenticatedNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 