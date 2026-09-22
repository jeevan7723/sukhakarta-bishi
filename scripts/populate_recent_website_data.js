/**
 * Populates Cloud Firestore with the RECENT website data from latest_download_backup.json:
 * - members/SKB-001 & members/SKB-002 with all 50 weeks, transactions, and loans
 * - transactions (all 10 transactions)
 * - loans (LN-SKB-001-01)
 * - settings/bishi_rules
 * - summary/dashboard_overview
 * - sukhakarta_bishi/live_state
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to convert JS value to Firestore REST API value
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

function writeFirestoreDoc(collectionPath, docId, data) {
  return new Promise((resolve, reject) => {
    const firestorePayload = convertObjectToFirestoreDoc(data);
    const postData = JSON.stringify(firestorePayload);

    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/sukhakarta-bishi/databases/(default)/documents/${collectionPath}/${encodeURIComponent(docId)}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, collection: collectionPath, docId });
        } else {
          reject(new Error(`Failed to write ${collectionPath}/${docId}: [${res.statusCode}] ${responseData}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function buildMemberDocument(member, allTransactions, allLoans, meta) {
  const totalWeeks = Number(meta.totalWeeks) || 50;
  const maturityPercent = Number(meta.maturityInterestPercent) || 8;

  const memberTxns = allTransactions.filter(t => t.memberId === member.id);
  const memberLoans = allLoans.filter(l => l.memberId === member.id);

  let totalDeposited = 0;
  let totalFinePaid = 0;
  let paidWeeksCount = 0;
  let pendingWeeksCount = 0;

  if (Array.isArray(member.weeks)) {
    member.weeks.forEach(w => {
      const deposit = Number(w.amountPaid) || 0;
      const fine = Number(w.finePaid) || 0;
      totalDeposited += deposit;
      totalFinePaid += fine;
      if (w.status === 'paid') {
        paidWeeksCount++;
      } else if (w.status === 'pending' || w.status === 'partial') {
        pendingWeeksCount++;
      }
    });
  }

  const weeklyAmt = Number(member.weeklyAmount) || 1000;
  const expectedTotalContribution = weeklyAmt * totalWeeks;
  const projectedInterest = Math.round((expectedTotalContribution * maturityPercent) / 100);
  const projectedMaturityAmount = expectedTotalContribution + projectedInterest;

  return {
    id: member.id,
    name: member.name || '',
    phone: member.phone || '',
    password: member.password || '',
    weeklyAmount: weeklyAmt,
    startWeek: Number(member.startWeek) || 1,
    nominee: member.nominee || '',
    notes: member.notes || '',
    joinDate: member.joinDate || new Date().toISOString().split('T')[0],
    status: member.status || 'active',
    currentCycle: Number(member.currentCycle) || 1,
    pastCycles: member.pastCycles || [],
    payoutStatus: member.payoutStatus || 'pending',
    payoutDetails: member.payoutDetails || null,
    weeks: member.weeks || [],
    summary: {
      totalDeposited,
      totalFinePaid,
      totalPaid: totalDeposited + totalFinePaid,
      paidWeeksCount,
      pendingWeeksCount,
      totalWeeks,
      completionRatePercent: totalWeeks > 0 ? Math.round((paidWeeksCount / totalWeeks) * 100) : 0,
      expectedTotalContribution,
      projectedMaturityAmount,
      balanceToMaturity: Math.max(0, expectedTotalContribution - totalDeposited)
    },
    transactions: memberTxns,
    loans: memberLoans,
    _section: 'members',
    _updatedAt: new Date().toISOString(),
    _version: '2.0'
  };
}

async function populateRecentData() {
  console.log('🚀 Loading recent website backup data...');
  const backupPath = path.resolve(__dirname, '..', 'latest_download_backup.json');
  const state = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  const members = state.members || [];
  const transactions = state.transactions || [];
  const loans = state.loans || [];
  const meta = state.meta || {};

  meta.lastUpdated = Date.now();
  meta.updateVersion = (Number(meta.updateVersion) || 0) + 1;

  console.log(`Found ${members.length} members, ${transactions.length} transactions, ${loans.length} loans.`);

  // 1. Write Members collection
  console.log('\n--- Writing Member Documents (Collection: "members") ---');
  for (const m of members) {
    const doc = buildMemberDocument(m, transactions, loans, meta);
    await writeFirestoreDoc('members', m.id, doc);
    console.log(`✅ [members/${m.id}]: Saved "${m.name}" (${doc.weeks.length} weeks, ${doc.transactions.length} txns, ${doc.loans.length} loans).`);
  }

  // 2. Write Transactions collection
  console.log('\n--- Writing Transaction Documents (Collection: "transactions") ---');
  for (const txn of transactions) {
    await writeFirestoreDoc('transactions', txn.id, {
      ...txn,
      _section: 'transactions',
      _updatedAt: new Date().toISOString()
    });
    console.log(`✅ [transactions/${txn.id}]: Saved txn for ${txn.memberName} (Week ${txn.weekNumber}, ₹${txn.totalAmount || txn.depositAmount || txn.amount}).`);
  }

  // 3. Write Loans collection
  console.log('\n--- Writing Loan Documents (Collection: "loans") ---');
  for (const loan of loans) {
    await writeFirestoreDoc('loans', loan.id, {
      ...loan,
      _section: 'loans',
      _updatedAt: new Date().toISOString()
    });
    console.log(`✅ [loans/${loan.id}]: Saved loan for ${loan.memberName} (₹${loan.principalAmount}).`);
  }

  // 4. Write Settings collection
  console.log('\n--- Writing Settings Section (Collection: "settings") ---');
  await writeFirestoreDoc('settings', 'bishi_rules', {
    ...meta,
    _section: 'settings',
    _updatedAt: new Date().toISOString()
  });
  console.log(`✅ [settings/bishi_rules]: Saved settings (Current Week: ${meta.currentWeek}).`);

  // 5. Write Summary collection
  console.log('\n--- Writing Summary Section (Collection: "summary") ---');
  let totalBishiDeposits = 0;
  let totalBishiFines = 0;
  members.forEach(m => {
    (m.weeks || []).forEach(w => {
      totalBishiDeposits += Number(w.amountPaid) || 0;
      totalBishiFines += Number(w.finePaid) || 0;
    });
  });

  const summaryDoc = {
    bishiName: meta.bishiName || 'सुखकर्ता बीशी',
    currentWeek: meta.currentWeek || 1,
    totalWeeks: meta.totalWeeks || 50,
    totalActiveMembers: members.length,
    totalSettledMembers: 0,
    totalTransactionsCount: transactions.length,
    totalLoansCount: loans.length,
    financials: {
      totalDeposited: totalBishiDeposits,
      totalFines: totalBishiFines,
      grandTotalCollected: totalBishiDeposits + totalBishiFines
    },
    _section: 'summary',
    _updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('summary', 'dashboard_overview', summaryDoc);
  console.log(`✅ [summary/dashboard_overview]: Saved summary.`);

  // 6. Write sukhakarta_bishi/live_state
  console.log('\n--- Writing Unified Snapshot (sukhakarta_bishi/live_state) ---');
  const livePayload = {
    ...state,
    meta,
    _updatedAt: new Date().toISOString(),
    _lastUpdatedBy: 'Website Recent Sync'
  };
  await writeFirestoreDoc('sukhakarta_bishi', 'live_state', livePayload);
  console.log('✅ [sukhakarta_bishi/live_state]: Updated atomic state.');

  // Also update recovered_backup.json so it matches the recent data
  fs.writeFileSync(path.resolve(__dirname, '..', 'recovered_backup.json'), JSON.stringify(livePayload, null, 2), 'utf8');
  console.log('✅ Updated recovered_backup.json with recent website data.');

  console.log('\n🎉 RECENT WEBSITE DATA HAS BEEN FULLY POPULATED TO FIREBASE!');
}

populateRecentData().catch(err => {
  console.error('❌ Error populating data:', err);
  process.exit(1);
});
