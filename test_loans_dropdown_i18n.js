const fs = require('fs');

const localStorageMock = {};
global.localStorage = {
  getItem: (k) => localStorageMock[k] || null,
  setItem: (k, v) => { localStorageMock[k] = String(v); },
  removeItem: (k) => { delete localStorageMock[k]; }
};

global.window = global;

class MockElement {
  constructor(tagName, textContent = '', id = '') {
    this.tagName = tagName;
    this.id = id;
    this._textContent = textContent;
    this.attrs = {};
    this.children = [];
    this.parentElement = null;
  }
  getAttribute(k) { return this.attrs[k] || null; }
  setAttribute(k, v) { this.attrs[k] = v; }
  hasAttribute(k) { return k in this.attrs; }
  closest(selector) {
    if (selector === '[data-i18n]' && this.attrs['data-i18n']) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }
  querySelector(selector) {
    for (const child of this.children) {
      if (selector.includes('value="all"') && child.getAttribute('value') === 'all') return child;
      if (selector.includes('value="active"') && child.getAttribute('value') === 'active') return child;
      if (selector.includes('value="paid"') && child.getAttribute('value') === 'paid') return child;
    }
    return null;
  }
  get textContent() { return this._textContent; }
  set textContent(v) { this._textContent = v; }
}

const selectEl = new MockElement('SELECT', '', 'loansPageStatusFilter');
const optAll = new MockElement('OPTION', 'सर्व कर्जे (All Loans)');
optAll.setAttribute('value', 'all');
optAll.setAttribute('data-i18n', 'opt_loans_status_all');
optAll.parentElement = selectEl;

const optActive = new MockElement('OPTION', '🔴 कर्ज बाकी (Pending Loans)');
optActive.setAttribute('value', 'active');
optActive.setAttribute('data-i18n', 'opt_loans_status_active');
optActive.parentElement = selectEl;

const optPaid = new MockElement('OPTION', '✅ पूर्ण फेड कर्जे (Paid / Settled)');
optPaid.setAttribute('value', 'paid');
optPaid.setAttribute('data-i18n', 'opt_loans_status_paid');
optPaid.parentElement = selectEl;

selectEl.children = [optAll, optActive, optPaid];

const allElements = [selectEl, optAll, optActive, optPaid];

global.document = {
  documentElement: { setAttribute: () => {} },
  querySelectorAll: (selector) => {
    if (selector === '[data-i18n]') return [optAll, optActive, optPaid];
    if (selector.includes('option')) return [optAll, optActive, optPaid];
    return [];
  },
  getElementById: (id) => {
    if (id === 'loansPageStatusFilter') return selectEl;
    return null;
  },
  body: selectEl
};

// Load i18n
const i18nCode = fs.readFileSync('./js/i18n.js', 'utf-8');
eval(i18nCode);

console.log('--- Testing Loans Status Filter Translation ---');
console.log('Initial Option All:', optAll.textContent);

// 1. Switch to English
window.i18n.setLanguage('en', true);
console.log('English Option All:', optAll.textContent);
if (optAll.textContent !== 'All Loans') throw new Error('Expected "All Loans", got: ' + optAll.textContent);
if (optActive.textContent !== '🔴 Pending Loans') throw new Error('Expected "🔴 Pending Loans", got: ' + optActive.textContent);
if (optPaid.textContent !== '✅ Settled Loans') throw new Error('Expected "✅ Settled Loans", got: ' + optPaid.textContent);

// 2. Switch to Marathi
window.i18n.setLanguage('mr', true);
console.log('Marathi Option All:', optAll.textContent);
if (optAll.textContent !== 'सर्व कर्जे') throw new Error('Expected "सर्व कर्जे", got: ' + optAll.textContent);

// 3. Repeat switching 15 times to ensure NO recursive accumulation
for (let i = 0; i < 15; i++) {
  window.i18n.setLanguage('en', true);
  if (optAll.textContent !== 'All Loans') throw new Error(`Iter ${i} EN failed: ` + optAll.textContent);
  window.i18n.setLanguage('mr', true);
  if (optAll.textContent !== 'सर्व कर्जे') throw new Error(`Iter ${i} MR failed: ` + optAll.textContent);
}

console.log('✅ PASS: 15 switches completed with 0 errors! optAll always displays single "All Loans" or "सर्व कर्जे".');
