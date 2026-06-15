// Test script to verify date conversion functions
// Run with: node test-date-functions.js

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateStringToTimestamp(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

console.log('=== Date Function Tests ===\n');

// Test 1: June 10, 2026 at midnight local time
console.log('Test 1: June 10, 2026');
const date1 = new Date(2026, 5, 10); // Month is 0-indexed, so 5 = June
console.log('  Input Date object:', date1.toString());
console.log('  formatDateOnly():', formatDateOnly(date1));
console.log('  Expected: 2026-06-10');
console.log('  Match:', formatDateOnly(date1) === '2026-06-10' ? '✅' : '❌');
console.log('');

// Test 2: Parse back from string
console.log('Test 2: Parse "2026-06-10" back to timestamp');
const timestamp = parseDateStringToTimestamp('2026-06-10');
const dateFromTimestamp = new Date(timestamp);
console.log('  Timestamp:', timestamp);
console.log('  Date from timestamp:', dateFromTimestamp.toString());
console.log('  Year:', dateFromTimestamp.getFullYear());
console.log('  Month:', dateFromTimestamp.getMonth() + 1, '(should be 6)');
console.log('  Day:', dateFromTimestamp.getDate(), '(should be 10)');
console.log('  Match:', dateFromTimestamp.getDate() === 10 && dateFromTimestamp.getMonth() === 5 ? '✅' : '❌');
console.log('');

// Test 3: Round trip
console.log('Test 3: Round trip (Date → String → Timestamp → Date)');
const original = new Date(2026, 5, 10);
const asString = formatDateOnly(original);
const asTimestamp = parseDateStringToTimestamp(asString);
const backToDate = new Date(asTimestamp);
console.log('  Original:', original.toDateString());
console.log('  As string:', asString);
console.log('  Back to date:', backToDate.toDateString());
console.log('  Match:', backToDate.getDate() === 10 ? '✅' : '❌');
console.log('');

// Test 4: Using .toISOString() (the WRONG way)
console.log('Test 4: What happens with .toISOString() (BAD)');
const date4 = new Date(2026, 5, 10);
console.log('  Date object:', date4.toString());
console.log('  .toISOString():', date4.toISOString());
console.log('  Notice: ISO shows different date in UTC!');
console.log('  This is why we need formatDateOnly()');
console.log('');

// Test 5: Current timezone info
console.log('Test 5: System Info');
console.log('  Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
const now = new Date();
console.log('  Current time:', now.toString());
console.log('  UTC offset (minutes):', now.getTimezoneOffset());
console.log('  UTC offset (hours):', now.getTimezoneOffset() / -60);
console.log('');

console.log('=== All Tests Complete ===');
console.log('\nIf all tests show ✅, the functions work correctly!');
console.log('If you see ❌, there may be an issue with the date handling.');
