import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';

// -----------------------------
// MOCK LOGGER TO SPEED UP TESTS
// -----------------------------
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// -----------------------------
// FORCE TEST SECRET
// -----------------------------
process.env.JWT_SECRET = 'testsecret';

// -----------------------------
// JEST TIMEOUT
// -----------------------------
jest.setTimeout(20000); // 20s for MongoMemoryServer operations

let mongoServer;
let adminToken;
let userToken;

// -----------------------------
// GLOBAL SETUP
// -----------------------------
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'pokemon_test' });

  // Generate consistent tokens with _id field (common in auth middleware)
  adminToken = jwt.sign({ role: 'admin', _id: 'adminId' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  userToken = jwt.sign({ role: 'user', _id: 'userId' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
});

// -----------------------------
// GLOBAL TEARDOWN
// -----------------------------
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// -----------------------------
// CLEAN DB BEFORE EACH TEST
// -----------------------------
beforeEach(async () => {
  // Parallel deletion of all collections
  await Promise.all(
    Object.values(mongoose.connection.collections).map((col) => col.deleteMany({})),
  );
});

// -----------------------------
// TEST SUITE
// -----------------------------
describe('Pokémon API Full Test Suite', () => {
  test('GET /api/v1/pokemon returns empty initially', async () => {
    const res = await request(app).get('/api/v1/pokemon');
    expect(res.statusCode).toBe(200);
    expect(res.body.pokemons).toHaveLength(0);
  });

  test('POST /api/v1/pokemon creates Pokémon with imageUrl', async () => {
    const payload = {
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      imageUrl: 'https://example.com/bulbasaur.png',
    };
    const res = await request(app)
      .post('/api/v1/pokemon')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bulbasaur');
  });

  test('Duplicate Pokémon number fails', async () => {
    await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'https://example.com/bulbasaur.png',
    });

    const res = await request(app)
      .post('/api/v1/pokemon')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        number: 1,
        name: 'Charmander',
        type: ['Fire'],
        imageUrl: 'https://example.com/charmander.png',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/duplicate/i);
  });

  test('Admin DELETE /pokemon/:id succeeds', async () => {
    const poke = await Pokemon.create({
      number: 2,
      name: 'Ivysaur',
      type: ['Grass'],
      imageUrl: 'https://example.com/ivysaur.png',
    });

    const res = await request(app)
      .delete(`/api/v1/pokemon/${poke._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('Non-admin cannot delete Pokémon', async () => {
    const poke = await Pokemon.create({
      number: 3,
      name: 'Venusaur',
      type: ['Grass'],
      imageUrl: 'https://example.com/venusaur.png',
    });

    const res = await request(app)
      .delete(`/api/v1/pokemon/${poke._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  test('Rate limit on /pokemon/roll works', async () => {
    // Seed DB
    await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'https://example.com/bulbasaur.png',
    });

    // Sequential requests to trigger rate limit
    for (let i = 0; i < 19; i++) {
      await request(app).post('/api/v1/pokemon/roll');
    }

    const blocked = await request(app).post('/api/v1/pokemon/roll');
    expect(blocked.statusCode).toBe(429);
  });
});
