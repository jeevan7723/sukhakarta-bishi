/**
 * Verification test script for Sukhakarta Bishi Mobile & Web Notifications Engine
 * Tests:
 *  1. 2 Days early deposit installment reminder logic
 *  2. All loan action notifications (Disbursed, 3% Interest, Full Repaid, Partial Repaid)
 *  3. In-app notification management (filtering, unread counts, mark as read)
 */

const fs = require('fs');
const assert = require('assert');

// Mock browser globals
global.window = global;
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

global.document = {
  getElementById(id) {
    return {
      style: {},
      classList: {
        add() {},
        remove() {}
      },
      textContent: '',
      innerHTML: ''
    };
  },
  querySelectorAll() {
    return [];
  }
};

global.navigator = {
  serviceWorker: null
};

global.Notification = function(title, options) {
  global.Notification.sent.push({ title, options });
};
global.Notification.permission = 'granted';
global.Notification.requestPermission = async () => 'granted';
global.Notification.sent = [];

// Load notification engine
require('./js/notifications.js');

console.log('--- Test 1: Notification Manager Initialization ---');
const nm = window.notificationManager;
assert.ok(nm, 'NotificationManager instance should exist');
assert.strictEqual(typeof nm.notify, 'function', 'notify method exists');
console.log('✅ NotificationManager initialized successfully');

console.log('--- Test 2: In-App Notification Sending & Unread Count ---');
global.Notification.sent = [];
nm.notify({
  title: ' चाचणी सूचना',
  body: 'सिस्टम चाचणी',
  type: 'general'
});

assert.strictEqual(nm.notifications.length, 1, 'Should have 1 notification in tray');
assert.strictEqual(nm.getUnreadCount(), 1, 'Should have 1 unread notification');
assert.strictEqual(global.Notification.sent.length, 1, 'Should have triggered 1 native notification');
console.log('✅ In-App notification sending and unread count verified');

console.log('--- Test 3: Loan Disbursed Notification ---');
global.Notification.sent = [];
const mockLoan = {
  id: 'LOAN-SKB001-1',
  memberId: 'SKB-001',
  memberName: 'राजाराम पाटील',
  principalAmount: 20000
};
const mockMember = { id: 'SKB-001', name: 'राजाराम पाटील', nameMarathi: 'राजाराम पाटील' };

nm.notifyLoanDisbursed(mockLoan, mockMember);
const loanDisbNotif = nm.notifications[0];
assert.strictEqual(loanDisbNotif.type, 'loan', 'Type should be loan');
assert.ok(loanDisbNotif.title.includes('कर्ज वाटप'), 'Title should mention loan disbursement');
assert.ok(loanDisbNotif.body.includes('₹20,000'), 'Body should mention principal amount');
console.log('✅ Loan Disbursed notification verified:', loanDisbNotif.title, '->', loanDisbNotif.body);

console.log('--- Test 4: Loan 3% Interest Paid Notification ---');
const mockInterestPayment = {
  amount: 600,
  cycleNumber: 1,
  receiptNo: 'INT-REC-001'
};
nm.notifyLoanInterestPaid(mockLoan, mockInterestPayment);
const intNotif = nm.notifications[0];
assert.strictEqual(intNotif.type, 'loan', 'Type should be loan');
assert.ok(intNotif.title.includes('व्याज जमा'), 'Title should mention interest received');
assert.ok(intNotif.body.includes('₹600'), 'Body should mention interest amount');
console.log('✅ Loan Interest Paid notification verified:', intNotif.title, '->', intNotif.body);

console.log('--- Test 5: Full and Partial Loan Repayment Notification ---');
// Partial
nm.notifyLoanRepayment(mockLoan, {
  repaidAmount: 10000,
  remainingPrincipal: 10000,
  isFullySettled: false
});
const partialNotif = nm.notifications[0];
assert.ok(partialNotif.title.includes('अंशतः'), 'Title should mention partial repayment');
assert.ok(partialNotif.body.includes('₹10,000 बाकी'), 'Body should show remaining principal');

// Full
mockLoan.status = 'paid';
nm.notifyLoanRepayment(mockLoan, {
  repaidAmount: 10000,
  remainingPrincipal: 0,
  isFullySettled: true
});
const fullNotif = nm.notifications[0];
assert.ok(fullNotif.title.includes('पूर्ण परतफेड'), 'Title should mention full settlement');
assert.ok(fullNotif.body.includes('१००% पूर्ण परतफेड'), 'Body should mention 100% settlement');
console.log('✅ Full and Partial loan repayment notifications verified');

console.log('--- Test 6: 2 Days Early Deposit Installment Reminder ---');
// Mock BishiStore
const today = new Date();
// Set startDate such that currentWeek due date is exactly 2 days from today
const targetDueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0, 0);

window.bishiStore = {
  state: {
    meta: {
      currentWeek: 2,
      startDate: today.toISOString().split('T')[0]
    }
  },
  getWeekDate(w) {
    return targetDueDate;
  },
  getMembers() {
    return [
      {
        id: 'SKB-001',
        name: 'अजय शिंदे',
        status: 'active',
        weeklyAmount: 1000,
        weeks: [
          { weekNumber: 1, status: 'paid', amountPaid: 1000 },
          { weekNumber: 2, status: 'pending', amountPaid: 0 } // pending!
        ]
      }
    ];
  }
};

const initialCount = nm.notifications.length;
nm.checkDepositInstallmentReminders();
assert.strictEqual(nm.notifications.length, initialCount + 1, 'Should have added deposit reminder');
const depNotif = nm.notifications[0];
assert.strictEqual(depNotif.type, 'installment', 'Type should be installment');
assert.ok(depNotif.title.includes('आठवडा 2'), 'Title should mention Week 2');
assert.ok(depNotif.body.includes('२ दिवसांत') && depNotif.body.includes('देय आहे'), 'Body should state due in 2 days');
console.log('✅ 2 Days early deposit installment reminder verified:', depNotif.title, '->', depNotif.body);

console.log('--- Test 7: Duplicate Prevention on Same Day ---');
// Running checkDepositInstallmentReminders again on same day should NOT send duplicate
nm.checkDepositInstallmentReminders();
assert.strictEqual(nm.notifications.length, initialCount + 1, 'Duplicate notification should not be sent on same day');
console.log('✅ Duplicate prevention verified');

console.log('--- Test 8: Mark All as Read and Filtering ---');
assert.ok(nm.getUnreadCount() > 0, 'Should have unread notifications');
nm.markAllAsRead();
assert.strictEqual(nm.getUnreadCount(), 0, 'Unread count should be 0 after markAllAsRead');
console.log('✅ Mark all as read verified');

console.log('\n🎉 ALL NOTIFICATION UNIT TESTS (1 to 8) PASSED WITH 100% SUCCESS!');
