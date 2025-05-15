import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, Divider, List, Text, Chip } from 'react-native-paper';

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

const CallDetailScreen = ({ route, navigation }) => {
  const { call } = route.params;

  const handleCallClient = () => {
    if (call.client?.phone) {
      Linking.openURL(`tel:${call.client.phone}`);
    }
  };

  const handleEmailClient = () => {
    if (call.client?.postal_mail) {
      Linking.openURL(`mailto:${call.client.postal_mail}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.title}>Hovor</Title>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(call.status) }}
              style={{ borderColor: getStatusColor(call.status) }}
            >
              {call.status}
            </Chip>
          </View>
          
          <Text style={styles.callDate}>
            {formatDate(call.callDate)}
          </Text>
          
          {call.duration > 0 && (
            <Text style={styles.callDuration}>
              Trvanie: {call.duration} minút
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Klient</Title>
          
          <Text style={styles.clientName}>
            {call.client?.name || 'Neznámy klient'}
          </Text>
          
          {call.client && (
            <View style={styles.actionButtons}>
              {call.client.phone && (
                <Button 
                  icon="phone" 
                  mode="contained" 
                  onPress={handleCallClient}
                  style={styles.actionButton}
                >
                  Zavolať
                </Button>
              )}
              
              {call.client.postal_mail && (
                <Button 
                  icon="email" 
                  mode="contained" 
                  onPress={handleEmailClient}
                  style={styles.actionButton}
                >
                  Email
                </Button>
              )}
              
              <Button 
                icon="account-details" 
                mode="contained" 
                onPress={() => navigation.navigate('ClientDetail', { client: call.client })}
                style={styles.actionButton}
              >
                Detail klienta
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Detaily hovoru</Title>
          
          <List.Item
            title="Typ hovoru"
            description={call.callType || 'Nespecifikované'}
            left={props => <List.Icon {...props} icon="phone-in-talk" />}
          />
          
          <Divider />
          
          <List.Item
            title="Zámer"
            description={call.purpose || 'Nespecifikované'}
            left={props => <List.Icon {...props} icon="target" />}
          />
          
          <Divider />
          
          <List.Item
            title="Výsledok"
            description={call.outcome || 'Nespecifikované'}
            left={props => <List.Icon {...props} icon="check-circle" />}
          />
        </Card.Content>
      </Card>

      {call.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Poznámky</Title>
            <Paragraph>{call.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informácie o zázname</Title>
          
          <List.Item
            title="Vytvoril"
            description={call.user?.name || 'Neznámy používateľ'}
            left={props => <List.Icon {...props} icon="account" />}
          />
          
          <Divider />
          
          <List.Item
            title="Vytvorené"
            description={formatDate(call.createdAt)}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          
          <Divider />
          
          <List.Item
            title="Aktualizované"
            description={formatDate(call.updatedAt)}
            left={props => <List.Icon {...props} icon="update" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomButtons}>
        <Button 
          icon="pencil" 
          mode="contained" 
          onPress={() => navigation.navigate('EditCall', { call })}
          style={styles.editButton}
        >
          Upraviť hovor
        </Button>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  callDate: {
    fontSize: 16,
    marginBottom: 5,
  },
  callDuration: {
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  actionButton: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  bottomButtons: {
    marginVertical: 20,
  },
  editButton: {
    borderRadius: 5,
  },
});

export default CallDetailScreen; 