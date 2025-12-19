const express = require('express')
const router = express.Router()
const {
  getPokemon,
  addPokemon,
  rollPokemon,
  getRollHistory,
} = require('../controllers/controller')

// Replace old custom middleware with Joi-based validation
const validateBody = require('../validation/validateBody')
const pokemonSchema = require('../validation/pokemonSchema')

// GET all Pokémon
router.get('/', getPokemon)

// POST new Pokémon (with Joi validation)
router.post('/', validateBody(pokemonSchema), addPokemon)

// POST a roll → strictly RESTful
router.post('/roll', rollPokemon)

// GET roll history
router.get('/roll/history', getRollHistory)

module.exports = router
