import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Odhlásenie',
      'Naozaj sa chcete odhlásiť?',
      [
        {
          text: 'Zrušiť',
          style: 'cancel',
        },
        {
          text: 'Odhlásiť',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.message}>Načítavanie profilu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profil hlavička */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImageText}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Sekcie profilu */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informácie o účte</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="person" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Meno a priezvisko</Text>
              <Text style={styles.optionValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="mail" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Email</Text>
              <Text style={styles.optionValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="calendar" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Dátum registrácie</Text>
              <Text style={styles.optionValue}>
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('sk-SK')
                  : 'Nie je k dispozícii'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nastavenia</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="notifications" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Notifikácie</Text>
              <Text style={styles.optionSubtitle}>Spravujte nastavenia notifikácií</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="lock-closed" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Zmeniť heslo</Text>
              <Text style={styles.optionSubtitle}>Aktualizujte svoje heslo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="moon" size={20} color="#0077b6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Tmavý režim</Text>
              <Text style={styles.optionSubtitle}>Zapnúť/vypnúť tmavý režim</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        {/* Odhlásenie */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Odhlásiť sa</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Verzia aplikácie: 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0077b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  optionValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen; 