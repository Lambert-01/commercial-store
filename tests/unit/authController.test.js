const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../src/models/User');

describe('Authentication Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
  });

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(302); // Redirect to login

      expect(response.headers.location).toBe('/login');

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('customer');
    });

    it('should not register user with existing email', async () => {
      // Create existing user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashedpassword',
        role: 'customer'
      });

      const userData = {
        name: 'New User',
        email: 'existing@example.com', // Same email
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.text).toContain('Registration failed');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        name: 'Test User',
        // Missing email and password
      };

      const response = await request(app)
        .post('/register')
        .send(incompleteData)
        .expect(400);

      expect(response.text).toContain('Registration failed');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(302);

      expect(response.headers.location).toBe('/');
    });

    it('should not login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.text).toContain('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.text).toContain('Invalid credentials');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit multiple failed login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple requests quickly
      const promises = Array(6).fill().map(() =>
        request(app)
          .post('/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);

      // At least one response should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});