// test_ledger_report.js
const fs = require('fs');

const localStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = val; },
  removeItem: (key) => { delete localStorageData[key]; }
};

global.window = {
  bishiStore: null,
  receiptManager: null,
  authManager: {
    isAdmin: () => true
  }
};
global.document = {
  getElementById: () => null,
  createElement: () => ({ style: {} })
};

// Load translit helper
const translitCode = fs.readFileSync('./js/marathi_translit.js', 'utf-8');
eval(translitCode);

// Load store.js
const storeCode = fs.readFileSync('./js/store.js', 'utf-8');
eval(storeCode);

// Load receipt.js
const receiptCode = fs.readFileSync('./js/receipt.js', 'utf-8');
eval(receiptCode);

console.log('--- Testing Member Ledger Card Report Generation (100% Marathi) ---');
const member = window.bishiStore.addMember({
  name: 'सुशांत पाटील (Sushant Patil)',
  phone: '9876543210',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'प्रिया पाटील',
  notes: 'दुकान क्र. ४, मुख्य बाजारपेठ',
  initialDeposit: 1000,
  paymentMode: 'UPI'
});

// Record a payment for week 2
window.bishiStore.recordPayment(member.id, 2, 1000, 'Cash', 'नियमित हप्ता', 50);

// Add a loan
if (window.bishiStore.disburseLoan) {
  window.bishiStore.disburseLoan({
    memberId: member.id,
    principal: 10000,
    interestRatePercent: 2,
    disbursedWeek: 2,
    purpose: 'व्यवसाय भांडवल'
  });
}

console.log('Testing with member:', member.id, member.name);

// 1. Test generateMemberLedgerReportHTML
const htmlActive = window.receiptManager.generateMemberLedgerReportHTML(member, null, false);
console.log('HTML length (active weeks):', htmlActive.length);
console.log('Sample of generated HTML:');
console.log(htmlActive.slice(0, 750));

// Assert required Marathi markers
const expectedMarathiMarkers = [
  'सदस्य खातावही कार्ड रजिस्टर',
  'कार्यालय: मुख्य कार्यालय',
  'तारीख:',
  'पृष्ठ: १ / १',
  'खाते क्र.:',
  'सभासदाचे नाव:',
  'साप्ताहिक हप्ता:',
  'पत्ता व मोबाईल:',
  'एकूण बीशी परतावा:',
  'लाभांश व व्याज दर:',
  'अ.क्र.',
  'तारीख',
  'जमा हप्ता',
  'एकूण जमा',
  'दंड',
  'कर्ज वाटप',
  'कर्ज परतफेड मुद्दल',
  'कर्ज व्याज जमा',
  'शिल्लक बाकी',
  'एकूण',
  '१) टाकणी: वारस: प्रिया पाटील',
  '२) लाभांश / परतावा व्याज',
  '३) खाते क्र.:',
  '४) एकूण अंतिम परतावा:',
  'सचिव / अध्यक्ष'
];

let allPassed = true;
for (const marker of expectedMarathiMarkers) {
  if (!htmlActive.includes(marker)) {
    console.error('MISSING REQUIRED MARATHI MARKER:', marker);
    allPassed = false;
  }
}

// Assert that English labels are NOT present
const forbiddenEnglishMarkers = [
  'Member Ledger Card Register',
  'Office:',
  'Date:',
  'Page 1 / 1',
  'Account No:',
  'Customer Name:',
  'Installment:',
  'Address / Mobile:',
  'Total Bishi',
  'Dividend / Interest',
  'Sr.',
  'Loan Given',
  'Loan Repayment',
  'Balance Due',
  'TOTAL',
  'Secretary / President',
  '(Sushant Patil)',
  'Weekly',
  'Base:',
  'Annually at Payout'
];

for (const forbidden of forbiddenEnglishMarkers) {
  if (htmlActive.includes(forbidden)) {
    console.error('FORBIDDEN ENGLISH MARKER FOUND IN HTML:', forbidden);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('FAILED: English markers detected or Marathi markers missing.');
  process.exit(1);
} else {
  console.log('SUCCESS: Report HTML is 100% Marathi with zero English labels!');
}

// 2. Test generateMemberLedgerWhatsAppText
const waText = window.receiptManager.generateMemberLedgerWhatsAppText(member);
console.log('\n--- WhatsApp Ledger Report Sample ---');
console.log(waText);

if (!waText.includes('सदस्य खातावही कार्ड रजिस्टर') || !waText.includes('खातेदार:') || waText.includes('MEMBER LEDGER CARD REGISTER') || waText.includes('(Sushant Patil)')) {
  console.error('WhatsApp report validation failed: unexpected English or missing Marathi');
  process.exit(1);
}

// 3. Test missed deposit paid in next week: शिल्लक बाकी should show '-' for cleared week
console.log('\n--- Testing Cleared Missed Deposit in Ledger Card ---');
window.bishiStore.state.meta.currentWeek = 5;
const testMember = window.bishiStore.addMember({
  name: 'राजेश शिंदे (Rajesh Shinde)',
  phone: '9822001122',
  weeklyAmount: 500,
  startWeek: 1
});
window.bishiStore.recordPayment(testMember.id, 1, 500, 'Cash');
window.bishiStore.recordPayment(testMember.id, 2, 500, 'Cash');
// Week 3 missed (0 paid)
// Week 4 paid 1000 (covers week 3 and 4)
window.bishiStore.recordPayment(testMember.id, 4, 1000, 'Cash');

const updatedTestMember = window.bishiStore.getMember(testMember.id);
const testStats = window.bishiStore.calculateMemberStats(updatedTestMember);
console.log('Test member effectivePaidWeeks:', testStats.effectivePaidWeeks, '(Expected: 4)');
if (testStats.effectivePaidWeeks < 4) {
  console.error('FAILED: Member effectivePaidWeeks should be 4');
  process.exit(1);
}

const ledgerHtml = window.receiptManager.generateMemberLedgerReportHTML(updatedTestMember, null, true);

// Extract rows from tbody
const tbodyMatch = ledgerHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
if (!tbodyMatch) {
  console.error('FAILED: No tbody found in ledgerHtml');
  process.exit(1);
}
const rowMatches = tbodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g);
console.log('Total rows rendered:', rowMatches ? rowMatches.length : 0);

// Row index 2 is Week 3 (1-indexed 3rd row)
const week3Row = rowMatches[2];
console.log('Week 3 row HTML:\n', week3Row.trim());

// The last cell is "शिल्लक बाकी"
const week3Cells = week3Row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
const week3BalanceCell = week3Cells[week3Cells.length - 1];
console.log('Week 3 balance cell:', week3BalanceCell.trim());

if (week3BalanceCell.includes('₹500')) {
  console.error('FAILED: Week 3 should NOT show ₹500 when cleared by next week payment!');
  process.exit(1);
}
if (!week3BalanceCell.includes('>-<') && !week3BalanceCell.includes('-\n') && !week3BalanceCell.trim().endsWith('-</td>')) {
  console.error('FAILED: Week 3 balance cell should show "-" (dash/blank)');
  process.exit(1);
}
console.log('SUCCESS: Week 3 correctly displays "-" (blank) after being cleared by next week payment!');

// Row index 3 is Week 4 (1-indexed 4th row)
const week4Row = rowMatches[3];
const week4Cells = week4Row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
const week4BalanceCell = week4Cells[week4Cells.length - 1];
console.log('Week 4 balance cell:', week4BalanceCell.trim());
if (!week4BalanceCell.includes('₹0')) {
  console.error('FAILED: Week 4 balance cell should show ₹0');
  process.exit(1);
}
console.log('SUCCESS: Week 4 correctly displays "₹0"!');

console.log('\nALL PURE MARATHI LEDGER REPORT TESTS PASSED PERFECTLY!');
