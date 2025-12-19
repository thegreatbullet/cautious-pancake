const mongoose = require('mongoose')

const rollHistorySchema = new mongoose.Schema(
  {
    pokemonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon',
      required: true,
    },
    name: { type: String, required: true },
    rolledAt: { type: Date, default: Date.now },
  },
  { collection: 'rollHistory' }
)

module.exports = mongoose.model('RollHistory', rollHistorySchema)
