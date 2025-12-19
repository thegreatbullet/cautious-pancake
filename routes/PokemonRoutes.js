const express = require('express')
const router = express.Router()
const {
  getPokemon,
  addPokemon,
  rollPokemon,
  getRollHistory,
  deletePokemon, // new admin-only route
  deleteRollHistory, // new admin-only route
} = require('../controllers/controller')

// Validation
const validateBody = require('../validation/validateBody')
const pokemonSchema = require('../validation/pokemonSchema')

// Auth middleware
const authMiddleware = require('../middleware/authMiddleware')

// Public routes
router.get('/', getPokemon)
router.post('/', validateBody(pokemonSchema), addPokemon)
router.post('/roll', rollPokemon)
router.get('/roll/history', getRollHistory)

// Admin-only routes
router.delete('/:id', authMiddleware(['admin']), deletePokemon)
router.delete('/roll/history/:id', authMiddleware(['admin']), deleteRollHistory)

module.exports = router
