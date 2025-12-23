import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';

jest.setTimeout(30000); // 30 seconds for slower tests

let mongoServer;
let adminToken;
let userToken;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'pokemon_test' });

  // Tokens
  adminToken = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'testsecret');
  userToken = jwt.sign({ role: 'user' }, process.env.JWT_SECRET || 'testsecret');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear DB before each test
  await Pokemon.deleteMany({});
  await RollHistory.deleteMany({});
  await Pokemon.syncIndexes();
  await RollHistory.syncIndexes();
});

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
    const res = await request(app).post('/api/v1/pokemon').send(payload);

    if (res.statusCode !== 201) {
      console.log('POST /api/v1/pokemon failed:', res.statusCode, res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bulbasaur');

    // Verify GET returns it
    const getRes = await request(app).get('/api/v1/pokemon');
    expect(getRes.body.pokemons).toHaveLength(1);
    expect(getRes.body.pokemons[0].imageUrl).toBe(payload.imageUrl);
  });

  test('POST /api/v1/pokemon fails with empty imageUrl', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({
        number: 2,
        name: 'Ivysaur',
        type: ['Grass'],
        imageUrl: '',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/"imageUrl" is not allowed to be empty/);
  });

  test('POST /api/v1/pokemon/roll returns a random Pokémon', async () => {
    await Pokemon.create({ number: 1, name: 'Bulbasaur', type: ['Grass'], imageUrl: 'url' });
    const res = await request(app).post('/api/v1/pokemon/roll');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bulbasaur');
  });

  test('GET /api/v1/pokemon/roll/history returns history', async () => {
    const bulba = await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'url',
    });
    await RollHistory.create({ pokemonId: bulba._id, name: bulba.name });
    const res = await request(app).get('/api/v1/pokemon/roll/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].name).toBe('Bulbasaur');
  });

  test('Admin DELETE /pokemon/:id succeeds', async () => {
    const poke = await Pokemon.create({
      number: 2,
      name: 'Ivysaur',
      type: ['Grass'],
      imageUrl: 'url',
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
      imageUrl: 'url',
    });
    const res = await request(app)
      .delete(`/api/v1/pokemon/${poke._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  test('Rate limit on /pokemon/roll works', async () => {
    // Seed DB so roll endpoint works
    await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'https://example.com/bulbasaur.png',
    });

    // First 19 requests should succeed
    for (let i = 0; i < 19; i++) {
      const res = await request(app).post('/api/v1/pokemon/roll');
      expect(res.statusCode).toBe(200);
    }

    // 20th request should be rate-limited
    const blocked = await request(app).post('/api/v1/pokemon/roll');
    expect(blocked.statusCode).toBe(429);
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
      .send({
        number: 1, // duplicate
        name: 'Charmander',
        type: ['Fire'],
        imageUrl: 'https://example.com/charmander.png', // ✅ valid URI
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/duplicate/i);
  });
});
