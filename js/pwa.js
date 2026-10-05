/**
 * सुखकर्ता बीशी - PWA (Progressive Web App) Manager
 * Handles Service Worker registration, Install Prompts (Android/Chrome/Edge),
 * iOS "Add to Home Screen" instructions, and offline indicators.
 */

(function() {
  'use strict';

  let deferredPrompt = null;
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && window.navigator.standalone);

  window.pwaManager = {
    deferredPrompt: null,
    isIos: isIos,
    isStandalone: isInStandaloneMode,

    init() {
      this.registerServiceWorker();
      this.setupInstallListeners();
      this.updateInstallUi();
      this.setupNetworkStatusListener();
    },

    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then((reg) => {
              console.log('✅ [PWA] Service Worker registered successfully, scope:', reg.scope);
              
              // Handle SW updates
              reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                      if (navigator.serviceWorker.controller) {
                        console.log('🔄 [PWA] New update available.');
                      } else {
                        console.log('🎉 [PWA] App is ready for offline use!');
                      }
                    }
                  };
                }
              };
            })
            .catch((err) => {
              console.warn('⚠️ [PWA] Service Worker registration failed:', err);
            });
        });
      }
    },

    setupInstallListeners() {
      // 1. Android / Chrome / Edge install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar on mobile
        e.preventDefault();
        deferredPrompt = e;
        this.deferredPrompt = e;
        console.log('💡 [PWA] beforeinstallprompt captured.');
        this.showInstallPrompts(true);
      });

      // 2. Installed event
      window.addEventListener('appinstalled', (evt) => {
        console.log('🎉 [PWA] App was successfully installed!');
        deferredPrompt = null;
        this.deferredPrompt = null;
        this.showInstallPrompts(false);
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('🎉 सुखकर्ता बीशी ॲप मोबाईलवर यशस्वीरित्या इन्स्टॉल झाले!', 'success');
        }
      });
    },

    promptInstall() {
      if (deferredPrompt) {
        // Trigger native Chrome/Android install prompt
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted PWA install prompt');
            if (window.ui && typeof window.ui.showToast === 'function') {
              window.ui.showToast('ॲप इन्स्टॉल केले जात आहे...', 'info');
            }
          } else {
            console.log('❌ User dismissed PWA install prompt');
          }
          deferredPrompt = null;
          this.deferredPrompt = null;
          this.showInstallPrompts(false);
        });
      } else if (isIos && !isInStandaloneMode) {
        // Show iOS Add to Home Screen Instructions
        this.openIosInstallModal();
      } else {
        // If already standalone or standard browser
        if (isInStandaloneMode) {
          if (window.ui && typeof window.ui.showToast === 'function') {
            window.ui.showToast('हे ॲप आधीच इन्स्टॉल झालेले आहे!', 'info');
          }
        } else {
          this.openGenericInstallModal();
        }
      }
    },

    showInstallPrompts(visible) {
      const banner = document.getElementById('pwaInstallBanner');
      const sidebarBtn = document.getElementById('btnPwaInstallSidebar');
      const headerBtn = document.getElementById('btnPwaInstallHeader');

      if (isInStandaloneMode) {
        if (banner) banner.style.display = 'none';
        if (sidebarBtn) sidebarBtn.style.display = 'none';
        if (headerBtn) headerBtn.style.display = 'none';
        return;
      }

      if (banner) banner.style.display = visible ? 'flex' : 'none';
      if (sidebarBtn) sidebarBtn.style.display = visible ? 'flex' : 'none';
      if (headerBtn) headerBtn.style.display = visible ? 'inline-flex' : 'none';
    },

    updateInstallUi() {
      if (isInStandaloneMode) {
        this.showInstallPrompts(false);
      } else {
        // If on iOS or mobile device, show sidebar button by default so users always have install option
        const sidebarBtn = document.getElementById('btnPwaInstallSidebar');
        const headerBtn = document.getElementById('btnPwaInstallHeader');
        if (sidebarBtn) sidebarBtn.style.display = 'flex';
        if (headerBtn && window.innerWidth <= 768) headerBtn.style.display = 'inline-flex';
      }
    },

    openIosInstallModal() {
      const modal = document.getElementById('pwaIosModal');
      if (modal) {
        modal.classList.add('active');
      } else {
        alert("iPhone वर इन्स्टॉल करण्यासाठी:\n1. Safari मधील खालचे Share बटण (📤) दाबा.\n2. 'Add to Home Screen' (होम स्क्रीनवर जोडा ➕) निवडा.");
      }
    },

    openGenericInstallModal() {
      const modal = document.getElementById('pwaInstallGuideModal');
      if (modal) {
        modal.classList.add('active');
      } else {
        alert("ॲप इन्स्टॉल करण्यासाठी आपल्या ब्राउझरच्या मेनूवर (तीन ठिपके ⋮ किंवा शेअर) क्लिक करून 'Add to Home Screen' किंवा 'Install App' निवडा.");
      }
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    },

    dismissBanner() {
      const banner = document.getElementById('pwaInstallBanner');
      if (banner) banner.style.display = 'none';
      sessionStorage.setItem('sukhakarta_pwa_banner_dismissed', 'true');
    },

    setupNetworkStatusListener() {
      const handleOnline = () => {
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('🟢 आपण परत ऑनलाइन आला आहात!', 'success');
        }
      };
      const handleOffline = () => {
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('📶 ऑफलाइन मोड: ॲप सुरू राहील, डेटा सुरक्षित आहे.', 'warning');
        }
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.pwaManager.init());
  } else {
    window.pwaManager.init();
  }
})();
