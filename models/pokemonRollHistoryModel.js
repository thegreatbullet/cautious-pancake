// backend/models/pokemonRollHistoryModel.js
import mongoose from 'mongoose';

const rollHistorySchema = new mongoose.Schema(
  {
    pokemonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rolledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'rollHistory',
    timestamps: true,
  },
);

export default mongoose.model('RollHistory', rollHistorySchema);
