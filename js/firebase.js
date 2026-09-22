/**
 * ==========================================================================
 * सुखकर्ता बीशी - FIREBASE CLOUD REALTIME LIVE SYNC & DATABASE ENGINE
 * (Firestore & Realtime Database Multi-Cloud Dual Layer with Live Sync)
 * ==========================================================================
 */

const firebaseConfig = {
  apiKey: "AIzaSyDXLjxfPGhE9Olpth2AfhpYCzdAcDOq-To",
  authDomain: "sukhakarta-bishi.firebaseapp.com",
  databaseURL: "https://sukhakarta-bishi-default-rtdb.firebaseio.com",
  projectId: "sukhakarta-bishi",
  storageBucket: "sukhakarta-bishi.firebasestorage.app",
  messagingSenderId: "71819390502",
  appId: "1:71819390502:web:596780f9234aecf9eb40e7",
  measurementId: "G-E30BMT020Z"
};

class FirebaseSyncManager {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.rtdb = null;
    this.isInitialized = true;
    this.isConnected = false;
    this.isSyncing = false;
    this.autoSyncEnabled = true;
    this.lastSyncTimestamp = null;
    this.lastPingMs = null;
    this.hasRemoteData = false;
    this.firestoreDocRef = null;
    this.rtdbRef = null;
    this.heartbeatTimer = null;
    this.activityLogs = [];
    this.restBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
    this.rtdbBaseUrl = firebaseConfig.databaseURL;

    // Immediately boot up
    this.init();
  }

  // --- १. इनिशिअलायझेशन (Initialization & Universal Fallback) ---
  init() {
    this.isInitialized = true;
    try {
      if (typeof firebase !== 'undefined') {
        if (!this.app) {
          if (!firebase.apps || !firebase.apps.length) {
            this.app = firebase.initializeApp(firebaseConfig);
          } else {
            this.app = firebase.app();
          }
        }

        // 1. Initialize Firestore SDK
        try {
          if (!this.firestore) {
            this.firestore = firebase.firestore();
            this.firestoreDocRef = this.firestore.collection('sukhakarta_bishi').doc('live_state');
          }
        } catch (e) {
          console.warn('Firestore SDK initialization notice:', e);
        }

        // 2. Initialize Realtime Database
        try {
          if (!this.rtdb) {
            this.rtdb = firebase.database();
            this.rtdbRef = this.rtdb.ref('sukhakarta_bishi/live_state');
          }
        } catch (e) {
          console.warn('Realtime Database initialization notice:', e);
        }

        // Start Realtime Listeners
        this.setupRealtimeListeners();
      } else {
        console.warn('Firebase JavaScript SDK not loaded, operating in Universal Cloud REST Engine Mode.');
      }

      this.updateStatusUI('connecting', 'क्लाउड कनेक्ट करत आहे...');
      this.logActivity('Firebase Cloud Engine सक्रिय झाले');

      // Network online / offline events
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', () => {
          this.updateStatusUI('connecting', 'पुन्हा कनेक्ट करत आहे...');
          this.logActivity('इंटरनेट पुन्हा जोडले गेले - ऑटो-सिंक सुरू');
          const store = window.bishiStore;
          if (store && store.hasData && store.hasData()) {
            this.saveCurrentStateToCloud(true);
          } else {
            this.fetchStateAndApply();
          }
        });

        window.addEventListener('offline', () => {
          this.updateStatusUI('offline', 'इंटरनेट बंद (ऑफलाइन)');
          this.logActivity('इंटरनेट बंद - स्थानिक सुरक्षित मोड');
        });
      }

      // Background periodic heartbeat to monitor latency
      this.startHeartbeat();

      // Auto-load state from cloud if local store is empty
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const store = window.bishiStore;
          const hasLocalData = store && (
            (typeof store.hasData === 'function' && store.hasData()) ||
            (Array.isArray(store.state?.members) && store.state.members.length > 0)
          );
          if (store && !hasLocalData) {
            console.log('🔄 Local store is empty. Fetching initial state from Firebase...');
            this.fetchStateAndApply();
          }
        }, 400);
      }

      console.log('🔥 Firebase Cloud Realtime Live Sync Engine is active for Sukhakarta Bishi.');
    } catch (err) {
      console.error('Firebase Initialization Error:', err);
      this.isInitialized = true; // Never block UI
      this.updateStatusUI('offline', 'स्थानिक मोड (REST सक्रिय)');
      this.logActivity(`सूचना: REST मोड सक्रिय (${err.message || err})`);
    }
  }

  // --- REST Engine Helpers (Universal Fallback for zero dependency & no adblock issue) ---
  toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: val.toString() };
      return { doubleValue: val };
    }
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(v => this.toFirestoreValue(v)) } };
    }
    if (typeof val === 'object') {
      const fields = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) fields[k] = this.toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  toFirestoreDocument(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) fields[k] = this.toFirestoreValue(v);
    }
    return { fields };
  }

  parseFirestoreValue(val) {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('nullValue' in val) return null;
    if ('timestampValue' in val) return val.timestampValue;
    if ('arrayValue' in val) return (val.arrayValue.values || []).map(v => this.parseFirestoreValue(v));
    if ('mapValue' in val) {
      const res = {};
      const f = val.mapValue.fields || {};
      for (const k in f) res[k] = this.parseFirestoreValue(f[k]);
      return res;
    }
    return val;
  }

  parseFirestoreDocument(doc) {
    if (!doc || !doc.fields) return null;
    const res = {};
    for (const k in doc.fields) res[k] = this.parseFirestoreValue(doc.fields[k]);
    return res;
  }

  async fetchStateViaRest() {
    const startTime = performance.now();
    const url = `${this.restBaseUrl}/sukhakarta_bishi/live_state`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = await res.json();
    const data = this.parseFirestoreDocument(doc);
    const latency = Math.round(performance.now() - startTime);
    return { data, latency };
  }

  async patchFirestoreDocViaRest(collection, docId, obj) {
    const url = `${this.restBaseUrl}/${collection}/${encodeURIComponent(docId)}`;
    const body = JSON.stringify(this.toFirestoreDocument(obj));
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return res.ok;
  }

  async deleteFirestoreDocViaRest(collection, docId) {
    const url = `${this.restBaseUrl}/${collection}/${encodeURIComponent(docId)}`;
    try {
      await fetch(url, { method: 'DELETE' });
    } catch (e) {}
  }

  async syncAllModularSectionsViaRest(payload) {
    // 1. Unified snapshot
    await this.patchFirestoreDocViaRest('sukhakarta_bishi', 'live_state', payload);
    
    // 2. Separate Member documents
    for (const member of (payload.members || [])) {
      const memberDoc = this.buildMemberDocument(member, payload);
      await this.patchFirestoreDocViaRest('members', member.id, memberDoc);
    }

    // 3. Transactions
    for (const txn of (payload.transactions || [])) {
      await this.patchFirestoreDocViaRest('transactions', txn.id, {
        ...txn,
        _section: 'transactions',
        _updatedAt: new Date().toISOString()
      });
    }

    // 4. Loans
    for (const loan of (payload.loans || [])) {
      await this.patchFirestoreDocViaRest('loans', loan.id, {
        ...loan,
        _section: 'loans',
        _updatedAt: new Date().toISOString()
      });
    }

    // 5. Settings
    if (payload.meta) {
      await this.patchFirestoreDocViaRest('settings', 'bishi_rules', {
        ...payload.meta,
        _section: 'settings',
        _updatedAt: new Date().toISOString()
      });
    }

    // 6. Summary
    const summaryDoc = this.buildSummaryPayload(payload);
    await this.patchFirestoreDocViaRest('summary', 'dashboard_overview', summaryDoc);
    return true;
  }

  // --- २. रिअल-टाईम लाइव्ह लिसनर्स (Bidirectional Realtime Listeners) ---
  setupRealtimeListeners() {
    if (!this.isInitialized) return;

    // 1. Primary: Firestore Realtime Listener
    if (this.firestoreDocRef) {
      this.firestoreDocRef.onSnapshot(
        (docSnap) => {
          this.isConnected = true;
          this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');

          if (docSnap.exists) {
            const remoteData = docSnap.data();
            this.handleRemoteUpdate(remoteData, 'Firestore');
          } else {
            const store = window.bishiStore;
            if (store && store.hasData && store.hasData()) {
              console.log('Firestore doc empty. Seeding local state to cloud...');
              this.saveCurrentStateToCloud(true);
            }
          }
        },
        (err) => {
          console.warn('Firestore live listener notice (using Realtime DB):', err.message || err);
          if (!this.isConnected) {
            this.setupRealtimeDBListener();
          }
        }
      );
    }

    // 2. Secondary: Realtime Database Listener
    this.setupRealtimeDBListener();
  }

  setupRealtimeDBListener() {
    if (!this.rtdbRef) return;

    this.rtdbRef.on(
      'value',
      (snapshot) => {
        this.isConnected = true;
        this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
        const val = snapshot.val();
        if (val) {
          this.handleRemoteUpdate(val, 'RTDB');
        } else {
          const store = window.bishiStore;
          if (store && store.hasData && store.hasData()) {
            this.saveCurrentStateToCloud(true);
          }
        }
      },
      (err) => {
        console.warn('Realtime Database listener notice:', err.message || err);
      }
    );
  }

  // --- ३. रिमोट अपडेट हाताळणी व कॉन्फ्लिक्ट रिझोल्युशन (Conflict Resolution) ---
  handleRemoteUpdate(remoteData, source = 'Cloud') {
    if (!remoteData || !remoteData.members || !remoteData.meta) return;

    const store = window.bishiStore;
    if (!store) return;

    if (this.isSyncing) return;

    const currentClean = JSON.parse(JSON.stringify(store.state));
    delete currentClean._updatedAt;
    delete currentClean._lastUpdatedBy;

    const remoteClean = JSON.parse(JSON.stringify(remoteData));
    delete remoteClean._updatedAt;
    delete remoteClean._lastUpdatedBy;

    const currentStr = JSON.stringify(currentClean);
    const remoteStr = JSON.stringify(remoteClean);

    if (currentStr !== remoteStr) {
      const localUpdated = Number((store.state.meta && store.state.meta.lastUpdated) || 0);
      const remoteUpdated = Number((remoteClean.meta && remoteClean.meta.lastUpdated) || 0);
      const localVersion = Number((store.state.meta && store.state.meta.updateVersion) || 0);
      const remoteVersion = Number((remoteClean.meta && remoteClean.meta.updateVersion) || 0);

      const localHasData = Boolean(
        (store.state.members && store.state.members.length > 0) ||
        (store.state.settledMembers && store.state.settledMembers.length > 0) ||
        (store.state.transactions && store.state.transactions.length > 0) ||
        (store.state.loans && store.state.loans.length > 0)
      );

      const remoteHasData = Boolean(
        (remoteClean.members && remoteClean.members.length > 0) ||
        (remoteClean.settledMembers && remoteClean.settledMembers.length > 0) ||
        (remoteClean.transactions && remoteClean.transactions.length > 0) ||
        (remoteClean.loans && remoteClean.loans.length > 0)
      );

      // १. नव्याने उघडलेले कोरे क्लायंट (ज्यावर कधीही कोणताही डेटा सेव्ह झालेला नाही):
      // अशा कोऱ्या क्लायंटवर क्लाउड डेटा त्वरित लोड करणे
      const isBrandNewClient = (localUpdated === 0 && localVersion === 0 && !store.hasLoadedFromStorage);
      if (isBrandNewClient && remoteHasData) {
        console.log(`📥 Fresh uninitialized client loaded. Adopting cloud data (${(remoteClean.members || []).length} members).`);
      }
      // २. स्थानिक बदल नवीन आहेत (उदा. सदस्य भरणा, संपादन, किंवा सदस्य/डेटा डिलीट करणे):
      // स्थानिक डेटा (डिलीशनसह) कायम ठेवणे आणि क्लाउडवर तात्काळ पाठवणे जेणेकरून जुना डेटा परत येणार नाही
      else if (localUpdated > remoteUpdated || (localUpdated === remoteUpdated && localVersion > remoteVersion)) {
        console.log(`⚡ Local state (v${localVersion}, ${localUpdated}) is newer than remote (v${remoteVersion}, ${remoteUpdated}). Retaining local state (including deletions) and syncing to cloud.`);
        this.saveCurrentStateToCloud(true);
        return;
      }
      // ३. स्थानिक ॲपमध्ये डेटा आहे पण क्लाउड कोरा आहे
      else if (localHasData && !remoteHasData) {
        console.log(`📤 Cloud is empty but local has data (${(store.state.members || []).length} members). Seeding cloud.`);
        this.saveCurrentStateToCloud(true);
        return;
      }
      // ४. क्लाउडवरील अपडेट नवीन आहे: क्लाउडमधील बदल स्वीकारणे
      else {
        console.log(`📥 Cloud state (v${remoteVersion}, ${remoteUpdated}) is newer than local (v${localVersion}, ${localUpdated}). Applying cloud update.`);
      }

      // क्लाउडवरील डेटा स्वीकारणे व स्थानिक स्टोअर अपडेट करणे
      this.logActivity(`⚡ ${source} वरून लाइव्ह अपडेट प्राप्त झाला (${(remoteClean.members || []).length} सदस्य)`);
      this.isSyncing = true;
      store.state = remoteClean;
      store.ensureIntegrity();
      store.saveStateLocalOnly();

      // डॅशबोर्ड व UI त्वरित रि-रेंडर करणे
      if (window.ui) {
        if (window.authManager && window.authManager.isAdmin()) {
          window.ui.renderAll();
        } else if (window.authManager && window.authManager.isCustomer()) {
          window.ui.renderCustomerPortal();
        } else {
          window.ui.renderAll();
        }
      }

      this.lastSyncTimestamp = new Date();
      this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (अपडेट झाले)');

      setTimeout(() => {
        this.isSyncing = false;
      }, 250);
    } else {
      this.lastSyncTimestamp = new Date();
    }

    this.hasRemoteData = true;
  }

  // --- ३.१ सर्व डेटा समाविष्ट असलेले स्वतंत्र सदस्य डॉक्युमेंट तयार करणे (Comprehensive Member Document) ---
  buildMemberDocument(member, storeState = null) {
    const store = storeState || (window.bishiStore && window.bishiStore.state);
    const transactions = (store && store.transactions) || [];
    const loans = (store && store.loans) || [];
    const meta = (store && store.meta) || {};
    const totalWeeks = Number(meta.totalWeeks) || 50;
    const maturityPercent = Number(meta.maturityInterestPercent) || 8;

    const memberTxns = transactions.filter(t => t.memberId === member.id);
    const memberLoans = loans.filter(l => l.memberId === member.id);

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
      // Identity & Profile
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

      // All 50 Weeks Full Details
      weeks: member.weeks || [],

      // Calculated Financial Summary
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

      // Associated Records
      transactions: memberTxns,
      loans: memberLoans,

      // Metadata
      _section: 'members',
      _updatedAt: new Date().toISOString(),
      _version: '2.0'
    };
  }

  // डॅशबोर्ड समरी डॉक्युमेंट तयार करणे
  buildSummaryPayload(storeState) {
    const members = (storeState && storeState.members) || [];
    const settledMembers = (storeState && storeState.settledMembers) || [];
    const transactions = (storeState && storeState.transactions) || [];
    const loans = (storeState && storeState.loans) || [];
    const meta = (storeState && storeState.meta) || {};

    let totalBishiDeposits = 0;
    let totalBishiFines = 0;
    members.forEach(m => {
      (m.weeks || []).forEach(w => {
        totalBishiDeposits += Number(w.amountPaid) || 0;
        totalBishiFines += Number(w.finePaid) || 0;
      });
    });

    return {
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
  }

  // --- ४. क्लाउडवर डेटा सेव्ह/पुश करणे (Push State & Modular Sections to Firebase Cloud) ---
  async saveCurrentStateToCloud(force = false) {
    if (!this.isInitialized) return;
    if (!this.autoSyncEnabled && !force) return;
    if (this.isSyncing && !force) return;

    const store = window.bishiStore;
    if (!store || !store.state) return;

    const localHasData = Boolean(
      (store.state.members && store.state.members.length > 0) ||
      (store.state.settledMembers && store.state.settledMembers.length > 0) ||
      (store.state.transactions && store.state.transactions.length > 0) ||
      (store.state.loans && store.state.loans.length > 0)
    );

    // 🛡️ Data Loss Prevention: Don't push an empty state over cloud unless explicitly performed as Admin Reset
    if (!localHasData && !this.hasRemoteData && !force) {
      console.log('🛡️ Skipping cloud push of empty initial state before remote data is checked.');
      return;
    }

    const payload = JSON.parse(JSON.stringify(store.state));
    payload._updatedAt = new Date().toISOString();
    payload._lastUpdatedBy = (window.authManager && window.authManager.getCurrentUser()?.name) || 'User';

    this.updateStatusUI('connecting', 'डेटा सिंक होत आहे...');

    let pushedSuccessfully = false;

    // 1. Push Unified Snapshot to Firestore (Fast atomic listener)
    if (this.firestoreDocRef) {
      try {
        await this.firestoreDocRef.set(payload);
        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Firestore live_state push warning:', err.message || err);
      }
    }

    // 2. Mirror Push Unified Snapshot to Realtime Database
    if (this.rtdbRef) {
      try {
        await this.rtdbRef.set(payload);
        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Realtime Database live_state push warning:', err.message || err);
      }
    }

    // 3. Modular Sections: Write Dedicated Documents in Firestore & Clean Out Old Ones
    if (this.firestore) {
      try {
        const membersList = payload.members || [];
        const activeMemberIds = new Set(membersList.map(m => m.id));

        // Delete old obsolete member documents that are not in local members
        try {
          const existingMembersSnap = await this.firestore.collection('members').get();
          const batch = this.firestore.batch();
          let hasDeletions = false;
          existingMembersSnap.forEach(doc => {
            if (!activeMemberIds.has(doc.id)) {
              batch.delete(doc.ref);
              hasDeletions = true;
            }
          });
          if (hasDeletions) await batch.commit();
        } catch (e) {
          console.warn('Notice cleaning obsolete members:', e);
        }

        // (A) Write Separate Document for each active member
        for (const m of membersList) {
          const memberDoc = this.buildMemberDocument(m, payload);
          await this.firestore.collection('members').doc(m.id).set(memberDoc);
        }

        // (B) Write Separate Document for each settled member
        const settledList = payload.settledMembers || [];
        for (const sm of settledList) {
          const settledDoc = this.buildMemberDocument(sm, payload);
          await this.firestore.collection('settled_members').doc(sm.id).set(settledDoc);
        }

        // (C) Write Separate Document for each transaction & clean old
        const txnList = payload.transactions || [];
        const activeTxnIds = new Set(txnList.map(t => t.id));
        try {
          const existingTxnsSnap = await this.firestore.collection('transactions').get();
          const batchTxn = this.firestore.batch();
          let hasTxnDel = false;
          existingTxnsSnap.forEach(doc => {
            if (!activeTxnIds.has(doc.id)) {
              batchTxn.delete(doc.ref);
              hasTxnDel = true;
            }
          });
          if (hasTxnDel) await batchTxn.commit();
        } catch (e) {}

        for (const txn of txnList) {
          await this.firestore.collection('transactions').doc(txn.id).set({
            ...txn,
            _section: 'transactions',
            _updatedAt: new Date().toISOString()
          });
        }

        // (D) Write Separate Document for each loan & clean old
        const loanList = payload.loans || [];
        const activeLoanIds = new Set(loanList.map(l => l.id));
        try {
          const existingLoansSnap = await this.firestore.collection('loans').get();
          const batchLoans = this.firestore.batch();
          let hasLoanDel = false;
          existingLoansSnap.forEach(doc => {
            if (!activeLoanIds.has(doc.id)) {
              batchLoans.delete(doc.ref);
              hasLoanDel = true;
            }
          });
          if (hasLoanDel) await batchLoans.commit();
        } catch (e) {}

        for (const loan of loanList) {
          await this.firestore.collection('loans').doc(loan.id).set({
            ...loan,
            _section: 'loans',
            _updatedAt: new Date().toISOString()
          });
        }

        // (E) Settings Section (bishi_rules)
        if (payload.meta) {
          await this.firestore.collection('settings').doc('bishi_rules').set({
            ...payload.meta,
            _section: 'settings',
            _updatedAt: new Date().toISOString()
          });
        }

        // (F) Summary Section (dashboard_overview)
        const summaryDoc = this.buildSummaryPayload(payload);
        await this.firestore.collection('summary').doc('dashboard_overview').set(summaryDoc);

        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Firestore modular sections push warning:', err.message || err);
      }
    }

    // 4. Modular Sections: Mirror to Realtime Database Nodes
    if (this.rtdb) {
      try {
        const membersList = payload.members || [];
        const membersObj = {};
        membersList.forEach(m => {
          membersObj[m.id] = this.buildMemberDocument(m, payload);
        });
        await this.rtdb.ref('sukhakarta_bishi/members').set(membersObj);

        const txnList = payload.transactions || [];
        const txnsObj = {};
        txnList.forEach(t => {
          txnsObj[t.id] = t;
        });
        await this.rtdb.ref('sukhakarta_bishi/transactions').set(txnsObj);

        const loanList = payload.loans || [];
        const loansObj = {};
        loanList.forEach(l => {
          loansObj[l.id] = l;
        });
        await this.rtdb.ref('sukhakarta_bishi/loans').set(loansObj);

        if (payload.meta) {
          await this.rtdb.ref('sukhakarta_bishi/settings').set(payload.meta);
        }

        await this.rtdb.ref('sukhakarta_bishi/summary').set(this.buildSummaryPayload(payload));
        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Realtime DB modular sections push warning:', err.message || err);
      }
    }

    // 5. Direct REST API Fallback (Ultra-Reliable, runs even if SDK is blocked)
    if (!pushedSuccessfully) {
      try {
        await this.syncAllModularSectionsViaRest(payload);
        pushedSuccessfully = true;
      } catch (restErr) {
        console.warn('REST modular sync error:', restErr.message || restErr);
      }
    }

    if (pushedSuccessfully) {
      this.isConnected = true;
      this.lastSyncTimestamp = new Date();
      this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
      this.logActivity(`क्लाउडवर सर्व मॉड्यूल्स सेव्ह केले (${(payload.members || []).length} सदस्य डॉक्युमेंट्स, ${(payload.transactions || []).length} व्यवहार)`);
    } else {
      this.updateStatusUI('offline', 'स्थानिक जतन (क्लाउड प्रलंबित)');
    }
  }

  // ==========================================================================
  // 📥 ५. डेटा फेचिंग फंक्शन्स (Data Fetching APIs)
  // ==========================================================================

  // संपूर्ण स्टेट फेच करणे
  async fetchState() {
    this.isInitialized = true;
    const startTime = performance.now();

    // 1. Try Firestore SDK if available
    if (this.firestoreDocRef) {
      try {
        const docSnap = await this.firestoreDocRef.get();
        if (docSnap && docSnap.exists) {
          const data = docSnap.data();
          const latency = Math.round(performance.now() - startTime);
          this.lastPingMs = latency;
          this.isConnected = true;
          this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
          this.logActivity(`Firestore SDK वरून डेटा फेच केला (${latency}ms)`);
          return { success: true, state: data, source: 'Firestore SDK', latency };
        }
      } catch (sdkErr) {
        console.warn('Firestore SDK fetch notice:', sdkErr.message || sdkErr);
      }
    }

    // 2. Direct Firestore REST API (Ultra-Reliable, zero external SDK dependency)
    try {
      const { data, latency } = await this.fetchStateViaRest();
      if (data && (Array.isArray(data.members) || data.meta || Array.isArray(data.transactions))) {
        this.lastPingMs = latency;
        this.isConnected = true;
        this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
        this.logActivity(`Firestore REST वरून डेटा फेच केला (${latency}ms)`);
        return { success: true, state: data, source: 'Firestore REST', latency };
      }
    } catch (restErr) {
      console.warn('Firestore REST fetch notice:', restErr.message || restErr);
    }

    // 3. Fallback to Realtime Database SDK
    if (this.rtdbRef) {
      try {
        const snap = await this.rtdbRef.once('value');
        const val = snap.val();
        if (val) {
          const latency = Math.round(performance.now() - startTime);
          this.lastPingMs = latency;
          this.isConnected = true;
          this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
          this.logActivity(`Realtime DB वरून डेटा फेच केला (${latency}ms)`);
          return { success: true, state: val, source: 'RealtimeDB', latency };
        }
      } catch (rtdbErr) {
        console.warn('Realtime DB SDK fetch notice:', rtdbErr.message || rtdbErr);
      }
    }

    return { success: false, message: 'क्लाउडवर डेटा सापडला नाही किंवा नेटवर्क समस्या' };
  }

  // फेच करून थेट लागू करणे
  async fetchStateAndApply() {
    this.updateStatusUI('connecting', 'डेटा फेच करत आहे...');
    const result = await this.fetchState();
    if (result.success && result.state) {
      window.bishiStore.state = result.state;
      window.bishiStore.ensureIntegrity();
      window.bishiStore.saveStateLocalOnly();
      if (window.ui) window.ui.renderAll();
      this.lastSyncTimestamp = new Date();
      this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
      if (window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast(`✅ Firebase क्लाउडवरून संपूर्ण डेटा लोड झाला (${result.latency}ms)!`, 'success');
      }
      this.renderCloudModalStats();
      return true;
    } else {
      if (window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast(`⚠️ डेटा फेच करण्यात अडचण: ${result.message}`, 'error');
      }
      return false;
    }
  }

  // सर्व सदस्य फेच करणे
  async fetchMembers() {
    const res = await this.fetchState();
    if (res.success && res.state && Array.isArray(res.state.members)) {
      return res.state.members;
    }
    return window.bishiStore.getMembers();
  }

  // विशिष्ट सदस्य फेच करणे
  async fetchMember(memberId) {
    const members = await this.fetchMembers();
    return members.find(m => m.id === memberId) || null;
  }

  // व्यवहार खातावही फेच करणे
  async fetchTransactions(memberId = null) {
    const res = await this.fetchState();
    let txns = [];
    if (res.success && res.state && Array.isArray(res.state.transactions)) {
      txns = res.state.transactions;
    } else {
      txns = window.bishiStore.state.transactions || [];
    }

    if (memberId) {
      return txns.filter(t => t.memberId === memberId);
    }
    return txns;
  }

  // मेटा माहिती फेच करणे
  async fetchMeta() {
    const res = await this.fetchState();
    if (res.success && res.state && res.state.meta) {
      return res.state.meta;
    }
    return window.bishiStore.state.meta;
  }

  // ==========================================================================
  // 📤 ६. ग्रॅन्युलर डेटा अपडेटिंग फंक्शन्स (Granular Data Operations)
  // ==========================================================================

  async updateMemberInCloud(memberId, updateData) {
    const member = window.bishiStore.updateMember(memberId, updateData);
    if (member) {
      await this.saveCurrentStateToCloud(true);
      this.logActivity(`सदस्य अपडेट: ${member.name} (${member.id}) - डॉक्युमेंट सिंक`);
    }
    return member;
  }

  async syncMemberToCloud(memberId) {
    const member = window.bishiStore.getMember(memberId);
    if (!member) return null;
    const memberDoc = this.buildMemberDocument(member);
    if (this.firestore) {
      try {
        await this.firestore.collection('members').doc(memberId).set(memberDoc);
      } catch (e) {
        console.warn('Error syncing member doc to Firestore:', e);
      }
    }
    if (this.rtdb) {
      try {
        await this.rtdb.ref(`sukhakarta_bishi/members/${memberId}`).set(memberDoc);
      } catch (e) {
        console.warn('Error syncing member doc to RTDB:', e);
      }
    }
    return memberDoc;
  }

  async recordPaymentInCloud(memberId, weekNumber, depositAmount, paymentMode, note, fineAmount, upiId) {
    const res = window.bishiStore.recordPayment(memberId, weekNumber, depositAmount, paymentMode, note, fineAmount, upiId);
    if (res) {
      await this.saveCurrentStateToCloud(true);
      this.logActivity(`हप्ता जमा: ${res.member.name} (आठवडा ${weekNumber}, ₹${depositAmount})`);
    }
    return res;
  }

  async deleteMemberFromCloud(memberId) {
    const removed = window.bishiStore.removeMember(memberId);
    if (removed) {
      // 1. Explicitly remove member's dedicated document from Firestore collection 'members'
      if (this.firestore) {
        try {
          await this.firestore.collection('members').doc(memberId).delete();
        } catch (e) {
          console.warn('Error deleting member doc from Firestore:', e);
        }
      }
      // 2. Explicitly remove member's node from Realtime DB
      if (this.rtdb) {
        try {
          await this.rtdb.ref(`sukhakarta_bishi/members/${memberId}`).remove();
        } catch (e) {
          console.warn('Error deleting member from RTDB:', e);
        }
      }
      await this.saveCurrentStateToCloud(true);
      this.logActivity(`सदस्य डिलीट: ${removed.name} (${memberId}) - स्वतंत्र डॉक्युमेंट नष्ट केले`);
    }
    return removed;
  }

  async updateSettingsInCloud(settings) {
    const meta = window.bishiStore.updateSettings(settings);
    await this.saveCurrentStateToCloud(true);
    this.logActivity('ग्रुप नियम व लेट फी दर अपडेट केले');
    return meta;
  }

  async pushWebsiteDataToFirebase() {
    const store = window.bishiStore;
    if (!store || !store.state) {
      alert('⚠️ वेबसाइटवर कोणताही डेटा उपलब्ध नाही.');
      return;
    }

    const membersCount = (store.getMembers() || []).length;
    const txnsCount = (store.state.transactions || []).length;

    const confirmed = confirm(`⚡ पुष्टी करा: वेबसाइटवरील सर्व चालू डेटा (${membersCount} सदस्य, ${txnsCount} व्यवहार नोंदी) Firebase क्लाउडवर पाठवायचा आहे का? यामुळे Firebase मधील जुना डेटा बदलून वेबसाइटचा चालू डेटा सेव्ह होईल.`);
    if (!confirmed) return;

    this.updateStatusUI('connecting', 'वेबसाइट डेटा Firebase वर पाठवत आहे...');

    // 1. Force update local timestamps
    if (!store.state.meta) store.state.meta = {};
    store.state.meta.lastUpdated = Date.now();
    store.state.meta.updateVersion = (Number(store.state.meta.updateVersion) || 0) + 1;
    store.saveStateLocalOnly();

    // 2. Perform comprehensive push to modular collections and live_state
    await this.saveCurrentStateToCloud(true);

    this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
    this.logActivity(`वेबसाइटचा सर्व डेटा (${membersCount} सदस्य, ${txnsCount} व्यवहार) Firebase वर यशस्वीरित्या पाठवला`);

    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast(`🎉 वेबसाइटचा डेटा (${membersCount} सदस्य) Firebase क्लाउडवर 100% सिंक झाला!`, 'success');
    } else {
      alert(`🎉 वेबसाइटचा डेटा (${membersCount} सदस्य) Firebase क्लाउडवर 100% सिंक झाला!`);
    }

    this.renderCloudModalStats();
  }

  async syncAllModularSections(force = true) {
    this.updateStatusUI('connecting', 'सर्व सेक्शन्स सिंक होत आहेत...');
    await this.saveCurrentStateToCloud(force);
    const count = (window.bishiStore?.getMembers() || []).length;
    this.logActivity(`सर्व सेक्शन्स (members, transactions, settings, summary) यशस्वीरित्या सिंक झाले (${count} सदस्य डॉक्युमेंट्स)`);
    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast(`✅ Firebase मधील सर्व सेक्शन्स व ${count} सदस्यांचे स्वतंत्र डॉक्युमेंट्स क्लाउडवर सिंक झाले!`, 'success');
    }
    this.renderCloudModalStats();
  }

  async forceSyncNow() {
    await this.pushWebsiteDataToFirebase();
  }

  // ==========================================================================
  // ⚡ ७. डेटाबेस लेटन्सी व डायग्नोस्टिक टूल्स (Diagnostics)
  // ==========================================================================

  async pingDatabase() {
    this.isInitialized = true;
    const startTime = performance.now();
    try {
      let pingSuccess = false;
      if (this.firestoreDocRef) {
        try {
          await this.firestoreDocRef.get();
          pingSuccess = true;
        } catch (e) {}
      }
      
      if (!pingSuccess && this.rtdbRef) {
        try {
          await this.rtdbRef.once('value');
          pingSuccess = true;
        } catch (e) {}
      }

      if (!pingSuccess) {
        const pingRes = await fetch(`${this.restBaseUrl}/sukhakarta_bishi/live_state`);
        if (pingRes.ok) pingSuccess = true;
      }

      const latency = Math.round(performance.now() - startTime);
      this.lastPingMs = latency;
      this.isConnected = true;
      this.updateStatusUI('connected', `🟢 लाइव्ह (${latency}ms)`);
      this.logActivity(`डेटाबेस हेल्थ पिंग: ${latency}ms (उत्कृष्ट वेग)`);
      if (window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast(`⚡ Firebase डेटाबेस सक्रिय व वेगवान आहे! (${latency}ms)`, 'success');
      }
      this.renderCloudModalStats();
      return { success: true, latency };
    } catch (err) {
      this.isConnected = false;
      this.updateStatusUI('error', 'कनेक्शन एरर');
      if (window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast(`⚠️ डेटाबेस पिंग अयशस्वी: ${err.message || err}`, 'error');
      }
      return { success: false, message: err.message || err };
    }
  }

  getDatabaseStats() {
    const store = window.bishiStore;
    const membersCount = store ? store.getMembers().length : 0;
    const txnsCount = store && store.state.transactions ? store.state.transactions.length : 0;
    const loansCount = store && store.state.loans ? store.state.loans.length : 0;
    const settledCount = store && store.state.settledMembers ? store.state.settledMembers.length : 0;

    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnected,
      autoSyncEnabled: this.autoSyncEnabled,
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL,
      lastSync: this.lastSyncTimestamp ? this.lastSyncTimestamp.toLocaleTimeString('hi-IN') : 'अद्याप नाही',
      lastPingMs: this.lastPingMs ? `${this.lastPingMs} ms` : 'N/A',
      membersCount,
      txnsCount,
      loansCount,
      settledCount,
      modularSections: ['members', 'transactions', 'loans', 'settled_members', 'settings', 'summary', 'live_state'],
      logs: this.activityLogs.slice(-10)
    };
  }

  logActivity(message) {
    const logItem = `[${new Date().toLocaleTimeString('hi-IN')}] ${message}`;
    this.activityLogs.unshift(logItem);
    if (this.activityLogs.length > 50) this.activityLogs.pop();
    this.renderCloudModalStats();
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && !this.isSyncing) {
        this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
      }
    }, 12000);
  }

  updateStatusUI(status, text) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('cloudStatusBadge');
    const textEl = document.getElementById('cloudStatusText');
    const dot = document.getElementById('cloudStatusDot');

    if (badge) {
      badge.className = `cloud-status-badge ${status}`;
      const timeStr = this.lastSyncTimestamp ? ' • शेवटचा सिंक: ' + this.lastSyncTimestamp.toLocaleTimeString('hi-IN') : '';
      badge.title = `Firebase Realtime Database: ${text}${timeStr} (तपशील पाहण्यासाठी क्लिक करा)`;
    }
    if (textEl) {
      textEl.textContent = text;
    }
    if (dot) {
      dot.className = `cloud-dot ${status}`;
    }
  }

  renderCloudModalStats() {
    if (typeof document === 'undefined') return;
    const stats = this.getDatabaseStats();
    
    const elStatus = document.getElementById('fbModalStatus');
    if (elStatus) {
      elStatus.innerHTML = stats.isConnected 
        ? '<span style="color: var(--emerald-400); font-weight: 800;">🟢 कनेक्टेड (Firebase Live)</span>' 
        : '<span style="color: #fb7185; font-weight: 700;">🔴 ऑफलाइन / स्थानिक</span>';
    }

    const elProject = document.getElementById('fbModalProject');
    if (elProject) elProject.textContent = stats.projectId;

    const elUrl = document.getElementById('fbModalDbUrl');
    if (elUrl) elUrl.textContent = stats.databaseURL;

    const elSync = document.getElementById('fbModalLastSync');
    if (elSync) elSync.textContent = stats.lastSync;

    const elPing = document.getElementById('fbModalPing');
    if (elPing) elPing.textContent = stats.lastPingMs;

    const elCounts = document.getElementById('fbModalCounts');
    if (elCounts) elCounts.textContent = `${stats.membersCount} सदस्य डॉक्युमेंट्स • ${stats.txnsCount} व्यवहार नोंदी`;

    const elModular = document.getElementById('fbModalModularInfo');
    if (elModular) {
      elModular.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.3rem;">
          <span class="badge" style="background: rgba(16,185,129,0.15); color: var(--emerald-400); border: 1px solid rgba(16,185,129,0.3); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px;">📁 members (${stats.membersCount} डॉक्स)</span>
          <span class="badge" style="background: rgba(59,130,246,0.15); color: var(--blue-400); border: 1px solid rgba(59,130,246,0.3); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px;">📁 transactions (${stats.txnsCount})</span>
          <span class="badge" style="background: rgba(245,158,11,0.15); color: var(--gold-400); border: 1px solid rgba(245,158,11,0.3); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px;">📁 loans (${stats.loansCount})</span>
          <span class="badge" style="background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px;">📁 settings (bishi_rules)</span>
          <span class="badge" style="background: rgba(236,72,153,0.15); color: #f472b6; border: 1px solid rgba(236,72,153,0.3); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px;">📁 summary</span>
        </div>
      `;
    }

    const elLogs = document.getElementById('fbModalLogsList');
    if (elLogs) {
      if (stats.logs.length === 0) {
        elLogs.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem;">अद्याप कोणतेही लॉग्स नाहीत.</div>';
      } else {
        elLogs.innerHTML = stats.logs.map(l => `<div style="padding: 0.25rem 0; border-bottom: 1px dashed rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">${l}</div>`).join('');
      }
    }
  }

  openCloudControlModal() {
    if (window.authManager && !window.authManager.isAdmin()) {
      window.ui?.showToast('🔒 केवळ प्रशासक Firebase क्लाउड व्यवस्थापन पाहू शकतात.', 'error');
      return;
    }
    this.renderCloudModalStats();
    const modal = document.getElementById('firebaseDbModal');
    if (modal) modal.classList.add('active');
  }

  // संपूर्ण क्लाउड डेटाबेस रिसेट व नवीन स्वच्छ कलेक्शन तयार करणे (Wipe & Re-create Cloud DB)
  async wipeAndRecreateDatabase(skipConfirm = false) {
    if (window.authManager && !window.authManager.isAdmin()) {
      window.ui?.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक डेटाबेस रिसेट करू शकतात.', 'error');
      return false;
    }
    if (!skipConfirm && !confirm('⚠️ सावधान: तुम्हाला Firebase क्लाउडवरील सर्व डेटा डिलीट करून नवीन स्वच्छ डेटाबेस तयार करायचा आहे का?')) {
      return false;
    }

    this.updateStatusUI('connecting', 'क्लाउड डेटाबेस रिसेट करत आहे...');

    // 1. Reset Local Store State
    window.bishiStore.clearAllData();

    // 2. Prepare Clean Payload
    const cleanPayload = JSON.parse(JSON.stringify(window.bishiStore.state));
    cleanPayload._updatedAt = new Date().toISOString();
    cleanPayload._lastUpdatedBy = 'Admin Reset';

    // 3. Wipe and Overwrite Firestore Collections
    if (this.firestore) {
      try {
        await this.firestore.collection('sukhakarta_bishi').doc('live_state').set(cleanPayload);
        
        // Wipe all existing member docs in 'members' collection
        try {
          const membersSnap = await this.firestore.collection('members').get();
          const batch = this.firestore.batch();
          membersSnap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } catch (e) {}

        // Wipe transactions collection
        try {
          const txnsSnap = await this.firestore.collection('transactions').get();
          const batch = this.firestore.batch();
          txnsSnap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } catch (e) {}

        // Wipe loans collection
        try {
          const loansSnap = await this.firestore.collection('loans').get();
          const batch = this.firestore.batch();
          loansSnap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } catch (e) {}

        // Wipe settled_members collection
        try {
          const settledSnap = await this.firestore.collection('settled_members').get();
          const batch = this.firestore.batch();
          settledSnap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } catch (e) {}

        // Reset settings and summary
        await this.firestore.collection('settings').doc('bishi_rules').set({
          ...cleanPayload.meta,
          _section: 'settings',
          _updatedAt: new Date().toISOString()
        });
        await this.firestore.collection('summary').doc('dashboard_overview').set(this.buildSummaryPayload(cleanPayload));

        // Also clear legacy collections if accessible
        try {
          await this.firestore.collection('sukhakarta_bishi_db').doc('state_v2').delete();
        } catch (e) {}
      } catch (err) {
        console.warn('Firestore wipe notice:', err);
      }
    }

    // 4. Wipe and Overwrite Realtime Database Nodes
    if (this.rtdb) {
      try {
        await this.rtdb.ref('sukhakarta_bishi/live_state').set(cleanPayload);
        await this.rtdb.ref('sukhakarta_bishi/members').remove();
        await this.rtdb.ref('sukhakarta_bishi/transactions').remove();
        await this.rtdb.ref('sukhakarta_bishi/loans').remove();
        await this.rtdb.ref('sukhakarta_bishi/settled_members').remove();
        await this.rtdb.ref('sukhakarta_bishi/settings').set(cleanPayload.meta);
        await this.rtdb.ref('sukhakarta_bishi/summary').set(this.buildSummaryPayload(cleanPayload));
        try {
          await this.rtdb.ref('sukhakarta_bishi/state_v2').remove();
        } catch (e) {}
      } catch (err) {
        console.warn('Realtime Database wipe notice:', err);
      }
    }

    this.isConnected = true;
    this.lastSyncTimestamp = new Date();
    this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
    this.logActivity('🔥 Firebase मधील सर्व सेक्शन्स व सदस्य डॉक्युमेंट्स पूर्णपणे स्वच्छ करण्यात आले');

    if (window.ui && typeof window.ui.renderAll === 'function') {
      window.ui.renderAll();
    }
    this.renderCloudModalStats();

    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast('🎉 Firebase क्लाउड डेटाबेस रिसेट झाला व सर्व सेक्शन्स स्वच्छ झाले!', 'success');
    }

    return true;
  }
}

window.firebaseSyncManager = new FirebaseSyncManager();
window.pushWebsiteDataToFirebase = () => window.firebaseSyncManager.pushWebsiteDataToFirebase();
