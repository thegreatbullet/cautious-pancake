import mongoose from 'mongoose';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';
import NodeCache from 'node-cache';

// Initialize cache with 60 seconds TTL
const cache = new NodeCache({ stdTTL: 60 });

// Helper to invalidate cache by prefix
const invalidateCache = (prefix) => {
  cache.keys().forEach((key) => {
    if (key.startsWith(prefix)) cache.del(key);
  });
};

/**
 * GET all Pokémon with pagination and caching
 */
export const getAllPokemon = async (page = 1, limit = 20) => {
  const cacheKey = `allPokemon_page${page}_limit${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;
  const total = await Pokemon.countDocuments();
  const pokemons = await Pokemon.find().skip(skip).limit(limit).lean();

  const result = { pokemons, total };
  cache.set(cacheKey, result);
  return result;
};

/**
 * Create new Pokémon and invalidate cache
 */
export const createPokemon = async ({ number, name, type, imageUrl }) => {
  const pokemon = new Pokemon({
    number,
    name: name.trim(),
    type: type.map((t) => t.trim()),
    imageUrl: imageUrl?.trim() || '',
  });

  await pokemon.save();
  invalidateCache('allPokemon_');

  return pokemon;
};

/**
 * Roll / get a random Pokémon and log history
 */
export const rollRandomPokemon = async () => {
  const count = await Pokemon.countDocuments();
  if (count === 0) throw new Error('No Pokémon available to roll');

  let randomPokemon;
  const lastRoll = await RollHistory.findOne().sort({ rolledAt: -1 });

  if (count === 1) {
    randomPokemon = await Pokemon.findOne().lean();
  } else {
    do {
      const randomIndex = Math.floor(Math.random() * count);
      randomPokemon = await Pokemon.findOne().skip(randomIndex).lean();
    } while (lastRoll && randomPokemon._id.equals(lastRoll.pokemonId));
  }

  await RollHistory.create({
    pokemonId: randomPokemon._id,
    name: randomPokemon.name,
  });

  invalidateCache('rollHistory_');

  return randomPokemon;
};

/**
 * Fetch roll history with pagination and caching
 */
export const getRollHistory = async (page = 1, limit = 20) => {
  const cacheKey = `rollHistory_page${page}_limit${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;
  const total = await RollHistory.countDocuments();
  const history = await RollHistory.find()
    .sort({ rolledAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('pokemonId', 'number type imageUrl')
    .lean();

  const result = { history, total };
  cache.set(cacheKey, result);
  return result;
};

/**
 * Get Pokémon by array of IDs (parallel fetch)
 */
export const getPokemonByIds = async (ids) => {
  const promises = ids.map((id) => Pokemon.findById(id).lean());
  return Promise.all(promises);
};

// Export cache if needed elsewhere
export { cache };
