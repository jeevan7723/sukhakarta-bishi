const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to convert JS object to Firestore format
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const k in val) {
      fields[k] = toFirestoreValue(val[k]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function convertObjectToFirestoreDoc(obj) {
  const fields = {};
  for (const k in obj) {
    fields[k] = toFirestoreValue(obj[k]);
  }
  return { fields };
}

// 1. Rebuild SKB-001 (aditya patil)
const member1 = {
  id: 'SKB-001',
  name: 'aditya patil',
  phone: '1234567890',
  password: '7890',
  weeklyAmount: 500,
  startWeek: 1,
  nominee: '',
  notes: '',
  joinDate: '2026-09-04',
  status: 'active',
  currentCycle: 1,
  pastCycles: [],
  payoutStatus: 'pending',
  payoutDetails: null,
  weeks: []
};

for (let w = 1; w <= 50; w++) {
  if (w <= 21) {
    member1.weeks.push({
      weekNumber: w,
      status: 'paid',
      amountPaid: 500,
      finePaid: 0,
      paidDate: '2026-09-04',
      paymentMode: 'Cash',
      receiptNo: `REC-SKB-001-W${w}-2391`,
      notes: ''
    });
  } else {
    member1.weeks.push({
      weekNumber: w,
      status: 'pending',
      amountPaid: 0,
      finePaid: 0,
      paidDate: null,
      paymentMode: '',
      receiptNo: null,
      notes: ''
    });
  }
}

// 2. Rebuild SKB-002 (sarvesh nalwade)
const member2 = {
  id: 'SKB-002',
  name: 'sarvesh nalwade',
  phone: '1234567890',
  password: '7890',
  weeklyAmount: 1000,
  startWeek: 1,
  nominee: 'N/A',
  notes: '',
  joinDate: '2026-09-04',
  status: 'active',
  currentCycle: 1,
  pastCycles: [],
  payoutStatus: 'pending',
  payoutDetails: null,
  weeks: []
};

for (let w = 1; w <= 50; w++) {
  if (w === 21) {
    member2.weeks.push({
      weekNumber: 21,
      status: 'paid',
      amountPaid: 21000,
      finePaid: 0,
      paidDate: '2026-09-04',
      paymentMode: 'Cash',
      receiptNo: 'REC-SKB-002-W21-6361',
      notes: 'साप्ताहिक हप्ता (एकूण भरणा: ₹21,000)'
    });
  } else if (w === 30) {
    member2.weeks.push({
      weekNumber: 30,
      status: 'paid',
      amountPaid: 9000,
      finePaid: 0,
      paidDate: '2026-09-04',
      paymentMode: 'Cash',
      receiptNo: 'REC-SKB-002-W30-5620',
      notes: 'साप्ताहिक हप्ता (एकूण भरणा: ₹9,000)'
    });
  } else if (w === 31) {
    member2.weeks.push({
      weekNumber: 31,
      status: 'paid',
      amountPaid: 1000,
      finePaid: 0,
      paidDate: '2026-09-04',
      paymentMode: 'Cash',
      receiptNo: 'REC-SKB-002-W31-1579',
      notes: 'साप्ताहिक हप्ता'
    });
  } else if (w === 32) {
    member2.weeks.push({
      weekNumber: 32,
      status: 'paid',
      amountPaid: 19000,
      finePaid: 0,
      paidDate: '2026-09-05',
      paymentMode: 'Cash',
      receiptNo: 'REC-SKB-002-W32-BULK-1044',
      notes: 'एकत्रित हप्ता भरणा (पूर्ण ५० आठवडे)'
    });
  } else {
    // Covered weeks
    member2.weeks.push({
      weekNumber: w,
      status: 'paid',
      amountPaid: 0,
      finePaid: 0,
      paidDate: '2026-09-05',
      paymentMode: 'Cash',
      receiptNo: 'REC-SKB-002-W32-BULK-1044',
      notes: 'अगाऊ जमा (Advance Clear)'
    });
  }
}

// 3. Transactions
const transactions = [
  {
    id: 'TXN-SKB-002-W32',
    memberId: 'SKB-002',
    memberName: 'sarvesh nalwade',
    cycleNumber: 1,
    weekNumber: 32,
    depositAmount: 19000,
    fineAmount: 0,
    totalAmount: 19000,
    date: '2026-09-05T10:00:00.000Z',
    paymentMode: 'Cash',
    receiptNo: 'REC-SKB-002-W32-BULK-1044',
    note: 'साप्ताहिक हप्ता (एकूण भरणा: ₹19,000 • पूर्ण ५० आठवडे उद्दिष्ट साध्य)'
  },
  {
    id: 'TXN-SKB-002-W31',
    memberId: 'SKB-002',
    memberName: 'sarvesh nalwade',
    cycleNumber: 1,
    weekNumber: 31,
    depositAmount: 1000,
    fineAmount: 0,
    totalAmount: 1000,
    date: '2026-09-04T16:00:00.000Z',
    paymentMode: 'Cash',
    receiptNo: 'REC-SKB-002-W31-1579',
    note: 'साप्ताहिक हप्ता'
  },
  {
    id: 'TXN-SKB-002-W30',
    memberId: 'SKB-002',
    memberName: 'sarvesh nalwade',
    cycleNumber: 1,
    weekNumber: 30,
    depositAmount: 9000,
    fineAmount: 0,
    totalAmount: 9000,
    date: '2026-09-04T15:00:00.000Z',
    paymentMode: 'Cash',
    receiptNo: 'REC-SKB-002-W30-5620',
    note: 'साप्ताहिक हप्ता (एकूण भरणा: ₹9,000)'
  },
  {
    id: 'TXN-SKB-002-W21',
    memberId: 'SKB-002',
    memberName: 'sarvesh nalwade',
    cycleNumber: 1,
    weekNumber: 21,
    depositAmount: 21000,
    fineAmount: 0,
    totalAmount: 21000,
    date: '2026-09-04T14:00:00.000Z',
    paymentMode: 'Cash',
    receiptNo: 'REC-SKB-002-W21-6361',
    note: 'साप्ताहिक हप्ता (एकूण भरणा: ₹21,000)'
  },
  {
    id: 'TXN-SKB-001-W1',
    memberId: 'SKB-001',
    memberName: 'aditya patil',
    cycleNumber: 1,
    weekNumber: 1,
    depositAmount: 10500,
    fineAmount: 0,
    totalAmount: 10500,
    date: '2026-09-04T12:00:00.000Z',
    paymentMode: 'Cash',
    receiptNo: 'REC-SKB-001-W1-4210',
    note: 'सदस्य हप्ता भरणा (२१ आठवडे अगाऊ जमा)'
  }
];

// 4. Meta
const meta = {
  bishiName: 'सुखकर्ता बीशी',
  subtitle: '५०-आठवडे बचत व फंड व्यवस्थापन',
  currency: '₹',
  totalWeeks: 50,
  currentWeek: 4,
  defaultFineAmount: 50,
  maturityInterestPercent: 8,
  autoApplyFine: true,
  startDate: '2026-09-04',
  lastUpdated: Date.now(),
  updateVersion: 25
};

const fullState = {
  meta,
  members: [member1, member2],
  settledMembers: [],
  transactions,
  loans: [],
  _updatedAt: new Date().toISOString(),
  _lastUpdatedBy: 'Admin Recovery'
};

// 5. Save local backup files
const backupJsonStr = JSON.stringify(fullState, null, 2);
const projectBackupPath = path.resolve(__dirname, '..', 'recovered_backup.json');
fs.writeFileSync(projectBackupPath, backupJsonStr, 'utf8');
console.log('✅ Saved project backup to:', projectBackupPath);

const downloadsBackupPath = 'C:\\Users\\JEEVAN\\Downloads\\सुखकर्ता_बीशी_पुनर्प्राप्त_बॅकअप.json';
fs.writeFileSync(downloadsBackupPath, backupJsonStr, 'utf8');
console.log('✅ Saved Downloads backup to:', downloadsBackupPath);

// 6. Push to Firestore REST API
const firestorePayload = convertObjectToFirestoreDoc(fullState);
const postData = JSON.stringify(firestorePayload);

const options = {
  hostname: 'firestore.googleapis.com',
  port: 443,
  path: '/v1/projects/sukhakarta-bishi/databases/(default)/documents/sukhakarta_bishi/live_state',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Pushing recovered state to Firestore Cloud...');
const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log(`Firestore response status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('🎉 SUCCESS: Recovered data successfully written to Firebase Firestore Cloud!');
    } else {
      console.error('Firestore returned error:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('HTTPS request error:', e);
});

req.write(postData);
req.end();
