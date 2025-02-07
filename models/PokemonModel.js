const mongoose = require('mongoose')

const pokemonSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: [String],
  imageUrl: { type: String },
})

module.exports = mongoose.model('Pokemon', pokemonSchema)
