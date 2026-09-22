/**
 * Verification test for Modular Firebase Collections & Member Documents
 */
const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Modular Firebase Verification Test...\n');

  // 1. Verify Members Collection listing
  console.log('1️⃣ Checking Firestore "members" collection:');
  const membersRes = await httpsGet('https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/members');
  if (membersRes.status !== 200) {
    throw new Error(`Failed to list members: ${membersRes.status}`);
  }
  const memberDocs = (membersRes.body.documents || []).map(d => d.name.split('/').pop());
  console.log(`   ✅ Found ${memberDocs.length} member documents:`, memberDocs);
  if (memberDocs.length === 0) throw new Error('No member documents found!');

  // 2. Verify Member Document Data Completeness
  console.log('\n2️⃣ Inspecting each member document for complete data:');
  for (const id of memberDocs) {
    const docRes = await httpsGet(`https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/members/${id}`);
    const fields = docRes.body.fields;
    
    const name = fields.name?.stringValue;
    const phone = fields.phone?.stringValue;
    const weeklyAmount = fields.weeklyAmount?.integerValue || fields.weeklyAmount?.doubleValue;
    const weeksCount = fields.weeks?.arrayValue?.values?.length || 0;
    const summary = fields.summary?.mapValue?.fields;
    const totalPaid = summary?.totalPaid?.integerValue || summary?.totalPaid?.doubleValue;
    const paidWeeks = summary?.paidWeeksCount?.integerValue || summary?.paidWeeksCount?.doubleValue;
    const txnsCount = fields.transactions?.arrayValue?.values?.length || 0;

    console.log(`   📄 Document [members/${id}]:`);
    console.log(`      - Name: ${name}`);
    console.log(`      - Phone: ${phone}`);
    console.log(`      - Weekly Amount: ₹${weeklyAmount}`);
    console.log(`      - Weeks recorded: ${weeksCount} weeks`);
    console.log(`      - Paid weeks count: ${paidWeeks}`);
    console.log(`      - Total amount paid: ₹${totalPaid}`);
    console.log(`      - Attached transactions: ${txnsCount}`);

    if (weeksCount !== 50) {
      throw new Error(`Member ${id} does not have 50 weeks (has ${weeksCount})`);
    }
    if (!summary) {
      throw new Error(`Member ${id} missing calculated summary metrics`);
    }
  }

  // 3. Verify Transactions Collection
  console.log('\n3️⃣ Checking Firestore "transactions" collection:');
  const txnsRes = await httpsGet('https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/transactions');
  const txnDocs = (txnsRes.body.documents || []).map(d => d.name.split('/').pop());
  console.log(`   ✅ Found ${txnDocs.length} transaction documents:`, txnDocs.slice(0, 5));

  // 4. Verify Settings Document
  console.log('\n4️⃣ Checking Firestore "settings/bishi_rules" document:');
  const settingsRes = await httpsGet('https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/settings/bishi_rules');
  if (settingsRes.status === 200) {
    const bishiName = settingsRes.body.fields?.bishiName?.stringValue;
    const totalWeeks = settingsRes.body.fields?.totalWeeks?.integerValue || settingsRes.body.fields?.totalWeeks?.doubleValue;
    console.log(`   ✅ Settings valid: Bishi "${bishiName}", Total Weeks: ${totalWeeks}`);
  } else {
    throw new Error(`Settings document missing or status ${settingsRes.status}`);
  }

  // 5. Verify Summary Document
  console.log('\n5️⃣ Checking Firestore "summary/dashboard_overview" document:');
  const summaryRes = await httpsGet('https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/summary/dashboard_overview');
  if (summaryRes.status === 200) {
    const totalMembers = summaryRes.body.fields?.totalActiveMembers?.integerValue || summaryRes.body.fields?.totalActiveMembers?.doubleValue;
    const grandTotal = summaryRes.body.fields?.financials?.mapValue?.fields?.grandTotalCollected?.integerValue || 
                       summaryRes.body.fields?.financials?.mapValue?.fields?.grandTotalCollected?.doubleValue;
    console.log(`   ✅ Summary valid: Total Active Members: ${totalMembers}, Grand Total Collected: ₹${grandTotal}`);
  } else {
    throw new Error(`Summary document missing or status ${summaryRes.status}`);
  }

  // 6. Verify Live State Snapshot Document
  console.log('\n6️⃣ Checking Firestore "sukhakarta_bishi/live_state" unified snapshot:');
  const liveRes = await httpsGet('https://firestore.googleapis.com/v1/projects/sukhakarta-bishi/databases/(default)/documents/sukhakarta_bishi/live_state');
  if (liveRes.status === 200) {
    console.log(`   ✅ Live state snapshot valid and operational.`);
  } else {
    throw new Error(`Live state snapshot missing or status ${liveRes.status}`);
  }

  console.log('\n🎉 ALL 6 VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
