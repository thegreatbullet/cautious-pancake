import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Pokemon from '../models/pokemonModel.js';

jest.setTimeout(20000); // 20s timeout for all tests

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
});

describe('Pokemon API', () => {
  test('GET /api/v1/pokemon returns empty list', async () => {
    const res = await request(app).get('/api/v1/pokemon');
    expect(res.statusCode).toBe(200);
    expect(res.body.pokemons).toHaveLength(0);
  });

  test('POST /api/v1/pokemon creates pokemon', async () => {
    const res = await request(app)
      .post('/api/v1/pokemon')
      .send({
        name: 'Bulbasaur',
        number: 1,
        type: ['Grass', 'Poison'],
        imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
      });

    console.log('POST /api/v1/pokemon response:', res.statusCode, res.body);

    expect(res.statusCode).toBe(201); // should now succeed
    expect(res.body.name).toBe('Bulbasaur');

    // Verify GET now returns the Pokémon
    const getRes = await request(app).get('/api/v1/pokemon');
    expect(getRes.body.pokemons).toHaveLength(1);
  });
});
