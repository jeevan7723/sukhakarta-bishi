const assert = require('assert');

// Mock localStorage & window
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.document = {
  getElementById: () => null
};
global.window = global;

// Mock Firebase Sync Manager
global.window.firebaseSyncManager = {
  saveCurrentStateToCloud: () => {},
  isInitialized: true
};

// Mock Auth Manager
global.window.authManager = {
  isAdmin: () => true,
  getCurrentUser: () => ({ name: 'Admin', role: 'admin' })
};

require('./js/store.js');

const store = global.window.bishiStore;

console.log('Testing Deletion & JSON Export Synchronization...');

// 1. Add 2 members
const m1 = store.addMember({ name: 'Member One', weeklyAmount: 1000, phone: '9999999991' });
const m2 = store.addMember({ name: 'Member Two', weeklyAmount: 2000, phone: '9999999992' });

store.recordPayment(m1.id, 1, 1000);
store.recordPayment(m2.id, 1, 2000);

let exported = JSON.parse(store.exportJSON());
assert.strictEqual(exported.members.length, 2, 'Should export 2 members');
assert.strictEqual(exported.transactions.length, 2, 'Should export 2 transactions');
console.log('✅ PASS: Export has 2 members & 2 transactions initially');

// 2. Delete Member One permanently
store.deleteMemberPermanently(m1.id);
exported = JSON.parse(store.exportJSON());

assert.strictEqual(exported.members.length, 1, 'Should now have only 1 member');
assert.strictEqual(exported.members[0].id, m2.id, 'Remaining member must be Member Two');
assert.strictEqual(exported.transactions.length, 1, 'Should have only 1 transaction');
assert.strictEqual(exported.transactions[0].memberId, m2.id, 'Transaction must belong to Member Two');
assert.ok(!JSON.stringify(exported).includes('Member One'), 'Deleted member must not appear anywhere in exported JSON');
console.log('✅ PASS: When member is deleted, JSON export strictly removes them and their transactions');

// 3. Wipe / Clear all data
store.clearAllData();
exported = JSON.parse(store.exportJSON());

assert.strictEqual(exported.members.length, 0, 'Exported members must be empty array');
assert.strictEqual(exported.transactions.length, 0, 'Exported transactions must be empty array');
assert.strictEqual(exported.loans.length, 0, 'Exported loans must be empty array');
console.log('✅ PASS: When all data is cleared, JSON export is completely empty of members and transactions');

console.log('🎉 ALL DELETION & JSON SYNCHRONIZATION TESTS PASSED 100%!');
