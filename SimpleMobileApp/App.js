import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Kontexty
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CallsProvider } from './src/context/CallsContext';
import { ClientsProvider } from './src/context/ClientsContext';

// Obrazovky
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallsScreen from './src/screens/CallsScreen';
import CallDetailScreen from './src/screens/CallDetailScreen';
import CreateCallScreen from './src/screens/CreateCallScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientDetailScreen from './src/screens/ClientDetailScreen';
import CreateClientScreen from './src/screens/CreateClientScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigácia pre prihlásených používateľov
const CallsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CallsList" component={CallsScreen} options={{ title: 'Volania' }} />
    <Stack.Screen name="CallDetail" component={CallDetailScreen} options={{ title: 'Detail volania' }} />
    <Stack.Screen name="CreateCall" component={CreateCallScreen} options={{ title: 'Nové volanie' }} />
    <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detail klienta' }} />
  </Stack.Navigator>
);

const ClientsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ClientsList" component={ClientsScreen} options={{ title: 'Klienti' }} />
    <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detail klienta' }} />
    <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'Nový klient' }} />
    <Stack.Screen name="CreateCall" component={CreateCallScreen} options={{ title: 'Nové volanie' }} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Prehľad' }} />
    <Stack.Screen name="CallDetail" component={CallDetailScreen} options={{ title: 'Detail volania' }} />
    <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detail klienta' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Calls') {
          iconName = focused ? 'call' : 'call-outline';
        } else if (route.name === 'Clients') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0077b6',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false, title: 'Domov' }} />
    <Tab.Screen name="Calls" component={CallsStack} options={{ headerShown: false, title: 'Volania' }} />
    <Tab.Screen name="Clients" component={ClientsStack} options={{ headerShown: false, title: 'Klienti' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
  </Tab.Navigator>
);

// Hlavná navigácia
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Tu by sme mohli zobraziť splash screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Hlavný aplikačný komponent
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <CallsProvider>
          <ClientsProvider>
            <AppNavigator />
          </ClientsProvider>
        </CallsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
