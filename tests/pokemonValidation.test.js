import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';
import RollHistory from '../models/pokemonRollHistoryModel.js';

jest.setTimeout(20000); // 20 seconds for all tests

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { dbName: 'pokemon_test' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Pokemon.deleteMany({});
  await RollHistory.deleteMany({});
  await Pokemon.syncIndexes();
  await RollHistory.syncIndexes();
});

describe('Pokémon API Integration', () => {
  test('GET /api/v1/pokemon initially returns empty array', async () => {
    const res = await request(app).get('/api/v1/pokemon');
    expect(res.statusCode).toBe(200);
    expect(res.body.pokemons).toHaveLength(0);
  });

  test('POST /api/v1/pokemon creates a Pokémon', async () => {
    const payload = {
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png', // valid image URL
    };

    const res = await request(app).post('/api/v1/pokemon').send(payload);

    if (res.statusCode !== 201) {
      console.log('POST /api/v1/pokemon failed:', res.statusCode, res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bulbasaur');

    const getRes = await request(app).get('/api/v1/pokemon');
    expect(getRes.body.pokemons).toHaveLength(1);
  });

  test('POST /api/v1/pokemon/roll rolls a random Pokémon', async () => {
    await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
    });
    const res = await request(app).post('/api/v1/pokemon/roll');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bulbasaur');
  });

  test('GET /api/v1/pokemon/roll/history returns roll history', async () => {
    const bulba = await Pokemon.create({
      number: 1,
      name: 'Bulbasaur',
      type: ['Grass'],
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
    });
    await RollHistory.create({ pokemonId: bulba._id, name: bulba.name });

    const res = await request(app).get('/api/v1/pokemon/roll/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].name).toBe('Bulbasaur');
  });
});
