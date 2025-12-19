const {
  getAllPokemon,
  createPokemon,
  rollRandomPokemon,
  getRollHistory,
} = require('../services/pokemonService')

// GET /api/pokemon
const getPokemon = async (req, res, next) => {
  try {
    const pokemons = await getAllPokemon()
    res.status(200).json(pokemons)
  } catch (error) {
    next(error)
  }
}

// POST /api/pokemon
const addPokemon = async (req, res, next) => {
  try {
    const { number, name, type, imageUrl } = req.body
    const pokemon = await createPokemon({ number, name, type, imageUrl })
    res.status(201).json(pokemon)
  } catch (error) {
    next(error)
  }
}

// GET /api/pokemon/roll
const rollPokemon = async (req, res, next) => {
  try {
    const pokemon = await rollRandomPokemon()
    res.status(200).json(pokemon)
  } catch (error) {
    next(error)
  }
}

// GET roll history
const rollHistory = async (req, res, next) => {
  try {
    const history = await getRollHistory(50) // latest 50 rolls
    res.status(200).json(history)
  } catch (error) {
    next(error)
  }
}

module.exports = { getPokemon, addPokemon, rollPokemon }
