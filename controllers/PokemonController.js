const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')
const cache = require('../services/pokemonService').cache // if you export cache from service

const {
  getAllPokemon: serviceGetAllPokemon,
  createPokemon,
  rollRandomPokemon: serviceRollRandomPokemon,
  getRollHistory: serviceGetRollHistory,
} = require('../services/pokemonService')

// GET /api/v1/pokemon
const getPokemon = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const result = await serviceGetAllPokemon(page, limit)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

// POST /api/v1/pokemon
const addPokemon = async (req, res, next) => {
  try {
    const { number, name, type, imageUrl } = req.body
    const pokemon = await createPokemon({ number, name, type, imageUrl })
    res.status(201).json(pokemon)
  } catch (error) {
    next(error)
  }
}

// POST /api/v1/pokemon/roll
const rollPokemon = async (req, res, next) => {
  try {
    const pokemon = await serviceRollRandomPokemon()
    res.status(200).json(pokemon)
  } catch (error) {
    next(error)
  }
}

// GET /api/v1/pokemon/roll/history
const getRollHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const result = await serviceGetRollHistory(page, limit)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { getPokemon, addPokemon, rollPokemon, getRollHistory }
