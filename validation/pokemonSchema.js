const Joi = require('joi')

const pokemonSchema = Joi.object({
  number: Joi.number().integer().min(1).required(),
  name: Joi.string().trim().min(1).required(),
  type: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  imageUrl: Joi.string().uri().optional(),
})

module.exports = pokemonSchema
