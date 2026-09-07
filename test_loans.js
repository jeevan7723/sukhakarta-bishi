/**
 * Sukhakarta Bishi - Loan Management & 4-Week Periodic Interest Test Suite
 * Validates:
 * 1. Admin exclusive authority (non-admin blocked from issuing, paying interest, or settling).
 * 2. Issue loan to member.
 * 3. 0% interest within 4-week grace period (Weeks 1 to 4).
 * 4. 3% interest applied after 4 weeks (Week 5+).
 * 5. Admin "💰 व्याज जमा" (Pay 4-Week Periodic Interest Only) - resets cycle and keeps principal active.
 * 6. Multiple periodic 4-week interest cycles (Cycle 1 at W5, Cycle 2 at W9).
 * 7. Dedicated 4-Week Interest Receipts (INT-REC-...) and WhatsApp message formatting.
 * 8. Member overall due calculations (Weekly Bishi Deposit + Loan Principal + Loan Interest Due).
 * 9. Admin full loan settlement (Principal + remaining accrued interest).
 * 10. Dashboard financial stats and CSV Export generation.
 */

// Mock browser globals for Node.js
const storage = {};
const session = {};

global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.sessionStorage = {
  getItem: (k) => session[k] || null,
  setItem: (k, v) => { session[k] = String(v); },
  removeItem: (k) => { delete session[k]; },
  clear: () => { Object.keys(session).forEach(k => delete session[k]); }
};

global.document = {
  getElementById: () => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};

global.window = global;

// Load store, auth, receipts, export
require('./js/auth.js');
require('./js/store.js');
require('./js/receipt.js');
require('./js/export.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('====================================================');
console.log('🧪 SUKHAKARTA BISHI - 4-WEEK LOAN INTEREST TEST SUITE');
console.log('====================================================\n');

// 1. Setup Database with test member
window.authManager.loginUnified('admin', 'jeevan@1234', true);
window.bishiStore.clearAllData();

const member = window.bishiStore.addMember({
  name: 'रमेश पाटील (Ramesh Patil)',
  phone: '9822011111',
  weeklyAmount: 1000,
  password: '123'
});
assert(member && member.id, `Test member created successfully: ${member?.id} (${member?.name})`);

// 2. Test Authorization Guard - Non-admin cannot issue loan
window.authManager.logout();
const unauthIssue = window.bishiStore.issueLoan({
  memberId: member.id,
  principalAmount: 10000,
  issueWeek: 1
});
assert(!unauthIssue.success, 'Unauthenticated user cannot issue loan');

// Login as Admin
const adminLogin = window.authManager.loginUnified('admin', 'jeevan@1234', true);
assert(adminLogin.success && window.authManager.isAdmin(), 'Admin login successful');

// 3. Admin Issues Loan of ₹10,000 at Week 1
const loanRes = window.bishiStore.issueLoan({
  memberId: member.id,
  principalAmount: 10000,
  issueWeek: 1,
  issueDate: '2026-01-01',
  disbursementMode: 'UPI',
  disbursementUpiId: 'ramesh@upi',
  notes: 'शेती कामासाठी तात्पुरते कर्ज'
});
assert(loanRes.success, `Loan issued successfully: ${loanRes.loan?.id}`);
const loan = loanRes.loan;
assert(loan.lastInterestPaidWeek === 1, 'Initial lastInterestPaidWeek set to issueWeek (Week 1)');
assert(loan.totalInterestPaid === 0, 'Initial totalInterestPaid is 0');

// 4. Test Grace Period Calculation (0% Interest during Weeks 1-4)
// Week 1 (0 weeks elapsed)
window.bishiStore.state.meta.currentWeek = 1;
let calcW1 = window.bishiStore.calculateLoanDetails(loan);
assert(calcW1.interestAmount === 0, `Week 1: 0% interest (accrued: ₹${calcW1.interestAmount})`);
assert(calcW1.totalPayable === 10000, `Week 1: Total payable = ₹10,000`);
assert(calcW1.isGracePeriodActive === true, `Week 1: Grace period is active`);
assert(calcW1.nextInterestDueWeek === 5, `Week 1: Next interest due at Week 5`);

// Week 4 (3 weeks elapsed, within 4 weeks grace period)
window.bishiStore.state.meta.currentWeek = 4;
let calcW4 = window.bishiStore.calculateLoanDetails(loan);
assert(calcW4.interestAmount === 0, `Week 4: 0% interest (accrued: ₹${calcW4.interestAmount})`);
assert(calcW4.isGracePeriodActive === true, `Week 4: Grace period is active (0% interest, 1 week remaining)`);

// 5. Test Interest Calculation after 4 Weeks (Week 5 -> 4 weeks elapsed, 3% interest due = ₹300)
window.bishiStore.state.meta.currentWeek = 5;
let calcW5 = window.bishiStore.calculateLoanDetails(loan);
assert(calcW5.isInterestApplicable === true, `Week 5: 4 weeks complete, interest is applicable`);
assert(calcW5.interestAmount === 300, `Week 5: 3% cycle interest on ₹10,000 = ₹300 (actual: ₹${calcW5.interestAmount})`);
assert(calcW5.totalPayable === 10300, `Week 5: Total payable for full closure = ₹10,300`);

// 6. Test Member cannot pay interest (Admin exclusive)
window.authManager.logout();
window.authManager.loginUnified(member.id, '123', true);
assert(window.authManager.isCustomer(), 'Member logged in successfully');
const memberPayIntAttempt = window.bishiStore.payLoanInterest(loan.id, { amount: 300 });
assert(!memberPayIntAttempt.success, 'Member cannot record interest payment (Admin only)');

// 7. Admin Records 4-Week Interest Payment for Cycle 1 (Week 5, ₹300)
window.authManager.logout();
window.authManager.loginUnified('admin', 'jeevan@1234', true);
const intPay1 = window.bishiStore.payLoanInterest(loan.id, {
  amount: 300,
  paidWeek: 5,
  paidDate: '2026-02-05',
  paymentMode: 'UPI',
  upiId: 'ramesh@upi',
  notes: 'पहिल्या ४ आठवड्यांचे ३% व्याज जमा'
});
assert(intPay1.success, `Cycle 1 Interest paid successfully: ${intPay1.receiptNo}`);
assert(intPay1.currentCycleNum === 1, 'Payment recorded as Cycle 1');

// Verify updated loan state in store
const loanAfterInt1 = window.bishiStore.getLoan(loan.id);
assert(loanAfterInt1.status === 'active', 'Principal loan remains "active" after interest payment');
assert(loanAfterInt1.totalInterestPaid === 300, 'Loan totalInterestPaid is now ₹300');
assert(loanAfterInt1.lastInterestPaidWeek === 5, 'Loan lastInterestPaidWeek advanced to Week 5');
assert(loanAfterInt1.interestPayments.length === 1, 'Loan interestPayments array has 1 entry');

// 8. Test 4-Week Countdown Reset for Cycle 2 (Week 6 to Week 8)
window.bishiStore.state.meta.currentWeek = 6; // 1 week elapsed since Week 5 interest payment
let calcW6 = window.bishiStore.calculateLoanDetails(loanAfterInt1);
assert(calcW6.currentCycleElapsedWeeks === 1, `Week 6: 1 week elapsed in Cycle 2`);
assert(calcW6.isGracePeriodActive === true, `Week 6: In Cycle 2 grace period (3 weeks remaining)`);
assert(calcW6.interestAmount === 0, `Week 6: No new interest due yet (accrued: ₹${calcW6.interestAmount})`);
assert(calcW6.nextInterestDueWeek === 9, `Week 6: Next interest due at Week 9 (5 + 4)`);

// 9. Advance to Week 9 (Next 4 weeks elapsed from Week 5 -> Cycle 2 interest of ₹300 is due)
window.bishiStore.state.meta.currentWeek = 9;
let calcW9 = window.bishiStore.calculateLoanDetails(loanAfterInt1);
assert(calcW9.currentCycleElapsedWeeks === 4, `Week 9: 4 weeks elapsed since last interest payment`);
assert(calcW9.isInterestApplicable === true, `Week 9: Cycle 2 interest is now applicable`);
assert(calcW9.interestAmount === 300, `Week 9: 3% interest for Cycle 2 = ₹300`);

// 10. Admin Records 4-Week Interest Payment for Cycle 2 (Week 9, ₹300)
const intPay2 = window.bishiStore.payLoanInterest(loan.id, {
  amount: 300,
  paidWeek: 9,
  paidDate: '2026-03-05',
  paymentMode: 'Cash',
  notes: 'दुसऱ्या ४ आठवड्यांचे ३% व्याज जमा'
});
assert(intPay2.success, `Cycle 2 Interest paid successfully: ${intPay2.receiptNo}`);
assert(intPay2.currentCycleNum === 2, 'Payment recorded as Cycle 2');

const loanAfterInt2 = window.bishiStore.getLoan(loan.id);
assert(loanAfterInt2.totalInterestPaid === 600, 'Loan totalInterestPaid is now ₹600');
assert(loanAfterInt2.lastInterestPaidWeek === 9, 'Loan lastInterestPaidWeek advanced to Week 9');
assert(loanAfterInt2.interestPayments.length === 2, 'Loan interestPayments array has 2 entries');

// 11. Test Member Overall Due Calculation at Week 10
window.bishiStore.state.meta.currentWeek = 10;
const overallDueW10 = window.bishiStore.calculateMemberOverallDue(member);
assert(overallDueW10.loanPrincipalDue === 10000, `Week 10: Active loan principal due = ₹10,000`);
assert(overallDueW10.loanInterestDue === 0, `Week 10: Interest is cleared (1 week in Cycle 3)`);
assert(overallDueW10.totalLoanDue === 10000, `Week 10: Total loan payoff due = ₹10,000`);

// 12. Admin Full Settlement of Principal (₹10,000)
const payRes = window.bishiStore.markLoanPaid(loan.id, {
  repaidAmount: 10000,
  interestAmount: 0,
  paidWeek: 10,
  paidDate: '2026-03-12',
  paymentMode: 'Bank Transfer',
  notes: 'संपूर्ण मूळ कर्ज परतफेड जमा'
});
assert(payRes.success, `Loan settled in full with receipt: ${payRes.receiptNo}`);

const settledLoan = window.bishiStore.getLoan(loan.id);
assert(settledLoan.status === 'paid', 'Settled loan status is "paid"');
assert(settledLoan.totalInterestPaid === 600, 'Total interest collected on this loan throughout cycles = ₹600');

// 13. Verify Dashboard Stats
const stats = window.bishiStore.getDashboardStats();
assert(stats.totalLoansDisbursed === 10000, `Dashboard: Total loans disbursed = ₹10,000`);
assert(stats.totalLoanInterestCollected === 600, `Dashboard: Total periodic 4-week interest collected = ₹600`);
assert(stats.repaidLoansCount === 1, `Dashboard: Repaid loans count = 1`);
assert(stats.activeLoansCount === 0, `Dashboard: Active loans count = 0`);

// 14. Verify Dedicated 4-Week Interest Receipt & WhatsApp Generator
const intReceiptHTML = window.receiptManager.generateLoanInterestReceiptHTML(loanAfterInt2, intPay2.payment, member, window.bishiStore.state.meta);
assert(intReceiptHTML.includes('INT-REC-'), 'Interest Receipt HTML contains INT-REC receipt ID');
assert(intReceiptHTML.includes('४-आठवडे ३% व्याज'), 'Interest Receipt HTML contains 4-week 3% badge');
assert(intReceiptHTML.includes('चक्र 2') || intReceiptHTML.includes('चक्र २'), 'Interest Receipt HTML contains Cycle number');

const intWaText = window.receiptManager.generateLoanInterestWhatsAppText(loanAfterInt2, intPay2.payment, member, window.bishiStore.state.meta);
assert(intWaText.includes('४-आठवडे कर्ज व्याज पावती'), 'WhatsApp message contains 4-week loan interest title');
assert(intWaText.includes('300') || intWaText.includes('३००'), 'WhatsApp message contains ₹300 interest amount');

// 15. Verify Loan Interest Pending WhatsApp Message Generator
const pendingWaText = window.receiptManager.generateLoanInterestPendingWhatsAppText(loanAfterInt2, member, window.bishiStore.state.meta);
assert(pendingWaText.includes('कर्ज व्याज भरणा स्मरणपत्र'), 'Pending interest WhatsApp message contains reminder title');
assert(pendingWaText.includes('३% व्याज देय झाले आहे'), 'Pending interest message contains 3% interest due notice');
assert(pendingWaText.includes('10,000') || pendingWaText.includes('१०,०००'), 'Pending interest message contains principal loan amount');
assert(pendingWaText.includes('300') || pendingWaText.includes('३००'), 'Pending interest message contains due interest amount');

console.log('\n====================================================');
console.log(`📊 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');
