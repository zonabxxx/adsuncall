import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, Divider, List, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const ClientDetailScreen = ({ route, navigation }) => {
  const { client } = route.params;

  const handleCall = () => {
    if (client.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client.postal_mail && client.postal_mail.includes('@')) {
      Linking.openURL(`mailto:${client.postal_mail}`);
    }
  };

  const handleWeb = () => {
    if (client.web) {
      let url = client.web;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };

  const handleNewCall = () => {
    // Navigácia na pridanie nového hovoru s predvyplneným klientom
    // navigation.navigate('AddCall', { client });
    // Bude implementované neskôr
    alert('Funkcionalita pre pridanie hovoru bude implementovaná v ďalšom kroku');
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
          <Title style={styles.title}>{client.name}</Title>
          
          {client.company && (
            <Paragraph style={styles.company}>{client.company}</Paragraph>
          )}

          <View style={styles.actionButtons}>
            {client.phone && (
              <Button 
                icon="phone" 
                mode="contained" 
                onPress={handleCall}
                style={styles.actionButton}
              >
                Zavolať
              </Button>
            )}
            
            {client.postal_mail && client.postal_mail.includes('@') && (
              <Button 
                icon="email" 
                mode="contained" 
                onPress={handleEmail}
                style={styles.actionButton}
              >
                Email
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Kontaktné údaje</Title>
          
          <List.Item
            title="Telefón"
            description={client.phone || 'Nie je uvedený'}
            left={props => <List.Icon {...props} icon="phone" />}
            onPress={client.phone ? handleCall : null}
          />
          
          <Divider />
          
          <List.Item
            title="Adresa"
            description={client.address || 'Nie je uvedená'}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
          
          <Divider />
          
          <List.Item
            title="Web"
            description={client.web || 'Nie je uvedený'}
            left={props => <List.Icon {...props} icon="web" />}
            onPress={client.web ? handleWeb : null}
          />
        </Card.Content>
      </Card>

      {client.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Poznámky</Title>
            <Paragraph>{client.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informácie</Title>
          
          {client.mail && (
            <>
              <List.Item
                title="Kategória"
                description={client.mail}
                left={props => <List.Icon {...props} icon="tag" />}
              />
              <Divider />
            </>
          )}
          
          {client.postal_mail && (
            <>
              <List.Item
                title="Email"
                description={client.postal_mail}
                left={props => <List.Icon {...props} icon="email" />}
                onPress={client.postal_mail && client.postal_mail.includes('@') ? handleEmail : null}
              />
              <Divider />
            </>
          )}
          
          <List.Item
            title="Vytvorené"
            description={formatDate(client.createdAt)}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          
          <Divider />
          
          <List.Item
            title="Aktualizované"
            description={formatDate(client.updatedAt)}
            left={props => <List.Icon {...props} icon="update" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomButtons}>
        <Button 
          icon="phone-plus" 
          mode="contained" 
          onPress={handleNewCall}
          style={styles.newCallButton}
        >
          Pridať hovor
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    marginRight: 10,
    borderRadius: 5,
  },
  bottomButtons: {
    marginTop: 10,
    marginBottom: 20,
  },
  newCallButton: {
    borderRadius: 5,
  },
});

export default ClientDetailScreen; 