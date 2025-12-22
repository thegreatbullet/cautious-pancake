import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pokemon from '../models/pokemonModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/my_database';

const pokemons = [
  {
    number: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    imageUrl: '../static/images/Version1/1.webp',
  },
  {
    number: 2,
    name: 'Ivysaur',
    type: ['Grass', 'Poison'],
    imageUrl: '../static/images/Version1/2.webp',
  },
  {
    number: 3,
    name: 'Venusaur',
    type: ['Grass', 'Poison'],
    imageUrl: '../static/images/Version1/3.webp',
  },
  {
    number: 4,
    name: 'Charmander',
    type: ['Fire'],
    imageUrl: '../static/images/Version1/4.webp',
  },
  {
    number: 5,
    name: 'Charmeleon',
    type: ['Fire'],
    imageUrl: '../static/images/Version1/5.webp',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to test DB');

    // Clear the collection first
    await Pokemon.deleteMany();

    // Insert Pokémon
    await Pokemon.insertMany(pokemons);
    console.log('✅ Seeded test Pokémon');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
