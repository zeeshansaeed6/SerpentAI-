const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      // The in-memory database is a dev convenience: it downloads a MongoDB binary and loses
      // all data on restart, so production must be configured with a real database.
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is required when NODE_ENV=production');
      }

      console.log('🧠 Starting in-memory MongoDB server...');
      const { MongoMemoryServer } = require('mongodb-memory-server'); // dev dependency: loaded lazily
      mongoServer = new MongoMemoryServer();
      await mongoServer.start();
      uri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB started successfully');
    }

    // Fail fast (instead of hanging for 30s) when the database is unreachable
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    // Seed snake data on first connection
    const Snake = require('../models/Snake');
    const count = await Snake.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding snake encyclopedia data...');
      const { snakeData } = require('../data/seedSnakes');
      await Snake.insertMany(snakeData);
      console.log(`✅ Seeded ${snakeData.length} snake species`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
