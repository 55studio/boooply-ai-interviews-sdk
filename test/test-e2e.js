/**
 * End-to-End Tests
 *
 * Tests the full SDK flow against a running Boooply backend.
 * Requires: BOOOPLY_API_KEY and BOOOPLY_BASE_URL env vars.
 *
 * Run: BOOOPLY_API_KEY=bply_xxx BOOOPLY_BASE_URL=https://localhost:5001 node test/test-e2e.js
 */

const { BoooplyClient } = require('../index');

const API_KEY = process.env.BOOOPLY_API_KEY;
const BASE_URL = process.env.BOOOPLY_BASE_URL || 'https://localhost:5001';

if (!API_KEY) {
  console.log('⚠️  Skipping e2e tests — BOOOPLY_API_KEY not set');
  console.log('   Run with: BOOOPLY_API_KEY=bply_xxx node test/test-e2e.js\n');
  process.exit(0);
}

const client = new BoooplyClient({ apiKey: API_KEY, baseUrl: BASE_URL });

let createdMeetingCode = null;
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    if (err.response?.data) console.log(`     Response:`, JSON.stringify(err.response.data).slice(0, 200));
    failed++;
  }
}

async function run() {
  console.log('\n🧪 Boooply SDK — E2E Tests');
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── Organization ────────────────────────────────────────

  console.log('Organization:');

  await test('get organization details', async () => {
    const result = await client.organization.get();
    if (!result.success) throw new Error('Expected success');
    if (!result.organization) throw new Error('Expected organization object');
  });

  // ─── Create Interview (new API) ──────────────────────────

  console.log('\nCreate Interview (namespaced):');

  await test('create AI interview via interviews.create()', async () => {
    const result = await client.interviews.create({
      type: 'ai',
      jobRole: 'SDK E2E Test Engineer',
      candidate: { name: 'E2E Test User', email: 'e2e-test@boooply.dev' },
      durationMinutes: 5,
      skills: ['Testing', 'Automation'],
      seniority: 'MID',
      department: 'Engineering',
      externalJobId: 'e2e-test-job-001',
    });

    if (!result.success) throw new Error('Expected success');
    if (!result.meeting?.code) throw new Error('Expected meeting code');
    createdMeetingCode = result.meeting.code;
  });

  // ─── Read Operations ─────────────────────────────────────

  console.log('\nRead Operations:');

  await test('list interviews', async () => {
    const result = await client.interviews.list({ limit: 5 });
    if (!result.success) throw new Error('Expected success');
    if (!Array.isArray(result.meetings)) throw new Error('Expected meetings array');
  });

  await test('list interviews with search filter', async () => {
    const result = await client.interviews.list({ search: 'E2E Test' });
    if (!result.success) throw new Error('Expected success');
  });

  await test('get interview by code', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code from create step');
    const result = await client.interviews.get(createdMeetingCode);
    if (!result.success) throw new Error('Expected success');
    if (!result.meeting) throw new Error('Expected meeting object');
    if (result.meeting.meetingCode !== createdMeetingCode && result.meeting.code !== createdMeetingCode) {
      throw new Error('Meeting code mismatch');
    }
  });

  await test('get transcript (may be empty)', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const result = await client.interviews.getTranscript(createdMeetingCode);
    if (!result.success) throw new Error('Expected success');
  });

  await test('get evaluation (may be empty)', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const result = await client.interviews.getEvaluation(createdMeetingCode);
    if (!result.success) throw new Error('Expected success');
  });

  // ─── Update Operations ───────────────────────────────────

  console.log('\nUpdate Operations:');

  await test('reschedule interview', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const result = await client.interviews.reschedule(createdMeetingCode, {
      scheduledAt: tomorrow,
      reason: 'E2E test reschedule',
    });
    if (!result.success) throw new Error('Expected success');
  });

  // ─── AI Features ─────────────────────────────────────────

  console.log('\nAI Features:');

  await test('generate job description', async () => {
    const result = await client.ai.generateJobDescription({
      jobRole: 'Senior Backend Engineer',
      department: 'Engineering',
      skills: ['Node.js', 'PostgreSQL'],
      seniority: 'SENIOR',
    });
    if (!result.success) throw new Error('Expected success');
    if (!result.description) throw new Error('Expected description');
  });

  // ─── Legacy Backward Compatibility ───────────────────────

  console.log('\nLegacy Backward Compat:');

  await test('legacy listInterviews() works', async () => {
    const result = await client.listInterviews({ limit: 2 });
    if (!result.success) throw new Error('Expected success');
  });

  await test('legacy getInterview() works', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const result = await client.getInterview(createdMeetingCode);
    if (!result.success) throw new Error('Expected success');
  });

  await test('legacy getOrganization() works', async () => {
    const result = await client.getOrganization();
    if (!result.success) throw new Error('Expected success');
  });

  // ─── Cleanup ─────────────────────────────────────────────

  console.log('\nCleanup:');

  await test('cancel interview', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const result = await client.interviews.cancel(createdMeetingCode, 'E2E test cleanup');
    if (!result.success) throw new Error('Expected success');
  });

  await test('delete interview', async () => {
    if (!createdMeetingCode) throw new Error('No meeting code');
    const result = await client.interviews.delete(createdMeetingCode);
    if (!result.success) throw new Error('Expected success');
  });

  // ─── Results ─────────────────────────────────────────────

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`E2E Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`${'─'.repeat(50)}\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
