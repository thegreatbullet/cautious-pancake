import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: [String],
      index: true,
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    stats: {
      hp: { type: Number, default: 0 },
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      specialAttack: { type: Number, default: 0 },
      specialDefense: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
    },
  },
  {
    collection: 'pokemon',
    timestamps: true,
  },
);

export default mongoose.model('Pokemon', pokemonSchema);
