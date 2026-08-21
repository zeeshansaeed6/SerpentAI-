const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no URI is provided, use in-memory MongoDB
    if (!uri) {
      console.log('🧠 Starting in-memory MongoDB server...');
      mongoServer = new MongoMemoryServer();
      await mongoServer.start();
      uri = mongoServer.getUri();
      console.log('✅ In-memory MongoDB started successfully');
    }

    const conn = await mongoose.connect(uri);
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
