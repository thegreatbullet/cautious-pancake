// backend/models/pokemonRollHistoryModel.js
import mongoose from 'mongoose';

const rollHistorySchema = new mongoose.Schema(
  {
    pokemonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon',
      required: true,
      index: true, // allows fast lookups by pokemonId
    },
    name: {
      type: String,
      required: true,
      trim: true, // removes extra spaces
    },
    rolledAt: {
      type: Date,
      default: Date.now,
      index: true, // allows sorting by recent rolls efficiently
    },
  },
  {
    collection: 'rollHistory',
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

export default mongoose.model('RollHistory', rollHistorySchema);
