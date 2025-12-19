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

// ----------------- Rate Limiting -----------------
// Limit Pokémon rolls: 20 requests per 30 minutes per IP
const rollLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20,
  message: 'Too many rolls, try again later.',
})

// ----------------- Public Routes -----------------
router.get('/', getPokemon) // GET all Pokémon
router.post('/', validateBody(pokemonSchema), addPokemon) // POST new Pokémon
router.post('/roll', rollLimiter, rollPokemon) // POST a roll with limiter
router.get('/roll/history', getRollHistory) // GET roll history

// ----------------- Admin-only Routes -----------------
router.delete('/:id', authMiddleware(['admin']), deletePokemon) // DELETE Pokémon
router.delete('/roll/history/:id', authMiddleware(['admin']), deleteRollHistory) // DELETE roll history entry

module.exports = router
