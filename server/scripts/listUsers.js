const mongoose = require('mongoose');
require('dotenv').config();

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

// Funkcia na získanie používateľov
const listUsers = async () => {
  try {
    // Pripojíme sa k databáze
    await connectDB();
    
    // Použijeme priamo kolekciu používateľov
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('Získanie zoznamu používateľov...');
    
    // Získame zoznam používateľov
    const users = await usersCollection.find({}).toArray();
    console.log(`Nájdených ${users.length} používateľov.`);
    
    // Zobraziť údaje o každom používateľovi (bez hesla)
    users.forEach((user, index) => {
      console.log(`\nPoužívateľ #${index + 1}:`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Meno: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Vytvorený: ${user.createdAt}`);
    });
    
    // Odpojíme sa od databázy
    await mongoose.connection.close();
    console.log('\nSpojenie s databázou zatvorené');
    
    process.exit(0);
  } catch (error) {
    console.error('Chyba:', error);
    process.exit(1);
  }
};

// Spustíme získanie používateľov
listUsers(); 