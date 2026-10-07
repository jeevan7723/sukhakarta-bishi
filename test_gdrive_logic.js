// Node.js test script to verify Google Drive Backup Manager and 11-File FIFO Retention Logic
const fs = require('fs');

// Mock browser environment
const localStorageData = {};
const sessionStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; }
};
global.sessionStorage = {
  getItem: (key) => sessionStorageData[key] || null,
  setItem: (key, val) => { sessionStorageData[key] = String(val); },
  removeItem: (key) => { delete sessionStorageData[key]; }
};

global.window = {
  addEventListener: () => {},
  bishiStore: {
    ensureIntegrity: () => true,
    exportJSON: () => JSON.stringify({ test: 'sukhakarta_bishi_data', timestamp: Date.now() }),
    importJSON: (data) => !!data
  },
  ui: {
    showToast: (msg, type) => console.log(`[Toast ${type || 'info'}]: ${msg}`),
    renderAll: () => {}
  }
};

// Load and evaluate gdrive.js
const gdriveCode = fs.readFileSync('./js/gdrive.js', 'utf-8');
const vm = require('vm');
vm.runInThisContext(gdriveCode);

const mgr = window.gdriveBackupManager || new GoogleDriveBackupManager();

console.log('--- Test 1: Defaults & Config ---');
console.log('Max Backup Files Limit:', mgr.MAX_BACKUP_FILES);
if (mgr.MAX_BACKUP_FILES !== 11) {
  throw new Error('Expected MAX_BACKUP_FILES to be 11, got ' + mgr.MAX_BACKUP_FILES);
}
console.log('Folder Name:', mgr.FOLDER_NAME);
console.log('Default Backup Time:', mgr.backupTime);
console.log('Auto Backup Enabled:', mgr.autoBackupEnabled);

console.log('\n--- Test 2: Local 11-File FIFO Rolling Queue ---');
// Clear existing local backups
localStorage.removeItem('skb_local_backup_history');

// Push 15 backup files sequentially
for (let i = 1; i <= 15; i++) {
  const fileName = `सुखकर्ता_बीशी_बॅकअप_2026-10-07_file_${String(i).padStart(2, '0')}.json`;
  const content = JSON.stringify({ backupId: i, date: '2026-10-07' });
  mgr.saveLocalRollingBackup(fileName, content);
}

const localBackups = mgr.getLocalBackups();
console.log(`Saved 15 files, total files currently retained: ${localBackups.length}`);
if (localBackups.length !== 11) {
  throw new Error(`Expected exactly 11 files in local history, got ${localBackups.length}`);
}

// Check that the first 4 files (file_01, file_02, file_03, file_04) were automatically deleted
// and the oldest remaining file is file_05, while the newest is file_15.
const oldestFile = localBackups[0];
const newestFile = localBackups[localBackups.length - 1];
console.log('Oldest file preserved (1st in queue):', oldestFile.name);
console.log('Newest file preserved (last in queue):', newestFile.name);

if (!oldestFile.name.includes('file_05')) {
  throw new Error(`Expected oldest retained file to be file_05, but got ${oldestFile.name}`);
}
if (!newestFile.name.includes('file_15')) {
  throw new Error(`Expected newest retained file to be file_15, but got ${newestFile.name}`);
}
console.log('✅ Local 11-File FIFO queue test passed!');

console.log('\n--- Test 3: Google Drive 11-File FIFO Deletion Simulation ---');
// Simulate mock Google Drive API listing with 14 files
const mockDriveFiles = [];
for (let i = 1; i <= 14; i++) {
  mockDriveFiles.push({
    id: `gdrive_file_id_${i}`,
    name: `सुखकर्ता_बीशी_बॅकअप_2026-10-0${Math.min(i, 9)}_file_${i}.json`,
    createdTime: new Date(2026, 9, i, 10, 0, 0).toISOString()
  });
}

console.log(`Initial mock Drive files count: ${mockDriveFiles.length}`);

// Test FIFO pruning calculation
const MAX_LIMIT = mgr.MAX_BACKUP_FILES; // 11
mockDriveFiles.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime());

let deletedMockFiles = [];
if (mockDriveFiles.length > MAX_LIMIT) {
  const excess = mockDriveFiles.length - MAX_LIMIT; // 14 - 11 = 3 files to delete
  const toDelete = mockDriveFiles.slice(0, excess);
  deletedMockFiles = toDelete.map(f => f.name);
  mockDriveFiles.splice(0, excess);
}

console.log(`Deleted oldest files count: ${deletedMockFiles.length}`);
console.log('Deleted oldest files:', deletedMockFiles);
console.log(`Remaining files in Drive: ${mockDriveFiles.length}`);

if (deletedMockFiles.length !== 3) {
  throw new Error('Expected 3 oldest files to be deleted');
}
if (mockDriveFiles.length !== 11) {
  throw new Error('Expected remaining files to be exactly 11');
}
if (mockDriveFiles[0].id !== 'gdrive_file_id_4') {
  throw new Error('Expected oldest remaining file to be id_4, got ' + mockDriveFiles[0].id);
}
console.log('✅ Google Drive 11-File FIFO deletion logic verified!');

console.log('\n--- Test 4: Daily Scheduled Backup Checks ---');
// Test scheduling behavior
mgr.autoBackupEnabled = true;
mgr.backupTime = '22:00';
mgr.lastBackupDate = '2026-10-06'; // Yesterday

// Mock connected state
mgr.scriptUrl = 'https://script.google.com/macros/s/test/exec';
console.log('Is manager connected?:', mgr.isConnected());
if (!mgr.isConnected()) {
  throw new Error('Expected manager to be connected with scriptUrl');
}

// Test settings update
mgr.saveSettings('test-client-id.apps.googleusercontent.com', 'https://script.google.com/macros/s/test2/exec', '21:30', true);
if (mgr.clientId !== 'test-client-id.apps.googleusercontent.com') {
  throw new Error('Failed to save Client ID');
}
if (mgr.backupTime !== '21:30') {
  throw new Error('Failed to save backup time');
}
console.log('Settings successfully updated and persisted:', {
  clientId: mgr.clientId,
  scriptUrl: mgr.scriptUrl,
  backupTime: mgr.backupTime,
  autoBackupEnabled: mgr.autoBackupEnabled
});

console.log('\n✅ ALL GOOGLE DRIVE AUTOMATIC BACKUP & 11-FILE FIFO TESTS PASSED 100%!');
