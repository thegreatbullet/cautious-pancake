// dropCollection.js
import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './db.js';

async function dropPokemonCollection() {
  try {
    await connectDB();
    await mongoose.connection.collection('pokemon_firered').drop();
    console.log('✅ pokemon_firered collection dropped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping collection:', err);
    process.exit(1);
  }
}

dropPokemonCollection();
