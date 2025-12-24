import 'dotenv/config';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'pokemon_firered', // ensure this matches your Atlas DB
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
