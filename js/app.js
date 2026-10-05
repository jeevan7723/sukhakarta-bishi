/**
 * ==========================================================================
 * सुखकर्ता बीशी - APPLICATION BOOTSTRAPPER WITH FIREBASE REALTIME SYNC
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 सुखकर्ता बीशी - 50-Week Fund Collection System initialized.');
  
  // 0. Initialize Bilingual Internationalization (Marathi / English)
  if (window.i18n && typeof window.i18n.init === 'function') {
    window.i18n.init();
  }

  // 1. Initialize UI & Authentication
  window.ui.init();

  // 2. Initialize Firebase Realtime Cloud Database
  if (window.firebaseSyncManager && typeof window.firebaseSyncManager.init === 'function') {
    window.firebaseSyncManager.init();
  }
});
