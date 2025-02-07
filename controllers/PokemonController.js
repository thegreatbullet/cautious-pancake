const Pokemon = require('../models/PokemonModel')

const getPokemon = async (req, res, next) => {
  try {
    const pokemons = await Pokemon.find()
    res.json(pokemons)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pokémon' })
    next(error)
  }
}

const addPokemon = async (req, res, next) => {
  try {
    const { number, name, type, imageUrl } = req.body
    const pokemon = new Pokemon({ number, name, type, imageUrl })
    await pokemon.save()
  } catch (error) {
    next(error)
  }
}

module.exports = { getPokemon, addPokemon }
