// test_monthly_members.js
// Verification of Monthly Member Support (12 months cycle, month-by-month deposits)

const fs = require('fs');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

const session = {};
global.sessionStorage = {
  getItem: (k) => session[k] || null,
  setItem: (k, v) => { session[k] = String(v); },
  removeItem: (k) => { delete session[k]; },
  clear: () => { Object.keys(session).forEach(k => delete session[k]); }
};

// Mock window and document
global.window = global;
global.window.localStorage = global.localStorage;
global.window.sessionStorage = global.sessionStorage;
global.window.location = { reload: () => {} };
global.window.dispatchEvent = () => {};
global.document = {
  addEventListener: () => {},
  getElementById: () => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {}
  }),
  querySelector: () => null,
  querySelectorAll: () => []
};

// Load auth, store and receipt
require('./js/auth.js');
require('./js/store.js');
require('./js/receipt.js');

const store = window.bishiStore;
const receiptService = window.receiptManager;

console.log('====================================================');
console.log('🧪 TESTING MONTHLY MEMBERSHIP AND DEPOSIT LOGIC');
console.log('====================================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Admin login
window.authManager.loginUnified('admin', 'jeevan@1234', true);
store.clearAllData();

// 1. Add Monthly Member
const monthlyMember = store.addMember({
  name: 'सचिन तेंडुलकर (Sachin Tendulkar)',
  phone: '9822011223',
  frequency: 'monthly',
  monthlyAmount: 2000,
  startWeek: 1,
  notes: 'मासिक बीशी सदस्य'
});

assert(monthlyMember !== null, 'Monthly member created successfully');
assert(monthlyMember.frequency === 'monthly', 'Member frequency is "monthly"');
assert(monthlyMember.monthlyAmount === 2000, 'Member monthlyAmount is 2000');
assert(monthlyMember.weeklyAmount === 2000, 'Member weeklyAmount synced to 2000 for compatibility');
assert(monthlyMember.weeks.length === 12, 'Member has exactly 12 period slots (months)');
assert(monthlyMember.weeks[0].weekNumber === 1, 'First period is Month 1');
assert(monthlyMember.weeks[11].weekNumber === 12, 'Twelfth period is Month 12');

// 2. Check Member Stats
const stats = store.calculateMemberStats(monthlyMember);
assert(stats.isMonthly === true, 'Stats detects isMonthly as true');
assert(stats.totalPeriods === 12, 'Stats totalPeriods is 12');
assert(stats.periodUnit === 'महिना', 'Stats periodUnit is "महिना"');
assert(stats.periodUnitPlural === 'महिने', 'Stats periodUnitPlural is "महिने"');
assert(stats.installmentAmount === 2000, 'Stats installmentAmount is 2000');
assert(stats.totalTarget === 24000, 'Stats totalTarget is 24,000 (12 * 2000)');
assert(stats.totalDeposited === 0, 'Initial total deposited is 0');
assert(stats.remainingAmount === 24000, 'Initial remaining amount is 24,000');
assert(stats.nextDueWeek === 1, 'Initial next due period is Month 1');

// 3. Record Month 1 Payment
const payMonth1 = store.recordPayment(monthlyMember.id, 1, 2000, 'Cash', 'महिना १ जमा');

assert(payMonth1 !== null, 'Month 1 payment recorded successfully');
assert(payMonth1.week !== undefined, 'Week/period object returned');
assert(payMonth1.week.weekNumber === 1, 'Payment period is Month 1');

const updatedMember1 = store.getMember(monthlyMember.id);
const updatedStats1 = store.calculateMemberStats(updatedMember1);

assert(updatedStats1.totalDeposited === 2000, 'Total deposited after Month 1 is 2000');
assert(updatedStats1.paidWeeksCount === 1, 'Paid periods count is 1');
assert(updatedStats1.remainingWeeksCount === 11, 'Remaining periods count is 11');
assert(updatedStats1.nextDueWeek === 2, 'Next due period is Month 2');
assert(updatedStats1.remainingAmount === 22000, 'Remaining target is 22,000');

// 4. Pay Month 2 + Month 3 in advance (₹4,000)
const payMonth2and3 = store.recordPayment(monthlyMember.id, 2, 4000, 'UPI', 'महिना २ व ३ एकत्रित जमा');

assert(payMonth2and3 !== null, 'Month 2 & 3 payment recorded successfully');
const updatedMember2 = store.getMember(monthlyMember.id);
const updatedStats2 = store.calculateMemberStats(updatedMember2);

assert(updatedStats2.totalDeposited === 6000, 'Total deposited after Month 2 & 3 is 6000');
assert(updatedStats2.effectivePaidWeeks === 3, 'Effective paid periods is 3');
assert(updatedStats2.nextDueWeek === 4, 'Next due period is Month 4');
assert(updatedMember2.weeks[1].status === 'paid', 'Month 2 status is paid');
assert(updatedStats2.effectivePaidWeeks >= 3, 'Month 3 is covered by Month 2 advance');

// 5. Test Receipts for Monthly Member
const receiptHTML = receiptService.generateReceiptHTML(updatedMember1, payMonth1.week, store.state.meta);
assert(receiptHTML.includes('मासिक हप्ता'), 'Receipt HTML contains "मासिक हप्ता"');
assert(receiptHTML.includes('महिना'), 'Receipt HTML contains "महिना"');
assert(receiptHTML.includes('12'), 'Receipt HTML references 12 periods target');

const waText = receiptService.generateWhatsAppText(updatedMember1, payMonth1.week, store.state.meta);
assert(waText.includes('मासिक हप्ता'), 'WhatsApp message contains "मासिक हप्ता"');
assert(waText.includes('महिना'), 'WhatsApp message contains "महिना"');

// 6. Test Member Ledger Card Report for Monthly Member
const ledgerHTML = receiptService.generateMemberLedgerReportHTML(updatedMember2);
assert(ledgerHTML.includes('दर महिना'), 'Ledger report contains "दर महिना"');
assert(ledgerHTML.includes('12 महिने'), 'Ledger report specifies "12 महिने"');

// 7. Add Weekly Member side-by-side to verify coexistence
const weeklyMember = store.addMember({
  name: 'विराट कोहली (Virat Kohli)',
  phone: '9822099887',
  frequency: 'weekly',
  weeklyAmount: 1000,
  startWeek: 1
});

assert(weeklyMember !== null, 'Weekly member created successfully');
assert(weeklyMember.frequency === 'weekly', 'Weekly member frequency is "weekly"');
assert(weeklyMember.weeks.length === 50, 'Weekly member has 50 weeks');
const weeklyStats = store.calculateMemberStats(weeklyMember);
assert(weeklyStats.isMonthly === false, 'Weekly member isMonthly is false');
assert(weeklyStats.totalPeriods === 50, 'Weekly member totalPeriods is 50');
assert(weeklyStats.periodUnit === 'आठवडा', 'Weekly member periodUnit is "आठवडा"');
assert(weeklyStats.totalTarget === 50000, 'Weekly member target is 50,000 (50 * 1000)');

// 8. Test Month-by-Month Consecutive Deposit Flow (No 5-week wait)
console.log('\n--- Test 8: Consecutive Monthly Deposit Flow (No 5-week wait) ---');
const testMemberMonthly = store.addMember({
  name: 'सुनीता जोशी (Sunita Joshi)',
  phone: '9822112233',
  frequency: 'monthly',
  monthlyAmount: 3000,
  startPeriod: 1
});

assert(testMemberMonthly !== null, 'Member Sunita Joshi created');
let sunitaStats = store.calculateMemberStats(testMemberMonthly);
assert(sunitaStats.nextDueWeek === 1, 'Initial next due month is Month 1');

// Pay Month 1
store.recordPayment(testMemberMonthly.id, 1, 3000, 'Cash', 'महिना १');
sunitaStats = store.calculateMemberStats(testMemberMonthly);
assert(sunitaStats.effectivePaidWeeks === 1, 'Month 1 is paid');
assert(sunitaStats.nextDueWeek === 2, 'Next due month is immediately Month 2 (no 5-week wait!)');

// Simulate openCollectModal period resolution logic for monthly member
function resolveMonthlyCollectWeek(member, requestedWeek) {
  const stats = store.calculateMemberStats(member);
  if (!stats.isMonthly) return Number(requestedWeek) || 1;
  let targetMonth = Number(requestedWeek);
  if (!targetMonth || targetMonth > 12) {
    targetMonth = stats.nextDueWeek;
  } else {
    const checkWk = member.weeks.find(w => w.weekNumber === targetMonth);
    const checkPaid = Number(checkWk?.amountPaid || 0);
    const checkFull = checkWk && (checkWk.status === 'paid' || checkPaid >= stats.installmentAmount);
    const checkCleared = !checkFull && (targetMonth <= stats.effectivePaidWeeks);
    if (checkFull || checkCleared) {
      targetMonth = stats.isFullyPaid ? 12 : stats.nextDueWeek;
    }
  }
  return targetMonth || 1;
}

// When weekly carousel is on Week 1, calling collect must resolve to Month 2
assert(resolveMonthlyCollectWeek(testMemberMonthly, 1) === 2, 'Caller passing week 1 automatically resolves to Month 2 because Month 1 is paid');
assert(resolveMonthlyCollectWeek(testMemberMonthly, 4) === 4, 'Caller requesting unpaid Month 4 resolves to Month 4');
assert(resolveMonthlyCollectWeek(testMemberMonthly, 15) === 2, 'Caller passing invalid week 15 resolves to Month 2');
assert(resolveMonthlyCollectWeek(testMemberMonthly, undefined) === 2, 'Caller without week resolves to Month 2');

// Pay Month 2 immediately
store.recordPayment(testMemberMonthly.id, 2, 3000, 'UPI', 'महिना २');
sunitaStats = store.calculateMemberStats(testMemberMonthly);
assert(sunitaStats.effectivePaidWeeks === 2, 'Month 2 is paid');
// Test 9: 5-week monthly schedule and isPaidAhead advance status
store.state.meta.currentWeek = 3;
let sStatsWk3 = store.calculateMemberStats(testMemberMonthly);
assert(sStatsWk3.activeMonth === 1, 'At Week 3, activeMonth is 1');
assert(sStatsWk3.isPaidAhead === true, 'Member who paid Month 1 & 2 is isPaidAhead=true at Week 3');
assert(sStatsWk3.nextDueDueWeekNumber === 11, 'Month 3 is due after Week 10 (Week 11)');

// Simulate passing 5 weeks for Month 1 and 5 weeks for Month 2 (Week 11)
store.state.meta.currentWeek = 11;
let sStatsWk11 = store.calculateMemberStats(testMemberMonthly);
assert(sStatsWk11.activeMonth === 3, 'At Week 11, activeMonth is 3');
assert(sStatsWk11.isPaidAhead === false, 'At Week 11, Month 3 is now due, so isPaidAhead is false');

console.log('====================================================');
console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}

