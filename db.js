import 'dotenv/config';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pokemon_firered', {
        dbName: 'pokemon_firered',
      });
      console.log('MongoDB Connected');
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
