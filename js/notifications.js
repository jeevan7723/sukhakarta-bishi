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
      this.activeTab = 'all'; // 'all' | 'deposit' | 'installment' | 'loan'
      this.swRegistration = null;
      this.isDepositFormCollapsed = false;
      this.lastSelectedDepositMemberId = null;

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
      const isCustomer = window.authManager && typeof window.authManager.isCustomer === 'function' && window.authManager.isCustomer();
      const currentMember = isCustomer ? window.authManager.getCurrentCustomerMember() : null;

      if (isCustomer && currentMember) {
        return this.notifications.filter(n => !n.read && (!n.meta?.memberId || n.meta?.memberId === currentMember.id)).length;
      }
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

    // ==========================================================================
    // 💰 ॲडमिन थेट साप्ताहिक हप्ता जमा नोंदणी (Admin Quick Weekly Deposit Entry)
    // ==========================================================================
    renderAdminDepositBox(prefillMemberId = null) {
      const container = document.getElementById('notifAdminDepositSection');
      if (!container) return;

      const isEn = window.i18n && window.i18n.isEnglish();
      const isAdmin = !window.authManager || (typeof window.authManager.isAdmin === 'function' && window.authManager.isAdmin());
      const isCustomer = window.authManager && typeof window.authManager.isCustomer === 'function' && window.authManager.isCustomer();
      const currentMember = isCustomer ? window.authManager.getCurrentCustomerMember() : null;

      // जर सदस्य (ग्राहक) लॉगिन असेल, तर ॲडमिन फॉर्म लपवा आणि सदस्याला वेलकम बॅनर दाखवा
      if (!isAdmin) {
        if (isCustomer && currentMember) {
          container.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.1)); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.3rem;">👤</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${currentMember.name} (${currentMember.id})</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${isEn ? 'Your official weekly deposit and loan alerts below:' : 'तुमच्या खात्याच्या सर्व अधिकृत हप्ता व कर्ज सूचना खालीलप्रमाणे:'}</div>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openPassbookModal('${currentMember.id}'); window.notificationManager.closeModal();" style="font-size: 0.75rem; padding: 0.25rem 0.65rem; font-weight: 700;">
                  ${isEn ? '📖 View Passbook ➔' : '📖 पासबुक पहा ➔'}
                </button>
              </div>
            </div>
          `;
        } else {
          container.innerHTML = '';
        }
        return;
      }

      // प्रशासक (Admin) व्ह्यू: थेट साप्ताहिक हप्ता नोंदणी बॉक्स
      const allMembers = (window.bishiStore && typeof window.bishiStore.getMembers === 'function')
        ? window.bishiStore.getMembers()
        : [];
      const activeMembers = allMembers.filter(m => m.status === 'active');

      if (activeMembers.length === 0) {
        container.innerHTML = `
          <div style="padding: 0.75rem 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary); text-align: center;">
            ${isEn ? 'No active members available for deposit entry.' : 'हप्ता भरण्यासाठी कोणतेही सक्रिय सदस्य उपलब्ध नाहीत.'}
          </div>
        `;
        return;
      }

      let selectedMemberId = prefillMemberId || this.lastSelectedDepositMemberId;
      if (!selectedMemberId || !activeMembers.find(m => m.id === selectedMemberId)) {
        selectedMemberId = activeMembers[0].id;
      }
      this.lastSelectedDepositMemberId = selectedMemberId;

      const selMember = activeMembers.find(m => m.id === selectedMemberId) || activeMembers[0];
      const stats = window.bishiStore.calculateMemberStats(selMember);
      const currency = window.bishiStore.state?.meta?.currency || '₹';
      const targetPeriod = stats.nextDueWeek || 1;
      const targetAmount = stats.installmentAmount || (selMember.weeklyAmount || 1000);

      container.innerHTML = `
        <div class="notif-deposit-entry-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.38); border-radius: var(--radius-md); padding: 0.95rem; margin-bottom: 1rem; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.35rem;">💰</span>
              <div>
                <strong style="color: var(--emerald-400); font-size: 0.95rem; display: block;">${isEn ? 'Quick Weekly Deposit Entry (Admin)' : 'साप्ताहिक हप्ता थेट जमा नोंदवा (प्रशासक)'}</strong>
                <span style="font-size: 0.74rem; color: var(--text-secondary);">${isEn ? 'Record deposit & immediately dispatch message to member\'s app & WhatsApp' : 'येथून हप्ता नोंदवून थेट सदस्याच्या मोबाईल ॲपवर व WhatsApp वर मेसेज पाठवा'}</span>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.notificationManager.toggleDepositForm()" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; font-weight: 700;">
              ${this.isDepositFormCollapsed ? (isEn ? '▼ Open Form' : '▼ फॉर्म उघडा') : (isEn ? '▲ Minimize' : '▲ लपवा')}
            </button>
          </div>

          <div id="notifDepositFormBody" style="${this.isDepositFormCollapsed ? 'display: none;' : 'display: block;'}">
            <!-- सदस्य निवडा ड्रॉपडाउन -->
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label class="form-label" for="notifDepositMemberSelect" style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
                ${isEn ? 'Select Member *' : 'सदस्य निवडा *'}
              </label>
              <select id="notifDepositMemberSelect" class="form-control" style="font-size: 0.88rem; padding: 0.5rem 0.75rem; font-weight: 600;" onchange="window.notificationManager.onMemberSelectChange(this.value)">
                ${activeMembers.map(m => {
                  const mStats = window.bishiStore.calculateMemberStats(m);
                  const isSel = m.id === selectedMemberId;
                  const mName = window.bishiStore.getMemberMarathiName ? window.bishiStore.getMemberMarathiName(m) : m.name;
                  return `<option value="${m.id}" ${isSel ? 'selected' : ''}>${m.id} • ${mName || m.name} (${mStats.periodUnit} ${mStats.nextDueWeek} बाकी • ₹${mStats.installmentAmount})</option>`;
                }).join('')}
              </select>
            </div>

            <!-- निवडलेल्या सदस्याची स्थिती माहिती -->
            <div id="notifDepositMemberInfoCard" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin-bottom: 0.75rem; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span style="color: var(--text-muted);">${isEn ? 'Due Period:' : 'देय कालावधी:'}</span>
                <strong style="color: var(--emerald-400); margin-left: 0.25rem;">${stats.periodUnit} ${targetPeriod} / ${stats.totalPeriods}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">${isEn ? 'Deposited So Far:' : 'आतापर्यंत जमा:'}</span>
                <strong style="color: var(--text-primary); margin-left: 0.25rem;">${currency}${stats.totalDeposited.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">${isEn ? 'Standard Installment:' : 'नियमित हप्ता:'}</span>
                <strong style="color: var(--gold-400); margin-left: 0.25rem;">${currency}${targetAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <input type="hidden" id="notifDepositWeekNumber" value="${targetPeriod}">

            <!-- भरणा रक्कम व पेमेंट पद्धत (२ कॉलम्स) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.75rem;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="notifDepositAmount" style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
                  ${isEn ? 'Deposit Amount (₹) *' : 'भरणा रक्कम (₹) *'}
                </label>
                <input type="number" id="notifDepositAmount" class="form-control" value="${targetAmount}" min="1" step="any" style="font-size: 1rem; font-weight: 800; color: var(--emerald-400); font-family: var(--font-mono); padding: 0.5rem 0.75rem;" required>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="notifDepositPaymentMode" style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
                  ${isEn ? 'Payment Mode *' : 'पेमेंट पद्धत *'}
                </label>
                <select id="notifDepositPaymentMode" class="form-control" style="font-size: 0.88rem; padding: 0.5rem 0.75rem;">
                  <option value="Cash">💵 ${isEn ? 'Cash' : 'रोख (Cash)'}</option>
                  <option value="UPI">📱 UPI (GPay/PhonePe)</option>
                  <option value="Bank Transfer">🏦 ${isEn ? 'Bank Transfer' : 'बँक ट्रान्सफर'}</option>
                  <option value="Cheque">📜 ${isEn ? 'Cheque' : 'चेक'}</option>
                </select>
              </div>
            </div>

            <!-- लेट फी दंड (ऐच्छिक) व टीप -->
            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 0.65rem; margin-bottom: 0.75rem;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="notifDepositFineAmount" style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                  ${isEn ? 'Fine / Late Fee (₹)' : 'लेट फी दंड (₹)'}
                </label>
                <input type="number" id="notifDepositFineAmount" class="form-control" value="0" min="0" step="any" style="font-size: 0.88rem; padding: 0.45rem 0.65rem;">
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="notifDepositNote" style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                  ${isEn ? 'Note / Remark' : 'टीप / शेरा (ऐच्छिक)'}
                </label>
                <input type="text" id="notifDepositNote" class="form-control" placeholder="${isEn ? 'e.g. Received via Mobile' : 'उदा. मोबाईल ॲपवरून भरणा'}" style="font-size: 0.85rem; padding: 0.45rem 0.65rem;">
              </div>
            </div>

            <!-- मेसेज वितरण चेकबॉक्सेस -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.35); border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-primary); cursor: pointer; margin: 0; font-weight: 700;">
                <input type="checkbox" id="notifSendToMemberAppCheckbox" checked style="width: 17px; height: 17px; accent-color: var(--emerald-500); cursor: pointer;">
                <span>📲 ${isEn ? 'Send Notification to Member\'s App' : 'सदस्याच्या मोबाईल ॲपवर मेसेज व अलर्ट पाठवा'}</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #25d366; cursor: pointer; margin: 0; font-weight: 700;">
                <input type="checkbox" id="notifSendWhatsAppCheckbox" checked style="width: 17px; height: 17px; accent-color: #25d366; cursor: pointer;">
                <span>💬 ${isEn ? 'Send Digital Receipt via WhatsApp' : 'सदस्याच्या WhatsApp वर पावती मेसेज पाठवा'}</span>
              </label>
            </div>

            <!-- सबमिट बटण -->
            <button type="button" class="btn btn-emerald" onclick="window.notificationManager.submitWeeklyDepositFromNotif()" style="width: 100%; font-weight: 800; font-size: 0.92rem; padding: 0.65rem 1rem; justify-content: center; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);">
              ${isEn ? '💰 Collect Deposit & Send Message to Member ➔' : '💰 हप्ता जमा करा व सदस्यास मेसेज पाठवा ➔'}
            </button>
          </div>
        </div>
      `;
    }

    toggleDepositForm() {
      this.isDepositFormCollapsed = !this.isDepositFormCollapsed;
      this.renderAdminDepositBox();
    }

    onMemberSelectChange(memberId) {
      this.lastSelectedDepositMemberId = memberId;
      this.renderAdminDepositBox(memberId);
    }

    prefillDepositForm(memberId = null, weekNumber = null) {
      this.isDepositFormCollapsed = false;
      if (memberId) {
        this.lastSelectedDepositMemberId = memberId;
      }
      this.renderAdminDepositBox(memberId);
      if (weekNumber) {
        const wkInput = document.getElementById('notifDepositWeekNumber');
        if (wkInput) wkInput.value = weekNumber;
      }
      const amtInput = document.getElementById('notifDepositAmount');
      if (amtInput) amtInput.focus();
    }

    submitWeeklyDepositFromNotif() {
      if (!window.bishiStore || typeof window.bishiStore.recordPayment !== 'function') {
        if (window.ui && window.ui.showToast) window.ui.showToast('सिस्टम उपलब्ध नाही.', 'error');
        return;
      }
      if (window.authManager && !window.authManager.isAdmin()) {
        if (window.ui && window.ui.showToast) window.ui.showToast('🔒 केवळ प्रशासक हप्ता नोंदवू शकतात.', 'error');
        return;
      }

      const selEl = document.getElementById('notifDepositMemberSelect');
      const memberId = selEl ? selEl.value : null;
      if (!memberId) {
        if (window.ui && window.ui.showToast) window.ui.showToast('कृपया सदस्य निवडा.', 'warning');
        return;
      }

      const member = window.bishiStore.getMember(memberId);
      if (!member) {
        if (window.ui && window.ui.showToast) window.ui.showToast('सदस्य सापडला नाही.', 'error');
        return;
      }

      const stats = window.bishiStore.calculateMemberStats(member);
      const isEn = window.i18n && window.i18n.isEnglish();
      const amountInput = document.getElementById('notifDepositAmount');
      const depositAmount = Number(amountInput ? amountInput.value : 0);
      if (depositAmount <= 0) {
        if (window.ui && window.ui.showToast) window.ui.showToast('कृपया वैध हप्ता रक्कम टाका.', 'warning');
        if (amountInput) amountInput.focus();
        return;
      }

      const paymentMode = document.getElementById('notifDepositPaymentMode')?.value || 'Cash';
      const fineAmount = Number(document.getElementById('notifDepositFineAmount')?.value || 0);
      const note = document.getElementById('notifDepositNote')?.value || (isEn ? 'Deposit recorded from Mobile Notifications' : 'मोबाईल नोटिफिकेशन्सवरून थेट हप्ता भरणा');
      const sendToMemberApp = document.getElementById('notifSendToMemberAppCheckbox')?.checked !== false;
      const sendWhatsApp = document.getElementById('notifSendWhatsAppCheckbox')?.checked !== false;
      const targetWeek = Number(document.getElementById('notifDepositWeekNumber')?.value) || stats.nextDueWeek || 1;

      try {
        const result = window.bishiStore.recordPayment(
          member.id,
          targetWeek,
          depositAmount,
          paymentMode,
          note,
          fineAmount,
          ''
        );

        if (result) {
          const totalPaid = depositAmount + fineAmount;
          const memName = window.bishiStore.getMemberDisplayName ? window.bishiStore.getMemberDisplayName(member) : member.name;
          const receiptNo = result.transaction?.receiptNo || `REC-${member.id}-W${targetWeek}`;
          const currentTotalDeposited = result.stats?.totalDeposited || (stats.totalDeposited + depositAmount);

          // 📲 सदस्याच्या मोबाईल ॲपवर विशेष मेसेज व सूचना तयार करा (Targeted Member Notification)
          if (sendToMemberApp) {
            const memberMsgTitle = isEn 
              ? `✅ ${stats.periodUnit} ${targetWeek} Installment Received (Receipt: ${receiptNo})`
              : `✅ ${stats.periodUnit} ${targetWeek} हप्ता यशस्वीरीत्या जमा (पावती क्र. ${receiptNo})`;
            const memberMsgBody = isEn
              ? `Dear ${member.name}, your ${stats.periodUnit} ${targetWeek} installment of ₹${depositAmount.toLocaleString('en-IN')} has been successfully credited via ${paymentMode}. Total Savings: ₹${currentTotalDeposited.toLocaleString('en-IN')}.`
              : `प्रिय ${memName}, आपला ${stats.periodUnit} ${targetWeek} चा ₹${depositAmount.toLocaleString('en-IN')} हप्ता ${paymentMode} द्वारे यशस्वीरीत्या जमा झाला आहे. एकूण बचत: ₹${currentTotalDeposited.toLocaleString('en-IN')}.`;

            this.notify({
              title: memberMsgTitle,
              body: memberMsgBody,
              type: 'installment',
              url: './app.html#members',
              meta: {
                memberId: member.id,
                memberName: member.name,
                memberPhone: member.phone,
                weekNumber: targetWeek,
                amount: depositAmount,
                finePaid: fineAmount,
                paymentMode: paymentMode,
                receiptNo: receiptNo,
                action: 'installment_completed',
                sentToMemberApp: true,
                sentAt: Date.now()
              }
            });
          }

          // 💬 सदस्याच्या WhatsApp वर पावती पाठवणे
          if (sendWhatsApp && window.receiptManager && typeof window.receiptManager.sendWhatsAppMessage === 'function') {
            setTimeout(() => {
              window.receiptManager.sendWhatsAppMessage(member.id, targetWeek);
            }, 300);
          }

          // टोस्ट संदेश
          if (window.ui && window.ui.showToast) {
            const toastMsg = isEn
              ? `✅ ₹${totalPaid.toLocaleString('en-IN')} deposit recorded! Sent message to ${member.name}'s app.`
              : `✅ ₹${totalPaid.toLocaleString('en-IN')} हप्ता जमा झाला आणि ${memName} यांच्या मोबाईल ॲपवर मेसेज पाठवला!`;
            window.ui.showToast(toastMsg, 'success');
          }

          // संपूर्ण UI अद्ययावत करा
          if (window.ui && typeof window.ui.renderAll === 'function') {
            window.ui.renderAll();
          }

          this.renderAdminDepositBox();
          this.renderNotificationList();
        } else {
          if (window.ui && window.ui.showToast) window.ui.showToast('पेमेंट नोंदवताना त्रुटी आली.', 'error');
        }
      } catch (err) {
        console.error('Error submitting deposit from notif:', err);
        if (window.ui && window.ui.showToast) window.ui.showToast(`त्रुटी: ${err.message}`, 'error');
      }
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

      const isEn = window.i18n && window.i18n.isEnglish();
      const isAdmin = !window.authManager || (typeof window.authManager.isAdmin === 'function' && window.authManager.isAdmin());
      const isCustomer = window.authManager && typeof window.authManager.isCustomer === 'function' && window.authManager.isCustomer();
      const currentMember = isCustomer ? window.authManager.getCurrentCustomerMember() : null;

      let list = [...this.notifications];

      // जर सदस्य लॉगिन असेल, तर फक्त स्वतःच्या सूचना किंवा सामान्य सूचना दाखवा
      if (isCustomer && currentMember) {
        list = list.filter(n => !n.meta?.memberId || n.meta.memberId === currentMember.id);
      }

      if (this.activeTab === 'deposit') {
        list = list.filter(n => n.meta?.action === 'installment_completed');
      } else if (this.activeTab === 'installment') {
        list = list.filter(n => n.type === 'installment' && n.meta?.action !== 'installment_completed');
      } else if (this.activeTab === 'loan') {
        list = list.filter(n => n.type === 'loan');
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.6;">🔕</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
              ${isEn ? 'No notifications found' : 'कोणत्याही सूचना नाहीत'}
            </div>
            <p style="font-size: 0.82rem; margin: 0;">
              ${isEn ? 'Installment deposits, reminders, and loan updates will appear here automatically.' : 'हप्ता भरणा, स्मरणपत्रे व कर्ज व्यवहारांचे अपडेट्स येथे आपोआप दिसतील.'}
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(n => {
        const isDepositAction = n.meta?.action === 'installment_completed';
        const icon = n.type === 'loan' ? '💳' : (isDepositAction ? '💰' : (n.type === 'installment' ? '📅' : '🔔'));
        const badgeClass = n.type === 'loan' ? 'status-pill status-active' : (isDepositAction ? 'status-pill status-paid' : (n.type === 'installment' ? 'status-pill status-pending' : 'status-pill'));
        const badgeText = n.type === 'loan' 
          ? (isEn ? 'Loan Action' : 'कर्ज ॲक्शन') 
          : (isDepositAction 
              ? (isEn ? 'Deposit Credited' : 'हप्ता भरणा पावती') 
              : (n.type === 'installment' ? (isEn ? '2 Days Early' : 'हप्ता २ दिवस आधी') : (isEn ? 'General' : 'सामान्य सूचना')));
        const unreadStyle = !n.read ? 'border-left: 4px solid var(--emerald-500); background: rgba(16, 185, 129, 0.05);' : '';

        // Generate action buttons
        let actionsHtml = '';
        if (isDepositAction && n.meta?.memberId && n.meta?.weekNumber) {
          const mId = n.meta.memberId;
          const wNum = n.meta.weekNumber;
          if (isAdmin) {
            actionsHtml = `
              <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; margin-top: 0.5rem;" onclick="event.stopPropagation();">
                <button type="button" class="btn btn-sm" onclick="window.receiptManager.sendWhatsAppMessage('${mId}', ${wNum})" style="background: #25d366; color: #000; font-weight: 700; font-size: 0.73rem; padding: 0.25rem 0.6rem; border: none; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;">
                  <span>💬</span> WhatsApp ${isEn ? 'Receipt' : 'पावती'}
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${mId}', ${wNum})" style="font-size: 0.73rem; padding: 0.25rem 0.6rem; font-weight: 700;">
                  <span>🧾</span> ${isEn ? 'View Receipt' : 'पावती पहा'}
                </button>
                <span class="status-pill status-paid" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; background: rgba(16, 185, 129, 0.12); color: var(--emerald-400);">
                  ✓ ${isEn ? 'Delivered to Member App' : 'सदस्य ॲपवर मेसेज वितरित'}
                </span>
              </div>
            `;
          } else {
            actionsHtml = `
              <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; margin-top: 0.5rem;" onclick="event.stopPropagation();">
                <button type="button" class="btn btn-emerald btn-sm" onclick="window.receiptManager.showReceiptModal('${mId}', ${wNum})" style="font-size: 0.73rem; padding: 0.25rem 0.65rem; font-weight: 700;">
                  <span>🧾</span> ${isEn ? 'View My Receipt' : 'माझी डिजिटल पावती पहा'}
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openPassbookModal('${mId}'); window.notificationManager.closeModal();" style="font-size: 0.73rem; padding: 0.25rem 0.6rem; font-weight: 700;">
                  <span>📖</span> ${isEn ? 'View Passbook' : 'पासबुक पहा'}
                </button>
              </div>
            `;
          }
        } else if (isAdmin && n.type === 'installment' && n.meta?.unpaidCount > 0 && n.meta?.week) {
          actionsHtml = `
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; margin-top: 0.5rem;" onclick="event.stopPropagation();">
              <button type="button" class="btn btn-primary btn-sm" onclick="window.notificationManager.prefillDepositForm(null, ${n.meta.week})" style="font-size: 0.73rem; padding: 0.25rem 0.65rem; font-weight: 700;">
                <span>💰</span> ${isEn ? 'Collect Remaining Installment' : 'बाकी हप्ता जमा करा'}
              </button>
            </div>
          `;
        }

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
            ${actionsHtml}
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

    openModal(prefillMemberId = null) {
      this.renderAdminDepositBox(prefillMemberId);
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
