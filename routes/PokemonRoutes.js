// backend/routes/pokemonRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  getPokemon,
  addPokemon,
  rollPokemon,
  getRollHistory,
} from '../controllers/pokemonController.js';

import { deletePokemon, deleteRollHistory } from '../controllers/adminController.js';
import validateBody from '../validation/validateBody.js';
import pokemonSchema from '../validation/pokemonSchema.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ----------------- Rate Limiting -----------------
// Limit Pokémon rolls: 20 requests per 30 minutes per IP
const rollLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20,
  message: 'Too many rolls, try again later.',
});

// ----------------- Public Routes -----------------
router.get('/', getPokemon); // GET all Pokémon
router.post('/', validateBody(pokemonSchema), addPokemon); // POST new Pokémon
router.post('/roll', rollLimiter, rollPokemon); // POST a roll with limiter
router.get('/roll/history', getRollHistory); // GET roll history

// ----------------- Admin-only Routes -----------------
router.delete('/:id', authMiddleware(['admin']), deletePokemon); // DELETE Pokémon
router.delete('/roll/history/:id', authMiddleware(['admin']), deleteRollHistory); // DELETE roll history entry

export default router;
