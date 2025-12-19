const express = require('express')
const router = express.Router()
const {
  getPokemon,
  addPokemon,
  rollPokemon,
  rollHistory,
} = require('../controllers/controller')
const validatePokemonData = require('../middleware/validatePokemonData')

// GET all Pokémon
router.get('/', getPokemon)

// POST new Pokémon (with validation)
router.post('/', validatePokemonData, addPokemon)

// POST a roll (instead of GET) → strictly RESTful
router.post('/roll', rollPokemon)

// GET roll history
router.get('/roll/history', rollHistory)

module.exports = router
