const validatePokemonData = (req, res, next) => {
  let { name, type } = req.body

  // Check if 'name' and 'type' are provided
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and Type are required fields.' })
  }

  // Check if 'name' is a non-empty string
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a valid string.' })
  }

  // Trim name
  req.body.name = name.trim()

  // Check if 'type' is either a non-empty string or a non-empty array of strings
  if (typeof type === 'string') {
    if (type.trim() === '') {
      return res.status(400).json({ error: 'Type must be a valid string.' })
    }
    // Convert single string to array
    req.body.type = [type.trim()]
  } else if (Array.isArray(type)) {
    if (
      type.length === 0 ||
      !type.every((t) => typeof t === 'string' && t.trim() !== '')
    ) {
      return res
        .status(400)
        .json({ error: 'Type must be a non-empty array of strings.' })
    }
    // Trim each string in the array
    req.body.type = type.map((t) => t.trim())
  } else {
    return res
      .status(400)
      .json({ error: 'Type must be a string or an array of strings.' })
  }

  // If validation passes, proceed
  next()
}

module.exports = validatePokemonData
