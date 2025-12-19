const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')

// Existing functions
const getAllPokemon = async () => {
  return await Pokemon.find()
}

const createPokemon = async ({ number, name, type, imageUrl }) => {
  const pokemon = new Pokemon({ number, name, type, imageUrl })
  await pokemon.save()
  return pokemon
}

// Roll / get random Pokémon and log history
const rollRandomPokemon = async () => {
  const count = await Pokemon.countDocuments()
  if (count === 0) throw new Error('No Pokémon available to roll')

  let randomPokemon
  let lastRoll = await RollHistory.findOne().sort({ rolledAt: -1 }) // latest roll

  do {
    const randomIndex = Math.floor(Math.random() * count)
    randomPokemon = await Pokemon.findOne().skip(randomIndex)
  } while (lastRoll && randomPokemon._id.equals(lastRoll.pokemonId)) // retry if same as last

  // Log roll history
  await RollHistory.create({
    pokemonId: randomPokemon._id,
    name: randomPokemon.name,
  })

  return randomPokemon
}

// Fetch roll history
const getRollHistory = async (limit = 20) => {
  // Fetch latest rolls with Pokémon info, most recent first
  return await RollHistory.find()
    .sort({ rolledAt: -1 })
    .limit(limit)
    .populate('pokemonId', 'number type imageUrl') // optional: get extra info
}

module.exports = {
  getAllPokemon,
  createPokemon,
  rollRandomPokemon,
  getRollHistory,
}
