/**
 * Re-index all transactions in Firebase Firestore & RTDB with Inverted Timestamp IDs
 * (TXN-{invertedTimestamp}-{rand}) so that in Firebase Console, the newest transaction
 * is ALWAYS at the very top of the transactions collection documents!
 */
const https = require('https');

const PROJECT_ID = 'sukhakarta-bishi';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const RTDB_BASE = 'https://sukhakarta-bishi-default-rtdb.firebaseio.com';

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + (parsed.search || ''),
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: body });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(v => toFirestoreValue(v)) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function parseFirestoreDocument(doc) {
  if (!doc || !doc.fields) return null;
  const res = {};
  for (const k in doc.fields) {
    res[k] = parseFirestoreValue(doc.fields[k]);
  }
  return res;
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(v => parseFirestoreValue(v));
  if ('mapValue' in val) {
    const res = {};
    const f = val.mapValue.fields || {};
    for (const k in f) res[k] = parseFirestoreValue(f[k]);
    return res;
  }
  return val;
}

async function run() {
  console.log('🚀 Starting Re-Indexing of Firestore Transactions (Top-of-Table Sorting)...');

  // 1. Fetch live_state
  const liveRes = await httpRequest(`${FIRESTORE_BASE}/sukhakarta_bishi/live_state`);
  if (liveRes.status !== 200) {
    throw new Error(`Failed to fetch live_state: ${liveRes.status} ${liveRes.data}`);
  }

  const liveDoc = JSON.parse(liveRes.data);
  const liveState = parseFirestoreDocument(liveDoc);
  const txns = liveState.transactions || [];
  console.log(`Found ${txns.length} transactions in live_state.`);

  // 2. Fetch all current documents in 'transactions' collection
  const listRes = await httpRequest(`${FIRESTORE_BASE}/transactions`);
  let existingDocNames = [];
  if (listRes.status === 200) {
    const listData = JSON.parse(listRes.data);
    if (listData.documents) {
      existingDocNames = listData.documents.map(d => d.name.split('/').pop());
    }
  }
  console.log(`Found ${existingDocNames.length} existing documents in transactions collection.`);

  // Sort transactions descending by date (newest first)
  txns.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const newDocIds = new Set();
  const updatedTxns = [];

  // 3. Write each transaction under TXN-{invertedTimestamp}-{rand}
  for (const t of txns) {
    const ts = new Date(t.date || Date.now()).getTime();
    const inv = String(9999999999999 - ts).padStart(13, '0');
    const rand = (t.id || '').replace(/^TXN-/, '').substring(0, 4) || Math.random().toString(36).substring(2, 6).toUpperCase();
    const newDocId = `TXN-${inv}-${rand}`;

    newDocIds.add(newDocId);

    const oldId = t.id;
    t.id = newDocId;
    t._docId = newDocId;
    t._section = 'transactions';
    t._updatedAt = new Date().toISOString();

    updatedTxns.push(t);

    const firestoreFields = {};
    for (const [k, v] of Object.entries(t)) {
      firestoreFields[k] = toFirestoreValue(v);
    }
    const docPayload = JSON.stringify({ fields: firestoreFields });

    const patchRes = await httpRequest(`${FIRESTORE_BASE}/transactions/${encodeURIComponent(newDocId)}`, {
      method: 'PATCH'
    }, docPayload);

    if (patchRes.status === 200) {
      console.log(`  ✅ Wrote doc: ${newDocId} (${t.memberName}, ${t.date}, ₹${t.totalAmount || t.depositAmount})`);
    } else {
      console.error(`  ❌ Failed to write ${newDocId}: ${patchRes.status}`);
    }
  }

  // 4. Delete obsolete documents that are not in newDocIds
  console.log('\n🧹 Cleaning up old random transaction document IDs...');
  for (const oldDocId of existingDocNames) {
    if (!newDocIds.has(oldDocId)) {
      const delRes = await httpRequest(`${FIRESTORE_BASE}/transactions/${encodeURIComponent(oldDocId)}`, {
        method: 'DELETE'
      });
      console.log(`  🗑️ Deleted old doc: ${oldDocId} (${delRes.status})`);
    }
  }

  // 5. Update live_state with updated transaction IDs
  liveState.transactions = updatedTxns;
  liveState._updatedAt = new Date().toISOString();
  liveState._lastUpdatedBy = 'Transaction Re-indexer';

  const liveFields = {};
  for (const [k, v] of Object.entries(liveState)) {
    liveFields[k] = toFirestoreValue(v);
  }
  const livePayload = JSON.stringify({ fields: liveFields });
  await httpRequest(`${FIRESTORE_BASE}/sukhakarta_bishi/live_state`, {
    method: 'PATCH'
  }, livePayload);
  console.log('✅ Updated sukhakarta_bishi/live_state with re-indexed transactions.');

  // 6. Update Realtime Database
  const rtdbTxns = {};
  updatedTxns.forEach(t => {
    rtdbTxns[t.id] = t;
  });
  await httpRequest(`${RTDB_BASE}/sukhakarta_bishi/transactions.json`, {
    method: 'PUT'
  }, JSON.stringify(rtdbTxns));
  console.log('✅ Updated Realtime Database sukhakarta_bishi/transactions node.');

  console.log('\n🎉 ALL TRANSACTIONS RE-INDEXED! IN FIREBASE CONSOLE, NEWEST TRANSACTIONS ARE NOW ON TOP!');
}

run().catch(console.error);
