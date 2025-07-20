const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/tgt'; // Change to your URI

let isConnected = false;

async function connectToMongo() {
  if (!isConnected) {
    try {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

module.exports = { connectToMongo, mongoose };
