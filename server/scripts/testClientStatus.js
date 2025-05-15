const axios = require('axios');
require('dotenv').config();

// Získať prihlasovacie údaje z príkazového riadka alebo použiť predvolené hodnoty
const email = process.argv[2] || 'test@example.com';
const password = process.argv[3] || 'test123';
const clientId = process.argv[4] || '6816682dd4d442a19e851178';

const API_URL = 'http://localhost:5001/api';

console.log(`Použité údaje: Email=${email}, ClientID=${clientId}`);

// Testovacia funkcia
async function testClientStatus() {
  try {
    console.log('Testovanie API endpointu setClientStatus...');
    
    // 1. Prihlásenie a získanie tokenu
    console.log('1. Prihlasovanie...');
    let loginResponse;
    try {
      loginResponse = await axios.post(`${API_URL}/users/login`, {
        email: email,
        password: password
      });
      
      console.log('Prihlásenie úspešné!');
    } catch (error) {
      console.error('Chyba pri prihlásení:', error.response ? error.response.data : error.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('Token:', token.substring(0, 20) + '...');
    
    // 2. Získanie aktuálnych údajov o klientovi
    console.log('\n2. Získanie aktuálnych údajov o klientovi...');
    let clientBefore;
    try {
      const clientResponse = await axios.get(`${API_URL}/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clientBefore = clientResponse.data;
      console.log('Aktuálny stav klienta:');
      console.log(`- ID: ${clientBefore._id}`);
      console.log(`- Meno: ${clientBefore.name}`);
      console.log(`- isClient: ${clientBefore.isClient}`);
      console.log(`- clientSince: ${clientBefore.clientSince || 'nenastavené'}`);
    } catch (error) {
      console.error('Chyba pri získavaní údajov o klientovi:', error.response ? error.response.data : error.message);
      return;
    }
    
    // 3. Zmena stavu klienta
    const newStatus = !clientBefore.isClient;
    console.log(`\n3. Zmena stavu klienta na: isClient=${newStatus}`);
    try {
      const updateResponse = await axios.put(`${API_URL}/clients/${clientId}/setClientStatus`, {
        isClient: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedClient = updateResponse.data;
      console.log('Aktualizácia úspešná!');
      console.log('Aktualizované údaje:');
      console.log(`- ID: ${updatedClient._id}`);
      console.log(`- Meno: ${updatedClient.name}`);
      console.log(`- isClient: ${updatedClient.isClient}`);
      console.log(`- clientSince: ${updatedClient.clientSince || 'nenastavené'}`);
      
      if (updatedClient.isClient !== newStatus) {
        console.error('CHYBA: Stav isClient sa nezmenil správne!');
      } else {
        console.log('Stav isClient sa úspešne zmenil.');
      }
      
      if (newStatus === true && !updatedClient.clientSince) {
        console.error('CHYBA: Pri nastavení isClient=true sa nenastavil dátum clientSince!');
      } else if (newStatus === true && updatedClient.clientSince) {
        console.log('Dátum clientSince bol správne nastavený.');
      }
      
    } catch (error) {
      console.error('Chyba pri aktualizácii stavu klienta:', error.response ? error.response.data : error.message);
    }
  } catch (error) {
    console.error('Neočakávaná chyba:', error);
  }
}

// Spustenie testu
testClientStatus(); 