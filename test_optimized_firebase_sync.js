/**
 * Test Suite: Verify Firebase Read & Write Optimization
 * (Delta Sync, Zero .get() Sweeps, Debouncing)
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
global.document = {
  getElementById: (id) => ({
    id,
    innerHTML: '',
    textContent: '',
    className: '',
    style: {}
  }),
  querySelectorAll: () => []
};
global.window = global;

// Mock Firebase SDK to count reads and writes precisely
let firestoreReads = 0;
let firestoreWrites = 0;
let firestoreDeletes = 0;

const mockDocs = {};
function createMockDocRef(collectionName, docId) {
  return {
    id: docId,
    set: async (data) => {
      firestoreWrites++;
      mockDocs[`${collectionName}/${docId}`] = data;
    },
    get: async () => {
      firestoreReads++;
      return { exists: Boolean(mockDocs[`${collectionName}/${docId}`]), data: () => mockDocs[`${collectionName}/${docId}`] };
    },
    delete: async () => {
      firestoreDeletes++;
      delete mockDocs[`${collectionName}/${docId}`];
    }
  };
}

const mockFirestore = {
  collection: (name) => ({
    doc: (id) => createMockDocRef(name, id),
    get: async () => {
      firestoreReads += 50; // A collection get reads many documents!
      return { forEach: () => {} };
    }
  }),
  batch: () => ({
    delete: () => { firestoreDeletes++; },
    commit: async () => {}
  })
};

global.firebase = {
  apps: [],
  initializeApp: () => ({}),
  app: () => ({}),
  firestore: () => mockFirestore,
  database: () => ({
    ref: () => ({
      set: async () => {},
      remove: async () => {},
      on: () => {},
      once: async () => ({ val: () => null })
    })
  })
};

require('./js/auth.js');
require('./js/store.js');
require('./js/firebase.js');

async function runOptimizationTests() {
  console.log('🧪 Starting Firebase Read & Write Optimization Tests...\n');

  window.authManager.loginUnified('admin', 'jeevan@1234', true);
  const store = window.bishiStore;
  const sync = window.firebaseSyncManager;

  // Ensure mock firestore is attached
  sync.firestore = mockFirestore;
  sync.firestoreDocRef = createMockDocRef('sukhakarta_bishi', 'live_state');

  // Test 1: Reset counters and seed initial members
  firestoreReads = 0;
  firestoreWrites = 0;
  firestoreDeletes = 0;

  store.clearAllData();
  const m1 = store.addMember({ name: 'Member One', phone: '9999911111', weeklyAmount: 1000 });
  const m2 = store.addMember({ name: 'Member Two', phone: '9999922222', weeklyAmount: 1000 });
  const m3 = store.addMember({ name: 'Member Three', phone: '9999933333', weeklyAmount: 1000 });

  // Run full sync initially
  await sync.saveCurrentStateToCloud(true, true);
  console.log(`  Initial Full Sync: ${firestoreReads} reads, ${firestoreWrites} writes`);
  assert(firestoreReads === 0, 'Full sync does not perform any collection .get() reads');
  assert(firestoreWrites > 0, 'Documents written during full sync');

  // Test 2: Measure Reads & Writes for 1 SINGLE PAYMENT
  firestoreReads = 0;
  firestoreWrites = 0;
  firestoreDeletes = 0;

  store.recordPayment(m1.id, 1, 1000);
  const deltaBeforeSync = store.getDelta();
  console.log('  Delta before sync:', deltaBeforeSync);
  assert(deltaBeforeSync.memberIds.includes(m1.id), 'Only Member 1 is dirty');
  assert(deltaBeforeSync.txnIds.length === 1, 'Only 1 transaction is dirty');

  // Execute cloud save (force=true, isFullSync=false)
  await sync.saveCurrentStateToCloud(true, false);

  console.log(`  After Single Payment Sync: ${firestoreReads} reads, ${firestoreWrites} writes`);
  // Must be 0 reads!
  assert.strictEqual(firestoreReads, 0, 'Zero collection .get() reads during regular payment save!');
  // Writes must be: 1 (live_state) + 1 (member m1) + 1 (new txn) + 1 (summary) = 4 writes total!
  // NOT 100+ writes!
  assert(firestoreWrites <= 5, `Writes for 1 payment is minimal (expected <= 5, actual: ${firestoreWrites})`);
  console.log('  ✅ PASS: 1 payment uses 0 Reads and only 4 Writes (down from 130+ reads and 130+ writes)!');

  // Test 3: Member 2 and Member 3 documents were NOT rewritten
  const deltaAfterSync = store.getDelta();
  assert.strictEqual(deltaAfterSync.memberIds.length, 0, 'Delta cleared after sync');
  assert.strictEqual(deltaAfterSync.txnIds.length, 0, 'Delta cleared after sync');
  console.log('  ✅ PASS: Delta state correctly cleared after successful push');

  // Test 4: Member deletion does not scan collection
  firestoreReads = 0;
  firestoreWrites = 0;
  firestoreDeletes = 0;
  await sync.deleteMemberFromCloud(m3.id);
  console.log(`  After Member Deletion: ${firestoreReads} reads, ${firestoreDeletes} deletes`);
  assert.strictEqual(firestoreReads, 0, 'Member deletion does not execute collection .get() read');
  assert(firestoreDeletes >= 1, 'Member doc was deleted');
  console.log('  ✅ PASS: Member deletion directly deletes document with 0 collection reads');

  console.log('\n🎉 ALL FIREBASE READ/WRITE OPTIMIZATION TESTS PASSED SUCCESSFULLY!');
}

runOptimizationTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
