import {
  getAllPokemon as serviceGetAllPokemon,
  createPokemon,
  rollRandomPokemon as serviceRollRandomPokemon,
  getRollHistory as serviceGetRollHistory,
} from '../services/pokemonService.js';

import { logMessage } from './logController.js';

// GET /api/v1/pokemon
export const getPokemon = async (req, res, next) => {
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
export const addPokemon = async (req, res, next) => {
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
export const rollPokemon = async (req, res, next) => {
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
export const getRollHistory = async (req, res, next) => {
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
