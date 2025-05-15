import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, ActivityIndicator, FAB, Button, Snackbar } from 'react-native-paper';
import { getClients } from '../../api/api';

const ClientsListScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      setError('Nepodarilo sa načítať klientov');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (client.postal_mail && client.postal_mail.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (client.phone && client.phone.includes(searchQuery))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ClientDetail', { client: item })}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.clientName}>{item.name}</Text>
          {item.phone && <Text>Telefón: {item.phone}</Text>}
          {item.address && <Text>Adresa: {item.address}</Text>}
          {item.postal_mail && <Text>Email: {item.postal_mail}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && clients.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Hľadať klienta"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={loadClients} 
            style={styles.retryButton}
          >
            Skúsiť znova
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text>Žiadni klienti neboli nájdení</Text>
              <Button 
                mode="contained" 
                onPress={loadClients} 
                style={styles.retryButton}
              >
                Obnoviť
              </Button>
            </View>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddClient')}
      />
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 10,
    borderRadius: 10,
  },
  card: {
    margin: 10,
    borderRadius: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  retryButton: {
    marginTop: 10,
  },
});

export default ClientsListScreen; 