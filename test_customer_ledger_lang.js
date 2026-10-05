// test_customer_ledger_lang.js
const fs = require('fs');

// Setup mock browser environment
const localStorageMock = {};
global.localStorage = {
  getItem: (k) => localStorageMock[k] || null,
  setItem: (k, v) => { localStorageMock[k] = String(v); },
  removeItem: (k) => { delete localStorageMock[k]; }
};

global.window = global;

function createMockElement(id = '', tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    _html: '',
    _text: '',
    get innerHTML() {
      if (this.children.length > 0) {
        return this.children.map(c => `<${c.tagName.toLowerCase()}>${c.innerHTML}</${c.tagName.toLowerCase()}>`).join('');
      }
      return this._html || this._text;
    },
    set innerHTML(val) {
      this.children = [];
      this._html = String(val);
      this._text = String(val).replace(/<[^>]+>/g, ' ').trim();
    },
    get textContent() {
      if (this.children.length > 0) {
        return this.children.map(c => c.textContent).join(' ');
      }
      return this._text || this._html.replace(/<[^>]+>/g, ' ').trim();
    },
    set textContent(val) {
      this.children = [];
      this._text = String(val);
      this._html = String(val);
    },
    style: {},
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    dataset: {},
    children: [],
    appendChild: function(child) { this.children.push(child); return child; },
    remove: function() {},
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    querySelectorAll: function() { return []; },
    addEventListener: function() {},
    removeEventListener: function() {}
  };
  return el;
}

const elementRegistry = {};
function getOrCreateElement(id) {
  if (!elementRegistry[id]) {
    elementRegistry[id] = createMockElement(id);
  }
  return elementRegistry[id];
}

global.document = {
  documentElement: createMockElement('html'),
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => createMockElement('', tag),
  querySelectorAll: () => []
};

global.history = { pushState: () => {} };
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };

// Load code files in order
eval(fs.readFileSync('./js/marathi_translit.js', 'utf-8'));
eval(fs.readFileSync('./js/store.js', 'utf-8'));
eval(fs.readFileSync('./js/i18n.js', 'utf-8'));
eval(fs.readFileSync('./js/receipt.js', 'utf-8'));

// Mock authManager
let currentRole = 'admin';
global.authManager = {
  isAdmin: () => currentRole === 'admin',
  isCustomer: () => currentRole === 'customer',
  currentUser: { username: 'testuser', role: 'customer', memberId: 'SKB-001' },
  getCurrentCustomerMember: () => window.bishiStore.getMember('SKB-001')
};

// Seed sample member
window.bishiStore.state.members = [];
const member = window.bishiStore.addMember({
  id: 'SKB-001',
  name: 'आदित्य पाटील (Aditya Patil)',
  phone: '9822123456',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'अमित पाटील',
  notes: 'सांगली'
});
window.bishiStore.recordPayment(member.id, 1, 1000, 'UPI', 'आठवडा १ हप्ता', 0, 'aditya@upi');

// Switch to customer role for testing customer portal
currentRole = 'customer';

eval(fs.readFileSync('./js/ui.js', 'utf-8'));

console.log('--- TEST 1: Customer Portal in Marathi (Default) ---');
window.i18n.setLanguage('mr', true);
window.ui.renderCustomerPortal();

const mrHeroPassbook = document.getElementById('btnCustHeroPassbook').textContent;
const mrHeroLedger = document.getElementById('btnCustHeroPrintLedgerCard').textContent;
const mrCustHistoryTh = document.getElementById('custHistoryTableHead').innerHTML;

console.log('Marathi Hero Passbook button:', mrHeroPassbook);
console.log('Marathi Hero Ledger button:', mrHeroLedger);

if (!mrHeroPassbook.includes('पासबुक')) throw new Error('Passbook button should have Marathi in mr mode');
if (!mrHeroLedger.includes('लेजर कार्ड')) throw new Error('Ledger button should have Marathi in mr mode');
if (!mrCustHistoryTh.includes('हप्ता ठेव') || !mrCustHistoryTh.includes('पावती क्र.')) {
  throw new Error('Customer history table headers should be Marathi in mr mode');
}

console.log('\n--- TEST 2: Customer Portal in English ---');
window.i18n.setLanguage('en', true);
window.ui.renderCustomerPortal();

const enHeroPassbook = document.getElementById('btnCustHeroPassbook').textContent;
const enHeroLedger = document.getElementById('btnCustHeroPrintLedgerCard').textContent;
const enCustHistoryTh = document.getElementById('custHistoryTableHead').innerHTML;
const enCustHistoryTbody = document.getElementById('custHistoryTableBody').innerHTML;

console.log('English Hero Passbook button:', enHeroPassbook);
console.log('English Hero Ledger button:', enHeroLedger);

if (!enHeroPassbook.includes('Member Passbook')) throw new Error('Passbook button should be English');
if (!enHeroLedger.includes('Ledger Card Report')) throw new Error('Ledger button should be English');
if (!enCustHistoryTh.includes('Receipt No.') || !enCustHistoryTh.includes('Installment Deposit') || !enCustHistoryTh.includes('Payment Mode')) {
  throw new Error('Customer history table headers should be English in en mode');
}
if (!enCustHistoryTbody.includes('Week 1 / 50') || !enCustHistoryTbody.includes('Receipt')) {
  throw new Error('Customer history rows should be English in en mode');
}

console.log('\n--- TEST 3: Dedicated Reports Page for Customer ---');
window.ui.renderReportsPage();
const enReportsTitle = document.getElementById('reportsHeroPageTitle').textContent;
const enReportsBack = document.getElementById('reportsHeroBackBtnText').textContent;
const enReportsContent = document.getElementById('reportPageContentArea').innerHTML;

console.log('English Reports Title:', enReportsTitle);
console.log('English Reports Back button:', enReportsBack);

if (!enReportsTitle.includes('Bishi Reports & Official Member Ledger Card Register')) {
  throw new Error('Reports page title should be English');
}
if (!enReportsBack.includes('Back to Portal')) {
  throw new Error('Customer reports back button should say "Back to Portal" in English');
}
if (!enReportsContent.includes('Member Ledger Card Register') || !enReportsContent.includes('Installment Deposit')) {
  throw new Error('Reports page content should contain English member ledger card register');
}

console.log('\n--- TEST 4: Member Ledger Modal for Customer ---');
window.receiptManager.showMemberLedgerCard(member.id, 1, false);
const modalBodyHTML = document.getElementById('memberLedgerModalBody').innerHTML;

if (!modalBodyHTML.includes('Member Ledger Card Register')) {
  throw new Error('Member ledger modal should render English report when language is EN');
}
if (!modalBodyHTML.includes('Installment Deposit') || !modalBodyHTML.includes('Remaining Balance')) {
  throw new Error('Member ledger modal should include English table columns');
}
if (!modalBodyHTML.includes('Print Ledger')) {
  throw new Error('Member ledger modal toolbar should include English Print button');
}

console.log('\n--- TEST 5: Member Passbook Modal in English ---');
window.ui.openPassbookModal(member.id);
const enPassbookTitle = document.getElementById('passbookModalTitle').textContent;
const enInstLabel = document.getElementById('passbookInstallmentLabel').textContent;
const enTotalPaidLabel = document.getElementById('passbookTotalPaidLabel').textContent;
const enCloseBtn = document.getElementById('passbookCloseBtn').textContent;

console.log('English Passbook Title:', enPassbookTitle);
console.log('English Passbook Installment Label:', enInstLabel);

if (!enPassbookTitle.includes('Member 50-Week Passbook')) {
  throw new Error('Passbook title should be in English');
}
if (enInstLabel !== 'Weekly Installment') {
  throw new Error('Passbook installment label should be "Weekly Installment"');
}
if (enTotalPaidLabel !== 'Total Deposit') {
  throw new Error('Passbook total paid label should be "Total Deposit"');
}
if (enCloseBtn !== 'Close') {
  throw new Error('Passbook close button should be "Close"');
}

console.log('\n--- TEST 6: Dynamic Language Switch Re-rendering ---');
// While passbook modal and ledger modal are open, switch back to Marathi
document.getElementById('memberLedgerModal').classList.add('active');
document.getElementById('passbookModal').classList.add('active');
window.i18n.setLanguage('mr');

// Verify instant adaptation to Marathi
const mrPassbookTitle = document.getElementById('passbookModalTitle').textContent;
const mrModalBodyHTML = document.getElementById('memberLedgerModalBody').innerHTML;

console.log('Reverted Marathi Passbook Title:', mrPassbookTitle);
if (!mrPassbookTitle.includes('सदस्य ५०-आठवडे पासबुक')) {
  throw new Error('Passbook title should revert back to Marathi');
}
if (!mrModalBodyHTML.includes('सदस्य खातावही कार्ड रजिस्टर')) {
  throw new Error('Member ledger modal should revert back to Marathi');
}

console.log('\n✅ ALL CUSTOMER PAGE & LEDGER CARD LANGUAGE TESTS PASSED CLEANLY!');
process.exit(0);
