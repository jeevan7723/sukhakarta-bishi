/**
 * ==========================================================================
 * सुखकर्ता बीशी - GOOGLE DRIVE AUTOMATIC BACKUP & 11-FILE ROLLING RETENTION
 * (Google Drive Auto-Backup Manager with 11-File FIFO Rotation)
 * ==========================================================================
 * 
 * वैशिष्ट्ये (Features):
 * १. दररोज ठरविक वेळेस आपोआप Google Drive वर बॅकअप साठवणे.
 * २. Google Drive वर जास्तीत जास्त ११ बॅकअप फाईल्स ठेवणे.
 * ३. १२ वी फाईल सेव्ह होताच सर्वात जुनी (१ ली) फाईल आपोआप डिलीट करणे (FIFO Retention).
 * ४. Google Identity Services (OAuth2) आणि Google Apps Script Webhook दोन्ही पर्याय.
 * ५. स्थानिक ११ फाईल्स रोटेशन (Local Snapshot Queue) फॉलबॅक.
 * ६. Google Drive वरून १-क्लिक डेटा पूर्ववत (Restore) व डाउनलोड सुविधा.
 */

class GoogleDriveBackupManager {
  constructor() {
    this.MAX_BACKUP_FILES = 11;
    this.FOLDER_NAME = 'सुखकर्ता बीशी बॅकअप';
    this.SCOPE = 'https://www.googleapis.com/auth/drive.file';
    
    // Configuration from localStorage
    this.clientId = localStorage.getItem('skb_gdrive_client_id') || '';
    this.scriptUrl = localStorage.getItem('skb_gdrive_script_url') || '';
    this.autoBackupEnabled = localStorage.getItem('skb_gdrive_auto_enabled') !== 'false';
    this.backupTime = localStorage.getItem('skb_gdrive_backup_time') || '22:00'; // Default 10:00 PM
    this.lastBackupDate = localStorage.getItem('skb_gdrive_last_date') || '';
    this.lastBackupTime = localStorage.getItem('skb_gdrive_last_timestamp') || '';
    
    // Auth state
    this.tokenClient = null;
    this.accessToken = sessionStorage.getItem('skb_gdrive_token') || null;
    this.tokenExpiresAt = parseInt(sessionStorage.getItem('skb_gdrive_token_exp') || '0', 10);
    this.folderId = localStorage.getItem('skb_gdrive_folder_id') || null;
    this.accountEmail = localStorage.getItem('skb_gdrive_account_email') || '';
    
    this.isBackingUp = false;
    this.schedulerInterval = null;
    this.cachedDriveFiles = [];

    this.init();
  }

  // --- १. इनिशिअलायझेशन (Initialization) ---
  init() {
    this.setupScheduler();
    this.initGISClient();

    // Listen to store updates or online events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.checkScheduledDailyBackup();
      });
      // Run quick check 5 seconds after boot
      setTimeout(() => {
        this.checkScheduledDailyBackup();
      }, 5000);
    }
  }

  // Initialize Google Identity Services Client
  initGISClient() {
    if (typeof window === 'undefined') return;
    
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      if (this.clientId) {
        try {
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.clientId.trim(),
            scope: this.SCOPE,
            callback: (resp) => {
              if (resp.error) {
                console.error('[GDrive] Auth error:', resp);
                window.ui?.showToast('Google Drive ऑथरायझेशन अयशस्वी: ' + resp.error, 'error');
                return;
              }
              this.setAccessToken(resp.access_token, resp.expires_in);
              this.fetchUserInfo();
              window.ui?.showToast('✅ Google Drive यशस्वीरीत्या जोडले गेले!', 'success');
              this.renderStatusUI();
              this.loadFilesList();
            }
          });
        } catch (e) {
          console.warn('[GDrive] GIS Client init notice:', e);
        }
      }
    } else {
      // Retry loading GIS after a moment if library is still downloading
      setTimeout(() => this.initGISClient(), 1500);
    }
  }

  // Store token in session
  setAccessToken(token, expiresIn) {
    this.accessToken = token;
    const expiresSec = parseInt(expiresIn, 10) || 3600;
    this.tokenExpiresAt = Date.now() + (expiresSec - 120) * 1000;
    sessionStorage.setItem('skb_gdrive_token', token);
    sessionStorage.setItem('skb_gdrive_token_exp', this.tokenExpiresAt.toString());
  }

  // Check if token is valid
  isTokenValid() {
    return !!(this.accessToken && Date.now() < this.tokenExpiresAt);
  }

  // Check if connected via GIS or Apps Script Webhook
  isConnected() {
    if (this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com/')) {
      return true;
    }
    return this.isTokenValid() || !!this.accountEmail;
  }

  // Fetch Google User Profile info
  async fetchUserInfo() {
    if (!this.isTokenValid()) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.accountEmail = data.email || '';
        localStorage.setItem('skb_gdrive_account_email', this.accountEmail);
        this.renderStatusUI();
      }
    } catch (e) {
      console.warn('[GDrive] User info fetch error:', e);
    }
  }

  // --- २. कनेक्ट आणि डिस्कनेक्ट (Connect & Disconnect) ---
  connect(promptOverride = 'select_account') {
    // जर युझरने Apps Script URL टाकली असेल तर थेट त्याद्वारे कनेक्ट करा
    const inputScriptUrl = document.getElementById('gdriveScriptUrlInput')?.value?.trim();
    if (inputScriptUrl && inputScriptUrl.startsWith('https://script.google.com/')) {
      this.scriptUrl = inputScriptUrl;
      localStorage.setItem('skb_gdrive_script_url', this.scriptUrl);
      this.renderStatusUI();
      this.loadFilesList();
      window.ui?.showToast('✅ Google Apps Script द्वारे Drive जोडले गेले!', 'success');
      return;
    }

    if (this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com/')) {
      window.ui?.showToast('Google Apps Script द्वारे Drive आधीच जोडलेले आहे.', 'info');
      return;
    }

    if (!this.clientId) {
      const inputClientId = document.getElementById('gdriveClientIdInput')?.value?.trim();
      if (inputClientId) {
        this.clientId = inputClientId;
        localStorage.setItem('skb_gdrive_client_id', this.clientId);
      }
    }

    if (!this.clientId) {
      window.ui?.showToast('Google ने कनेक्ट करण्यासाठी खाली Client ID टाका, किंवा पर्याय २ मधील Apps Script URL वापरा!', 'warning');
      const details = document.querySelector('#gdriveModal details');
      if (details) details.open = true;
      document.getElementById('gdriveClientIdInput')?.focus();
      return;
    }

    if (!this.tokenClient) {
      this.initGISClient();
    }

    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: promptOverride });
    } else {
      window.ui?.showToast('Google Identity लायब्ररी लोड होत आहे, कृपया १ सेकंदाने पुन्हा प्रयत्न करा.', 'info');
    }
  }

  disconnect() {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.accountEmail = '';
    this.folderId = null;
    this.scriptUrl = '';
    sessionStorage.removeItem('skb_gdrive_token');
    sessionStorage.removeItem('skb_gdrive_token_exp');
    localStorage.removeItem('skb_gdrive_account_email');
    localStorage.removeItem('skb_gdrive_folder_id');
    localStorage.removeItem('skb_gdrive_script_url');

    const inputScriptUrl = document.getElementById('gdriveScriptUrlInput');
    if (inputScriptUrl) inputScriptUrl.value = '';

    this.cachedDriveFiles = [];
    this.renderStatusUI();
    this.loadFilesList();
    window.ui?.showToast('Google Drive डिस्कनेक्ट केले.', 'info');
  }

  // --- ३. फोल्डर शोधणे किंवा नवीन तयार करणे (Folder Management) ---
  async getOrCreateFolder() {
    if (this.folderId) {
      // Verify cached folder exists
      try {
        const verifyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${this.folderId}?fields=id,trashed`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        if (verifyRes.ok) {
          const folderData = await verifyRes.json();
          if (!folderData.trashed) return this.folderId;
        }
      } catch (e) {
        // Continue to search or create
      }
    }

    // Search for folder by name
    const query = encodeURIComponent(`name = '${this.FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        this.folderId = data.files[0].id;
        localStorage.setItem('skb_gdrive_folder_id', this.folderId);
        return this.folderId;
      }
    }

    // Create new folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      this.folderId = folderData.id;
      localStorage.setItem('skb_gdrive_folder_id', this.folderId);
      return this.folderId;
    }

    throw new Error('Google Drive फोल्डर तयार करता आले नाही');
  }

  // --- ४. मुख्य बॅकअप पद्धत (Backup to Drive with 11-file FIFO Retention) ---
  async backupNow(options = {}) {
    const isAuto = !!options.isAuto;

    if (this.isBackingUp) {
      if (!isAuto) window.ui?.showToast('बॅकअप प्रक्रिया आधीच चालू आहे...', 'info');
      return false;
    }

    this.isBackingUp = true;
    this.updateBackupButtonState(true);

    try {
      // Ensure data integrity before export
      if (window.bishiStore && typeof window.bishiStore.ensureIntegrity === 'function') {
        window.bishiStore.ensureIntegrity();
      }

      const jsonStr = window.bishiStore ? window.bishiStore.exportJSON() : '{}';
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
      const fileName = `सुखकर्ता_बीशी_बॅकअप_${dateStr}_${timeStr}.json`;

      // 1. Always update local 11-file rolling queue as immediate offline backup
      this.saveLocalRollingBackup(fileName, jsonStr);

      let driveSuccess = false;
      let deletedFilesCount = 0;
      let totalRemaining = 0;

      // Method A: Google Apps Script Webhook (if configured)
      if (this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com/')) {
        const scriptResult = await this.uploadViaAppsScript(fileName, jsonStr);
        if (scriptResult && scriptResult.success) {
          driveSuccess = true;
          deletedFilesCount = scriptResult.deletedCount || 0;
          totalRemaining = scriptResult.remainingCount || 1;
        }
      }
      // Method B: Official Google Drive API v3 (GIS OAuth Token)
      else if (this.isTokenValid()) {
        const driveResult = await this.uploadViaDriveApi(fileName, jsonStr);
        if (driveResult && driveResult.success) {
          driveSuccess = true;
          deletedFilesCount = driveResult.deletedCount || 0;
          totalRemaining = driveResult.remainingCount || 1;
        }
      } else {
        // Token expired or not connected
        if (!isAuto) {
          // Attempt silent or interactive connect
          if (this.clientId) {
            window.ui?.showToast('Google Drive कनेक्शन आवश्यक आहे, कृपया लॉगिन करा.', 'warning');
            this.connect();
          } else {
            window.ui?.showToast('स्थानिक बॅकअप सुरक्षित (Google Drive जोडलेले नाही).', 'info');
            this.openGdriveModal();
          }
        }
        this.isBackingUp = false;
        this.updateBackupButtonState(false);
        return false;
      }

      if (driveSuccess) {
        const nowIso = new Date().toISOString();
        this.lastBackupTime = nowIso;
        this.lastBackupDate = dateStr;
        localStorage.setItem('skb_gdrive_last_timestamp', this.lastBackupTime);
        localStorage.setItem('skb_gdrive_last_date', this.lastBackupDate);

        let msg = `✅ बॅकअप Google Drive वर सेव्ह झाला! (एकूण ${totalRemaining} फाईल्स)`;
        if (deletedFilesCount > 0) {
          msg = `✅ Drive वर नवीन बॅकअप सेव्ह झाला आणि सर्वात जुनी १ ली फाईल आपोआप डिलीट झाली (एकूण ११ फाईल्स व्यवस्थापित)!`;
        }
        window.ui?.showToast(msg, 'success');

        this.renderStatusUI();
        this.loadFilesList();
        this.isBackingUp = false;
        this.updateBackupButtonState(false);
        return true;
      }

    } catch (err) {
      console.error('[GDrive] Backup error:', err);
      if (!isAuto) {
        window.ui?.showToast('Google Drive बॅकअप त्रुटी: ' + (err.message || err), 'error');
      }
    } finally {
      this.isBackingUp = false;
      this.updateBackupButtonState(false);
    }

    return false;
  }

  // --- ५. GOOGLE DRIVE API V3 अपलोड आणि ११ फाईल्स FIFO रोटेशन ---
  async uploadViaDriveApi(fileName, jsonContent) {
    const folderId = await this.getOrCreateFolder();

    // 1. Multipart Upload
    const boundary = '-------SukhakartaBishiBoundary' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: 'सुखकर्ता बीशी सुरक्षित बॅकअप',
      properties: {
        app: 'sukhakarta_bishi',
        source: 'auto_backup'
      }
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`अपलोड अयशस्वी (${uploadRes.status}): ${errText}`);
    }

    const uploadedFile = await uploadRes.json();
    console.log('[GDrive] File uploaded successfully:', uploadedFile.name, uploadedFile.id);

    // 2. FIFO 11-File Retention Rule Check & Oldest File Deletion
    const retentionResult = await this.enforceElevenFilesLimit(folderId);

    return {
      success: true,
      file: uploadedFile,
      deletedCount: retentionResult.deletedCount,
      remainingCount: retentionResult.remainingCount
    };
  }

  // ११ फाईल्सची मर्यादा तपासणे व १ ली सर्वात जुनी फाईल डिलीट करणे (FIFO Retention)
  async enforceElevenFilesLimit(folderId) {
    let deletedCount = 0;
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType = 'application/json'`);
      const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime asc&fields=files(id,name,createdTime,size)&pageSize=100`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!listRes.ok) return { deletedCount: 0, remainingCount: this.MAX_BACKUP_FILES };

      const data = await listRes.json();
      const files = data.files || [];

      // Sort files by createdTime asc (Oldest file first, newest file last)
      files.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime());

      // If more than 11 files exist, delete oldest files (starting from index 0)
      if (files.length > this.MAX_BACKUP_FILES) {
        const excessCount = files.length - this.MAX_BACKUP_FILES;
        const filesToDelete = files.slice(0, excessCount);

        for (const oldFile of filesToDelete) {
          try {
            const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${oldFile.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            if (delRes.ok || delRes.status === 204) {
              deletedCount++;
              console.log(`[GDrive FIFO] 🗑️ जुनी बॅकअप फाईल डिलीट केली: ${oldFile.name} (${oldFile.id})`);
            }
          } catch (delErr) {
            console.warn('[GDrive FIFO] Failed to delete old file:', oldFile.name, delErr);
          }
        }
      }

      return {
        deletedCount,
        remainingCount: Math.min(files.length - deletedCount, this.MAX_BACKUP_FILES)
      };
    } catch (e) {
      console.warn('[GDrive FIFO] Retention enforcement warning:', e);
      return { deletedCount, remainingCount: this.MAX_BACKUP_FILES };
    }
  }

  // --- ६. GOOGLE APPS SCRIPT WEBHOOK पर्याय (Alternative 1-Click Upload) ---
  async uploadViaAppsScript(fileName, jsonContent) {
    const payload = {
      action: 'backup',
      folderName: this.FOLDER_NAME,
      fileName: fileName,
      content: jsonContent,
      maxFiles: this.MAX_BACKUP_FILES // 11 files max
    };

    const res = await fetch(this.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Apps Script त्रुटी (${res.status})`);
    }

    const data = await res.json();
    return data;
  }

  // --- ७. स्थानिक ११ फाईल्स रोटेशन (Local Rolling Queue Fallback) ---
  saveLocalRollingBackup(fileName, jsonStr) {
    try {
      let history = [];
      const stored = localStorage.getItem('skb_local_backup_history');
      if (stored) {
        try { history = JSON.parse(stored); } catch (e) { history = []; }
      }

      const item = {
        name: fileName,
        timestamp: new Date().toISOString(),
        size: jsonStr.length,
        data: jsonStr
      };

      history.push(item);

      // FIFO: If more than 11 files, remove oldest from front
      while (history.length > this.MAX_BACKUP_FILES) {
        const removed = history.shift();
        console.log(`[Local FIFO] 🗑️ जुना स्थानिक बॅकअप काढला: ${removed.name}`);
      }

      localStorage.setItem('skb_local_backup_history', JSON.stringify(history));
    } catch (e) {
      console.warn('[Local FIFO] Local backup history error:', e);
    }
  }

  getLocalBackups() {
    try {
      const stored = localStorage.getItem('skb_local_backup_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // --- ८. दररोज ठरविक वेळेस ऑटो बॅकअप शेड्युलर (Daily Auto Scheduler) ---
  setupScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    // Check every 30 seconds
    this.schedulerInterval = setInterval(() => {
      this.checkScheduledDailyBackup();
    }, 30000);
  }

  checkScheduledDailyBackup() {
    if (!this.autoBackupEnabled) return;
    if (!this.isConnected()) return;

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];

    // Already backed up today?
    if (this.lastBackupDate === todayDate) return;

    // Check if current time is >= scheduled time (e.g. "22:00")
    const [targetHour, targetMinute] = (this.backupTime || '22:00').split(':').map(n => parseInt(n, 10) || 0);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isPastScheduledTime = (currentHour > targetHour) || (currentHour === targetHour && currentMinute >= targetMinute);

    if (isPastScheduledTime) {
      console.log(`[GDrive Scheduler] ⏰ दैनिक ऑटो-बॅकअप सुरू करत आहे (${this.backupTime})...`);
      this.backupNow({ isAuto: true });
    }
  }

  // --- ९. Google Drive मधील बॅकअप फाईल्स यादी आणणे (List Files) ---
  async fetchDriveFiles() {
    if (!this.isTokenValid()) return [];
    try {
      const folderId = await this.getOrCreateFolder();
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType = 'application/json'`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,webViewLink)&pageSize=20`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        this.cachedDriveFiles = data.files || [];
        return this.cachedDriveFiles;
      }
    } catch (e) {
      console.warn('[GDrive] Fetch files list error:', e);
    }
    return [];
  }

  // --- १०. Google Drive वरून फाईल डाऊनलोड व रिस्टोर (Download & Restore) ---
  async downloadDriveFile(fileId, fileName) {
    if (!this.isTokenValid()) {
      window.ui?.showToast('Google Drive कनेक्ट केलेले नाही', 'warning');
      return;
    }
    try {
      window.ui?.showToast('Google Drive वरून फाईल डाउनलोड होत आहे...', 'info');
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) throw new Error('फाईल मिळवता आली नाही');
      const text = await res.text();

      // Trigger browser download
      if (window.exportManager && typeof window.exportManager.downloadFile === 'function') {
        window.exportManager.downloadFile(text, fileName, 'application/json');
      } else {
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      window.ui?.showToast(`✅ ${fileName} डाउनलोड झाली!`, 'success');
    } catch (e) {
      window.ui?.showToast('डाउनलोड त्रुटी: ' + e.message, 'error');
    }
  }

  async restoreFromDriveFile(fileId, fileName) {
    if (!confirm(`तुम्हाला खात्री आहे का?\n\n'${fileName}' या बॅकअपमधून संपूर्ण डेटा पूर्ववत (Restore) केला जाईल.\nचालू न सेव्ह केलेला डेटा बदलला जाईल.`)) {
      return;
    }

    try {
      window.ui?.showToast('Google Drive वरून डेटा पूर्ववत करत आहे...', 'info');
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) throw new Error('फाईल मिळवता आली नाही');
      const jsonText = await res.text();

      const success = window.bishiStore.importJSON(jsonText);
      if (success) {
        window.ui?.showToast(`🎉 डेटाबेस Google Drive वरून पूर्ववत (Restore) झाला!`, 'success');
        window.ui?.renderAll();
      } else {
        window.ui?.showToast('अवैध बॅकअप फाईल फॉरमॅट', 'error');
      }
    } catch (e) {
      window.ui?.showToast('रिस्टोर त्रुटी: ' + e.message, 'error');
    }
  }

  async deleteDriveFile(fileId, fileName) {
    if (!confirm(`'${fileName}' ही फाईल Google Drive वरून कायमची डिलीट करायची आहे का?`)) return;

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok || res.status === 204) {
        window.ui?.showToast('फाईल Google Drive वरून डिलीट केली.', 'info');
        this.loadFilesList();
      }
    } catch (e) {
      window.ui?.showToast('डिलीट करताना त्रुटी: ' + e.message, 'error');
    }
  }

  // --- ११. UI रेंडरिंग व मोडल नियंत्रक (UI Helpers) ---
  saveSettings(newClientId, newScriptUrl, newBackupTime, newAutoEnabled) {
    this.clientId = (newClientId || '').trim();
    this.scriptUrl = (newScriptUrl || '').trim();
    this.backupTime = newBackupTime || '22:00';
    this.autoBackupEnabled = !!newAutoEnabled;

    localStorage.setItem('skb_gdrive_client_id', this.clientId);
    localStorage.setItem('skb_gdrive_script_url', this.scriptUrl);
    localStorage.setItem('skb_gdrive_backup_time', this.backupTime);
    localStorage.setItem('skb_gdrive_auto_enabled', this.autoBackupEnabled ? 'true' : 'false');

    this.initGISClient();
    this.renderStatusUI();
    window.ui?.showToast('⚙️ Google Drive सेटिंग्ज सेव्ह झाल्या!', 'success');
  }

  openGdriveModal() {
    const modal = document.getElementById('gdriveModal');
    if (modal) {
      this.populateSettingsForm();
      this.renderStatusUI();
      this.loadFilesList();
      modal.classList.add('active');
    }
  }

  closeGdriveModal() {
    const modal = document.getElementById('gdriveModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  populateSettingsForm() {
    if (typeof document === 'undefined') return;
    const inputClientId = document.getElementById('gdriveClientIdInput');
    const inputScriptUrl = document.getElementById('gdriveScriptUrlInput');
    const inputTime = document.getElementById('gdriveBackupTimeInput');
    const checkAuto = document.getElementById('gdriveAutoEnabledCheck');

    if (inputClientId) inputClientId.value = this.clientId;
    if (inputScriptUrl) inputScriptUrl.value = this.scriptUrl;
    if (inputTime) inputTime.value = this.backupTime;
    if (checkAuto) checkAuto.checked = this.autoBackupEnabled;

    const codeBox = document.getElementById('gdriveScriptCodeBox');
    if (codeBox && window.APPS_SCRIPT_TEMPLATE) {
      codeBox.value = window.APPS_SCRIPT_TEMPLATE;
    }
  }

  renderStatusUI() {
    if (typeof document === 'undefined') return;
    const connected = this.isConnected();
    const statusBadges = document.querySelectorAll('.gdrive-status-badge');
    statusBadges.forEach(el => {
      if (connected) {
        el.innerHTML = '<span style="color: var(--emerald-400); font-weight: 700;">🟢 कनेक्टेड</span>';
      } else {
        el.innerHTML = '<span style="color: var(--text-muted); font-weight: 700;">⚪ डिस्कनेक्टेड</span>';
      }
    });

    const accountEls = document.querySelectorAll('.gdrive-account-text');
    accountEls.forEach(el => {
      if (this.accountEmail) {
        el.textContent = this.accountEmail;
      } else if (this.scriptUrl) {
        el.textContent = 'Apps Script Webhook द्वारे जोडलेले';
      } else {
        el.textContent = 'कोणतेही Google खाते जोडलेले नाही';
      }
    });

    const lastBackupEls = document.querySelectorAll('.gdrive-last-backup-text');
    lastBackupEls.forEach(el => {
      if (this.lastBackupTime) {
        const d = new Date(this.lastBackupTime);
        el.textContent = d.toLocaleString('mr-IN', { dateStyle: 'medium', timeStyle: 'short' });
      } else {
        el.textContent = 'अद्याप घेतलेला नाही';
      }
    });

    const scheduleEls = document.querySelectorAll('.gdrive-schedule-text');
    scheduleEls.forEach(el => {
      el.textContent = `दररोज ${this.backupTime} वाजता (कमाल ११ फाईल्स FIFO)`;
    });

    // सर्व Connect बटणे अद्ययावत करा (नेहमी दृश्यमान ठेवा)
    const connectBtns = document.querySelectorAll('.btn-gdrive-connect, #btnGdriveConnect, #btnMainGdriveConnect');
    connectBtns.forEach(btn => {
      if (connected) {
        btn.innerHTML = '<span>🔄</span> पुन्हा कनेक्ट करा';
        btn.title = 'नवीन खात्याने किंवा Apps Script ने पुन्हा कनेक्ट करा';
      } else {
        btn.innerHTML = '<span>🌐</span> Google ने कनेक्ट करा';
        btn.title = 'Google Drive जोडा';
      }
      btn.style.display = 'inline-flex';
    });

    // सर्व Disconnect बटणे
    const disconnectBtns = document.querySelectorAll('.btn-gdrive-disconnect, #btnGdriveDisconnect');
    disconnectBtns.forEach(btn => {
      btn.style.display = connected ? 'inline-flex' : 'none';
    });
  }

  updateBackupButtonState(loading) {
    if (typeof document === 'undefined') return;
    const btns = document.querySelectorAll('.btn-gdrive-backup-now');
    btns.forEach(btn => {
      if (loading) {
        btn.disabled = true;
        btn.innerHTML = '⏳ बॅकअप Drive वर सेव्ह होत आहे...';
      } else {
        btn.disabled = false;
        btn.innerHTML = '☁️ आताच Google Drive वर बॅकअप घ्या';
      }
    });
  }

  async loadFilesList() {
    const container = document.getElementById('gdriveFilesList');
    if (!container) return;

    if (!this.isConnected()) {
      // Show local snapshots if Drive not connected
      const localBackups = this.getLocalBackups();
      if (!localBackups.length) {
        container.innerHTML = `
          <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
            Google Drive जोडलेले नाही. Drive कनेक्ट केल्यावर येथे ११ फाईल्सची यादी दिसेल.
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="padding: 0.5rem 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--gold-400); margin-bottom: 0.5rem;">
          ℹ️ Google Drive ऑफलाइन / डिस्कनेक्टेड आहे. खाली स्थानिक सुरक्षित ११-रोलिंग फाईल्स दिसत आहेत:
        </div>
        ${this.renderFilesHtml(localBackups, true)}
      `;
      return;
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">
        🔄 Google Drive वरील फाईल्स तपासत आहे...
      </div>
    `;

    const files = await this.fetchDriveFiles();
    if (!files || !files.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
          Google Drive वर अद्याप कोणतीही बॅकअप फाईल नाही. "आताच बॅकअप घ्या" बटण दाबा.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; font-size: 0.8rem; color: var(--text-secondary);">
        <span>📂 <strong>${this.FOLDER_NAME}</strong> फोल्डरमधील फाईल्स (${files.length} / ११)</span>
        <span style="color: var(--emerald-400); font-weight: 700;">FIFO ऑटो-रोटेशन सक्रिय</span>
      </div>
      ${this.renderFilesHtml(files, false)}
    `;
  }

  renderFilesHtml(files, isLocal = false) {
    return files.map((file, idx) => {
      const dateStr = file.createdTime || file.timestamp || '';
      const formattedDate = dateStr ? new Date(dateStr).toLocaleString('mr-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
      const sizeKb = file.size ? `${(file.size / 1024).toFixed(1)} KB` : '';
      const isOldest = idx === files.length - 1 && files.length >= this.MAX_BACKUP_FILES;

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 0.4rem; gap: 0.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; min-width: 180px;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); word-break: break-all; display: flex; align-items: center; gap: 0.3rem;">
              <span>📄</span>
              <span>${file.name}</span>
              ${idx === 0 ? '<span style="font-size: 0.65rem; background: rgba(16, 185, 129, 0.2); color: var(--emerald-400); padding: 0.1rem 0.35rem; border-radius: 999px;">नवीनतम</span>' : ''}
              ${isOldest ? '<span style="font-size: 0.65rem; background: rgba(244, 63, 94, 0.2); color: var(--rose-400); padding: 0.1rem 0.35rem; border-radius: 999px;">पुढील डिलीट</span>' : ''}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">
              📅 ${formattedDate} ${sizeKb ? `• 💾 ${sizeKb}` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            ${!isLocal ? `
              <button type="button" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="window.gdriveBackupManager.downloadDriveFile('${file.id}', '${file.name}')" title="डाउनलोड करा">
                📥 डाउनलोड
              </button>
              <button type="button" class="btn btn-emerald btn-sm" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="window.gdriveBackupManager.restoreFromDriveFile('${file.id}', '${file.name}')" title="डेटा पूर्ववत करा">
                🔄 रिस्टोर
              </button>
              <button type="button" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.45rem; font-size: 0.75rem;" onclick="window.gdriveBackupManager.deleteDriveFile('${file.id}', '${file.name}')" title="डिलीट करा">
                🗑️
              </button>
            ` : `
              <button type="button" class="btn btn-emerald btn-sm" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="window.bishiStore.importJSON(window.gdriveBackupManager.getLocalBackups()[${idx}].data); window.ui.renderAll(); window.ui.showToast('स्थानिक बॅकअप पूर्ववत झाला!', 'success');">
                🔄 रिस्टोर
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Global instance initialization
if (typeof window !== 'undefined') {
  window.gdriveBackupManager = new GoogleDriveBackupManager();
}
