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
    this.isInitialized = false;
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
  }

  // --- १. इनिशिअलायझेशन (Initialization) ---
  init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Operating in local storage mode.');
        this.updateStatusUI('offline', 'स्थानिक मोड (ऑफलाइन)');
        return;
      }

      if (!firebase.apps || !firebase.apps.length) {
        this.app = firebase.initializeApp(firebaseConfig);
      } else {
        this.app = firebase.app();
      }

      // 1. Initialize Firestore
      try {
        this.firestore = firebase.firestore();
        this.firestoreDocRef = this.firestore.collection('sukhakarta_bishi').doc('live_state');
      } catch (e) {
        console.warn('Firestore initialization notice:', e);
      }

      // 2. Initialize Realtime Database
      try {
        this.rtdb = firebase.database();
        this.rtdbRef = this.rtdb.ref('sukhakarta_bishi/live_state');
      } catch (e) {
        console.warn('Realtime Database initialization notice:', e);
      }

      this.isInitialized = true;
      this.updateStatusUI('connecting', 'क्लाउड कनेक्ट करत आहे...');
      this.logActivity('Firebase Cloud SDK यशस्वीरीत्या सुरू झाले');

      // Start Realtime Listeners
      this.setupRealtimeListeners();

      // Network online / offline events
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', () => {
          this.updateStatusUI('connecting', 'पुन्हा कनेक्ट करत आहे...');
          this.logActivity('इंटरनेट पुन्हा जोडले गेले - ऑटो-सिंक सुरू');
          this.saveCurrentStateToCloud(true);
        });

        window.addEventListener('offline', () => {
          this.updateStatusUI('offline', 'इंटरनेट बंद (ऑफलाइन)');
          this.logActivity('इंटरनेट बंद - स्थानिक सुरक्षित मोड');
        });
      }

      // Background periodic heartbeat to monitor latency
      this.startHeartbeat();

      console.log('🔥 Firebase Cloud Realtime Live Sync Engine is active for Sukhakarta Bishi.');
    } catch (err) {
      console.error('Firebase Initialization Error:', err);
      this.updateStatusUI('error', 'क्लाउड एरर');
      this.logActivity(`त्रुटी: ${err.message || err}`);
    }
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
            console.log('Firestore doc empty. Seeding current state to cloud...');
            this.saveCurrentStateToCloud(true);
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
          this.saveCurrentStateToCloud(true);
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
      // Timestamp & Version Check: Prevent stale snapshots from overwriting local state
      const localUpdated = Number((store.state.meta && store.state.meta.lastUpdated) || 0);
      const remoteUpdated = Number((remoteClean.meta && remoteClean.meta.lastUpdated) || 0);
      const localVersion = Number((store.state.meta && store.state.meta.updateVersion) || 0);
      const remoteVersion = Number((remoteClean.meta && remoteClean.meta.updateVersion) || 0);

      // जर स्थानिक बदल नवीन असतील, तर स्थानिक बदल कायम ठेवून क्लाउडवर पुन्हा पाठवा
      if (localUpdated > remoteUpdated || (localUpdated === remoteUpdated && localVersion > remoteVersion)) {
        console.log(`⚡ Local state (v${localVersion}, ${localUpdated}) is newer than remote (v${remoteVersion}, ${remoteUpdated}). Retaining local data and syncing to cloud.`);
        this.saveCurrentStateToCloud(true);
        return;
      }

      // क्लाउडवरील नवीन बदल स्वीकारणे
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

  // --- ४. क्लाउडवर डेटा सेव्ह/पुश करणे (Push State to Firebase Cloud) ---
  async saveCurrentStateToCloud(force = false) {
    if (!this.isInitialized) return;
    if (!this.autoSyncEnabled && !force) return;
    if (this.isSyncing && !force) return;

    const store = window.bishiStore;
    if (!store || !store.state) return;

    const payload = JSON.parse(JSON.stringify(store.state));
    payload._updatedAt = new Date().toISOString();
    payload._lastUpdatedBy = (window.authManager && window.authManager.getCurrentUser()?.name) || 'User';

    this.updateStatusUI('connecting', 'डेटा सिंक होत आहे...');

    let pushedSuccessfully = false;

    // 1. Push to Firestore
    if (this.firestoreDocRef) {
      try {
        await this.firestoreDocRef.set(payload);
        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Firestore push warning:', err.message || err);
      }
    }

    // 2. Mirror Push to Realtime Database
    if (this.rtdbRef) {
      try {
        await this.rtdbRef.set(payload);
        pushedSuccessfully = true;
      } catch (err) {
        console.warn('Realtime Database push warning:', err.message || err);
      }
    }

    if (pushedSuccessfully) {
      this.isConnected = true;
      this.lastSyncTimestamp = new Date();
      this.updateStatusUI('connected', '🟢 लाइव्ह सिंक (Firebase Live)');
      this.logActivity(`क्लाउडवर डेटा सेव्ह केला (${(payload.members || []).length} सदस्य, ${(payload.transactions || []).length} व्यवहार)`);
    } else {
      this.updateStatusUI('offline', 'स्थानिक जतन (क्लाउड प्रलंबित)');
    }
  }

  // ==========================================================================
  // 📥 ५. डेटा फेचिंग फंक्शन्स (Data Fetching APIs)
  // ==========================================================================

  // संपूर्ण स्टेट फेच करणे
  async fetchState() {
    if (!this.isInitialized) {
      return { success: false, message: 'Firebase इनिशिअलाइझ झाले नाही' };
    }

    const startTime = performance.now();
    try {
      if (this.firestoreDocRef) {
        const docSnap = await this.firestoreDocRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const latency = Math.round(performance.now() - startTime);
          this.lastPingMs = latency;
          this.logActivity(`Firestore वरून डेटा फेच केला (${latency}ms)`);
          return { success: true, state: data, source: 'Firestore', latency };
        }
      }

      if (this.rtdbRef) {
        const snap = await this.rtdbRef.once('value');
        const val = snap.val();
        const latency = Math.round(performance.now() - startTime);
        this.lastPingMs = latency;
        if (val) {
          this.logActivity(`Realtime DB वरून डेटा फेच केला (${latency}ms)`);
          return { success: true, state: val, source: 'RealtimeDB', latency };
        }
      }

      return { success: false, message: 'क्लाउडवर डेटा सापडला नाही' };
    } catch (err) {
      console.error('fetchState error:', err);
      return { success: false, message: err.message || err };
    }
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
      this.logActivity(`सदस्य अपडेट: ${member.name} (${member.id})`);
    }
    return member;
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
      await this.saveCurrentStateToCloud(true);
      this.logActivity(`सदस्य डिलीट: ${removed.name} (${memberId})`);
    }
    return removed;
  }

  async updateSettingsInCloud(settings) {
    const meta = window.bishiStore.updateSettings(settings);
    await this.saveCurrentStateToCloud(true);
    this.logActivity('ग्रुप नियम व लेट फी दर अपडेट केले');
    return meta;
  }

  // ==========================================================================
  // ⚡ ७. डेटाबेस लेटन्सी व डायग्नोस्टिक टूल्स (Diagnostics)
  // ==========================================================================

  async pingDatabase() {
    if (!this.isInitialized) {
      return { success: false, message: 'Firebase इनिशिअलाइझ नाही' };
    }

    const startTime = performance.now();
    try {
      if (this.firestoreDocRef) {
        await this.firestoreDocRef.get();
      } else if (this.rtdbRef) {
        await this.rtdbRef.once('value');
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
    if (elCounts) elCounts.textContent = `${stats.membersCount} सदस्य • ${stats.txnsCount} व्यवहार नोंदी`;

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

    // 3. Wipe and Overwrite Firestore Collection
    if (this.firestore) {
      try {
        await this.firestore.collection('sukhakarta_bishi').doc('live_state').set(cleanPayload);
        // Also clear legacy collections if accessible
        try {
          await this.firestore.collection('sukhakarta_bishi_db').doc('state_v2').delete();
        } catch (e) {}
      } catch (err) {
        console.warn('Firestore wipe notice:', err);
      }
    }

    // 4. Wipe and Overwrite Realtime Database Node
    if (this.rtdb) {
      try {
        await this.rtdb.ref('sukhakarta_bishi/live_state').set(cleanPayload);
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
    this.logActivity('🔥 Firebase क्लाउड डेटाबेस पूर्णपणे स्वच्छ करून नवीन तयार करण्यात आला');

    if (window.ui && typeof window.ui.renderAll === 'function') {
      window.ui.renderAll();
    }
    this.renderCloudModalStats();

    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast('🎉 Firebase क्लाउड डेटाबेस रिसेट झाला व नवीन स्वच्छ कलेक्शन तयार झाले!', 'success');
    }

    return true;
  }
}

window.firebaseSyncManager = new FirebaseSyncManager();
