const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const requiredIds = [
  'payLoanInterestModal',
  'payLoanInterestForm',
  'payLoanInterestLoanId',
  'payLoanInterestMemberName',
  'payLoanInterestMemberMeta',
  'payLoanInterestCycleBadge',
  'payLoanInterestAmountDisplay',
  'payLoanInterestPrincipalDisplay',
  'payLoanInterestLastPaidDisplay',
  'payLoanInterestDurationDisplay',
  'payLoanInterestTotalPaidDisplay',
  'payLoanInterestAmountInput',
  'payLoanInterestWeek',
  'payLoanInterestDate',
  'payLoanInterestMode',
  'payLoanInterestUpiGroup',
  'payLoanInterestUpiId',
  'payLoanInterestNotes',
  'adminLoansTableBody',
  'custActiveLoansContainer',
  'custLoansTableBody',
  'custTotalOverallDueDisplay',
  'custDueWeeklyBishi',
  'custDueLoanPrincipal',
  'custDueLoanInterest'
];

let missing = [];
requiredIds.forEach(id => {
  if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
    missing.push(id);
  }
});

console.log('Missing DOM IDs:', missing);
if (missing.length === 0) {
  console.log('✅ ALL REQUIRED DOM IDs PRESENT AND MATCHING IN index.html!');
}
