// backend/seed.js
import mongoose from 'mongoose';
import Pokemon from './models/pokemonModel.js';

const mongoURI = 'mongodb://localhost:27017/my_database'; // Change DB name if needed

const pokemons = [
  {
    number: 3,
    name: 'Venusaur',
    type: ['Grass', 'Poison'],
    imageUrl: '../static/images/Version1/3.webp',
  },
  { number: 4, name: 'Charmander', type: ['Fire'], imageUrl: '../static/images/Version1/4.webp' },
  { number: 5, name: 'Charmeleon', type: ['Fire'], imageUrl: '../static/images/Version1/5.webp' },
  {
    number: 6,
    name: 'Charizard',
    type: ['Fire', 'Flying'],
    imageUrl: '../static/images/Version1/6.webp',
  },
  { number: 7, name: 'Squirtle', type: ['Water'], imageUrl: '../static/images/Version1/7.webp' },
  // ... continue all other Pokémon
  { number: 151, name: 'Mew', type: ['Psychic'], imageUrl: '../static/images/Version1/151.webp' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const count = await Pokemon.countDocuments();
    if (count === 0) {
      await Pokemon.insertMany(pokemons);
      console.log('Pokémon data seeded successfully');
    } else {
      console.log('Pokémon data already exists. Skipping seeding.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedDB();
