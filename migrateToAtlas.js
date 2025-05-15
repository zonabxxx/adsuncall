const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('Starting migration process...');
console.log('MongoDB Atlas URI:', process.env.MONGO_URI ? `${process.env.MONGO_URI.substring(0, 25)}...` : 'Not defined');

// Model definitions based on actual models
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String
  },
  { timestamps: true }
);

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a client name'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    company: {
      type: String,
    },
    notes: {
      type: String,
    },
    web: {
      type: String,
    },
    mail: {
      type: String,
    },
    postal_mail: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const callSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    callDate: Date,
    status: String,
    duration: Number,
    notes: String,
    outcome: String,
    nextAction: String,
    nextActionDate: Date
  },
  { timestamps: true }
);

async function migrateData() {
  let localConn = null;
  let atlasConn = null;
  
  try {
    // Zapisujeme log súbor pre debugging
    const logStream = fs.createWriteStream(path.join(__dirname, 'migration_log.txt'), { flags: 'a' });
    const log = (message) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;
      console.log(logMessage);
      logStream.write(logMessage + '\n');
    };

    log('Migration started');

    // Pripojenie k lokálnej MongoDB
    try {
      localConn = await mongoose.createConnection('mongodb://localhost:27017/callManagementSystem', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      log('Connected to local MongoDB');
    } catch (err) {
      log(`Failed to connect to local MongoDB: ${err.message}`);
      throw err;
    }

    // Nastavenie modelov pre lokálnu databázu
    const LocalUser = localConn.model('User', userSchema);
    const LocalClient = localConn.model('Client', clientSchema);
    const LocalCall = localConn.model('Call', callSchema);

    // Načítanie dát z lokálnej databázy
    let users = [], clients = [], calls = [];
    
    try {
      users = await LocalUser.find({}).lean();
      log(`Found ${users.length} users in local database`);
      
      clients = await LocalClient.find({}).lean();
      log(`Found ${clients.length} clients in local database`);
      
      calls = await LocalCall.find({}).lean();
      log(`Found ${calls.length} calls in local database`);
    } catch (err) {
      log(`Error fetching data from local database: ${err.message}`);
      throw err;
    }

    if (users.length === 0 && clients.length === 0 && calls.length === 0) {
      log('No data found in local database. Trying to use MongoDB dump from backup directory');
      
      // Možno použiť mongorestore priamo tu
      log('Please restore the data from mongodb_backup directory manually using mongorestore');
    }

    // Pripojenie k MongoDB Atlas
    try {
      atlasConn = await mongoose.createConnection(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      log('Connected to MongoDB Atlas');
    } catch (err) {
      log(`Failed to connect to MongoDB Atlas: ${err.message}`);
      throw err;
    }

    // Nastavenie modelov pre Atlas databázu
    const AtlasUser = atlasConn.model('User', userSchema);
    const AtlasClient = atlasConn.model('Client', clientSchema);
    const AtlasCall = atlasConn.model('Call', callSchema);

    // Skontrolujeme existujúce dáta v Atlas
    const existingUsers = await AtlasUser.countDocuments();
    const existingClients = await AtlasClient.countDocuments();
    const existingCalls = await AtlasCall.countDocuments();
    
    log(`Existing data in Atlas: ${existingUsers} users, ${existingClients} clients, ${existingCalls} calls`);

    // Pýtame sa na potvrdenie ak už existujú dáta
    if (existingUsers > 0 || existingClients > 0 || existingCalls > 0) {
      log('WARNING: There is existing data in Atlas database.');
      log('Clearing existing data in Atlas...');
      
      // Vyčistíme existujúce dáta v Atlas
      await AtlasUser.deleteMany({});
      await AtlasClient.deleteMany({});
      await AtlasCall.deleteMany({});
      log('Cleared existing data in Atlas');
    }

    // Vloženie dát do Atlas
    let insertedUsers = 0, insertedClients = 0, insertedCalls = 0;
    
    if (users.length > 0) {
      try {
        const result = await AtlasUser.insertMany(users);
        insertedUsers = result.length;
        log(`Users migrated successfully: ${insertedUsers}/${users.length}`);
      } catch (err) {
        log(`Error migrating users: ${err.message}`);
      }
    }

    if (clients.length > 0) {
      try {
        // Transformácia klientov: mapovanie email -> address
        const transformedClients = clients.map(client => {
          const transformedClient = { ...client };
          if (client.email) {
            transformedClient.address = client.email;
            delete transformedClient.email;
          }
          return transformedClient;
        });
        
        const result = await AtlasClient.insertMany(transformedClients);
        insertedClients = result.length;
        log(`Clients migrated successfully: ${insertedClients}/${clients.length}`);
      } catch (err) {
        log(`Error migrating clients: ${err.message}`);
      }
    }

    if (calls.length > 0) {
      try {
        const result = await AtlasCall.insertMany(calls);
        insertedCalls = result.length;
        log(`Calls migrated successfully: ${insertedCalls}/${calls.length}`);
      } catch (err) {
        log(`Error migrating calls: ${err.message}`);
      }
    }

    log(`Migration completed. Inserted: ${insertedUsers} users, ${insertedClients} clients, ${insertedCalls} calls`);
    
    // Alternatívny spôsob - použitie mongorestore na import zálohy
    log('If migration from local database failed, you can use mongorestore with the following command:');
    log(`mongorestore --uri="${process.env.MONGO_URI}" mongodb_backup/`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Zatvorenie pripojení
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    await mongoose.disconnect();
    console.log('Connections closed. Migration process finished.');
    process.exit();
  }
}

migrateData(); 