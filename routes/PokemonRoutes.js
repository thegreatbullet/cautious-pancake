const express = require('express')
const { getPokemon, addPokemon } = require('../controllers/PokemonController')
const validatePokemonData = require('../middleware/validatePokemonData')

const router = express.Router()

router.get('/', getPokemon)

router.post('/', validatePokemonData, addPokemon)

module.exports = router
