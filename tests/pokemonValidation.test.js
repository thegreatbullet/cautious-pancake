const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Pokemon = require('../models/pokemonModel')
const RollHistory = require('../models/pokemonRollHistoryModel')

const adminToken = jwt.sign(
  { role: 'admin' },
  process.env.JWT_SECRET || 'testsecret'
)

// Helper function to create a Pokémon
const createTestPokemon = async () => {
  const pokemon = new Pokemon({
    number: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
  })
  return await pokemon.save()
}

describe('Pokémon API Integration & Validation Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pokemon_test'
    )
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  afterEach(async () => {
    await Pokemon.deleteMany()
    await RollHistory.deleteMany()
  })

  /*----------------- Public routes -----------------*/
  test('GET /pokemon returns empty array initially', async () => {
    const res = await request(app).get('/api/v1/pokemon')
    expect(res.statusCode).toBe(200)
    expect(res.body.pokemons).toHaveLength(0)
  })

  test('POST /pokemon adds a Pokémon', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({ number: 1, name: 'Bulbasaur', type: ['Grass'] })

    expect(res.statusCode).toBe(201)
    expect(res.body.name).toBe('Bulbasaur')
    expect(res.body.type).toContain('Grass')
  })

  test('POST /pokemon rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({ number: 1, type: ['Grass'] })
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/name/i)
  })

  test('POST /pokemon rejects empty type', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({ number: 1, name: 'Bulbasaur', type: [] })
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/type/i)
  })

  test('POST /pokemon/roll returns a random Pokémon', async () => {
    await createTestPokemon()
    const res = await request(app).post('/api/v1/pokemon/roll')
    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Bulbasaur')
  })

  test('GET /pokemon/roll/history returns roll history', async () => {
    await createTestPokemon()
    await request(app).post('/api/v1/pokemon/roll')
    const res = await request(app).get('/api/v1/pokemon/roll/history')
    expect(res.statusCode).toBe(200)
    expect(res.body.history).toHaveLength(1)
  })

  /*----------------- Admin-only routes -----------------*/
  test('DELETE /pokemon/:id deletes Pokémon', async () => {
    const pokemon = await createTestPokemon()
    const res = await request(app)
      .delete(`/api/v1/pokemon/${pokemon._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  test('DELETE /pokemon/:id returns 404 for non-existent Pokémon', async () => {
    const res = await request(app)
      .delete('/api/v1/pokemon/64f000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })

  test('DELETE /pokemon/roll/history/:id deletes roll entry', async () => {
    const pokemon = await createTestPokemon()
    const rollRes = await request(app).post('/api/v1/pokemon/roll')
    const rollId = rollRes.body._id || rollRes.body.id // depending on your response

    const res = await request(app)
      .delete(`/api/v1/pokemon/roll/history/${rollId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  test('DELETE /pokemon/roll/history/:id returns 404 for non-existent roll', async () => {
    const res = await request(app)
      .delete('/api/v1/pokemon/roll/history/64f000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })
})
