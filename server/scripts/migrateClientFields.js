const mongoose = require('mongoose');
require('dotenv').config(); // Načíta .env súbor

// Explicitne nastavíme MongoDB URI z .env súboru
const MONGO_URI = process.env.MONGO_URI;
console.log('Použitý MongoDB URI:', MONGO_URI.substring(0, 20) + '...');

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

// Hlavná migračná funkcia
const migrateClientFields = async () => {
  try {
    // Pripojíme sa k databáze
    await connectDB();
    
    // Použijeme priamo kolekciu klientov bez definície schémy
    const db = mongoose.connection.db;
    const clientCollection = db.collection('clients');
    
    console.log('Migrácia začala...');
    
    // Získame počet dokumentov
    const count = await clientCollection.countDocuments();
    console.log(`Nájdených ${count} záznamov na migráciu.`);
    
    // Vykonáme hromadnú aktualizáciu - pridáme pole isClient všetkým dokumentom
    const updateResult = await clientCollection.updateMany(
      { isClient: { $exists: false } }, // Aktualizovať len záznamy, kde pole isClient neexistuje
      { $set: { isClient: false } }     // Nastaviť isClient na false
    );
    
    console.log('Migrácia dokončená:');
    console.log(`- Dokumenty na aktualizáciu: ${count}`);
    console.log(`- Aktualizované dokumenty: ${updateResult.modifiedCount}`);
    
    // Skontrolujeme stav po aktualizácii
    const countAfter = await clientCollection.countDocuments({ isClient: { $exists: true } });
    console.log(`- Dokumenty s poľom isClient po aktualizácii: ${countAfter}`);
    
    // Ukázať prvý záznam pre kontrolu
    const firstDoc = await clientCollection.findOne({});
    console.log('Príklad záznamu po migrácii:');
    console.log(JSON.stringify(firstDoc, null, 2));
    
    // Odpojíme sa od databázy
    await mongoose.connection.close();
    console.log('Spojenie s databázou zatvorené');
    
    process.exit(0);
  } catch (error) {
    console.error('Chyba pri migrácii:', error);
    process.exit(1);
  }
};

// Spustíme migráciu
migrateClientFields(); 