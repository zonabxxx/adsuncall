const mongoose = require('mongoose');
require('dotenv').config();

// Explicitne nastavíme MongoDB URI z .env súboru
const MONGO_URI = process.env.MONGO_URI;
console.log('Použitý MongoDB URI:', MONGO_URI.substring(0, 20) + '...');

// ID klienta na aktualizáciu (môžeme zadať ako parameter príkazového riadka)
const clientId = process.argv[2] || '6816682dd4d442a19e851178';
console.log(`Aktualizujem klienta s ID: ${clientId}`);

// Mongo DB Connect
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log('Chyba pripojenia k MongoDB:', error);
    process.exit(1);
  }
};

// Funkcia na aktualizáciu stavu klienta
const updateClientStatus = async () => {
  try {
    // Pripojíme sa k databáze
    await connectDB();
    
    // Použijeme priamo kolekciu klientov
    const db = mongoose.connection.db;
    const clientCollection = db.collection('clients');
    
    console.log('Získanie aktuálneho stavu klienta...');
    
    // Získame aktuálny stav klienta
    const clientBefore = await clientCollection.findOne({
      _id: new mongoose.Types.ObjectId(clientId)
    });
    
    if (!clientBefore) {
      console.error(`Klient s ID ${clientId} nebol nájdený v databáze.`);
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('Aktuálny stav klienta:');
    console.log(`- Meno: ${clientBefore.name}`);
    console.log(`- isClient: ${clientBefore.isClient !== undefined ? clientBefore.isClient : 'nenastavené'}`);
    console.log(`- clientSince: ${clientBefore.clientSince || 'nenastavené'}`);
    
    // Pripravíme dáta na aktualizáciu
    const newIsClient = !clientBefore.isClient;
    const updateData = {
      isClient: newIsClient
    };
    
    // Ak sa zmení status na klienta, nastavíme dátum od kedy je klientom
    if (newIsClient === true) {
      updateData.clientSince = new Date();
    }
    
    console.log(`\nAktualizácia stavu klienta na isClient=${newIsClient}...`);
    
    // Aktualizujeme stav klienta
    const updateResult = await clientCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(clientId) },
      { $set: updateData }
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('Aktualizácia nebola úspešná. Žiadne dokumenty neboli zmenené.');
    } else {
      console.log('Aktualizácia úspešná!');
      
      // Získame aktualizovaný stav klienta
      const clientAfter = await clientCollection.findOne({
        _id: new mongoose.Types.ObjectId(clientId)
      });
      
      console.log('Aktualizovaný stav klienta:');
      console.log(`- Meno: ${clientAfter.name}`);
      console.log(`- isClient: ${clientAfter.isClient}`);
      console.log(`- clientSince: ${clientAfter.clientSince || 'nenastavené'}`);
    }
    
    // Odpojíme sa od databázy
    await mongoose.connection.close();
    console.log('\nSpojenie s databázou zatvorené');
    
    process.exit(0);
  } catch (error) {
    console.error('Chyba:', error);
    process.exit(1);
  }
};

// Spustíme aktualizáciu
updateClientStatus(); 