import { getTomorrowRange } from '../src/utils/taskReminderScheduler.js';

console.log('Testing getTomorrowRange() for different dates\n');
console.log('Today is: May 19, 2026 (in Asia/Kolkata timezone)\n');

// Simulate the current date by checking what getTomorrowRange returns
const result = getTomorrowRange();

console.log('getTomorrowRange() returns:');
console.log(`  Label: ${result.label}`);
console.log(`  Start UTC: ${result.start.toISOString()}`);
console.log(`  End UTC:   ${result.end.toISOString()}`);
console.log(`\n✓ System will check for ${result.label} workspaces`);

// Verify it's checking for May 20 (tomorrow from May 19)
const expectedLabel = '20 May 2026';
if (result.label === expectedLabel) {
  console.log(`✓ CORRECT: Checking for tomorrow (${expectedLabel})`);
} else {
  console.log(`✗ ERROR: Expected ${expectedLabel}, got ${result.label}`);
}
