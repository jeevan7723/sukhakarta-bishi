// Node test script to verify BishiStore calculations and workflows
const fs = require('fs');

// Mock localStorage and window
const localStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = val; },
  removeItem: (key) => { delete localStorageData[key]; }
};
global.window = {};

// Load store.js
const storeCode = fs.readFileSync('./js/store.js', 'utf-8');
eval(storeCode);

const store = window.bishiStore;
console.log('--- Initial Demo State ---');
const initialStats = store.getDashboardStats();
console.log('Total Members:', initialStats.totalMembers);
console.log('50-Week Fund Target Pool:', initialStats.totalFundTarget);
console.log('Total All Time Collected:', initialStats.totalAllTimeCollected);
console.log('Current Week:', initialStats.currentWeek);
console.log('Week Collected Amount:', initialStats.weekCollectedAmount);

// Test 1: Add New Member
console.log('\n--- Test 1: Adding New Member ---');
const newMember = store.addMember({
  name: 'Kavita Deshmukh',
  phone: '9823098765',
  weeklyAmount: 2000,
  startWeek: 1,
  nominee: 'Rohit Deshmukh',
  notes: 'Boutique Owner',
  initialDeposit: 2000,
  paymentMode: 'UPI'
});

console.log('New Member Created:', newMember.id, newMember.name);
const mStats = store.calculateMemberStats(newMember);
console.log('Target Total (50 Weeks * 2000):', mStats.totalTarget, '(Expected: 100000)');
console.log('Total Deposited after Week 1 initial deposit:', mStats.totalDeposited, '(Expected: 2000)');
console.log('Remaining Amount:', mStats.remainingAmount, '(Expected: 98000)');
console.log('Next Due Week:', mStats.nextDueWeek, '(Expected: 2)');
console.log('Next Due Amount:', mStats.nextDueAmount, '(Expected: 2000)');
console.log('Progress:', mStats.progressPercent + '%');

if (mStats.totalTarget !== 100000 || mStats.totalDeposited !== 2000) {
  throw new Error('Test 1 failed: Member stats calculation mismatch');
}

// Test 2: Record Payment for Week 2
console.log('\n--- Test 2: Collecting Week 2 Payment ---');
const paymentResult = store.recordPayment(newMember.id, 2, 2000, 'Cash', 'Collected in person');
console.log('Payment Result:', paymentResult.week.status, 'Paid Date:', paymentResult.week.paidDate);
console.log('New Total Deposited:', paymentResult.stats.totalDeposited, '(Expected: 4000)');
console.log('New Next Due Week:', paymentResult.stats.nextDueWeek, '(Expected: 3)');
console.log('Remaining Target:', paymentResult.stats.remainingAmount, '(Expected: 96000)');

if (paymentResult.stats.totalDeposited !== 4000) {
  throw new Error('Test 2 failed: Running total not updated properly');
}

// Test 3: Advance Week to Week 4 & Check Dashboard Aggregates
console.log('\n--- Test 3: Setting Current Week to 4 ---');
store.setCurrentWeek(4);
const wk4Stats = store.getDashboardStats();
console.log('Dashboard stats at Week 4:');
console.log('Current Week:', wk4Stats.currentWeek);
console.log('Week 4 Expected:', wk4Stats.weekExpectedAmount);
console.log('Week 4 Collected:', wk4Stats.weekCollectedAmount);
console.log('Week 4 Pending:', wk4Stats.weekPendingAmount);

// Test 4: Settle & Remove Member
console.log('\n--- Test 4: Settling & Removing Member ---');
const totalBefore = store.getMembers().length;
const settled = store.removeMember(newMember.id, 'Voluntary Exit', 4000);
console.log('Settled Member:', settled.name, 'Refund Amount:', settled.settlementRefundAmount);
const totalAfter = store.getMembers().length;
console.log('Members count before/after removal:', totalBefore, '->', totalAfter);

// Test 5: Extra deposit on Week 2 with Week 1 remaining empty
console.log('\n--- Test 5: Extra Deposit on This Week (Previous Week Empty) ---');
const member2 = store.addMember({
  name: 'Anand Patil',
  phone: '9876543210',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'Pooja Patil',
  notes: 'Shopkeeper',
  initialDeposit: 0
});

console.log('Member 2 created with ₹1,000/week (Week 1 unpaid/empty):', member2.id, member2.name);
// Member pays ₹2,000 in Week 2 (paying for both weeks in Week 2)
store.setCurrentWeek(2);
const paymentResultW2 = store.recordPayment(member2.id, 2, 2000, 'UPI', 'Paid Week 1 + Week 2 together in Week 2', 0, 'anand@upi');

console.log('Week 2 Payment Result:');
console.log('Week 1 amountPaid:', member2.weeks[0].amountPaid, 'status:', member2.weeks[0].status, '(Expected: 0, pending)');
console.log('Week 2 amountPaid:', member2.weeks[1].amountPaid, 'status:', member2.weeks[1].status, '(Expected: 2000, paid)');
console.log('Week 3 amountPaid:', member2.weeks[2].amountPaid, 'status:', member2.weeks[2].status, '(Expected: 0, pending)');
console.log('Total Deposited:', paymentResultW2.stats.totalDeposited, '(Expected: 2000)');
console.log('Next Due Week:', paymentResultW2.stats.nextDueWeek, '(Expected: 3)');
console.log('Overdue Weeks at Week 2:', paymentResultW2.stats.overdueWeeksCount, '(Expected: 0)');

if (member2.weeks[0].amountPaid !== 0 || member2.weeks[1].amountPaid !== 2000 || member2.weeks[1].status !== 'paid') {
  throw new Error('Test 5 failed: Week 2 should hold all ₹2000 deposit and Week 1 should stay empty (0)');
}
if (paymentResultW2.stats.totalDeposited !== 2000 || paymentResultW2.stats.overdueWeeksCount !== 0) {
  throw new Error('Test 5 failed: Cumulative calculation mismatch');
}

// Test 6: Extra amount dashboard stats verification
console.log('\n--- Test 6: Extra Amount Dashboard Stats Verification ---');
store.setCurrentWeek(2);
const statsWithExtra = store.getDashboardStats();
console.log('Week 2 Extra Amount in Dashboard:', statsWithExtra.weekExtraAmount, '(Expected: 1000)');
if (statsWithExtra.weekExtraAmount !== 1000) {
  throw new Error('Test 6 failed: weekExtraAmount calculation mismatch');
}

// Test 7: Cleared week & Past Clearance Logic Verification (W1 unpaid, W2 paid 2000)
console.log('\n--- Test 7: Cleared Week & Past Clearance Logic ---');
const memberStats = store.calculateMemberStats(member2);
console.log('Member 2 Total Deposited:', memberStats.totalDeposited);
console.log('Member 2 Effective Paid Weeks:', memberStats.effectivePaidWeeks, '(Expected: 2)');

const wk1 = member2.weeks[0];
const wk2 = member2.weeks[1];
const wk3 = member2.weeks[2];

const isWk1Paid = wk1.status === 'paid' && Number(wk1.amountPaid) > 0;
const isWk1Cleared = !isWk1Paid && (wk1.weekNumber <= memberStats.effectivePaidWeeks);

const isWk2Paid = wk2.status === 'paid' && Number(wk2.amountPaid) > 0;
const depUpToW2 = member2.weeks.filter(w => w.weekNumber <= 2).reduce((s, w) => s + (Number(w.amountPaid) || 0), 0);
const expUpToW2 = 2 * memberStats.weeklyAmount;
const advanceExtraW2 = Math.max(0, depUpToW2 - expUpToW2);
const isWk2AdvanceExtra = isWk2Paid && (advanceExtraW2 > 0);

console.log('W1 isCleared:', isWk1Cleared, '(Expected: true)');
console.log('W2 isPaid:', isWk2Paid, 'advanceExtraW2:', advanceExtraW2, 'isAdvanceExtra:', isWk2AdvanceExtra, '(Expected: true, 0, false - no jada message when clearing past)');
console.log('W2 amountPaid:', wk2.amountPaid, '(Expected: 2000)');

if (!isWk1Cleared) {
  throw new Error('Test 7 failed: W1 must be marked as isCleared=true');
}
if (!isWk2Paid || isWk2AdvanceExtra || Number(wk2.amountPaid) !== 2000) {
  throw new Error('Test 7 failed: W2 must be paid with 2000, but isAdvanceExtra must be false');
}

// Test 8: Future Week Advance Deposit Logic Verification (W1 paid 2000 for advance of W2)
console.log('\n--- Test 8: Future Week Advance Deposit Logic ---');
const member3 = store.addMember({
  name: 'Sunil Shinde',
  phone: '9123456780',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'Asha Shinde',
  notes: 'Advance Payer',
  initialDeposit: 2000, // 2 weeks advance paid on W1
  paymentMode: 'UPI'
});

const m3Stats = store.calculateMemberStats(member3);
const m3Wk1 = member3.weeks[0];
const m3Wk2 = member3.weeks[1];

const m3DepUpToW1 = member3.weeks.filter(w => w.weekNumber <= 1).reduce((s, w) => s + (Number(w.amountPaid) || 0), 0);
const m3ExpUpToW1 = 1 * m3Stats.weeklyAmount;
const m3AdvanceExtraW1 = Math.max(0, m3DepUpToW1 - m3ExpUpToW1);
const isM3Wk1AdvanceExtra = m3AdvanceExtraW1 > 0;
const isM3Wk2Cleared = (m3Wk2.status !== 'paid' || Number(m3Wk2.amountPaid) === 0) && (m3Wk2.weekNumber <= m3Stats.effectivePaidWeeks);

console.log('Member 3 W1 advanceExtra:', m3AdvanceExtraW1, 'isAdvanceExtra:', isM3Wk1AdvanceExtra, '(Expected: 1000, true - show +1000 jada message)');
console.log('Member 3 W2 isCleared:', isM3Wk2Cleared, '(Expected: true - covered in advance)');

if (!isM3Wk1AdvanceExtra || m3AdvanceExtraW1 !== 1000) {
  throw new Error('Test 8 failed: W1 must have advanceExtra=1000 and isAdvanceExtra=true');
}
if (!isM3Wk2Cleared) {
  throw new Error('Test 8 failed: W2 must be marked as isCleared=true');
}

// Test 9: Partial Payment & Pending Amount Verification
console.log('\n--- Test 9: Partial Payment & Pending Amount Verification ---');
const member4 = store.addMember({
  name: 'Ramesh Kale',
  phone: '9555123456',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'Sunita Kale',
  notes: 'Partial Payer Test',
  initialDeposit: 400 // only paid ₹400 out of ₹1000
});

const m4Stats = store.calculateMemberStats(member4);
const m4Wk1 = member4.weeks[0];
const m4PaidAmt = Number(m4Wk1.amountPaid || 0);
const m4IsFullPaid = m4PaidAmt >= m4Stats.weeklyAmount;
const m4IsPartial = m4PaidAmt > 0 && m4PaidAmt < m4Stats.weeklyAmount;
const m4PendingAmt = m4Stats.weeklyAmount - m4PaidAmt;

console.log('Member 4 W1 amountPaid:', m4PaidAmt, '(Expected: 400)');
console.log('Member 4 W1 isPartial:', m4IsPartial, '(Expected: true)');
console.log('Member 4 W1 pendingAmt:', m4PendingAmt, '(Expected: 600)');
console.log('Member 4 status in weeks[0]:', m4Wk1.status, '(Expected: partial)');

if (!m4IsPartial || m4PaidAmt !== 400 || m4PendingAmt !== 600 || m4Wk1.status !== 'partial') {
  throw new Error('Test 9 failed: Partial week not detected correctly');
}

// Now member4 pays the remaining ₹600
const topupResult = store.recordPayment(member4.id, 1, 600, 'Cash', 'Remaining balance for W1');
const m4UpdatedWk1 = member4.weeks[0];
console.log('After paying ₹600:');
console.log('New amountPaid in W1:', m4UpdatedWk1.amountPaid, '(Expected: 1000)');
console.log('New status in W1:', m4UpdatedWk1.status, '(Expected: paid)');
console.log('New totalDeposited:', topupResult.stats.totalDeposited, '(Expected: 1000)');

if (m4UpdatedWk1.amountPaid !== 1000 || m4UpdatedWk1.status !== 'paid') {
  throw new Error('Test 9 failed: Incremental payment did not complete W1');
}

// Test 10: Week Navigator Pill Status for Advance & Late Payments
console.log('\n--- Test 10: Week Status Calculation for Early / Late Deposits ---');
// Member 3 paid ₹2,000 in Week 1 (so Week 1 and Week 2 are covered)
// Member 4 paid ₹1,000 in Week 1
const members = store.getMembers().filter(m => m.status === 'active');
function getWeekPillStatus(w, currentWk) {
  let fullyPaidCount = 0;
  let partialCount = 0;
  let totalWkAmount = 0;
  members.forEach(m => {
    const stats = store.calculateMemberStats(m);
    const wk = m.weeks.find(item => item.weekNumber === w);
    const paidAmt = Number(wk ? wk.amountPaid : 0) || 0;
    const isMemberDirectPaid = (wk && wk.status === 'paid' && paidAmt >= stats.weeklyAmount) || (paidAmt >= stats.weeklyAmount);
    const isMemberAdvanceCovered = !isMemberDirectPaid && (w <= stats.effectivePaidWeeks);
    const isMemberFullPaid = isMemberDirectPaid || isMemberAdvanceCovered;
    const isMemberPartial = !isMemberFullPaid && (paidAmt > 0 || (wk && wk.status === 'partial'));

    if (isMemberFullPaid) {
      fullyPaidCount++;
      totalWkAmount += (paidAmt > 0 ? paidAmt : stats.weeklyAmount);
    } else if (isMemberPartial) {
      partialCount++;
      totalWkAmount += paidAmt;
    }
  });

  const isCompleted = members.length > 0 && fullyPaidCount === members.length;
  const hasDeposits = (fullyPaidCount > 0 && fullyPaidCount < members.length) || partialCount > 0 || totalWkAmount > 0;
  const isOverdue = (w < currentWk) && !isCompleted && !hasDeposits;
  return { isCompleted, hasDeposits, isOverdue, fullyPaidCount, totalWkAmount };
}

const w1Status = getWeekPillStatus(1, 1);
const w2Status = getWeekPillStatus(2, 1);
const w3Status = getWeekPillStatus(3, 1);

console.log('Week 1 Pill Status:', w1Status);
console.log('Week 2 Pill Status (Early Advance Paid by Member 3):', w2Status);
console.log('Week 3 Pill Status (Pending):', w3Status);

if (!w1Status.isCompleted || w1Status.fullyPaidCount < 2) {
  throw new Error('Test 10 failed: Week 1 should be fully completed');
}
if (!w2Status.hasDeposits || w2Status.fullyPaidCount < 1) {
  throw new Error('Test 10 failed: Week 2 should show deposits from Member 3 advance');
}

// Test 11: Combined previous week payment with empty note (validates auto-note generation)
console.log('\n--- Test 11: Combined Previous Week Payment with Auto-Note Generation ---');
const member5 = store.addMember({
  name: 'Ganesh More',
  phone: '9123456780',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'Asha More',
  notes: 'Combine Test',
  initialDeposit: 0
});
// Member 5 missed Week 1, and now in Week 2 pays combined ₹2000 with empty note
const combineResult = store.recordPayment(member5.id, 2, 2000, 'Cash', '');
console.log('Transaction Note generated:', combineResult.transaction.note);
console.log('Member 5 total deposited:', combineResult.stats.totalDeposited);
console.log('Member 5 effective paid weeks:', combineResult.stats.effectivePaidWeeks);

if (!combineResult.transaction.note.includes('₹2,000') || combineResult.stats.totalDeposited !== 2000 || combineResult.stats.effectivePaidWeeks !== 2) {
  throw new Error('Test 11 failed: Auto note generation for combined payment failed');
}

// Test 12: Pay all remaining weeks at a specific week (Bulk Pay on Week 31)
console.log('\n--- Test 12: Bulk Pay All Remaining Weeks at Specific Week ---');
const member6 = store.addMember({
  name: 'Santosh Jadhav',
  phone: '9888776655',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'Sheetal Jadhav',
  notes: 'Bulk Pay Test',
  initialDeposit: 0
});

// Member 6 pays weeks 1 to 30 normally (₹1000 each)
for (let w = 1; w <= 30; w++) {
  store.recordPayment(member6.id, w, 1000, 'Cash', `Week ${w} regular payment`);
}

const statsBeforeBulk = store.calculateMemberStats(member6);
console.log('Stats before bulk pay:');
console.log('Paid weeks:', statsBeforeBulk.paidWeeksCount, '(Expected: 30)');
console.log('Remaining weeks:', statsBeforeBulk.remainingWeeksCount, '(Expected: 20)');
console.log('Remaining amount:', statsBeforeBulk.remainingAmount, '(Expected: 20000)');

const txnTotalBefore = store.state.transactions.filter(t => t.memberId === member6.id).length;

// Now member 6 pays all remaining 20 weeks (Weeks 31 to 50 = ₹20,000) at Week 31
const bulkResult = store.recordBulkPayment(member6.id, 'UPI', 'santosh@upi', 'Paid all remaining weeks together', 31);

const txnTotalAfter = store.state.transactions.filter(t => t.memberId === member6.id).length;
const member6Updated = store.getMember(member6.id);
const statsAfterBulk = store.calculateMemberStats(member6Updated);

console.log('Stats after bulk pay at Week 31:');
console.log('Transactions created by bulk pay:', txnTotalAfter - txnTotalBefore, '(Expected: 1)');
console.log('Week 31 amountPaid:', member6Updated.weeks[30].amountPaid, '(Expected: 20000)');
console.log('Week 31 status:', member6Updated.weeks[30].status, '(Expected: paid)');
console.log('Week 32 amountPaid:', member6Updated.weeks[31].amountPaid, '(Expected: 0)');
console.log('Week 32 status:', member6Updated.weeks[31].status, '(Expected: paid / cleared)');
console.log('Week 50 amountPaid:', member6Updated.weeks[49].amountPaid, '(Expected: 0)');
console.log('Total deposited:', statsAfterBulk.totalDeposited, '(Expected: 50000)');
console.log('Paid weeks count:', statsAfterBulk.paidWeeksCount, '(Expected: 50)');
console.log('Remaining weeks count:', statsAfterBulk.remainingWeeksCount, '(Expected: 0)');
console.log('Is fully paid:', statsAfterBulk.isFullyPaid, '(Expected: true)');

if (txnTotalAfter - txnTotalBefore !== 1) {
  throw new Error('Test 12 failed: Bulk pay should create exactly 1 transaction');
}
if (member6Updated.weeks[30].amountPaid !== 20000 || member6Updated.weeks[31].amountPaid !== 0 || member6Updated.weeks[49].amountPaid !== 0) {
  throw new Error('Test 12 failed: Only Week 31 must hold 20000 deposit, subsequent weeks must have amountPaid=0');
}
if (statsAfterBulk.totalDeposited !== 50000 || statsAfterBulk.paidWeeksCount !== 50 || statsAfterBulk.remainingWeeksCount !== 0 || !statsAfterBulk.isFullyPaid) {
  throw new Error('Test 12 failed: Total stats after bulk payment do not equal 50 weeks');
}

// Test 13: Passbook Grid display rendering logic for Week 31 vs Week 32-50
console.log('\n--- Test 13: Passbook Grid Rendering Logic Verification ---');
const viewWeeks = member6Updated.weeks;
const currency = '₹';
const stats6 = statsAfterBulk;

viewWeeks.forEach(wk => {
  const paidAmt = Number(wk.amountPaid || 0);
  const weeklyReq = stats6.weeklyAmount;
  const depositedUpToW = viewWeeks.filter(w => w.weekNumber <= wk.weekNumber).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
  const expectedUpToW = wk.weekNumber * weeklyReq;
  const advanceExtraAmt = Math.max(0, depositedUpToW - expectedUpToW);
  const isAdvanceExtra = (paidAmt >= weeklyReq) && (advanceExtraAmt > 0);
  const isCleared = (paidAmt < weeklyReq) && (wk.weekNumber <= stats6.effectivePaidWeeks);
  const isFullPaid = (paidAmt >= weeklyReq);

  let displayAmt = '';
  let statusText = '';
  if (isFullPaid) {
    displayAmt = `${currency}${paidAmt.toLocaleString('en-IN')}`;
    statusText = isAdvanceExtra ? `⭐ +₹${advanceExtraAmt.toLocaleString('en-IN')} जादा` : '✓ जमा';
  } else if (isCleared) {
    displayAmt = '—';
    statusText = '✓ क्लिअर';
  }

  if (wk.weekNumber === 31) {
    console.log(`Week 31 Display: displayAmt=${displayAmt}, statusText=${statusText}`);
    if (displayAmt !== '₹20,000' || !statusText.includes('जादा')) {
      throw new Error('Test 13 failed: Week 31 should show ₹20,000 and extra deposit tag');
    }
  } else if (wk.weekNumber > 31) {
    if (displayAmt !== '—' || statusText !== '✓ क्लिअर') {
      throw new Error(`Test 13 failed: Week ${wk.weekNumber} should display '—' and '✓ क्लिअर', got displayAmt=${displayAmt}, statusText=${statusText}`);
    }
  }
});

console.log('Week 32 to 50 correctly render as displayAmt="—" and status="✓ क्लिअर" without duplicate deposit amounts.');

// Test 14: Clear / Reset single member's payment data
console.log('\n--- Test 14: Reset Member Payments (Clear Data of Specific Member) ---');
const m6TxnsBefore = store.state.transactions.filter(t => t.memberId === member6.id).length;
console.log('Member 6 transactions before reset:', m6TxnsBefore, '(> 0)');
const m6Reset = store.resetMemberPayments(member6.id);
const m6StatsAfterReset = store.calculateMemberStats(m6Reset);
const m6TxnsAfter = store.state.transactions.filter(t => t.memberId === member6.id).length;

console.log('Member 6 after reset:');
console.log('Status:', m6Reset.status, '(Expected: active)');
console.log('Total deposited:', m6StatsAfterReset.totalDeposited, '(Expected: 0)');
console.log('Paid weeks count:', m6StatsAfterReset.paidWeeksCount, '(Expected: 0)');
console.log('Remaining weeks count:', m6StatsAfterReset.remainingWeeksCount, '(Expected: 50)');
console.log('Transactions remaining for member 6:', m6TxnsAfter, '(Expected: 0)');

if (m6StatsAfterReset.totalDeposited !== 0 || m6StatsAfterReset.paidWeeksCount !== 0 || m6TxnsAfter !== 0) {
  throw new Error('Test 14 failed: resetMemberPayments did not clear all payments and transactions');
}

// Test 15: Permanently Delete Member
console.log('\n--- Test 15: Permanently Delete Member ---');
const totalMembersBeforeDelete = store.getMembers().length;
const deleted = store.deleteMemberPermanently(member6.id);
const totalMembersAfterDelete = store.getMembers().length;
const foundMember = store.getMember(member6.id);

console.log('Members count before/after permanent delete:', totalMembersBeforeDelete, '->', totalMembersAfterDelete);
console.log('Found member after delete:', foundMember, '(Expected: null)');

if (foundMember !== null || totalMembersAfterDelete !== totalMembersBeforeDelete - 1) {
  throw new Error('Test 15 failed: deleteMemberPermanently did not completely delete member');
}

// Test 16: Clear All Payments Only (Keep all members registered)
console.log('\n--- Test 16: Clear All Payments Only ---');
const countBeforeClearPayments = store.getMembers().length;
store.clearAllPaymentsOnly();
const countAfterClearPayments = store.getMembers().length;
const allMembers = store.getMembers();
const anyHasDeposits = allMembers.some(m => store.calculateMemberStats(m).totalDeposited > 0);
const allTxnsCount = store.state.transactions.length;

console.log('Members count before/after clear payments:', countBeforeClearPayments, '->', countAfterClearPayments);
console.log('Any member has deposits > 0:', anyHasDeposits, '(Expected: false)');
console.log('Total transactions remaining:', allTxnsCount, '(Expected: 0)');

if (countAfterClearPayments !== countBeforeClearPayments || anyHasDeposits || allTxnsCount !== 0) {
  throw new Error('Test 16 failed: clearAllPaymentsOnly should keep members but clear all payments/transactions');
}

// Test 17: Wipe All Data from Website and Database (Complete Factory Reset)
console.log('\n--- Test 17: Wipe All Data (Complete Factory Reset) ---');
store.clearAllData();
const finalStats = store.getDashboardStats();

console.log('Final stats after full wipe:');
console.log('Total members:', finalStats.totalMembers, '(Expected: 0)');
console.log('Total all time collected:', finalStats.totalAllTimeCollected, '(Expected: 0)');
console.log('Transactions length:', store.state.transactions.length, '(Expected: 0)');
console.log('Current week:', finalStats.currentWeek, '(Expected: 1)');

if (finalStats.totalMembers !== 0 || finalStats.totalAllTimeCollected !== 0 || store.state.transactions.length !== 0) {
  throw new Error('Test 17 failed: clearAllData did not wipe all data');
}

console.log('\n✅ ALL VERIFICATION TESTS (1 to 17) PASSED SUCCESSFULLY! 100% Correct.');



