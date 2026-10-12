const assert = require('assert');

// Mock localStorage and sessionStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};
global.window = global;

require('./js/auth.js');
require('./js/store.js');

console.log('Testing Store delta tracking...');
window.authManager.loginUnified('admin', 'jeevan@1234', true);
const store = window.bishiStore;
store.clearAllData();

const deltaInit = store.getDelta();
console.log('Initial delta after clear:', deltaInit);
assert(deltaInit.fullSyncNeeded === true, 'fullSyncNeeded is true after clearAllData');
store.clearDelta();

// 1. Add member
const m = store.addMember({ name: 'Test Member', phone: '9876543210', weeklyAmount: 1000 });
const delta1 = store.getDelta();
console.log('Delta after addMember:', delta1);
assert(delta1.memberIds.includes(m.id), 'Member marked dirty');
store.clearDelta();

// 2. Record payment
store.recordPayment(m.id, 1, 1000);
const delta2 = store.getDelta();
console.log('Delta after recordPayment:', delta2);
assert(delta2.memberIds.includes(m.id), 'Member marked dirty on payment');
assert(delta2.txnIds.length > 0, 'Txn marked dirty on payment');
store.clearDelta();

// 3. Settings update
store.updateSettings({ defaultFineAmount: 50 });
const delta3 = store.getDelta();
console.log('Delta after updateSettings:', delta3);
assert(delta3.settings === true, 'Settings marked dirty');
store.clearDelta();

console.log('🎉 ALL DELTA TRACKING TESTS PASSED PERFECTLY!');
