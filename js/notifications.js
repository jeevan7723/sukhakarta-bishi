/**
 * ==========================================================================
 * सुखकर्ता बीशी - MOBILE & WEB NOTIFICATION ENGINE (सुवार्ता व अलर्ट्स)
 * Handles:
 *  1. PWA & Web Browser Native Notifications (Mobile System Tray / Lock Screen)
 *  2. "2 Days Early" Deposit Installment Reminders (२ दिवस आधी हप्ता भरणा सूचना)
 *  3. All Loan Action Notifications (कर्ज वाटप, ३% व्याज जमा, मुद्दल परतफेड, पूर्ण फेड)
 *  4. In-App Notification Tray / Center with Filter Tabs & Unread Badge Counters
 * ==========================================================================
 */

(function() {
  'use strict';

  const NOTIF_STORAGE_KEY = 'sukhakarta_notifications_v1';
  const NOTIF_SETTINGS_KEY = 'sukhakarta_notif_settings_v1';
  const MAX_HISTORY = 50;

  class NotificationManager {
    constructor() {
      this.notifications = this.loadNotifications();
      this.settings = this.loadSettings();
      this.activeTab = 'all'; // 'all' | 'installment' | 'loan'
      this.swRegistration = null;

      // Initialize after DOM loads
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('DOMContentLoaded', () => {
          this.init();
        });
      }
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
      return {
        enabled: true,
        depositReminders: true,
        loanActions: true,
        soundEnabled: true,
        vibrateEnabled: true,
        lastDepositCheckDate: null,
        lastLoanCheckDate: null
      };
    }

    saveSettings() {
      try {
        localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (e) {
        // ignore
      }
    }

    loadNotifications() {
      try {
        const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) return list;
        }
      } catch (e) {
        // ignore
      }
      return [];
    }

    saveNotifications() {
      try {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(this.notifications.slice(0, MAX_HISTORY)));
      } catch (e) {
        // ignore
      }
      this.updateBadges();
    }

    init() {
      this.findServiceWorkerRegistration();
      this.updateBadges();
      this.renderNotificationList();
      this.updatePermissionUi();

      // Check for automated 2-day early deposit reminders and loan overdue checks
      setTimeout(() => {
        this.runAutomatedChecks();
      }, 2500);

      // Periodically check every 30 minutes while app is open
      setInterval(() => {
        this.runAutomatedChecks();
      }, 30 * 60 * 1000);
    }

    findServiceWorkerRegistration() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            this.swRegistration = reg;
            console.log('🔔 [NotificationManager] SW ready for notifications');
          })
          .catch(() => {});
      }
    }

    // Permission check
    getPermissionState() {
      if (!('Notification' in window)) return 'unsupported';
      return Notification.permission; // 'default' | 'granted' | 'denied'
    }

    async requestPermission() {
      if (!('Notification' in window)) {
        if (window.ui && window.ui.showToast) {
          window.ui.showToast('तुमचा ब्राऊझर सिस्टम नोटिफिकेशन्सना सपोर्ट करत नाही', 'warning');
        }
        return 'unsupported';
      }

      try {
        const perm = await Notification.requestPermission();
        this.updatePermissionUi();
        if (perm === 'granted') {
          if (window.ui && window.ui.showToast) {
            window.ui.showToast('✅ मोबाईल नोटिफिकेशन्स यशस्वीरित्या सुरू झाल्या!', 'success');
          }
          this.sendNativeNotification(
            '🔔 सुखकर्ता बीशी सूचना सक्रिय!',
            'मोबाईलवर हप्ता व कर्ज अलर्ट्स आता वेळेवर मिळतील.',
            { type: 'general' }
          );
        } else if (perm === 'denied') {
          if (window.ui && window.ui.showToast) {
            window.ui.showToast('⚠️ नोटिफिकेशन्स ब्लॉक केल्या आहेत. फोनच्या ॲप सेटिंग्जमधून परवानगी द्या.', 'warning');
          }
        }
        return perm;
      } catch (e) {
        console.warn('Notification permission error:', e);
        return 'denied';
      }
    }

    // Native Push/System Notification Sender
    async sendNativeNotification(title, body, options = {}) {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
      }

      const notifOptions = {
        body: body,
        icon: 'assets/icons/icon-192x192.png',
        badge: 'assets/icons/icon-32x32.png',
        tag: options.tag || ('skb-' + Date.now()),
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: options.url || './app.html',
          type: options.type || 'general',
          id: options.id || null
        }
      };

      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          await this.swRegistration.showNotification(title, notifOptions);
          return true;
        } else {
          new Notification(title, notifOptions);
          return true;
        }
      } catch (err) {
        console.warn('Failed to send native notification:', err);
        return false;
      }
    }

    // Core method to add notification to in-app tray AND trigger system notification
    notify({ title, body, type = 'general', url = './app.html', meta = {}, sendNative = true }) {
      const item = {
        id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title,
        body,
        type, // 'installment' | 'loan' | 'general'
        url,
        meta,
        read: false,
        createdAt: Date.now()
      };

      this.notifications.unshift(item);
      if (this.notifications.length > MAX_HISTORY) {
        this.notifications = this.notifications.slice(0, MAX_HISTORY);
      }
      this.saveNotifications();
      this.renderNotificationList();

      if (sendNative && this.settings.enabled) {
        this.sendNativeNotification(title, body, {
          tag: `${type}-${meta.id || Date.now()}`,
          url: url,
          type: type
        });
      }

      // Also display subtle Toast if window is focused
      if (window.ui && typeof window.ui.showToast === 'function') {
        const icon = type === 'loan' ? '💳' : (type === 'installment' ? '📅' : '🔔');
        window.ui.showToast(`${icon} ${title}: ${body}`, 'info');
      }

      return item;
    }

    // ==========================================================================
    // 📅 १. हप्ता भरणा २ दिवस आधी सूचना (2 Days Early Deposit Installment)
    // ==========================================================================
    checkDepositInstallmentReminders() {
      if (!this.settings.depositReminders) return;
      if (!window.bishiStore || typeof window.bishiStore.getMembers !== 'function') return;

      const meta = window.bishiStore.state.meta;
      if (!meta) return;

      const currentWeek = Number(meta.currentWeek) || 1;
      const dueDate = window.bishiStore.getWeekDate(currentWeek);
      if (!dueDate || isNaN(dueDate.getTime())) return;

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
      const diffDays = Math.round((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      // तपासा: जर हप्त्याची तारीख नेमकी २ दिवसांवर असेल (diffDays === 2) किंवा २ दिवसांच्या आत असेल (0 <= diffDays <= 2)
      if (diffDays >= 0 && diffDays <= 2) {
        const todayStr = now.toISOString().split('T')[0];
        const checkKey = `skb_notif_dep_w${currentWeek}_d${diffDays}_${todayStr}`;
        
        // आज ही सूचना आधीच पाठवली आहे का ते तपासा (Duplicate Prevention)
        if (localStorage.getItem(checkKey)) {
          return;
        }

        const allMembers = window.bishiStore.getMembers();
        const activeMembers = allMembers.filter(m => m.status === 'active');
        const unpaidMembers = activeMembers.filter(m => {
          const wk = m.weeks && m.weeks[currentWeek - 1];
          return !wk || (wk.status !== 'paid' && Number(wk.amountPaid || 0) < Number(m.weeklyAmount || 1000));
        });

        if (unpaidMembers.length > 0) {
          const dateFmt = dueDate.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short' });
          const daysText = diffDays === 0 ? 'आजच' : (diffDays === 1 ? 'उद्या' : '२ दिवसांत');
          
          this.notify({
            title: `📅 बीशी हप्ता सूचना (आठवडा ${currentWeek})`,
            body: `आठवडा ${currentWeek} चा हप्ता ${daysText} (${dateFmt}) देय आहे! ${unpaidMembers.length} सदस्यांचा हप्ता भरणे बाकी आहे. कृपया वेळेवर जमा करा.`,
            type: 'installment',
            url: './app.html#dashboard',
            meta: {
              week: currentWeek,
              dueDate: dueDate.toISOString(),
              unpaidCount: unpaidMembers.length
            }
          });

          localStorage.setItem(checkKey, 'true');
        }
      }
    }

    // ==========================================================================
    // 💰 ३. सदस्यास हप्ता पूर्ण भरणा सूचना (Installment Completed Notification to Member)
    // ==========================================================================
    notifyInstallmentCompleted(member, details = {}) {
      const memName = member ? (member.nameMarathi || member.name) : 'सदस्य';
      const memId = member ? member.id : '';
      const amount = Number(details.amount || 0);
      const weekNum = details.weekNumber || 1;
      const receiptNo = details.receiptNo || '';

      let title = `✅ बीशी हप्ता भरणा यशस्वी (आठवडा ${weekNum})`;
      let body = `${memName} (आयडी: ${memId}) आठवडा ${weekNum} चा ₹${amount.toLocaleString('en-IN')} हप्ता यशस्वीरीत्या जमा झाला आहे. (पावती क्र. ${receiptNo})`;

      if (details.isBulk) {
        title = `🎉 एकरकमी हप्ते जमा - बीशी पूर्ण!`;
        body = `${memName} (आयडी: ${memId}) यांचे उर्वरित सर्व ${details.unpaidCount || ''} आठवड्यांचे हप्ते (₹${amount.toLocaleString('en-IN')}) जमा झाले आहेत. बीशी १००% पूर्ण!`;
      } else if (details.isJustCompleted || details.isFullyPaid) {
        title = `🏆 ५० आठवडे बीशी पूर्ण - अभिनंदन!`;
        body = `${memName} (आयडी: ${memId}) यांनी सर्व ५० आठवड्यांचे हप्ते यशस्वीरीत्या पूर्ण भरले आहेत! मॅच्युरिटी परतावा पात्र.`;
      }

      this.notify({
        title,
        body,
        type: 'installment',
        url: `./app.html#members`,
        meta: {
          memberId: memId,
          weekNumber: weekNum,
          amount,
          receiptNo,
          action: 'installment_completed'
        }
      });
    }

    // ==========================================================================
    // 💳 २. सर्व कर्ज ॲक्शन्स सूचना (All Loan Actions Notifications)
    // ==========================================================================

    // २.१. नवीन कर्ज वाटप (Loan Disbursed / Issued)
    notifyLoanDisbursed(loan, member) {
      if (!this.settings.loanActions) return;
      const memName = member ? (member.nameMarathi || member.name) : (loan.memberName || 'सदस्य');
      const principal = Number(loan.principalAmount || 0);
      const rate = loan.interestRatePercent || loan.details?.interestRate || 3;

      this.notify({
        title: '💳 नवीन कर्ज वाटप मंजूर (Loan Disbursed)',
        body: `${memName} (आयडी: ${loan.memberId}) यांना ₹${principal.toLocaleString('en-IN')} चे कर्ज वाटप करण्यात आले (दर ४ आठवड्यांनी ${rate}% व्याज).`,
        type: 'loan',
        url: './app.html#loans',
        meta: {
          loanId: loan.id,
          memberId: loan.memberId,
          action: 'loan_disbursed',
          amount: principal
        }
      });
    }

    // २.२. ४ आठवड्यांचे ३% व्याज जमा (Loan Interest Received)
    notifyLoanInterestPaid(loan, payment) {
      if (!this.settings.loanActions) return;
      const memName = loan.memberName || 'सदस्य';
      const amount = Number(payment.amount || 0);
      const cycle = payment.cycleNumber || 1;
      const rate = loan.interestRatePercent || loan.details?.interestRate || payment.interestRate || 3;

      this.notify({
        title: `💰 ${rate}% कर्ज व्याज जमा (Loan Interest Paid)`,
        body: `${memName} यांनी चक्र ${cycle} चे ${rate}% कर्ज व्याज ₹${amount.toLocaleString('en-IN')} यशस्वीरीत्या जमा केले (पावती: ${payment.receiptNo}).`,
        type: 'loan',
        url: './app.html#loans',
        meta: {
          loanId: loan.id,
          memberId: loan.memberId,
          action: 'loan_interest_paid',
          amount: amount,
          cycleNumber: cycle
        }
      });
    }

    // २.३. कर्ज मुद्दल / पूर्ण परतफेड (Loan Principal / Full Repayment)
    notifyLoanRepayment(loan, paymentResult) {
      if (!this.settings.loanActions) return;
      const memName = loan.memberName || 'सदस्य';
      const totalRepaid = Number(paymentResult.repaidAmount || 0);
      const isFull = loan.status === 'paid' || (paymentResult.remainingPrincipal <= 0);
      const remPrincipal = Number(paymentResult.remainingPrincipal || 0);

      if (isFull) {
        this.notify({
          title: '✅ कर्ज पूर्ण परतफेड (Full Loan Cleared)',
          body: `${memName} यांनी ₹${totalRepaid.toLocaleString('en-IN')} भरून कर्ज क्र. ${loan.id} ची १००% पूर्ण परतफेड केली. कर्ज बंद झाले.`,
          type: 'loan',
          url: './app.html#loans',
          meta: {
            loanId: loan.id,
            memberId: loan.memberId,
            action: 'loan_full_paid',
            amount: totalRepaid
          }
        });
      } else {
        this.notify({
          title: '🟠 कर्ज अंशतः परतफेड (Partial Loan Repaid)',
          body: `${memName} यांनी मुद्दलपोटी ₹${totalRepaid.toLocaleString('en-IN')} परतफेड केली (शिल्लक मुद्दल: ₹${remPrincipal.toLocaleString('en-IN')} बाकी).`,
          type: 'loan',
          url: './app.html#loans',
          meta: {
            loanId: loan.id,
            memberId: loan.memberId,
            action: 'loan_partial_paid',
            amount: totalRepaid,
            remaining: remPrincipal
          }
        });
      }
    }

    // २.४. ४-आठवडे चक्र पूर्ण व्याज देय अलर्ट (Loan 4-Week Cycle Interest Due Alert)
    checkLoanInterestDueReminders() {
      if (!this.settings.loanActions) return;
      if (!window.bishiStore || typeof window.bishiStore.getLoans !== 'function') return;

      const loans = window.bishiStore.getLoans();
      const activeLoans = loans.filter(l => l.status === 'active');
      const todayStr = new Date().toISOString().split('T')[0];

      activeLoans.forEach(loan => {
        const details = window.bishiStore.calculateLoanDetails(loan);
        if (!details.isGracePeriodActive && details.currentCycleElapsedWeeks >= 4) {
          const checkKey = `skb_notif_loan_due_${loan.id}_c${(loan.interestPayments ? loan.interestPayments.length : 0) + 1}_${todayStr}`;
          if (!localStorage.getItem(checkKey)) {
            this.notify({
              title: '⚠️ ३% कर्ज व्याज देय अलर्ट (Interest Due)',
              body: `${loan.memberName} यांचे कर्ज ${loan.id} चे ४ आठवडे पूर्ण झाले आहेत. ३% व्याज (₹${details.interestAmount.toLocaleString('en-IN')}) देय आहे.`,
              type: 'loan',
              url: './app.html#loans',
              meta: {
                loanId: loan.id,
                action: 'loan_interest_due',
                amount: details.interestAmount
              }
            });
            localStorage.setItem(checkKey, 'true');
          }
        }
      });
    }

    // एकत्रित तपासणी (Run Automated Checks)
    runAutomatedChecks() {
      this.checkDepositInstallmentReminders();
      this.checkLoanInterestDueReminders();
    }

    // ==========================================================================
    // 🎨 UI & NOTIFICATION TRAY CONTROLS
    // ==========================================================================

    getUnreadCount() {
      return this.notifications.filter(n => !n.read).length;
    }

    updateBadges() {
      const count = this.getUnreadCount();
      
      // Top bar header badge
      const headerBadge = document.getElementById('notificationBadgeCount');
      if (headerBadge) {
        if (count > 0) {
          headerBadge.textContent = count > 99 ? '99+' : count;
          headerBadge.style.display = 'inline-flex';
        } else {
          headerBadge.style.display = 'none';
        }
      }

      // Sidebar menu badge
      const sidebarBadge = document.getElementById('sidebarNotificationCount');
      if (sidebarBadge) {
        if (count > 0) {
          sidebarBadge.textContent = count;
          sidebarBadge.style.display = 'inline-flex';
        } else {
          sidebarBadge.style.display = 'none';
        }
      }

      // Mobile bottom bar dot
      const bnavDot = document.getElementById('bnavNotifDot');
      if (bnavDot) {
        bnavDot.style.display = count > 0 ? 'block' : 'none';
      }
    }

    setTab(tab) {
      this.activeTab = tab;
      document.querySelectorAll('#notifTabs .filter-btn').forEach(btn => {
        if (btn.getAttribute('data-notif-tab') === tab) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      this.renderNotificationList();
    }

    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      this.saveNotifications();
      this.renderNotificationList();
    }

    clearAll() {
      if (this.notifications.length === 0) return;
      if (confirm('सर्व सूचना इतिहास हटवायचा आहे का?')) {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotificationList();
        if (window.ui && window.ui.showToast) {
          window.ui.showToast('सर्व सूचना हटवण्यात आल्या.', 'info');
        }
      }
    }

    handleNotificationClick(id) {
      const item = this.notifications.find(n => n.id === id);
      if (item) {
        item.read = true;
        this.saveNotifications();
        this.renderNotificationList();
        this.closeModal();

        if (item.url) {
          if (item.url.includes('#loans') && window.ui && window.ui.navigateToLoansPage) {
            window.ui.navigateToLoansPage();
          } else if (item.url.includes('#members') && window.ui && window.ui.navigateToMembersPage) {
            window.ui.navigateToMembersPage();
          } else if (window.ui && window.ui.navigateToDashboard) {
            window.ui.navigateToDashboard();
          }
        }
      }
    }

    formatTime(timestamp) {
      if (!timestamp) return '';
      const now = Date.now();
      const diffSec = Math.floor((now - timestamp) / 1000);
      if (diffSec < 60) return 'आत्ताच';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} मि. आधी`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} तास आधी`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'काल';
      if (diffDays < 7) return `${diffDays} दिवस आधी`;
      const d = new Date(timestamp);
      return d.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short' });
    }

    renderNotificationList() {
      const container = document.getElementById('notifListContainer');
      if (!container) return;

      let list = [...this.notifications];
      if (this.activeTab === 'installment') {
        list = list.filter(n => n.type === 'installment');
      } else if (this.activeTab === 'loan') {
        list = list.filter(n => n.type === 'loan');
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.6;">🔕</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">कोणत्याही सूचना नाहीत</div>
            <p style="font-size: 0.82rem; margin: 0;">हप्ता भरणा व कर्ज व्यवहारांचे अपडेट्स येथे आपोआप दिसतील.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(n => {
        const icon = n.type === 'loan' ? '💳' : (n.type === 'installment' ? '📅' : '🔔');
        const badgeClass = n.type === 'loan' ? 'status-pill status-active' : (n.type === 'installment' ? 'status-pill status-paid' : 'status-pill');
        const badgeText = n.type === 'loan' ? 'कर्ज ॲक्शन' : (n.type === 'installment' ? 'हप्ता २ दिवस आधी' : 'सामान्य सूचना');
        const unreadStyle = !n.read ? 'border-left: 4px solid var(--emerald-500); background: rgba(16, 185, 129, 0.05);' : '';

        return `
          <div class="notification-item-card ${n.read ? 'read' : 'unread'}" 
               style="${unreadStyle} padding: 1rem; border-radius: var(--radius-md); border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem; transition: all 0.2s; cursor: pointer;"
               onclick="window.notificationManager.handleNotificationClick('${n.id}')">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.25rem;">${icon}</span>
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${n.title}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span class="${badgeClass}" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">${badgeText}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">${this.formatTime(n.createdAt)}</span>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 0.5rem 0; line-height: 1.45;">
              ${n.body}
            </p>
            <div style="display: flex; justify-content: flex-end;">
              <span style="font-size: 0.78rem; color: var(--emerald-400); font-weight: 700;">पहा ➔</span>
            </div>
          </div>
        `;
      }).join('');
    }

    updatePermissionUi() {
      const banner = document.getElementById('notifPermissionBanner');
      if (!banner) return;

      const perm = this.getPermissionState();
      if (perm === 'granted') {
        banner.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--emerald-400); font-size: 1.2rem;">✅</span>
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">मोबाईल सूचना सक्रिय आहेत</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">हप्ता व कर्ज अलर्ट्स थेट तुमच्या डिव्हाइसवर मिळतील.</div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.notificationManager.sendTestNotification()" style="padding: 0.35rem 0.7rem; font-size: 0.75rem; font-weight: 700;">
              🧪 चाचणी सूचना
            </button>
          </div>
        `;
      } else if (perm === 'denied') {
        banner.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: #ef4444; font-size: 1.2rem;">⚠️</span>
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #f87171;">सूचना ब्लॉक केलेल्या आहेत</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">मोबाईलवर अलर्ट्स मिळण्यासाठी ब्राऊझर किंवा फोन सेटिंग्जमधून परमिशन द्या.</div>
              </div>
            </div>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1)); border: 1.5px solid rgba(59, 130, 246, 0.35); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                <span>📲</span> <span>मोबाईल नोटिफिकेशन्स सुरू करा</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                हप्ता २ दिवस आधी आणि कर्ज व्यवहारांचे इन्स्टंट अलर्ट्स मोबाईलवर मिळवा.
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.notificationManager.requestPermission()" style="font-weight: 800; padding: 0.45rem 1rem;">
              🔔 सूचना सुरू करा
            </button>
          </div>
        `;
      }
    }

    sendTestNotification() {
      this.notify({
        title: '🧪 चाचणी सूचना (Test Notification)',
        body: 'सुखकर्ता बीशी मोबाईल सूचना यशस्वीरीत्या कार्यरत आहेत! २ दिवस आधी हप्ता व कर्ज अलर्ट्स असेच मिळतील.',
        type: 'general',
        url: './app.html'
      });
      if (window.ui && window.ui.showToast) {
        window.ui.showToast('✅ चाचणी सूचना पाठवण्यात आली!', 'success');
      }
    }

    openModal() {
      this.renderNotificationList();
      this.updatePermissionUi();
      const modal = document.getElementById('notificationsModal');
      if (modal) {
        modal.classList.add('active');
      }
    }

    closeModal() {
      const modal = document.getElementById('notificationsModal');
      if (modal) {
        modal.classList.remove('active');
      }
    }
  }

  window.NotificationManager = NotificationManager;
  window.notificationManager = new NotificationManager();
})();
