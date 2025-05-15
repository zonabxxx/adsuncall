import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCalls } from '../context/CallsContext';
import { useClients } from '../context/ClientsContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { calls, isLoading: callsLoading, fetchCalls, getUpcomingCalls } = useCalls();
  const { clients, isLoading: clientsLoading, fetchClients } = useClients();
  
  const upcomingCalls = getUpcomingCalls();

  useEffect(() => {
    fetchCalls();
    fetchClients();
  }, []);

  const handleRefresh = () => {
    fetchCalls();
    fetchClients();
  };

  const navigateToCallDetail = (callId) => {
    navigation.navigate('CallDetail', { callId });
  };

  const navigateToCreateCall = () => {
    navigation.navigate('CreateCall');
  };

  const navigateToClientDetail = (clientId) => {
    navigation.navigate('ClientDetail', { clientId });
  };

  const isLoading = callsLoading || clientsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Uvítacia sekcia */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Vitajte, {user?.name || 'používateľ'}!</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('sk-SK', {
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Navigačné karty */}
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Calls')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#e6f5ff' }]}>
              <Ionicons name="call" size={24} color="#0077b6" />
            </View>
            <Text style={styles.cardTitle}>Volania</Text>
            <Text style={styles.cardCount}>{calls.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Clients')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#e6fff5' }]}>
              <Ionicons name="people" size={24} color="#00b686" />
            </View>
            <Text style={styles.cardTitle}>Klienti</Text>
            <Text style={styles.cardCount}>{clients.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Sekcia nadchádzajúcich hovorov */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nadchádzajúce volania</Text>
            <TouchableOpacity onPress={navigateToCreateCall}>
              <Ionicons name="add-circle" size={24} color="#0077b6" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#0077b6" style={styles.loader} />
          ) : upcomingCalls.length > 0 ? (
            upcomingCalls.slice(0, 5).map((call) => (
              <TouchableOpacity 
                key={call._id} 
                style={styles.callItem}
                onPress={() => navigateToCallDetail(call._id)}
              >
                <View style={styles.callItemLeft}>
                  <Text style={styles.callItemClient}>{call.clientName}</Text>
                  <Text style={styles.callItemNotes} numberOfLines={1}>
                    {call.notes || 'Žiadne poznámky'}
                  </Text>
                </View>
                <View style={styles.callItemRight}>
                  <Text style={styles.callItemDate}>
                    {new Date(call.scheduledAt || call.date).toLocaleDateString('sk-SK')}
                  </Text>
                  <Text style={styles.callItemTime}>
                    {new Date(call.scheduledAt || call.date).toLocaleTimeString('sk-SK', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nemáte žiadne nadchádzajúce volania</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={navigateToCreateCall}
              >
                <Text style={styles.createButtonText}>Vytvoriť volanie</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {upcomingCalls.length > 5 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Calls')}
            >
              <Text style={styles.viewAllButtonText}>Zobraziť všetky</Text>
            </TouchableOpacity>
          )}
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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077b6',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginVertical: 20,
  },
  callItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callItemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  callItemClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  callItemNotes: {
    fontSize: 14,
    color: '#666',
  },
  callItemRight: {
    alignItems: 'flex-end',
  },
  callItemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  callItemTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0077b6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#0077b6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 16,
    color: '#0077b6',
    fontWeight: '600',
  },
});

export default HomeScreen; 