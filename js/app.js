/**
 * ==========================================================================
 * सुखकर्ता बीशी - APPLICATION BOOTSTRAPPER WITH FIREBASE REALTIME SYNC
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 सुखकर्ता बीशी - 50-Week Fund Collection System initialized.');
  
  // 1. Initialize UI & Authentication
  window.ui.init();

  // 2. Initialize Firebase Realtime Cloud Database
  if (window.firebaseSyncManager && typeof window.firebaseSyncManager.init === 'function') {
    window.firebaseSyncManager.init();
  }
});
