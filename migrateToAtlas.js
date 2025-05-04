const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Model definitions (simplified versions of your actual models)
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
    name: String,
    email: String,
    phone: String,
    address: String,
    notes: String
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
  try {
    // Connect to local MongoDB
    const localConn = await mongoose.createConnection('mongodb://localhost:27017/callManagementSystem');
    console.log('Connected to local MongoDB');

    // Set up models for local database
    const LocalUser = localConn.model('User', userSchema);
    const LocalClient = localConn.model('Client', clientSchema);
    const LocalCall = localConn.model('Call', callSchema);

    // Fetch all data from local database
    const users = await LocalUser.find({});
    const clients = await LocalClient.find({});
    const calls = await LocalCall.find({});

    console.log(`Found ${users.length} users, ${clients.length} clients, and ${calls.length} calls in local database`);

    // Connect to MongoDB Atlas
    const atlasConn = await mongoose.createConnection(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Set up models for Atlas database
    const AtlasUser = atlasConn.model('User', userSchema);
    const AtlasClient = atlasConn.model('Client', clientSchema);
    const AtlasCall = atlasConn.model('Call', callSchema);

    // Clear existing data in Atlas (optional - remove if you want to keep existing data)
    await AtlasUser.deleteMany({});
    await AtlasClient.deleteMany({});
    await AtlasCall.deleteMany({});
    console.log('Cleared existing data in Atlas');

    // Insert data into Atlas
    if (users.length > 0) {
      await AtlasUser.insertMany(users.map(user => user.toObject()));
      console.log('Users migrated successfully');
    }

    if (clients.length > 0) {
      await AtlasClient.insertMany(clients.map(client => client.toObject()));
      console.log('Clients migrated successfully');
    }

    if (calls.length > 0) {
      await AtlasCall.insertMany(calls.map(call => call.toObject()));
      console.log('Calls migrated successfully');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await mongoose.disconnect();
    process.exit();
  }
}

migrateData(); 