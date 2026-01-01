// backend/scripts/updatePokemonImage.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Pokemon from '../models/pokemonModel.js';

const START = 1;
const END = 50; // change this for next batches

async function main() {
  // Check Mongo URI
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
  }

  // Connect to MongoDB Atlas
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }

  // Loop through Pokémon numbers
  for (let i = START; i <= END; i++) {
    try {
      const newUrl = `../static/images/Version1/${i}.png`;

      await Pokemon.updateOne({ number: i }, { $set: { imageUrl: newUrl } });

      console.log(`✅ Updated imageUrl for #${i}`);
    } catch (err) {
      console.error(`❌ Failed #${i}: ${err.message}`);
    }
  }

  console.log('✅ Image URLs updated for batch');
  process.exit();
}

main();
