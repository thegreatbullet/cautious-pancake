import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';

// Generate a test admin JWT
const adminToken = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

describe('Pokémon API Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pokemon_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Pokemon.deleteMany();
    await RollHistory.deleteMany();
  });

  test('GET /api/v1/pokemon initially returns empty array', async () => {
    const res = await request(app).get('/api/v1/pokemon');
    expect(res.statusCode).toBe(200);
    expect(res.body.pokemons).toHaveLength(0);
  });

  test('POST /api/v1/pokemon creates a Pokémon', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({ number: 1, name: 'Bulbasaur', type: ['Grass', 'Poison'] });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bulbasaur');
  });

  test('POST /api/v1/pokemon/roll rolls a random Pokémon', async () => {
    await Pokemon.create({ number: 1, name: 'Bulbasaur', type: ['Grass'] });
    const res = await request(app).post('/api/v1/pokemon/roll');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bulbasaur');
  });

  test('GET /api/v1/pokemon/roll/history returns roll history', async () => {
    const bulba = await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
    });
    await RollHistory.create({ pokemonId: bulba._id, name: bulba.name });

    const res = await request(app).get('/api/v1/pokemon/roll/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].name).toBe('Bulbasaur');
  });

  test('DELETE /api/v1/pokemon/:id deletes Pokémon (admin)', async () => {
    const poke = await Pokemon.create({
      number: 2,
      name: 'Ivysaur',
      type: ['Grass'],
    });
    const res = await request(app)
      .delete(`/api/v1/pokemon/${poke._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Pokémon deleted successfully');
  });

  test('DELETE /api/v1/pokemon/roll/history/:id deletes roll history (admin)', async () => {
    const poke = await Pokemon.create({
      number: 3,
      name: 'Venusaur',
      type: ['Grass'],
    });
    const roll = await RollHistory.create({
      pokemonId: poke._id,
      name: poke.name,
    });

    const res = await request(app)
      .delete(`/api/v1/pokemon/roll/history/${roll._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Roll history entry deleted successfully');
  });

  test('Non-admin cannot delete Pokémon', async () => {
    const poke = await Pokemon.create({
      number: 4,
      name: 'Charmander',
      type: ['Fire'],
    });
    const token = jwt.sign({ role: 'user' }, process.env.JWT_SECRET || 'testsecret');

    const res = await request(app)
      .delete(`/api/v1/pokemon/${poke._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });
});
