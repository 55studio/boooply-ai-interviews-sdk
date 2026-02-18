/**
 * Platform Authentication Tests
 * Tests creating organization API keys using platform key
 */

const { BoooplyClient } = require('../index');

module.exports = {
  name: 'Platform Authentication Tests',
  mode: 'platform', // Only runs in platform mode

  tests: [
    {
      name: 'Can create organization API key with platform key',
      fn: async () => {
        const platformKey = process.env.BOOOPLY_PLATFORM_KEY;
        const baseUrl = process.env.BOOOPLY_BASE_URL || 'https://localhost:5001';

        if (!platformKey) {
          throw new Error('BOOOPLY_PLATFORM_KEY not set');
        }

        const result = await BoooplyClient.createOrganizationApiKey(
          { baseUrl, platformKey },
          {
            userId: 'test-user-' + Date.now(),
            userEmail: 'test@example.com',
            userName: 'Test User',
            organizationId: 'test-org-' + Date.now(),
            organizationName: 'Test Organization'
          }
        );

        if (!result.success) {
          throw new Error('Failed to create API key');
        }

        if (!result.apiKey || !result.apiKey.startsWith('boooply_tenant_')) {
          throw new Error('Invalid API key format - expected boooply_tenant_*');
        }
      }
    }
  ]
};
