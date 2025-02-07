// middleware/validatePokemonData.js

const validatePokemonData = (req, res, next) => {
  const { name, type } = req.body

  // Check if 'name' and 'type' are provided
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and Type are required fields.' })
  }

  // Check if 'name' is a non-empty string
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a valid string.' })
  }

  // Check if 'type' is a non-empty string
  if (typeof type !== 'string' || type.trim() === '') {
    return res.status(400).json({ error: 'Type must be a valid string.' })
  }

  // If validation passes, proceed to the next middleware or route handler
  next()
}

module.exports = validatePokemonData
