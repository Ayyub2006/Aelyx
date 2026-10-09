import request from 'supertest';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

let mongoServer;

jest.setTimeout(60000); // 60 seconds

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register-admin', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register-admin').send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'admin@test.com');
    });

    it('should not allow duplicate emails', async () => {
      await request(app).post('/api/auth/register-admin').send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });

      const res = await request(app).post('/api/auth/register-admin').send({
        name: 'Another Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register-admin').send({
        name: 'Login User',
        email: 'login@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
