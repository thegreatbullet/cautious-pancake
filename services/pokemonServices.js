const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')
const NodeCache = require('node-cache')

// Existing functions
const cache = new NodeCache({ stdTTL: 60 }) // cache for 60 seconds

const getAllPokemon = async (page = 1, limit = 20) => {
  const cacheKey = `allPokemon_page${page}_limit${limit}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const skip = (page - 1) * limit
  const total = await Pokemon.countDocuments()
  const pokemons = await Pokemon.find().skip(skip).limit(limit)

  cache.set(cacheKey, { pokemons, total })
  return { pokemons, total }
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
  let lastRoll = await RollHistory.findOne().sort({ rolledAt: -1 })

  do {
    const randomIndex = Math.floor(Math.random() * count)
    randomPokemon = await Pokemon.findOne().skip(randomIndex)
  } while (lastRoll && randomPokemon._id.equals(lastRoll.pokemonId))

  // Log roll history
  const newRoll = await RollHistory.create({
    pokemonId: randomPokemon._id,
    name: randomPokemon.name,
  })

  // Invalidate roll history cache
  cache.del('rollHistory_limit20') // adjust if you support multiple limits

  return randomPokemon
}

// Fetch roll history
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

  const result = { history, total }
  cache.set(cacheKey, result)
  return result
}

// Get individual pokemon
const getPokemonByIds = async (ids) => {
  const promises = ids.map((id) => Pokemon.findById(id))
  return await Promise.all(promises)
}

module.exports = {
  getAllPokemon,
  createPokemon,
  rollRandomPokemon,
  getRollHistory,
  getPokemonByIds,
}
