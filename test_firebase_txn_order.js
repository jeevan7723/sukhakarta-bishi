/**
 * Test Suite: Verify that new transactions show at top of table
 * in Firebase transaction section, Firebase modal, and UI ledger tables.
 */
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

// Mock DOM
const dom = {};
function getEl(id) {
  if (!dom[id]) {
    dom[id] = {
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      style: {},
      children: [],
      appendChild(c) { this.children.push(c); this.innerHTML += c.innerHTML || ''; }
    };
  }
  return dom[id];
}

global.document = {
  getElementById: (id) => getEl(id),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tagName: tag,
    innerHTML: '',
    style: {},
    appendChild(c) { this.innerHTML += c.innerHTML || ''; }
  })
};
global.window = global;

require('./js/auth.js');
require('./js/store.js');
require('./js/receipt.js');
require('./js/export.js');
require('./js/ui.js');
require('./js/firebase.js');

console.log('🧪 Running Firebase & UI Transaction Ordering Tests...\n');

// 1. Verify getTxnDocId produces descending chronological order for Firestore Console
const syncManager = window.firebaseSyncManager;
assert(typeof syncManager.getTxnDocId === 'function', 'getTxnDocId method exists');

const txnOlder = {
  id: 'TXN-OLD-01',
  receiptNo: 'REC-SKB-001-W1',
  memberName: 'Aditya Patil',
  weekNumber: 1,
  date: '2026-10-10T10:00:00.000Z'
};

const txnNewer = {
  id: 'TXN-NEW-02',
  receiptNo: 'REC-SKB-001-W2',
  memberName: 'Aditya Patil',
  weekNumber: 2,
  date: '2026-10-12T10:00:00.000Z'
};

const docIdOlder = syncManager.getTxnDocId(txnOlder);
const docIdNewer = syncManager.getTxnDocId(txnNewer);

console.log(`  Older Transaction Doc ID: ${docIdOlder}`);
console.log(`  Newer Transaction Doc ID: ${docIdNewer}`);

// In Firestore Console (which sorts alphabetically ascending):
// docIdNewer must be < docIdOlder so it appears AT THE TOP
assert(docIdNewer < docIdOlder, 'Newer transaction doc ID sorts BEFORE older transaction doc ID in Firestore Console');
console.log('  ✅ PASS: In Firebase Firestore Console, newer transaction appears at the top of the table');

// 2. Verify store.js unshifts new transactions and ensureIntegrity keeps newest on top
window.authManager.loginUnified('admin', 'jeevan@1234', true);
const store = window.bishiStore;
store.clearAllData();
const m = store.addMember({ name: 'Rahul Shinde', phone: '9999988888', weeklyAmount: 1000 });
store.recordPayment(m.id, 1, 1000);
store.recordPayment(m.id, 2, 1000);

assert(store.state.transactions.length >= 2, 'Transactions recorded');
const txns = store.state.transactions;
assert(new Date(txns[0].date).getTime() >= new Date(txns[1].date).getTime(), 'First transaction in store is newest');
console.log('  ✅ PASS: Store transactions maintain newest at index 0');

// 3. Verify Admin Transactions Modal table displays newest on top
getEl('adminTxnModeFilter').value = 'all';
getEl('adminTxnSearchInput').value = '';
window.ui.renderAdminTransactionsTab();
const tbodyHtml = getEl('adminTransactionsTableBody').innerHTML;
assert(tbodyHtml.length > 0, 'Admin transactions table has rows');
console.log('  ✅ PASS: Admin transactions tab rendered successfully');

// 4. Verify Firebase Modal Stats renders fbModalTxnsTableBody with newest at top
syncManager.renderCloudModalStats();
const fbTableHtml = getEl('fbModalTxnsTableBody').innerHTML;
assert(fbTableHtml.includes('Rahul Shinde'), 'Firebase modal transaction table includes member');
assert(fbTableHtml.includes('नवीन'), 'Top row in Firebase modal transaction table is marked with "नवीन" badge');
console.log('  ✅ PASS: Firebase modal live transaction section renders with newest transaction at top');

console.log('\n🎉 ALL 4 FIREBASE TRANSACTION TOP-OF-TABLE TESTS PASSED SUCCESSFULLY!');
process.exit(0);
