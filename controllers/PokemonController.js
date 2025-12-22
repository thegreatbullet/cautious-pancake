const {
  getAllPokemon: serviceGetAllPokemon,
  createPokemon,
  rollRandomPokemon: serviceRollRandomPokemon,
  getRollHistory: serviceGetRollHistory,
} = require('../services/pokemonService');

const { logMessage } = require('./logController');

// GET /api/v1/pokemon
const getPokemon = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const result = await serviceGetAllPokemon(page, limit);

    logMessage('info', 'Fetched all Pokémon', {
      page,
      limit,
      count: result.pokemons.length,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error); // errorMiddleware will log it
  }
};

// POST /api/v1/pokemon
const addPokemon = async (req, res, next) => {
  try {
    const { number, name, type, imageUrl } = req.body;
    const pokemon = await createPokemon({ number, name, type, imageUrl });

    logMessage('info', 'Added new Pokémon', { number, name, type });

    res.status(201).json(pokemon);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/pokemon/roll
const rollPokemon = async (req, res, next) => {
  try {
    const pokemon = await serviceRollRandomPokemon();

    logMessage('info', 'Rolled a Pokémon', {
      name: pokemon.name,
      number: pokemon.number,
    });

    res.status(200).json(pokemon);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/pokemon/roll/history
const getRollHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const result = await serviceGetRollHistory(page, limit);

    logMessage('info', 'Fetched Pokémon roll history', {
      page,
      limit,
      count: result.history.length,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPokemon, addPokemon, rollPokemon, getRollHistory };
