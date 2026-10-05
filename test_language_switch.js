// test_language_switch.js
const fs = require('fs');

const localStorageMock = {};
global.localStorage = {
  getItem: (k) => localStorageMock[k] || null,
  setItem: (k, v) => { localStorageMock[k] = String(v); },
  removeItem: (k) => { delete localStorageMock[k]; }
};

global.window = global;

const domMock = {
  elements: [],
  setAttribute: function(k, v) { this[k] = v; },
  getAttribute: function(k) { return this[k] || null; }
};

global.document = {
  documentElement: domMock,
  querySelectorAll: () => [],
  getElementById: () => null
};

// Load i18n
const i18nCode = fs.readFileSync('./js/i18n.js', 'utf-8');
eval(i18nCode);

console.log('--- Testing Internationalization Engine (i18n) ---');

// Test 1: Default language is 'mr'
const defaultLang = window.i18n.getLanguage();
console.log('Default language:', defaultLang, '(Expected: mr)');
if (defaultLang !== 'mr') throw new Error('Default language must be mr');

// Test 2: Marathi translations
const mrDashboard = window.i18n.t('nav_dashboard');
const mrCollect = window.i18n.t('btn_collect');
console.log('Marathi Dashboard:', mrDashboard, '(Expected: मुख्य डॅशबोर्ड)');
console.log('Marathi Collect:', mrCollect, '(Expected: 💰 जमा करा)');
if (mrDashboard !== 'मुख्य डॅशबोर्ड') throw new Error('Failed Marathi dashboard translation');
if (mrCollect !== '💰 जमा करा') throw new Error('Failed Marathi collect translation');

// Test 3: Switch to English
window.i18n.setLanguage('en', true);
const enLang = window.i18n.getLanguage();
console.log('Switched language:', enLang, '(Expected: en)');
if (enLang !== 'en') throw new Error('Language should be en');

const enDashboard = window.i18n.t('nav_dashboard');
const enCollect = window.i18n.t('btn_collect');
const enMembers = window.i18n.t('nav_members');
const enLogin = window.i18n.t('login_submit_btn');

console.log('English Dashboard:', enDashboard, '(Expected: Main Dashboard)');
console.log('English Collect:', enCollect, '(Expected: 💰 Collect)');
console.log('English Members:', enMembers, '(Expected: All Members Data)');
console.log('English Login:', enLogin, '(Expected: Log In)');

if (enDashboard !== 'Main Dashboard') throw new Error('Failed English dashboard translation');
if (enCollect !== '💰 Collect') throw new Error('Failed English collect translation');
if (enMembers !== 'All Members Data') throw new Error('Failed English members translation');
if (enLogin !== 'Log In') throw new Error('Failed English login translation');

// Test 4: Toggle back to Marathi
const toggled = window.i18n.toggleLanguage();
console.log('Toggled language:', toggled, '(Expected: mr)');
if (toggled !== 'mr' || window.i18n.getLanguage() !== 'mr') throw new Error('Toggle should return mr');

// Verify localStorage persisted
console.log('LocalStorage persisted lang:', global.localStorage.getItem('sukhakarta_lang'), '(Expected: mr)');
if (global.localStorage.getItem('sukhakarta_lang') !== 'mr') throw new Error('LocalStorage should persist mr');

// Test 5: Member Ledger Card Report in English vs Marathi
console.log('\n--- Testing Member Ledger Card Report Language Switching ---');
// Load translit, store, and receipt
eval(fs.readFileSync('./js/marathi_translit.js', 'utf-8'));
eval(fs.readFileSync('./js/store.js', 'utf-8'));
eval(fs.readFileSync('./js/receipt.js', 'utf-8'));

const testMember = window.bishiStore.addMember({
  name: 'आदित्य पाटील (Aditya Patil)',
  phone: '9822123456',
  weeklyAmount: 500,
  startWeek: 1,
  nominee: 'अमित पाटील',
  notes: 'सांगली'
});
window.bishiStore.recordPayment(testMember.id, 1, 500, 'Cash', 'हप्ता', 0);

// A) When in Marathi mode
window.i18n.setLanguage('mr', true);
const mrLedgerHTML = window.receiptManager.generateMemberLedgerReportHTML(testMember, 1, false);
const mrLedgerWA = window.receiptManager.generateMemberLedgerWhatsAppText(testMember, 1);

if (!mrLedgerHTML.includes('सदस्य खातावही कार्ड रजिस्टर')) {
  throw new Error('Marathi ledger report missing "सदस्य खातावही कार्ड रजिस्टर"');
}
if (!mrLedgerHTML.includes('खाते क्र.:') || !mrLedgerHTML.includes('सभासदाचे नाव:')) {
  throw new Error('Marathi ledger report missing Marathi table headers');
}
if (mrLedgerHTML.includes('Member Ledger Card Register')) {
  throw new Error('Marathi ledger report should NOT contain English title');
}
if (!mrLedgerWA.includes('सदस्य खातावही कार्ड रजिस्टर')) {
  throw new Error('Marathi WhatsApp ledger text missing Marathi title');
}
console.log('✓ Marathi mode correctly produces 100% Marathi Ledger Report & WhatsApp text');

// B) When in English mode
window.i18n.setLanguage('en', true);
const enLedgerHTML = window.receiptManager.generateMemberLedgerReportHTML(testMember, 1, false);
const enLedgerWA = window.receiptManager.generateMemberLedgerWhatsAppText(testMember, 1);

const expectedEnglishMarkers = [
  'Member Ledger Card Register',
  'Office: Head Office',
  'Account No.:',
  'Member Name:',
  'Installment:',
  'Address & Mobile:',
  'Total Bishi Payout:',
  'Dividend & Interest Rate:',
  'Installment Deposit',
  'Total Deposit',
  'Remaining Balance',
  'Total',
  '1) Nominee: अमित पाटील',
  '2) Dividend / Payout Interest',
  '3) Account No.:',
  '4) Total Final Payout:',
  'Secretary / President'
];

for (const marker of expectedEnglishMarkers) {
  if (!enLedgerHTML.includes(marker)) {
    throw new Error(`English ledger report missing expected marker: "${marker}"`);
  }
}

if (!enLedgerWA.includes('Member Ledger Card Register') || !enLedgerWA.includes('*Member:* Aditya Patil') || !enLedgerWA.includes('Sukhakarta Bishi')) {
  throw new Error('English WhatsApp ledger text missing English title, Member name, or Sukhakarta Bishi branding');
}
console.log('✓ English mode correctly produces English Ledger Report & WhatsApp text');

// C) Switch back to Marathi
window.i18n.setLanguage('mr', true);
const resetMrHTML = window.receiptManager.generateMemberLedgerReportHTML(testMember, 1, false);
if (resetMrHTML.includes('Member Ledger Card Register') || !resetMrHTML.includes('सदस्य खातावही कार्ड रजिस्टर')) {
  throw new Error('Failed to cleanly reset to Marathi');
}
console.log('✓ Cleanly reverted back to Marathi mode');

console.log('\n✅ ALL LANGUAGE SWITCHING & LEDGER REPORT TESTS PASSED PERFECTLY!');
