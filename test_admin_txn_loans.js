/**
 * Test Suite for Admin Transaction Ledger & Loan Details Integration
 */
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

// Mock DOM elements
const domElements = {};
function getOrCreateEl(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      style: {},
      className: '',
      children: [],
      appendChild(child) {
        this.children.push(child);
        this.innerHTML += child.innerHTML;
      },
      addEventListener() {},
      classList: {
        add(cls) { domElements[id].className += ' ' + cls; },
        remove(cls) { domElements[id].className = domElements[id].className.replace(cls, '').trim(); }
      }
    };
  }
  return domElements[id];
}

global.document = {
  getElementById: (id) => getOrCreateEl(id),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tagName: tag,
    innerHTML: '',
    style: {},
    setAttribute() {},
    appendChild(c) { this.innerHTML += c.innerHTML || ''; }
  }),
  body: { appendChild() {}, removeChild() {} }
};

global.window = global;

require('./js/auth.js');
require('./js/store.js');
require('./js/receipt.js');
require('./js/export.js');
require('./js/ui.js');

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('--- Testing Admin Ledger Modal Loan Integration ---');

// 1. Setup sample data
window.authManager.loginUnified('admin', 'jeevan@1234', true);
const store = window.bishiStore;

// Add 2 members
const m1 = store.addMember({ name: 'Aditya Patil', nameMarathi: 'आदित्य पाटील', phone: '9876543210', weeklyAmount: 500 });
const m2 = store.addMember({ name: 'Sahil Khot', nameMarathi: 'सहिल खोत', phone: '9876543211', weeklyAmount: 500 });

// Member 1 pays week 1 deposit
store.recordPayment(m1.id, 1, 500);

// Member 1 takes a loan of 10,000 at week 1
const loanRes = store.issueLoan({
  memberId: m1.id,
  principalAmount: 10000,
  issueWeek: 1,
  notes: 'व्यवसाय वृद्धी'
});
assert(loanRes.success, 'Loan issued to Aditya Patil');

// Member 1 pays 3% interest of 300
const intRes = store.payLoanInterest(loanRes.loan.id, { amount: 300, paidWeek: 5 });
assert(intRes.success, 'Loan interest payment recorded');

// Initialize UI
const ui = window.ui;

// 2. Render Admin Transactions Tab (All) with active loan
getOrCreateEl('adminTxnModeFilter').value = 'all';
getOrCreateEl('adminTxnSearchInput').value = '';
ui.renderAdminTransactionsTab();

const tbodyHtml = getOrCreateEl('adminTransactionsTableBody').innerHTML;
assert(tbodyHtml.includes('Aditya Patil') || tbodyHtml.includes('आदित्य पाटील'), 'Table contains Aditya Patil');
assert(!tbodyHtml.includes('चालू कर्ज'), 'Regular weekly deposit does not show loan details badge');
assert(tbodyHtml.includes('कर्ज वाटप: ₹10,000'), 'Loan given transaction shows loan details');
assert(tbodyHtml.includes('कर्ज वाटप'), 'Table contains loan disbursed transaction');
assert(tbodyHtml.includes('कर्ज व्याज'), 'Table contains loan interest payment transaction');

// Now Member 1 repays partial principal of 4,000
const repRes = store.markLoanPaid(loanRes.loan.id, { repaidAmount: 4000, interestAmount: 0, paidWeek: 6 });
assert(repRes.success, 'Loan partial repayment recorded');
ui.renderAdminTransactionsTab();
assert(getOrCreateEl('adminTransactionsTableBody').innerHTML.includes('कर्ज परतफेड'), 'Table contains loan repayment transaction');

// 3. Test filter for only loans
getOrCreateEl('adminTxnModeFilter').value = 'loans';
ui.renderAdminTransactionsTab();
const loansOnlyHtml = getOrCreateEl('adminTransactionsTableBody').innerHTML;
assert(loansOnlyHtml.includes('कर्ज वाटप') && loansOnlyHtml.includes('कर्ज व्याज') && loansOnlyHtml.includes('कर्ज परतफेड'), 'Loans filter shows all loan transactions');
assert(!loansOnlyHtml.includes('आठवडा 1 / ५०'), 'Loans filter does not include regular weekly deposit');

// 4. Test filter for only deposits
getOrCreateEl('adminTxnModeFilter').value = 'deposits';
ui.renderAdminTransactionsTab();
const depositsOnlyHtml = getOrCreateEl('adminTransactionsTableBody').innerHTML;
assert(depositsOnlyHtml.includes('आठवडा 1 / ५०'), 'Deposits filter shows weekly deposit');
assert(!depositsOnlyHtml.includes('DISB-') && !depositsOnlyHtml.includes('INT-REC-'), 'Deposits filter does not show loan disbursement/interest');

// 5. Test Loan Accounts View
ui.renderAdminTxnLoanAccounts();
const loanAccountsHtml = getOrCreateEl('adminTxnLoanAccountsTableBody').innerHTML;
assert(loanAccountsHtml.includes(loanRes.loan.id), 'Loan accounts view includes loan ID');
assert(loanAccountsHtml.includes('10,000'), 'Loan accounts view includes original principal');
assert(loanAccountsHtml.includes('4,000'), 'Loan accounts view includes repaid principal');
assert(loanAccountsHtml.includes('6,000'), 'Loan accounts view includes remaining principal');

// 6. Test subtab switcher
ui.switchAdminTxnSubtab('loanAccounts');
assert(getOrCreateEl('adminTxnTableView').style.display === 'none', 'TableView is hidden in loanAccounts subtab');
assert(getOrCreateEl('adminTxnLoanAccountsView').style.display === 'block', 'LoanAccountsView is displayed in loanAccounts subtab');

ui.switchAdminTxnSubtab('all');
assert(getOrCreateEl('adminTxnTableView').style.display === 'block', 'TableView is displayed in all subtab');
assert(getOrCreateEl('adminTxnLoanAccountsView').style.display === 'none', 'LoanAccountsView is hidden in all subtab');

// 7. Verify Footer Stats
assert(getOrCreateEl('adminTxnTotalDeposits').textContent.includes('500'), 'Footer has total deposits: ₹500');
assert(getOrCreateEl('adminTxnTotalLoansDisbursed').textContent.includes('10,000'), 'Footer has total loans disbursed: ₹10,000');
assert(getOrCreateEl('adminTxnTotalLoanInterest').textContent.includes('300'), 'Footer has total loan interest: ₹300');
assert(getOrCreateEl('adminTxnTotalLoansRepaid').textContent.includes('4,000'), 'Footer has total loans repaid: ₹4,000');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 ALL ADMIN LEDGER LOAN TESTS PASSED!');
} else {
  process.exit(1);
}
