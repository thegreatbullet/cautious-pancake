// backend/scripts/updateStatsAndPrint.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Pokemon from '../models/pokemonModel.js';
import axios from 'axios';

const START = 1;
const END = 5; // adjust batch size as needed

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }

  for (let i = START; i <= END; i++) {
    try {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);

      // Build stats object
      const statsMap = {};
      data.stats.forEach((s) => {
        statsMap[s.stat.name] = s.base_stat;
      });

      // Print stats to console
      console.log(`Stats for #${i} (${data.name.charAt(0).toUpperCase() + data.name.slice(1)}):`);
      console.table(statsMap);

      // Update stats in MongoDB
      await Pokemon.updateOne(
        { number: i },
        {
          $set: {
            stats: {
              hp: statsMap.hp,
              attack: statsMap.attack,
              defense: statsMap.defense,
              specialAttack: statsMap['special-attack'],
              specialDefense: statsMap['special-defense'],
              speed: statsMap.speed,
            },
          },
        },
      );

      console.log(`✅ Updated stats for #${i} in MongoDB`);
    } catch (err) {
      console.error(`❌ Failed #${i}: ${err.message}`);
    }
  }

  console.log('✅ Batch complete');
  process.exit();
}

main();
