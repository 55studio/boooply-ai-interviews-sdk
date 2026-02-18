/**
 * Connection Tests
 * Tests basic connectivity to Boooply API
 */

const axios = require('axios');

module.exports = {
  name: 'Connection Tests',
  mode: null, // Runs in both modes

  tests: [
    {
      name: 'Can connect to Boooply API',
      fn: async () => {
        const baseUrl = process.env.BOOOPLY_BASE_URL || 'https://localhost:5001';

        // Try to connect to API root (should return 404 but connection works)
        try {
          await axios.get(baseUrl, {
            timeout: 5000,
            // SSL verification disabled for localhost testing
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false
            })
          });
        } catch (error) {
          // We expect 404, but connection should work
          if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new Error(`Cannot connect to ${baseUrl}: ${error.message}`);
          }
          // Any other error (like 404) means connection works
        }
      }
    }
  ]
};
