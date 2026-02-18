/**
 * Test Runner for Boooply SDK
 * Runs all tests and reports results
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runTest(testName, testFn) {
    this.results.total++;

    try {
      await testFn();
      this.results.passed++;
      console.log(`✅ ${testName}`);
      return true;
    } catch (error) {
      this.results.failed++;
      console.log(`❌ ${testName}`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary');
    console.log('='.repeat(50));
    console.log(`Total:  ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ❌`);
    console.log('='.repeat(50));

    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
}

async function runAllTests() {
  const runner = new TestRunner();

  console.log('🧪 Running Boooply SDK Tests\n');

  // Determine test mode
  const testMode = process.env.TEST_MODE || 'organization';
  console.log(`Test Mode: ${testMode.toUpperCase()}\n`);

  // Load test files
  const testDir = __dirname;
  const testFiles = fs.readdirSync(testDir)
    .filter(file => file.startsWith('test-') && file.endsWith('.js'))
    .sort();

  if (testFiles.length === 0) {
    console.log('⚠️  No test files found');
    return;
  }

  // Run tests
  for (const file of testFiles) {
    const testModule = require(path.join(testDir, file));

    // Check if test should run in current mode
    if (testModule.mode && testModule.mode !== testMode) {
      console.log(`⏭️  Skipping ${file} (requires ${testModule.mode} mode)\n`);
      continue;
    }

    console.log(`\n📋 ${testModule.name || file}\n`);

    if (testModule.tests && Array.isArray(testModule.tests)) {
      for (const test of testModule.tests) {
        await runner.runTest(test.name, test.fn);
      }
    }
  }

  runner.printSummary();
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, TestRunner };
