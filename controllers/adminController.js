import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';
import { logMessage } from './logController.js';

// Delete a Pokémon
export const deletePokemon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Pokemon.findByIdAndDelete(id);

    if (!deleted) {
      logMessage('warn', 'Attempted to delete non-existent Pokémon', { id });
      return res.status(404).json({ error: 'Pokémon not found' });
    }

    logMessage('info', 'Pokémon deleted', { id, name: deleted.name });
    res.json({ message: 'Pokémon deleted successfully' });
  } catch (err) {
    logMessage('error', 'Error deleting Pokémon', { error: err });
    next(err);
  }
};

// Delete a roll history entry
export const deleteRollHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await RollHistory.findByIdAndDelete(id);

    if (!deleted) {
      logMessage('warn', 'Attempted to delete non-existent roll history', {
        id,
      });
      return res.status(404).json({ error: 'Roll not found' });
    }

    logMessage('info', 'Roll history deleted', {
      id,
      pokemonId: deleted.pokemonId,
    });
    res.json({ message: 'Roll history entry deleted successfully' });
  } catch (err) {
    logMessage('error', 'Error deleting roll history', { error: err });
    next(err);
  }
};
