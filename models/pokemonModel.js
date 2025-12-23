// backend/models/pokemonModel.js
import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1, // ensures Pokémon number is positive
    },
    name: {
      type: String,
      required: true,
      index: true,
      trim: true, // trims leading/trailing spaces automatically
    },
    type: {
      type: [String],
      index: true,
      default: [], // ensures an empty array if none provided
    },
    imageUrl: {
      type: String,
      trim: true, // optional, but trims spaces
    },
  },
  {
    collection: 'pokemon',
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

export default mongoose.model('Pokemon', pokemonSchema);
