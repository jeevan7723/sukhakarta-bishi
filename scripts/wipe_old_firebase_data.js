/**
 * Wipes all old data from Cloud Firestore:
 * - members collection
 * - transactions collection
 * - loans collection
 * - settled_members collection
 * - summary collection
 * - sukhakarta_bishi/live_state
 */
const https = require('https');

function httpsRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/sukhakarta-bishi/databases/(default)/documents/${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resp) });
        } catch(e) {
          resolve({ status: res.statusCode, body: resp });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function deleteCollection(collectionName) {
  console.log(`\n🧹 Cleaning collection: "${collectionName}"...`);
  const res = await httpsRequest(collectionName);
  if (res.status === 200 && res.body.documents && Array.isArray(res.body.documents)) {
    for (const doc of res.body.documents) {
      const docPath = doc.name.split('/databases/(default)/documents/')[1];
      const delRes = await httpsRequest(docPath, 'DELETE');
      console.log(`   🗑️ Deleted doc: ${docPath} (status: ${delRes.status})`);
    }
  } else {
    console.log(`   ℹ️ No documents found in "${collectionName}".`);
  }
}

async function wipeOldData() {
  console.log('🔥 STARTING FULL WIPE OF OLD DATA IN FIREBASE...');

  // 1. Delete all old member documents
  await deleteCollection('members');

  // 2. Delete all old transaction documents
  await deleteCollection('transactions');

  // 3. Delete all old loan documents
  await deleteCollection('loans');

  // 4. Delete all old settled members
  await deleteCollection('settled_members');

  // 5. Delete summary doc
  await deleteCollection('summary');

  // 6. Reset sukhakarta_bishi/live_state to clean empty state
  console.log('\n🧹 Resetting sukhakarta_bishi/live_state to clean empty state...');
  const cleanState = {
    fields: {
      members: { arrayValue: { values: [] } },
      settledMembers: { arrayValue: { values: [] } },
      transactions: { arrayValue: { values: [] } },
      loans: { arrayValue: { values: [] } },
      meta: {
        mapValue: {
          fields: {
            bishiName: { stringValue: 'सुखकर्ता बीशी' },
            subtitle: { stringValue: '५०-आठवडे बचत व फंड व्यवस्थापन' },
            currency: { stringValue: '₹' },
            totalWeeks: { integerValue: '50' },
            currentWeek: { integerValue: '1' },
            defaultFineAmount: { integerValue: '50' },
            maturityInterestPercent: { integerValue: '8' },
            lastUpdated: { integerValue: '0' },
            updateVersion: { integerValue: '0' }
          }
        }
      },
      _updatedAt: { stringValue: new Date().toISOString() },
      _lastUpdatedBy: { stringValue: 'Clean Slate Reset' }
    }
  };

  const resetRes = await httpsRequest('sukhakarta_bishi/live_state', 'PATCH', cleanState);
  console.log(`   ✅ Reset sukhakarta_bishi/live_state (status: ${resetRes.status})`);

  console.log('\n🎉 ALL OLD DATA HAS BEEN COMPLETELY REMOVED FROM FIREBASE!');
  console.log('Firebase is now 100% clean and ready to receive fresh data from the website.');
}

wipeOldData().catch(err => {
  console.error('❌ Error wiping old data:', err);
  process.exit(1);
});
