const http = require('http');

const baseURL = 'http://localhost:5000/api';

async function fetchJSON(path, options) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${baseURL}${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing Login with Seed Data (student1@campusos.edu)...');
    const loginRes = await fetchJSON('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student1@campusos.edu', password: 'password123' })
    });
    console.log('Login Response:', loginRes);
    
    if (!loginRes.token) {
      throw new Error('No token received');
    }
    const token = loginRes.token;

    console.log('\nTesting GET /menu...');
    const menuRes = await fetchJSON('/canteen/menu', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Menu Items Count: ${Array.isArray(menuRes) ? menuRes.length : 'N/A'}`);

    console.log('\nTesting GET /tickets...');
    const ticketsRes = await fetchJSON('/tickets', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Tickets Count: ${Array.isArray(ticketsRes) ? ticketsRes.length : 'N/A'}`);

    console.log('\nAll tests passed successfully!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTests();
