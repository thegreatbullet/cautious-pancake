const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const {
  getPokemon,
  addPokemon,
  rollPokemon,
  getRollHistory,
  deletePokemon, // admin-only
  deleteRollHistory, // admin-only
} = require('../controllers/controller')

// Validation
const validateBody = require('../validation/validateBody')
const pokemonSchema = require('../validation/pokemonSchema')

// Auth middleware
const authMiddleware = require('../middleware/authMiddleware')

// Roll limiter: 20 rolls per 30 minutes per IP
const rollLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20,
  message: 'Too many rolls, try again later.',
})

// ----------------- Public routes -----------------
router.get('/', getPokemon)
router.post('/', validateBody(pokemonSchema), addPokemon)
router.post('/roll', rollLimiter, rollPokemon) // apply limiter here
router.get('/roll/history', getRollHistory)

// ----------------- Admin-only routes -----------------
router.delete('/:id', authMiddleware(['admin']), deletePokemon)
router.delete('/roll/history/:id', authMiddleware(['admin']), deleteRollHistory)

module.exports = router
