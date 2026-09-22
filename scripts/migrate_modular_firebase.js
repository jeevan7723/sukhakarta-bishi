/**
 * ==========================================================================
 * SUKHAKARTA BISHI - MODULAR FIREBASE SECTIONS & MEMBER DOCUMENTS MIGRATION
 * ==========================================================================
 * Populates Firestore Cloud with:
 * 1. Collection 'members': Dedicated document per member (SKB-001, SKB-002, etc.)
 *    with all profile details, 50 weeks records, calculated financial summary,
 *    transactions, and loans.
 * 2. Collection 'transactions': Dedicated document per transaction (TXN-...)
 * 3. Collection 'loans': Dedicated document per loan
 * 4. Collection 'settled_members': Dedicated document per settled member
 * 5. Collection 'settings': Document 'bishi_rules'
 * 6. Collection 'summary': Document 'dashboard_overview'
 * 7. Collection 'sukhakarta_bishi': Document 'live_state'
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

// Function to write document to Firestore via REST API
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

// Helper to calculate comprehensive member data
function buildComprehensiveMemberDoc(member, allTransactions = [], allLoans = [], totalWeeks = 50, maturityPercent = 8) {
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

  const expectedTotalContribution = (Number(member.weeklyAmount) || 1000) * totalWeeks;
  const projectedInterest = Math.round((expectedTotalContribution * maturityPercent) / 100);
  const projectedMaturityAmount = expectedTotalContribution + projectedInterest;

  return {
    // Identity
    id: member.id,
    name: member.name,
    phone: member.phone || '',
    password: member.password || '',
    weeklyAmount: Number(member.weeklyAmount) || 1000,
    startWeek: Number(member.startWeek) || 1,
    nominee: member.nominee || '',
    notes: member.notes || '',
    joinDate: member.joinDate || new Date().toISOString().split('T')[0],
    status: member.status || 'active',
    currentCycle: Number(member.currentCycle) || 1,
    pastCycles: member.pastCycles || [],
    payoutStatus: member.payoutStatus || 'pending',
    payoutDetails: member.payoutDetails || null,

    // All 50 Weeks payment records
    weeks: member.weeks || [],

    // Financial Metrics & Aggregates
    summary: {
      totalDeposited: totalDeposited,
      totalFinePaid: totalFinePaid,
      totalPaid: totalDeposited + totalFinePaid,
      paidWeeksCount: paidWeeksCount,
      pendingWeeksCount: pendingWeeksCount,
      totalWeeks: totalWeeks,
      completionRatePercent: totalWeeks > 0 ? Math.round((paidWeeksCount / totalWeeks) * 100) : 0,
      expectedTotalContribution: expectedTotalContribution,
      projectedMaturityAmount: projectedMaturityAmount,
      balanceToMaturity: Math.max(0, expectedTotalContribution - totalDeposited)
    },

    // Specific member's transactions history
    transactions: memberTxns,

    // Specific member's loans
    loans: memberLoans,

    // Cloud Metadata
    _updatedAt: new Date().toISOString(),
    _section: 'members',
    _version: '2.0'
  };
}

async function migrate() {
  console.log('🚀 Starting Modular Firebase Migration...');

  // 1. Load backup / source state
  const backupPath = path.resolve(__dirname, '..', 'recovered_backup.json');
  if (!fs.existsSync(backupPath)) {
    throw new Error('recovered_backup.json not found');
  }

  const state = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const members = state.members || [];
  const settledMembers = state.settledMembers || [];
  const transactions = state.transactions || [];
  const loans = state.loans || [];
  const meta = state.meta || {
    bishiName: 'सुखकर्ता बीशी',
    subtitle: '५०-आठवडे बचत व फंड व्यवस्थापन',
    currency: '₹',
    totalWeeks: 50,
    currentWeek: 21,
    defaultFineAmount: 50,
    maturityInterestPercent: 8,
    startDate: '2026-09-04'
  };

  console.log(`Found ${members.length} members, ${transactions.length} transactions, ${loans.length} loans.`);

  // 2. Write each member to collection 'members'
  console.log('\n--- Writing Individual Member Documents (Collection: "members") ---');
  for (const m of members) {
    const fullDoc = buildComprehensiveMemberDoc(m, transactions, loans, meta.totalWeeks || 50, meta.maturityInterestPercent || 8);
    await writeFirestoreDoc('members', m.id, fullDoc);
    console.log(`✅ [members/${m.id}]: Saved "${m.name}" with all 50 weeks, ${fullDoc.transactions.length} txns, and summary (Total Paid: ₹${fullDoc.summary.totalPaid}).`);
  }

  // 3. Write settled members to collection 'settled_members'
  if (settledMembers.length > 0) {
    console.log('\n--- Writing Settled Members (Collection: "settled_members") ---');
    for (const sm of settledMembers) {
      const fullDoc = buildComprehensiveMemberDoc(sm, transactions, loans, meta.totalWeeks || 50, meta.maturityInterestPercent || 8);
      await writeFirestoreDoc('settled_members', sm.id, fullDoc);
      console.log(`✅ [settled_members/${sm.id}]: Saved settled member "${sm.name}".`);
    }
  }

  // 4. Write transactions to collection 'transactions'
  console.log('\n--- Writing Transaction Documents (Collection: "transactions") ---');
  for (const txn of transactions) {
    const txnDoc = {
      ...txn,
      _section: 'transactions',
      _updatedAt: new Date().toISOString()
    };
    await writeFirestoreDoc('transactions', txn.id, txnDoc);
    console.log(`✅ [transactions/${txn.id}]: Saved txn for ${txn.memberName} (Week ${txn.weekNumber}, ₹${txn.totalAmount || txn.depositAmount}).`);
  }

  // 5. Write loans to collection 'loans'
  if (loans.length > 0) {
    console.log('\n--- Writing Loan Documents (Collection: "loans") ---');
    for (const loan of loans) {
      const loanDoc = {
        ...loan,
        _section: 'loans',
        _updatedAt: new Date().toISOString()
      };
      await writeFirestoreDoc('loans', loan.id, loanDoc);
      console.log(`✅ [loans/${loan.id}]: Saved loan.`);
    }
  }

  // 6. Write settings to collection 'settings' -> doc 'bishi_rules'
  console.log('\n--- Writing Settings Section (Collection: "settings" / Doc: "bishi_rules") ---');
  const settingsDoc = {
    ...meta,
    _section: 'settings',
    _updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('settings', 'bishi_rules', settingsDoc);
  console.log(`✅ [settings/bishi_rules]: Saved Bishi group configuration.`);

  // 7. Write financial overview to collection 'summary' -> doc 'dashboard_overview'
  console.log('\n--- Writing Summary Section (Collection: "summary" / Doc: "dashboard_overview") ---');
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
    totalSettledMembers: settledMembers.length,
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
  console.log(`✅ [summary/dashboard_overview]: Saved dashboard metrics (Grand Total: ₹${summaryDoc.financials.grandTotalCollected}).`);

  // 8. Update live_state as unified state
  console.log('\n--- Writing Live State Unified Snapshot (Collection: "sukhakarta_bishi" / Doc: "live_state") ---');
  const unifiedPayload = {
    ...state,
    _updatedAt: new Date().toISOString(),
    _lastUpdatedBy: 'Modular Migration Engine'
  };
  await writeFirestoreDoc('sukhakarta_bishi', 'live_state', unifiedPayload);
  console.log('✅ [sukhakarta_bishi/live_state]: Updated atomic state.');

  console.log('\n🎉 Modular Firebase Migration Completed Successfully!');
}

migrate().catch(err => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
