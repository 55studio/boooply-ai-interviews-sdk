#!/bin/bash
#
# SDK E2E Test Setup
#
# 1. Ensures the SDK test database is running and migrated
# 2. Seeds a test organization with API key
# 3. Starts a backend instance on port 5099 pointing to the test DB
# 4. Runs the SDK e2e tests
# 5. Stops the test backend
#
# Usage: ./test/setup-sdk-test.sh
#

set -e

BACKEND_DIR="../../boooply-meetings/backend"
SDK_TEST_DB_URL="postgresql://sdk_test:sdk_test@localhost:5435/boooply_sdk_test"
TEST_PORT=5099
TEST_API_KEY="bply_sdk_test_key_e2e_00000000000000000000"

echo "🧪 SDK E2E Test Setup"
echo ""

# ─── Step 1: Ensure test database is running ─────────────────
echo "1. Checking SDK test database..."
cd "$BACKEND_DIR"

docker compose up -d postgres-sdk-test 2>/dev/null
sleep 2

# ─── Step 2: Run migrations ──────────────────────────────────
echo "2. Running migrations..."
DATABASE_URL="$SDK_TEST_DB_URL" npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null

# ─── Step 3: Seed test organization ──────────────────────────
echo "3. Seeding test organization..."
DATABASE_URL="$SDK_TEST_DB_URL" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const p = new PrismaClient();

async function seed() {
  // Clean previous test data
  await p.organization.deleteMany({ where: { slug: 'sdk-test-org' } });

  // Create test org
  const apiKey = '${TEST_API_KEY}';
  const org = await p.organization.create({
    data: {
      name: 'SDK Test Org',
      slug: 'sdk-test-org',
      integrationType: 'NATIVE',
      apiKey,
      apiKeyHash: crypto.createHash('sha256').update(apiKey).digest('hex'),
      isActive: true,
    },
  });

  // Add credits
  await p.organizationFeature.create({
    data: {
      organizationId: org.id,
      featureType: 'AI_INTERVIEW',
      isEnabled: true,
      limit: 1000,
      usageCount: 0,
    },
  });

  console.log('   Created org:', org.name, '(', org.id, ')');
  console.log('   API Key:', apiKey);
  await p.\$disconnect();
}
seed();
" 2>/dev/null

# ─── Step 4: Start test backend ──────────────────────────────
echo "4. Starting test backend on port $TEST_PORT..."
DATABASE_URL="$SDK_TEST_DB_URL" \
  PORT=$TEST_PORT \
  NODE_ENV=test \
  OPENAI_API_KEY="${OPENAI_API_KEY:-sk-test}" \
  npx tsx src/server.ts &
TEST_PID=$!

# Wait for backend to start
sleep 3

# Check if it's running
if ! kill -0 $TEST_PID 2>/dev/null; then
  echo "❌ Backend failed to start"
  exit 1
fi
echo "   Backend PID: $TEST_PID"

# ─── Step 5: Run SDK tests ───────────────────────────────────
echo ""
echo "5. Running SDK e2e tests..."
echo ""
cd - > /dev/null

BOOOPLY_API_KEY="$TEST_API_KEY" \
  BOOOPLY_BASE_URL="http://localhost:$TEST_PORT" \
  node test/test-e2e.js
TEST_EXIT=$?

# ─── Step 6: Cleanup ─────────────────────────────────────────
echo ""
echo "6. Stopping test backend..."
kill $TEST_PID 2>/dev/null || true
wait $TEST_PID 2>/dev/null || true

# Clean test data from SDK test DB
echo "   Cleaning test data..."
cd "$BACKEND_DIR"
DATABASE_URL="$SDK_TEST_DB_URL" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.organization.deleteMany({ where: { slug: 'sdk-test-org' } })
  .then(r => { console.log('   Cleaned', r.count, 'test orgs'); return p.\$disconnect(); });
" 2>/dev/null

echo ""
if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ SDK E2E tests passed!"
else
  echo "❌ SDK E2E tests failed!"
fi

exit $TEST_EXIT
