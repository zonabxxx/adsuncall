import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ActivityIndicator, Chip, FAB, Searchbar } from 'react-native-paper';
import { getCalls } from '../../api/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return '#1976D2';
    case 'In Progress':
      return '#FFA000';
    case 'Completed':
      return '#388E3C';
    case 'Cancelled':
      return '#D32F2F';
    case 'Failed':
      return '#7B1FA2';
    default:
      return '#757575';
  }
};

const CallsListScreen = ({ navigation }) => {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const data = await getCalls();
      setCalls(data);
      setFilteredCalls(data);
    } catch (err) {
      setError('Nepodarilo sa načítať hovory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = calls.filter(
        (call) =>
          call.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (call.notes && call.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCalls(filtered);
    } else {
      setFilteredCalls(calls);
    }
  }, [searchQuery, calls]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CallDetail', { call: item })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.clientName}>{item.client?.name || 'Neznámy klient'}</Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ borderColor: getStatusColor(item.status) }}
            >
              {item.status}
            </Chip>
          </View>
          <Text>Dátum: {formatDate(item.callDate)}</Text>
          {item.duration > 0 && <Text>Trvanie: {item.duration} min</Text>}
          {item.notes && <Text numberOfLines={2}>Poznámky: {item.notes}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && calls.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Hľadať hovory"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text>Žiadne hovory neboli nájdené</Text>
            </View>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddCall')}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CallsListScreen; 