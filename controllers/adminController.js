const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')

// Delete a Pokémon (admin only)
const deletePokemon = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Pokemon.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'Pokémon not found' })
    res.json({ message: 'Pokémon deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// Delete a roll history entry (admin only)
const deleteRollHistory = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await RollHistory.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'Roll not found' })
    res.json({ message: 'Roll history entry deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getPokemon,
  addPokemon,
  rollPokemon,
  getRollHistory,
  deletePokemon,
  deleteRollHistory,
}
