# Boooply SDK Tests

Automated tests for the Boooply AI Interviews SDK.

## Test Structure

```
test/
├── runner.js                 # Test runner that executes all tests
├── test-connection.js        # Connection/network tests
├── test-platform-auth.js     # Platform-level authentication tests
├── test-organization.js      # Organization-level operation tests
└── README.md                 # This file
```

## Running Tests

### Prerequisites

1. Copy `.env.example` to `.env` and fill in your credentials
2. Ensure Boooply backend is running (default: https://localhost:5001)

### Run All Tests (Organization Mode)

```bash
npm test
```

Or with explicit mode:

```bash
npm run test:organization
```

### Run Platform Tests

```bash
npm run test:platform
```

## Environment Variables

See `.env.example` for all available environment variables.

### Organization Mode Variables
- `BOOOPLY_API_KEY` - Organization API key (`boooply_tenant_test_*`)
- `BOOOPLY_BASE_URL` - Boooply API URL
- `BOOOPLY_ORG_ID` - Organization snowflake ID

### Platform Mode Variables
- `BOOOPLY_PLATFORM_KEY` - Platform API key (`boooply_platform_test_*`)
- `BOOOPLY_BASE_URL` - Boooply API URL

## Test Modes

### Organization Mode (Default)
Tests operations using an organization-specific API key:
- ✅ Can initialize SDK client
- ✅ Can create AI interview

### Platform Mode
Tests platform-level operations:
- ✅ Can create organization API key with platform key

## Adding New Tests

Create a new file `test-*.js` in the `test/` directory:

```javascript
module.exports = {
  name: 'Your Test Suite Name',
  mode: 'organization', // or 'platform' or null for both

  tests: [
    {
      name: 'Test description',
      fn: async () => {
        // Your test code
        // Throw error if test fails
      }
    }
  ]
};
```

The test runner will automatically discover and run your tests.

## Test Results

Tests return exit code:
- `0` = All tests passed
- `1` = One or more tests failed

Example output:
```
🧪 Running Boooply SDK Tests

Test Mode: ORGANIZATION

📋 Connection Tests

✅ Can connect to Boooply API

📋 Organization-Level Tests

✅ Can initialize SDK client
✅ Can create AI interview

==================================================
Test Summary
==================================================
Total:  3
Passed: 3 ✅
Failed: 0 ❌
==================================================
```
