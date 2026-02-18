/**
 * Organization-Level Tests
 * Tests meeting operations using organization API key
 */

const { BoooplyClient } = require('../index');

module.exports = {
  name: 'Organization-Level Tests',
  mode: 'organization', // Only runs in organization mode

  tests: [
    {
      name: 'Can initialize SDK client',
      fn: async () => {
        const apiKey = process.env.BOOOPLY_API_KEY;
        const baseUrl = process.env.BOOOPLY_BASE_URL || 'https://localhost:5001';
        const organizationId = process.env.BOOOPLY_ORG_ID; // Optional - backend auto-extracts or creates default

        if (!apiKey) {
          throw new Error('BOOOPLY_API_KEY required');
        }

        const client = new BoooplyClient({ apiKey, baseUrl, organizationId });

        if (!client) {
          throw new Error('Failed to initialize SDK client');
        }
      }
    },

    {
      name: 'Can create AI interview',
      fn: async () => {
        const apiKey = process.env.BOOOPLY_API_KEY;
        const baseUrl = process.env.BOOOPLY_BASE_URL || 'https://localhost:5001';
        const organizationId = process.env.BOOOPLY_ORG_ID;

        const client = new BoooplyClient({ apiKey, baseUrl, organizationId });

        const result = await client.createAIInterview({
          title: 'SDK Test Interview',
          candidateData: {
            name: 'Test Candidate',
            email: 'test@example.com',
            userId: 'test-user-123'
          },
          jobData: {
            title: 'Software Engineer',
            description: 'Test job description'
          }
        });

        if (!result.success) {
          throw new Error('Failed to create AI interview');
        }

        if (!result.meeting || !result.meeting.code) {
          throw new Error('Invalid meeting response');
        }
      }
    }
  ]
};
