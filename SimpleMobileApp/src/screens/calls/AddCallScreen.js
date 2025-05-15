import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  Title, 
  Snackbar, 
  HelperText, 
  Divider,
  List,
  Card,
  Text,
  ActivityIndicator,
  Menu,
  IconButton
} from 'react-native-paper';
import { getClients, createCall } from '../../api/api';
import { format } from 'date-fns';
import { SafeView } from '../../components';
import { shouldUseNativeDriver } from '../../utils/webCompatibility';

// Podmienené importovanie DateTimePicker aby fungoval na webe
let DateTimePicker = () => null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    console.warn('DateTimePicker nebol nájdený:', e);
  }
}

const AddCallScreen = ({ navigation, route }) => {
  const initialClient = route.params?.client || null;
  
  const [callData, setCallData] = useState({
    callDate: new Date(),
    duration: '',
    notes: '',
    status: 'Scheduled',
    callType: '',
    purpose: '',
    outcome: '',
    client: initialClient?._id || '',
  });
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientsList, setShowClientsList] = useState(false);

  const statusOptions = [
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled',
    'Failed'
  ];

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.phone && client.phone.includes(searchQuery))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const clientsData = await getClients();
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Chyba pri načítaní klientov:', error);
      setSnackbarMessage('Nepodarilo sa načítať klientov');
      setSnackbarVisible(true);
    } finally {
      setClientsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!callData.client) {
      newErrors.client = 'Vyberte klienta';
    }
    
    if (!callData.status) {
      newErrors.status = 'Vyberte stav hovoru';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createCall({
        ...callData,
        client: callData.client,
      });
      
      setSnackbarMessage('Hovor bol úspešne vytvorený');
      setSnackbarVisible(true);
      
      // Počkáme na zobrazenie notifikácie a potom sa vrátime
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Chyba pri vytváraní hovoru:', error);
      setSnackbarMessage('Nepodarilo sa vytvoriť hovor');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentTime = callData.callDate;
      selectedDate.setHours(currentTime.getHours());
      selectedDate.setMinutes(currentTime.getMinutes());
      
      setCallData({ ...callData, callDate: selectedDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(callData.callDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      
      setCallData({ ...callData, callDate: newDate });
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setCallData({ ...callData, client: client._id });
    setShowClientsList(false);
  };

  const formatDateTime = (date) => {
    return format(date, "dd.MM.yyyy HH:mm");
  };

  const renderClientItem = ({ item }) => (
    <TouchableOpacity onPress={() => selectClient(item)}>
      <List.Item
        title={item.name}
        description={item.phone || item.postal_mail || item.address}
        left={props => <List.Icon {...props} icon="account" />}
      />
      <Divider />
    </TouchableOpacity>
  );

  const renderDateTimePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Dátum a čas</Text>
          <View style={styles.dateTimeRow}>
            <input
              type="date"
              value={format(callData.callDate, "yyyy-MM-dd")}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                const currentTime = callData.callDate;
                newDate.setHours(currentTime.getHours());
                newDate.setMinutes(currentTime.getMinutes());
                setCallData({ ...callData, callDate: newDate });
              }}
              style={{ flex: 2, marginRight: 10, padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
            />
            
            <input
              type="time"
              value={format(callData.callDate, "HH:mm")}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newDate = new Date(callData.callDate);
                newDate.setHours(parseInt(hours));
                newDate.setMinutes(parseInt(minutes));
                setCallData({ ...callData, callDate: newDate });
              }}
              style={{ flex: 1, padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>Dátum a čas</Text>
        <View style={styles.dateTimeRow}>
          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {format(callData.callDate, "dd.MM.yyyy")}
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowTimePicker(true)}
            style={styles.timeButton}
          >
            {format(callData.callDate, "HH:mm")}
          </Button>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={callData.callDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={callData.callDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Nový hovor</Title>
          
          <SafeView style={styles.formGroup}>
            <Text style={styles.label}>Klient</Text>
            <TouchableOpacity 
              style={styles.clientSelector}
              onPress={() => setShowClientsList(!showClientsList)}
            >
              <Text style={styles.clientSelectorText}>
                {selectedClient ? selectedClient.name : 'Vyberte klienta'}
              </Text>
              <IconButton 
                icon={showClientsList ? "chevron-up" : "chevron-down"}
                size={20}
              />
            </TouchableOpacity>
            {errors.client && <HelperText type="error">{errors.client}</HelperText>}
            
            {showClientsList && (
              <Card style={styles.clientsListCard}>
                <Card.Content>
                  <TextInput
                    label="Hľadať klienta"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                  />
                  
                  {clientsLoading ? (
                    <ActivityIndicator 
                      style={styles.clientsLoading} 
                      animating={true}
                      useNativeDriver={shouldUseNativeDriver()}
                    />
                  ) : (
                    filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <React.Fragment key={client._id}>
                          <List.Item
                            title={client.name}
                            description={client.phone || client.postal_mail || client.address}
                            left={props => <List.Icon {...props} icon="account" />}
                            onPress={() => selectClient(client)}
                          />
                          <Divider />
                        </React.Fragment>
                      ))
                    ) : (
                      <Text style={styles.noClientsText}>Žiadni klienti sa nenašli</Text>
                    )
                  )}
                </Card.Content>
              </Card>
            )}
          </SafeView>
          
          {renderDateTimePicker()}
          
          <SafeView style={styles.formGroup}>
            <Text style={styles.label}>Stav hovoru</Text>
            <Menu
              visible={showStatusMenu}
              onDismiss={() => setShowStatusMenu(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.statusSelector}
                  onPress={() => setShowStatusMenu(true)}
                >
                  <Text style={styles.statusText}>{callData.status}</Text>
                  <IconButton 
                    icon="chevron-down"
                    size={20}
                  />
                </TouchableOpacity>
              }
            >
              {statusOptions.map(option => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setCallData({ ...callData, status: option });
                    setShowStatusMenu(false);
                  }}
                  title={option}
                />
              ))}
            </Menu>
            {errors.status && <HelperText type="error">{errors.status}</HelperText>}
          </SafeView>
          
          <TextInput
            label="Trvanie (minúty)"
            value={callData.duration}
            onChangeText={(text) => setCallData({ ...callData, duration: text })}
            keyboardType="number-pad"
            style={styles.input}
          />
          
          <TextInput
            label="Typ hovoru"
            value={callData.callType}
            onChangeText={(text) => setCallData({ ...callData, callType: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Zámer"
            value={callData.purpose}
            onChangeText={(text) => setCallData({ ...callData, purpose: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Výsledok"
            value={callData.outcome}
            onChangeText={(text) => setCallData({ ...callData, outcome: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Poznámky"
            value={callData.notes}
            onChangeText={(text) => setCallData({ ...callData, notes: text })}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          >
            Vytvoriť hovor
          </Button>
        </Card.Content>
      </Card>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    marginBottom: 15,
    backgroundColor: '#fff',
    height: 100,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 5,
    paddingVertical: 5,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateButton: {
    flex: 2,
    marginRight: 10,
  },
  timeButton: {
    flex: 1,
  },
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  clientSelectorText: {
    fontSize: 16,
  },
  clientsListCard: {
    marginTop: 5,
    marginBottom: 15,
    maxHeight: 300,
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  noClientsText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  clientsLoading: {
    marginVertical: 20,
  },
  statusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 16,
  },
});

export default AddCallScreen; 