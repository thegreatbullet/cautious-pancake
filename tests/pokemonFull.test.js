import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';

jest.setTimeout(30000); // 30 seconds for slow tests

let mongoServer;
let adminToken;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'pokemon_test' });

  const secret = process.env.JWT_SECRET || 'testsecret';

  // Generate tokens with consistent payload
  adminToken = jwt.sign({ role: 'admin', id: 'adminId' }, secret, { expiresIn: '1h' });
  userToken = jwt.sign({ role: 'user', id: 'userId' }, secret, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
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
        number: 1, // duplicate
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
});
