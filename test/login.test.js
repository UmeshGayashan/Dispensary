const request = require('supertest');
const express = require('express');
const router = express.Router; 

// Create a new Express app and use the router
const app = express();
app.use(express.json());
app.use(router);

// Define base URL
const baseURL = "http://localhost:4000/public";

// Check whether the authentication is working properly
describe('POST /login', () => {
  test('Login as Patient and Return status 200', async () => {
    const response = await request(baseURL)
      .post('/login')
      .send({ username: 'UmesG', password: '123456' });
    
    expect(response.status).toBe(200);
  });
});


