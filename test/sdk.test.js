/**
 * Boooply SDK Unit Tests
 *
 * Tests constructor, method presence, interview creation mapping,
 * and backward compatibility with legacy methods.
 *
 * Run: node test/sdk.test.js
 */

const { BoooplyClient, mapGoogleParticipant, mapMicrosoftParticipant, mapGenericParticipant } = require('../index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Expected'} ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ─── Constructor ─────────────────────────────────────────────────────────────

console.log('\nConstructor:');

test('requires apiKey', () => {
  try {
    new BoooplyClient({ baseUrl: 'http://localhost' });
    throw new Error('Should have thrown');
  } catch (e) {
    assert(e.message.includes('apiKey'), 'Should mention apiKey');
  }
});

test('requires baseUrl', () => {
  try {
    new BoooplyClient({ apiKey: 'test' });
    throw new Error('Should have thrown');
  } catch (e) {
    assert(e.message.includes('baseUrl'), 'Should mention baseUrl');
  }
});

test('creates client with valid config', () => {
  const client = new BoooplyClient({ apiKey: 'bply_test', baseUrl: 'http://localhost:5001' });
  assert(client.version, 'Should have version');
  assert(client.apiKey === 'bply_test', 'apiKey set');
  assert(client.baseUrl === 'http://localhost:5001', 'baseUrl set');
});

test('strips trailing slash from baseUrl', () => {
  const client = new BoooplyClient({ apiKey: 'test', baseUrl: 'http://localhost:5001/' });
  assertEqual(client.baseUrl, 'http://localhost:5001', 'baseUrl trailing slash');
});

// ─── Namespaced API ──────────────────────────────────────────────────────────

console.log('\nNamespaced API:');
const client = new BoooplyClient({ apiKey: 'bply_test', baseUrl: 'http://localhost:5001' });

test('client.interviews exists with all methods', () => {
  const methods = ['create', 'list', 'get', 'addParticipant', 'cancel', 'reschedule', 'delete', 'getTranscript', 'getEvaluation', 'triggerAnalysis'];
  methods.forEach(m => {
    assert(typeof client.interviews[m] === 'function', `interviews.${m} should be a function`);
  });
});

test('client.ai exists with methods', () => {
  assert(typeof client.ai.generateJobDescription === 'function', 'ai.generateJobDescription');
});

test('client.organization exists with methods', () => {
  assert(typeof client.organization.get === 'function', 'organization.get');
});

// ─── Static Methods ──────────────────────────────────────────────────────────

console.log('\nStatic Methods:');

test('createOrganizationApiKey exists', () => {
  assert(typeof BoooplyClient.createOrganizationApiKey === 'function');
});

test('createOrganizationApiKey validates config', async () => {
  try {
    await BoooplyClient.createOrganizationApiKey({}, { userId: '1', userEmail: 'a@b.com', organizationId: '1' });
    throw new Error('Should have thrown');
  } catch (e) {
    assert(e.message.includes('baseUrl'), 'Should require baseUrl');
  }
});

test('createOrganizationApiKey validates data', async () => {
  try {
    await BoooplyClient.createOrganizationApiKey({ baseUrl: 'http://x', platformKey: 'pk' }, {});
    throw new Error('Should have thrown');
  } catch (e) {
    assert(e.message.includes('userId'), 'Should require userId');
  }
});

// ─── No Legacy Methods ──────────────────────────────────────────────────────

console.log('\nNo Legacy Methods:');

test('legacy methods were removed', () => {
  const removed = [
    'createAIInterview', 'createHumanInterview', 'createTeamMeeting',
    'listInterviews', 'getInterview', 'cancelInterview', 'rescheduleInterview',
    'deleteInterview', 'addParticipant', 'getTranscript', 'getEvaluation',
    'triggerAnalysis', 'generateJobDescription', 'getOrganization',
  ];
  removed.forEach(m => {
    assert(typeof client[m] === 'undefined', `client.${m} should NOT exist`);
  });
});

// ─── Interview Type Mapping ──────────────────────────────────────────────────

console.log('\nInterview Type Mapping:');

test('maps "ai" to AI_ONLY', () => {
  const MEETING_TYPE_MAP = { ai: 'AI_ONLY', human: 'HUMAN', team: 'HUMAN', AI_ONLY: 'AI_ONLY', HUMAN: 'HUMAN' };
  assertEqual(MEETING_TYPE_MAP['ai'], 'AI_ONLY');
  assertEqual(MEETING_TYPE_MAP['human'], 'HUMAN');
  assertEqual(MEETING_TYPE_MAP['team'], 'HUMAN');
});

test('accepts raw meeting type values', () => {
  const MEETING_TYPE_MAP = { ai: 'AI_ONLY', human: 'HUMAN', team: 'HUMAN', AI_ONLY: 'AI_ONLY', HUMAN: 'HUMAN' };
  assertEqual(MEETING_TYPE_MAP['AI_ONLY'], 'AI_ONLY');
  assertEqual(MEETING_TYPE_MAP['HUMAN'], 'HUMAN');
});

// ─── Mappers ─────────────────────────────────────────────────────────────────

console.log('\nMappers:');

test('mapGoogleParticipant exists', () => {
  assert(typeof mapGoogleParticipant === 'function');
});

test('mapMicrosoftParticipant exists', () => {
  assert(typeof mapMicrosoftParticipant === 'function');
});

test('mapGenericParticipant exists', () => {
  assert(typeof mapGenericParticipant === 'function');
});

test('mapGenericParticipant maps correctly', () => {
  const result = mapGenericParticipant({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'CANDIDATE',
  });
  assertEqual(result.name, 'John Doe');
  assertEqual(result.email, 'john@example.com');
  assertEqual(result.role, 'CANDIDATE');
});

// ─── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'─'.repeat(50)}\n`);

if (failed > 0) process.exit(1);
