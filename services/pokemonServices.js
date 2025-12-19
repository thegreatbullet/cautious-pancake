const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')
const NodeCache = require('node-cache')

// Initialize cache (60 seconds TTL)
const cache = new NodeCache({ stdTTL: 60 })

// GET all Pokémon with pagination and caching
const getAllPokemon = async (page = 1, limit = 20) => {
  const cacheKey = `allPokemon_page${page}_limit${limit}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const skip = (page - 1) * limit
  const total = await Pokemon.countDocuments()
  const pokemons = await Pokemon.find().skip(skip).limit(limit).lean()

  const result = { pokemons, total }
  cache.set(cacheKey, result)
  return result
}

// Create new Pokémon
const createPokemon = async ({ number, name, type, imageUrl }) => {
  const pokemon = new Pokemon({
    number,
    name: name.trim(),
    type: type.map((t) => t.trim()),
    imageUrl: imageUrl?.trim() || '',
  })

  await pokemon.save()
  // Invalidate all Pokémon cache
  cache.keys().forEach((key) => {
    if (key.startsWith('allPokemon_')) cache.del(key)
  })

  return pokemon
}

// Roll / get random Pokémon and log history
const rollRandomPokemon = async () => {
  const count = await Pokemon.countDocuments()
  if (count === 0) throw new Error('No Pokémon available to roll')

  let randomPokemon
  const lastRoll = await RollHistory.findOne().sort({ rolledAt: -1 })

  do {
    const randomIndex = Math.floor(Math.random() * count)
    randomPokemon = await Pokemon.findOne().skip(randomIndex)
  } while (lastRoll && randomPokemon._id.equals(lastRoll.pokemonId))

  // Log roll history
  await RollHistory.create({
    pokemonId: randomPokemon._id,
    name: randomPokemon.name,
  })

  // Invalidate all roll history cache
  cache.keys().forEach((key) => {
    if (key.startsWith('rollHistory_')) cache.del(key)
  })

  return randomPokemon
}

// Fetch roll history with pagination and caching
const getRollHistory = async (page = 1, limit = 20) => {
  const cacheKey = `rollHistory_page${page}_limit${limit}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const skip = (page - 1) * limit
  const total = await RollHistory.countDocuments()
  const history = await RollHistory.find()
    .sort({ rolledAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('pokemonId', 'number type imageUrl')
    .lean()

  const result = { history, total }
  cache.set(cacheKey, result)
  return result
}

// Get Pokémon by array of IDs (parallel fetch)
const getPokemonByIds = async (ids) => {
  const promises = ids.map((id) => Pokemon.findById(id).lean())
  return await Promise.all(promises)
}

module.exports = {
  getAllPokemon,
  createPokemon,
  rollRandomPokemon,
  getRollHistory,
  getPokemonByIds,
  cache, // export cache if needed elsewhere
}
