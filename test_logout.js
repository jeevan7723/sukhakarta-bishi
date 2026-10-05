// test_logout.js
const fs = require('fs');
const assert = require('assert');

// Mock browser environment
const localStorageData = {};
const sessionStorageData = {};

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; }
};

global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = String(v); },
  removeItem: (k) => { delete sessionStorageData[k]; }
};

const domElements = {};
function createMockElement(id) {
  return {
    id,
    style: { display: '' },
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c, v) { if (v) this.add(c); else this.remove(c); }
    },
    value: '',
    textContent: '',
    innerHTML: '',
    addEventListener: () => {}
  };
}

global.document = {
  body: createMockElement('body'),
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => null
  },
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  querySelector: () => null,
  querySelectorAll: () => []
};

global.window = global;
global.window.location = { hash: '', pathname: '/', search: '' };
global.history = { pushState: () => {} };

// Load i18n
eval(fs.readFileSync('./js/i18n.js', 'utf-8'));
// Load auth
eval(fs.readFileSync('./js/auth.js', 'utf-8'));
// Load store
eval(fs.readFileSync('./js/marathi_translit.js', 'utf-8'));
eval(fs.readFileSync('./js/store.js', 'utf-8'));

console.log('--- Testing Logout & Authentication State Transitions ---');

// 1. Initial State: Unauthenticated
assert.strictEqual(window.authManager.isAuthenticated(), false, 'Initially not authenticated');
assert.strictEqual(window.authManager.isAdmin(), false, 'Initially not admin');
assert.strictEqual(window.authManager.isCustomer(), false, 'Initially not customer');
console.log('✅ Initial unauthenticated state verified');

// 2. Admin Login
const adminRes = window.authManager.loginUnified('admin', 'jeevan@1234', true);
assert.strictEqual(adminRes.success, true, 'Admin login succeeds');
assert.strictEqual(window.authManager.isAuthenticated(), true, 'Authenticated as admin');
assert.strictEqual(window.authManager.isAdmin(), true, 'isAdmin is true');
assert.strictEqual(window.authManager.isCustomer(), false, 'isCustomer is false');
console.log('✅ Admin login state verified');

// Simulate DOM state during admin login
document.body.classList.add('admin-mode');
const loginOverlay = document.getElementById('adminLoginScreen');
loginOverlay.classList.add('hidden');
const dashboardView = document.getElementById('dashboardView');
dashboardView.style.display = 'block';

// 3. Perform Logout
window.authManager.logout();

// Assert Session & Auth State after logout
assert.strictEqual(window.authManager.isAuthenticated(), false, 'isAuthenticated MUST be false after logout');
assert.strictEqual(window.authManager.isAdmin(), false, 'isAdmin MUST be false after logout');
assert.strictEqual(window.authManager.isCustomer(), false, 'isCustomer MUST be false after logout');
assert.strictEqual(window.authManager.getCurrentUser(), null, 'Session must be null');
assert.strictEqual(document.body.classList.contains('admin-mode'), false, 'admin-mode class removed from body');
console.log('✅ Admin logout cleanly reset session & authentication flags');

// 4. Test Customer Login & Logout
const member = window.bishiStore.addMember({
  name: 'सुभाष गायकवाड (Subhash Gaikwad)',
  phone: '9822998877',
  weeklyAmount: 500,
  password: '123'
});

const custRes = window.authManager.loginUnified(member.id, '123', false);
assert.strictEqual(custRes.success, true, 'Customer login succeeds');
assert.strictEqual(window.authManager.isAuthenticated(), true, 'Authenticated as customer');
assert.strictEqual(window.authManager.isCustomer(), true, 'isCustomer is true');
assert.strictEqual(window.authManager.isAdmin(), false, 'isAdmin is false');

document.body.classList.add('customer-mode');
window.authManager.logout();

assert.strictEqual(window.authManager.isAuthenticated(), false, 'Customer logged out');
assert.strictEqual(window.authManager.isCustomer(), false, 'isCustomer false after logout');
assert.strictEqual(document.body.classList.contains('customer-mode'), false, 'customer-mode class removed from body');
console.log('✅ Customer logout cleanly reset session & authentication flags');

console.log('\n🎉 ALL LOGOUT TESTS PASSED 100% PERFECTLY!');
