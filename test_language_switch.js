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

console.log('✅ ALL LANGUAGE SWITCHING TESTS PASSED PERFECTLY!');
