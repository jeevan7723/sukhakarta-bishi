/**
 * ==========================================================================
 * सुखकर्ता बीशी - UI रेंडरिंग व ड्युअल पोर्टल कंट्रोलर
 * (प्रशासक व्यवस्थापन डॅशबोर्ड + सदस्य पोर्टल)
 * ==========================================================================
 */

class UIManager {
  constructor() {
    this.currentView = 'dashboard';
    this.currentAdminTab = 'audit';
    this.activeLoginTab = 'admin';
    this.currentFilter = 'all'; // all, paid, pending, overdue, completed
    this.searchQuery = '';
    this.selectedMemberId = null;
    this.selectedCollectWeek = null;
  }

  init() {
    try {
      this.setupEventListeners();
    } catch (e) {
      console.error('Error in setupEventListeners:', e);
    }
    this.checkAuthView();
    this.renderAll();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('active');
    });
  }

  // --- ऑथेंटिकेशन व भूमिका तपासणी ---
  checkAuthView() {
    const isAuth = window.authManager.isAuthenticated();
    const loginOverlay = document.getElementById('adminLoginScreen');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const cloudStatusBadge = document.getElementById('cloudStatusBadge');
    const btnOpenAdminSettings = document.getElementById('btnOpenAdminSettings');
    const btnOpenTxnLog = document.getElementById('btnOpenTxnLog');
    const btnOpenAddMember = document.getElementById('btnOpenAddMember');
    const btnOpenExport = document.getElementById('btnOpenExport');
    const btnOpenClearDataModal = document.getElementById('btnOpenClearDataModal');

    const dashboardView = document.getElementById('dashboardView');
    const customerPortalView = document.getElementById('customerPortalView');

    if (!isAuth) {
      if (loginOverlay) loginOverlay.classList.remove('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'none';
      if (cloudStatusBadge) cloudStatusBadge.style.display = 'none';
      if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'none';
      if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'none';
      if (btnOpenAddMember) btnOpenAddMember.style.display = 'none';
      if (btnOpenExport) btnOpenExport.style.display = 'none';
      if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'none';
      if (customerPortalView) customerPortalView.style.display = 'none';
    } else {
      if (loginOverlay) loginOverlay.classList.add('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'flex';

      if (window.authManager.isAdmin()) {
        // प्रशासक दृश्य (Admin Dashboard)
        const cur = window.authManager.getCurrentUser();
        const avatarEl = document.getElementById('userBadgeAvatar');
        if (avatarEl) {
          avatarEl.className = 'avatar-mini';
          avatarEl.textContent = '👑';
        }
        const nameEl = document.getElementById('userBadgeName');
        if (nameEl) nameEl.textContent = cur.name || 'मुख्य प्रशासक';

        if (cloudStatusBadge) cloudStatusBadge.style.display = 'inline-flex';
        if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'inline-flex';
        if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'inline-flex';
        if (btnOpenAddMember) btnOpenAddMember.style.display = 'inline-flex';
        if (btnOpenExport) btnOpenExport.style.display = 'inline-flex';
        if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'inline-flex';
        if (customerPortalView) customerPortalView.style.display = 'none';
        if (dashboardView) dashboardView.style.display = 'block';

        this.renderAll();
      } else if (window.authManager.isCustomer()) {
        // सदस्य दृश्य (Customer / Member View)
        const cur = window.authManager.getCurrentUser();
        const avatarEl = document.getElementById('userBadgeAvatar');
        if (avatarEl) {
          avatarEl.className = 'avatar-mini customer';
          avatarEl.textContent = '👤';
        }
        const nameEl = document.getElementById('userBadgeName');
        if (nameEl) nameEl.textContent = `${cur.name} (${cur.memberId})`;

        if (cloudStatusBadge) cloudStatusBadge.style.display = 'none';
        if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'none';
        if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'none';
        if (btnOpenAddMember) btnOpenAddMember.style.display = 'none';
        if (btnOpenExport) btnOpenExport.style.display = 'none';
        if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'none';
        if (dashboardView) dashboardView.style.display = 'none';
        if (customerPortalView) customerPortalView.style.display = 'block';

        this.renderCustomerPortal();
      }
    }
  }

  renderAll() {
    if (window.authManager.isAdmin()) {
      this.renderStats();
      this.renderWeekPills();
      this.renderMembersTable();
      this.renderSummaryBanner();
    } else if (window.authManager.isCustomer()) {
      this.renderCustomerPortal();
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icon}</span>
      <span style="flex: 1; font-weight: 500; font-size: 0.88rem;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // मोडल बंद करणे (Close Specific Modal or All Modals)
  closeModal(target = null) {
    if (typeof target === 'string') {
      const modal = document.getElementById(target);
      if (modal) modal.classList.remove('active');
      return;
    }
    if (target && target.closest) {
      const modal = target.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        return;
      }
    }
    this.closeAllModals();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }

  switchCustomerCycle(cycleNum) {
    this.customerViewCycle = Number(cycleNum);
    this.renderCustomerPortal();
  }

  // ==========================================================================
  // सदस्य वैयक्तिक पोर्टल (Customer Personal Portal)
  // ==========================================================================
  renderCustomerPortal() {
    const member = window.authManager.getCurrentCustomerMember();
    if (!member) {
      this.showToast('सदस्य खात्याचा तपशील लोड करता आला नाही', 'error');
      return;
    }

    const currency = window.bishiStore.state.meta.currency || '₹';
    const currentCycleWeek = window.bishiStore.state.meta.currentWeek;
    const activeCycleNum = member.currentCycle || 1;

    if (this.customerViewCycle === undefined || this.customerViewCycle === null) {
      this.customerViewCycle = activeCycleNum;
    }

    const isViewingArchived = this.customerViewCycle < activeCycleNum;
    let viewWeeks = member.weeks;
    let stats = null;
    let pastCycleData = null;

    if (isViewingArchived) {
      pastCycleData = (member.pastCycles || []).find(c => c.cycleNumber === this.customerViewCycle);
      if (pastCycleData) {
        viewWeeks = pastCycleData.weeks || [];
        stats = pastCycleData.stats || window.bishiStore.calculateMemberStats(pastCycleData);
      }
    }

    if (!stats) {
      stats = window.bishiStore.calculateMemberStats(member);
      viewWeeks = member.weeks;
    }

    // प्रोफाइल कार्ड
    document.getElementById('custHeroAvatar').textContent = member.name.charAt(0).toUpperCase();
    document.getElementById('custHeroName').textContent = member.name;
    document.getElementById('custHeroMeta').textContent = `सदस्य आयडी: ${member.id} • 📞 ${member.phone} • वारसदार: ${member.nominee || 'N/A'}${member.currentCycle > 1 ? ` • सायकल ${this.customerViewCycle} / ${member.currentCycle}` : ''}`;

    // सायकल स्विचर बार
    const switcherContainer = document.getElementById('custCycleSwitcherContainer');
    if (switcherContainer) {
      if (member.pastCycles && member.pastCycles.length > 0) {
        switcherContainer.style.display = 'flex';
        switcherContainer.style.alignItems = 'center';
        switcherContainer.style.gap = '0.5rem';
        switcherContainer.style.flexWrap = 'wrap';
        switcherContainer.style.background = 'var(--bg-tertiary)';
        switcherContainer.style.padding = '0.75rem 1rem';
        switcherContainer.style.borderRadius = 'var(--radius-md)';
        switcherContainer.style.border = '1px solid var(--border-color)';

        let html = `<span style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-right: 0.25rem;">बचत प्लॅन निवडा:</span>`;
        
        // सक्रिय सायकल बटण
        const isActiveSelected = this.customerViewCycle === activeCycleNum;
        html += `
          <button type="button" class="btn btn-sm ${isActiveSelected ? 'btn-primary' : 'btn-secondary'}" onclick="window.ui.switchCustomerCycle(${activeCycleNum})" style="${isActiveSelected ? 'font-weight: 800;' : ''}">
            🟢 सायकल ${activeCycleNum} (${stats.isFullyPaid ? 'पूर्ण' : 'सक्रिय'} • ${currency}${member.weeklyAmount}/आठवडा)
          </button>
        `;

        // मागील सायकल्स बटणे
        member.pastCycles.forEach(pc => {
          const isPastSelected = this.customerViewCycle === pc.cycleNumber;
          const payoutAmt = pc.payoutDetails?.amount || (pc.stats?.maturityTotalPayout || 0);
          html += `
            <button type="button" class="btn btn-sm ${isPastSelected ? 'btn-gold' : 'btn-secondary'}" onclick="window.ui.switchCustomerCycle(${pc.cycleNumber})" style="${isPastSelected ? 'font-weight: 800;' : ''}">
              🏆 सायकल ${pc.cycleNumber} (जतन • ${currency}${payoutAmt.toLocaleString('en-IN')})
            </button>
          `;
        });

        switcherContainer.innerHTML = html;
      } else {
        switcherContainer.style.display = 'none';
      }
    }

    // ५०-आठवडे पूर्ण बॅनर व व्हाउचर
    const celebrationBanner = document.getElementById('custMaturityCelebrationBanner');
    const heroVoucherBtn = document.getElementById('btnCustHeroVoucher');
    const heroDownloadBtn = document.getElementById('btnCustHeroDownloadLedger');

    if (stats.isFullyPaid) {
      if (celebrationBanner) celebrationBanner.style.display = 'block';
      const matSavings = document.getElementById('custMatTotalSavings');
      if (matSavings) matSavings.textContent = `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`;
      const matBonus = document.getElementById('custMatBonusAmount');
      if (matBonus) matBonus.textContent = `+${currency}${stats.interestAmount.toLocaleString('en-IN')} (${stats.maturityInterestPercent}%)`;
      const matFinal = document.getElementById('custMatFinalPayout');
      if (matFinal) matFinal.textContent = `${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}`;

      if (heroVoucherBtn) {
        if (stats.isPayoutCompleted || (isViewingArchived && pastCycleData?.payoutDetails)) {
          heroVoucherBtn.style.display = 'inline-flex';
          heroVoucherBtn.onclick = () => window.receiptManager.showPayoutVoucherModal(member.id, this.customerViewCycle);
        } else {
          heroVoucherBtn.style.display = 'none';
        }
      }
    } else {
      if (celebrationBanner) celebrationBanner.style.display = 'none';
      if (heroVoucherBtn) heroVoucherBtn.style.display = 'none';
    }

    const heroPassbookBtn = document.getElementById('btnCustHeroPassbook');
    if (heroPassbookBtn) {
      heroPassbookBtn.onclick = () => window.ui.openPassbookModal(member.id, this.customerViewCycle);
    }

    if (heroDownloadBtn) {
      heroDownloadBtn.onclick = () => window.exportManager.downloadMemberLedgerCSV(member.id);
    }

    // व्याज परतावा कार्ड
    const rateHdr = document.getElementById('custRateHeader');
    if (rateHdr) rateHdr.textContent = `${stats.maturityInterestPercent}% व्याज परतावा`;
    const rateBdg = document.getElementById('custRateBadge');
    if (rateBdg) rateBdg.textContent = `${stats.maturityInterestPercent}%`;
    const calcPrinc = document.getElementById('custCalcPrincipal');
    if (calcPrinc) calcPrinc.textContent = `${currency}${stats.totalTarget.toLocaleString('en-IN')}`;
    const calcIntLbl = document.getElementById('custCalcInterestLabel');
    if (calcIntLbl) calcIntLbl.textContent = `${stats.maturityInterestPercent}% व्याज बोनस`;
    const calcIntAmt = document.getElementById('custCalcInterestAmt');
    if (calcIntAmt) calcIntAmt.textContent = `+${currency}${stats.projectedInterest.toLocaleString('en-IN')}`;
    const calcTotPay = document.getElementById('custCalcTotalPayout');
    if (calcTotPay) calcTotPay.textContent = `${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')}`;

    // ४ वैयक्तिक कार्ड्स
    document.getElementById('custStatGoal').textContent = `${currency}${stats.totalTarget.toLocaleString('en-IN')}`;
    document.getElementById('custStatGoalSub').textContent = `५० आठवडे (+${stats.maturityInterestPercent}% बोनस = ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')})`;

    const currentWeekData = member.weeks.find(w => w.weekNumber === currentCycleWeek);
    const isPaidThisWeek = currentWeekData && currentWeekData.status === 'paid' && Number(currentWeekData.amountPaid) > 0;
    const thisWeekPaidAmt = isPaidThisWeek ? Number(currentWeekData.amountPaid || 0) : 0;
    const depUpToCurrentCycleWeek = (member.weeks || []).filter(w => w.weekNumber <= currentCycleWeek).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
    const expUpToCurrentCycleWeek = currentCycleWeek * stats.weeklyAmount;
    const thisWeekAdvanceExtra = isPaidThisWeek ? Math.max(0, depUpToCurrentCycleWeek - expUpToCurrentCycleWeek) : 0;

    document.getElementById('custStatDeposited').textContent = stats.isFullyPaid 
      ? `${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}` 
      : `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`;
    
    if (stats.isFullyPaid) {
      document.getElementById('custStatDepositedSub').textContent = `५० पैकी ५० आठवडे जमा (+${stats.maturityInterestPercent}% बोनस: +${currency}${stats.interestAmount.toLocaleString('en-IN')})`;
    } else {
      let subText = `${stats.paidWeeksCount} पैकी ५० आठवडे जमा (${stats.progressPercent}%)`;
      if (thisWeekAdvanceExtra > 0) {
        subText += ` • चालू आठवडा: +${currency}${thisWeekAdvanceExtra.toLocaleString('en-IN')} जादा`;
      }
      document.getElementById('custStatDepositedSub').textContent = subText;
    }
    
    document.getElementById('custProgressDeposited').style.width = `${stats.progressPercent}%`;

    document.getElementById('custStatNextDue').textContent = stats.isFullyPaid ? 'पूर्ण झाले 🎉' : `आठवडा ${stats.nextDueWeek}`;
    document.getElementById('custStatNextDueSub').textContent = stats.isFullyPaid 
      ? `एकूण परतावा: ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}`
      : `देय रक्कम: ${currency}${stats.nextDueAmount.toLocaleString('en-IN')}`;

    document.getElementById('custStatRemaining').textContent = stats.isFullyPaid ? '₹0' : `${currency}${stats.remainingAmount.toLocaleString('en-IN')}`;
    document.getElementById('custStatRemainingSub').textContent = stats.isFullyPaid 
      ? (isViewingArchived ? `सायकल ${this.customerViewCycle} पूर्ण 🏆` : 'सर्व ५० आठवडे पूर्ण!') 
      : `${stats.remainingWeeksCount} आठवडे बाकी`;

    // सदस्य ५०-आठवडे पासबुक ग्रिड
    const passbookGrid = document.getElementById('custPassbookGrid');
    if (passbookGrid) {
      passbookGrid.innerHTML = '';
      viewWeeks.forEach(wk => {
        const paidAmt = Number(wk.amountPaid || 0);
        const weeklyReq = stats.weeklyAmount;
        
        // Calculate cumulative deposit up to this week to check if extra is advance for next weeks or past dues
        const depositedUpToW = viewWeeks.filter(w => w.weekNumber <= wk.weekNumber).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
        const expectedUpToW = wk.weekNumber * weeklyReq;
        const advanceExtraAmt = Math.max(0, depositedUpToW - expectedUpToW);
        const isAdvanceExtra = (paidAmt >= weeklyReq) && (advanceExtraAmt > 0);

        // Conditions
        const isCleared = (paidAmt < weeklyReq) && (wk.weekNumber <= stats.effectivePaidWeeks);
        const isFullPaid = (paidAmt >= weeklyReq);
        const isPartial = (paidAmt > 0 && paidAmt < weeklyReq && !isCleared);
        const isPastEmpty = !isViewingArchived && !isCleared && !isPartial && (wk.weekNumber < currentCycleWeek && paidAmt === 0);
        const isCurrent = !isViewingArchived && !isCleared && !isPartial && (wk.weekNumber === currentCycleWeek && paidAmt === 0);

        let boxClass = '';
        let displayAmt = '';
        let statusText = 'प्रलंबित';

        if (isFullPaid) {
          boxClass = isAdvanceExtra ? 'paid has-extra' : 'paid';
          displayAmt = `${currency}${paidAmt.toLocaleString('en-IN')}`;
          if (isAdvanceExtra) {
            statusText = `⭐ +₹${advanceExtraAmt.toLocaleString('en-IN')} जादा`;
          } else if (wk.finePaid > 0) {
            statusText = `✓ +₹${wk.finePaid}`;
          } else {
            statusText = '✓ जमा';
          }
        } else if (isPartial) {
          const pendingAmt = weeklyReq - paidAmt;
          boxClass = 'partial';
          displayAmt = `${currency}${paidAmt.toLocaleString('en-IN')}`;
          statusText = `⚠️ ₹${pendingAmt.toLocaleString('en-IN')} बाकी`;
        } else if (isCleared) {
          boxClass = 'cleared';
          displayAmt = '—';
          statusText = '✓ क्लिअर';
        } else if (isCurrent) {
          boxClass = 'current-due';
          displayAmt = `${currency}${weeklyReq.toLocaleString('en-IN')}`;
          statusText = 'चालू';
        } else if (isPastEmpty) {
          boxClass = 'empty-week overdue';
          displayAmt = `${currency}0`;
          statusText = 'थकबाकी';
        } else {
          boxClass = 'pending';
          displayAmt = `${currency}${weeklyReq.toLocaleString('en-IN')}`;
          statusText = 'प्रलंबित';
        }

        const box = document.createElement('div');
        box.className = `passbook-week-box ${boxClass}`;
        box.innerHTML = `
          <div class="box-wk-title">W${wk.weekNumber}</div>
          <div class="box-wk-amount">${displayAmt}</div>
          <div style="font-size: 0.65rem; text-transform: uppercase;">
            ${statusText}
          </div>
        `;

        if (isFullPaid) {
          box.title = `सायकल ${this.customerViewCycle} • आठवडा ${wk.weekNumber} जमा: ₹${paidAmt}${isAdvanceExtra ? ` (+₹${advanceExtraAmt} पुढील आठवड्यांसाठी अ‍ॅडव्हान्स/जादा)` : ''} - पावती पाहण्यासाठी क्लिक करा`;
          box.style.cursor = 'pointer';
        } else if (isPartial) {
          const pendingAmt = weeklyReq - paidAmt;
          box.title = `आठवडा ${wk.weekNumber}: ₹${paidAmt} जमा (अपूर्ण भरणा • बाकी ₹${pendingAmt})`;
          box.style.cursor = 'pointer';
        } else if (isCleared) {
          box.title = `आठवडा ${wk.weekNumber}: थकबाकी क्लिअर (जादा भरण्यासोबत क्लिअर झाले)`;
        } else {
          box.title = `आठवडा ${wk.weekNumber} (${isPastEmpty ? 'रिकामे / हप्ता बाकी' : (isCurrent ? 'चालू' : 'प्रलंबित')}) - हप्ता प्रशासकांकडे जमा केला जातो`;
        }

        box.addEventListener('click', () => {
          if (isFullPaid || isPartial) {
            window.receiptManager.showReceiptModal(member.id, wk.weekNumber, this.customerViewCycle);
          } else if (isCleared) {
            this.showToast(`आठवडा ${wk.weekNumber} ची रक्कम पुढील आठवड्यातील जादा भरण्यासोबत क्लिअर झाली आहे.`, 'info');
          } else {
            this.showToast(`आठवडा ${wk.weekNumber} ${isPastEmpty ? 'रिकामे / बाकी' : (isCurrent ? 'चालू' : 'प्रलंबित')} आहे. साप्ताहिक हप्ते प्रशासक गोळा करून नोंदवतात.`, 'info');
          }
        });

        passbookGrid.appendChild(box);
      });
    }

    const btnDownloadLedger = document.getElementById('btnCustDownloadMyLedger');
    if (btnDownloadLedger) {
      btnDownloadLedger.onclick = () => window.exportManager.downloadMemberLedgerCSV(member.id);
    }

    // सदस्य व्यवहार इतिहास टेबल
    const historyTbody = document.getElementById('custHistoryTableBody');
    if (historyTbody) {
      const cleanMemberId = (member.id || '').trim().toUpperCase();
      const allTxns = window.bishiStore.state.transactions || [];
      const memberTxns = allTxns.filter(t => (t.memberId || '').trim().toUpperCase() === cleanMemberId);
      
      let recordsToDisplay = [];

      // Filter transactions matching the currently viewed cycle
      const cycleTxns = memberTxns.filter(t => (Number(t.cycleNumber) || 1) === this.customerViewCycle);

      if (cycleTxns.length > 0) {
        recordsToDisplay = cycleTxns.map(t => ({
          receiptNo: t.receiptNo || `REC-${member.id}-W${t.weekNumber || 1}`,
          cycleNumber: Number(t.cycleNumber) || this.customerViewCycle,
          weekNumber: t.weekNumber,
          isPayout: t.type === 'payout',
          depositAmount: Number(t.depositAmount || t.amount || 0),
          fineAmount: Number(t.fineAmount || 0),
          totalAmount: Number(t.totalAmount || (Number(t.depositAmount || t.amount || 0) + Number(t.fineAmount || 0))),
          paymentMode: t.paymentMode || 'Cash',
          upiId: t.upiId || '',
          date: t.date || t.paidDate,
          notes: t.note || t.notes || ''
        }));
      } else {
        // Fallback: derive from viewWeeks (supports active cycle & archived past cycles)
        const paidWeeks = (viewWeeks || []).filter(w => (w.status === 'paid' && Number(w.amountPaid || 0) > 0) || Number(w.amountPaid || 0) > 0 || w.status === 'partial');
        
        recordsToDisplay = paidWeeks.map(w => {
          const depAmt = Number(w.amountPaid || 0);
          const fineAmt = Number(w.finePaid || 0);
          return {
            receiptNo: w.receiptNo || `REC-${member.id}-W${w.weekNumber}`,
            cycleNumber: this.customerViewCycle,
            weekNumber: w.weekNumber,
            isPayout: false,
            depositAmount: depAmt,
            fineAmount: fineAmt,
            totalAmount: depAmt + fineAmt,
            paymentMode: w.paymentMode || 'Cash',
            upiId: w.upiId || '',
            date: w.paidDate,
            notes: w.notes || ''
          };
        });

        // If viewing archived cycle and payout details exist, append payout voucher record
        if (isViewingArchived && pastCycleData && pastCycleData.payoutDetails) {
          recordsToDisplay.push({
            receiptNo: pastCycleData.payoutDetails.receiptNo || `VOUCHER-${member.id}-C${this.customerViewCycle}`,
            cycleNumber: this.customerViewCycle,
            weekNumber: 50,
            isPayout: true,
            depositAmount: Number(pastCycleData.payoutDetails.amount || pastCycleData.stats?.maturityTotalPayout || 0),
            fineAmount: 0,
            totalAmount: Number(pastCycleData.payoutDetails.amount || pastCycleData.stats?.maturityTotalPayout || 0),
            paymentMode: pastCycleData.payoutDetails.paymentMode || 'Cash',
            upiId: pastCycleData.payoutDetails.upiId || '',
            date: pastCycleData.payoutDetails.payoutDate,
            notes: pastCycleData.payoutDetails.notes || 'मॅच्युरिटी परतावा'
          });
        }
      }

      historyTbody.innerHTML = '';

      if (recordsToDisplay.length === 0) {
        historyTbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.7;">🧾</div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.35rem;">
                सायकल ${this.customerViewCycle} मध्ये अद्याप कोणतेही व्यवहार किंवा जमा हप्ते नोंदवले गेलेले नाहीत
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 480px; margin: 0 auto;">
                प्रशासकांनी आपला साप्ताहिक हप्ता जमा केल्यावर त्याची संपूर्ण पावती, तारीख, पेमेंट पद्धत व तपशील येथे आपोआप दिसेल.
              </div>
            </td>
          </tr>
        `;
      } else {
        recordsToDisplay.forEach(rec => {
          const tr = document.createElement('tr');
          const depAmt = rec.depositAmount;
          const fineAmt = rec.fineAmount;
          const totalRec = rec.totalAmount;
          const isPayout = rec.isPayout;
          const txnCycle = rec.cycleNumber;
          const isExtraDeposit = !isPayout && depAmt > member.weeklyAmount && (rec.weekNumber || 0) > 0;
          const extraDepositAmt = isExtraDeposit ? (depAmt - member.weeklyAmount) : 0;

          // Format Marathi Date
          let formattedDate = 'आज';
          if (rec.date) {
            try {
              const d = new Date(rec.date);
              if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const monthNames = ['जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'];
                formattedDate = `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
              } else {
                formattedDate = String(rec.date).split('T')[0];
              }
            } catch (e) {
              formattedDate = String(rec.date).split('T')[0] || 'आज';
            }
          }

          tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--gold-400); font-weight: 600;">
              ${rec.receiptNo}
            </td>
            <td>
              <span class="status-pill" style="font-size: 0.7rem; background: rgba(59, 130, 246, 0.15); color: var(--blue-400); margin-right: 0.3rem;">C${txnCycle}</span>
              ${isPayout 
                ? '<span class="status-pill status-completed" style="font-weight: 700;">🏆 मॅच्युरिटी वाटप</span>' 
                : `<span class="status-pill status-paid">आठवडा ${rec.weekNumber || 1} / ५०</span>`}
              ${isExtraDeposit ? `<span class="extra-amount-pill" style="margin-left: 0.3rem;">⭐ +${currency}${extraDepositAmt.toLocaleString('en-IN')} जादा</span>` : ''}
              ${rec.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">${rec.notes}</div>` : ''}
            </td>
            <td style="color: ${isPayout ? 'var(--gold-400)' : 'var(--emerald-400)'}; font-weight: 700;">
              ${currency}${depAmt.toLocaleString('en-IN')}
              ${isExtraDeposit ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 600;">(नियमित ${currency}${member.weeklyAmount} + ⭐ ${currency}${extraDepositAmt} जादा)</div>` : ''}
            </td>
            <td style="color: ${fineAmt > 0 ? 'var(--rose-400)' : 'var(--text-muted)'}; font-weight: 600;">
              ${fineAmt > 0 ? `+${currency}${fineAmt.toLocaleString('en-IN')}` : '₹0'}
            </td>
            <td style="color: #fff; font-weight: 800; font-size: 0.95rem;">
              ${currency}${totalRec.toLocaleString('en-IN')}
            </td>
            <td>
              <span class="mode-tag ${(rec.paymentMode || 'cash').toLowerCase()}">${rec.paymentMode || 'Cash'}</span>
              ${rec.upiId ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.2rem;">${rec.upiId}</div>` : ''}
            </td>
            <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
              ${formattedDate}
            </td>
            <td style="text-align: right;">
              ${isPayout ? `
                <button type="button" class="btn btn-gold btn-sm" onclick="window.receiptManager.showPayoutVoucherModal('${member.id}', ${txnCycle})" title="व्हाउचर पहा व प्रिंट करा">
                  📜 व्हाउचर
                </button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${rec.weekNumber || 1}, ${txnCycle})" title="पावती पहा व प्रिंट करा">
                  🧾 पावती
                </button>
              `}
            </td>
          `;
          historyTbody.appendChild(tr);
        });
      }
    }
  }

  // --- प्रशासक डॅशबोर्ड मुख्य आकडेवारी ---
  renderStats() {
    const stats = window.bishiStore.getDashboardStats();
    const currency = window.bishiStore.state.meta.currency;

    const totalMem = document.getElementById('statTotalMembers');
    if (totalMem) totalMem.textContent = stats.totalMembers;
    const totalMemSub = document.getElementById('statTotalMembersSub');
    if (totalMemSub) totalMemSub.textContent = `${stats.totalSettledMembers} सेटल / जुने`;

    const totalFundPool = document.getElementById('statTotalFundPool');
    if (totalFundPool) totalFundPool.textContent = `${currency}${stats.totalFundTarget.toLocaleString('en-IN')}`;
    const totalFundPoolSub = document.getElementById('statTotalFundPoolSub');
    if (totalFundPoolSub) totalFundPoolSub.textContent = `५० आठवड्यांचे एकूण लक्ष्य`;

    const totalCollected = document.getElementById('statTotalCollected');
    if (totalCollected) totalCollected.textContent = `${currency}${stats.totalAllTimeCollected.toLocaleString('en-IN')}`;
    const totalCollectedSub = document.getElementById('statTotalCollectedSub');
    if (totalCollectedSub) {
      if (stats.totalFinesCollected > 0) {
        totalCollectedSub.textContent = `${stats.overallProgressPercent}% लक्ष्य • +${currency}${stats.totalFinesCollected.toLocaleString('en-IN')} लेट फी`;
      } else {
        totalCollectedSub.textContent = `एकूण लक्ष्याच्या ${stats.overallProgressPercent}% जमा`;
      }
    }
    const progressTotal = document.getElementById('progressTotalCollected');
    if (progressTotal) progressTotal.style.width = `${stats.overallProgressPercent}%`;

    const weekCollected = document.getElementById('statWeekCollected');
    if (weekCollected) weekCollected.textContent = `${currency}${stats.weekCollectedAmount.toLocaleString('en-IN')}`;
    const weekCollectedSub = document.getElementById('statWeekCollectedSub');
    if (weekCollectedSub) {
      let subText = `आठवडा ${stats.currentWeek} साठी ${stats.totalMembers} पैकी ${stats.weekPaidCount} जणांचे जमा`;
      if (stats.weekExtraAmount > 0) {
        subText += ` • +${currency}${stats.weekExtraAmount.toLocaleString('en-IN')} अतिरिक्त भरणा`;
      }
      weekCollectedSub.textContent = subText;
    }
    const progressWeek = document.getElementById('progressWeekCollected');
    if (progressWeek) progressWeek.style.width = `${stats.weekProgressPercent}%`;

    const weekPending = document.getElementById('statWeekPending');
    if (weekPending) weekPending.textContent = `${currency}${stats.weekPendingAmount.toLocaleString('en-IN')} बाकी`;
  }

  renderSummaryBanner() {
    const stats = window.bishiStore.getDashboardStats();
    const currency = window.bishiStore.state.meta.currency;

    const bannerWk = document.getElementById('bannerCurrentWeekNumber');
    if (bannerWk) bannerWk.textContent = `आठवडा ${stats.currentWeek} / ५०`;
    const bannerTarget = document.getElementById('bannerWeekTarget');
    if (bannerTarget) bannerTarget.textContent = `${currency}${stats.weekExpectedAmount.toLocaleString('en-IN')}`;
    const bannerCollected = document.getElementById('bannerWeekCollected');
    if (bannerCollected) {
      if (stats.weekExtraAmount > 0) {
        bannerCollected.innerHTML = `${currency}${stats.weekCollectedAmount.toLocaleString('en-IN')} <span style="font-size: 0.75rem; color: var(--gold-400); font-weight: 700;">(+${currency}${stats.weekExtraAmount.toLocaleString('en-IN')} अतिरिक्त)</span>`;
      } else {
        bannerCollected.textContent = `${currency}${stats.weekCollectedAmount.toLocaleString('en-IN')}`;
      }
    }
    const bannerPending = document.getElementById('bannerWeekPending');
    if (bannerPending) bannerPending.textContent = `${currency}${stats.weekPendingAmount.toLocaleString('en-IN')}`;
    const bannerRate = document.getElementById('bannerWeekRate');
    if (bannerRate) bannerRate.textContent = `${stats.weekProgressPercent}%`;
  }

  renderWeekPills() {
    const container = document.getElementById('weekScrollContainer');
    if (!container) return;

    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;
    const members = window.bishiStore.getMembers().filter(m => m.status === 'active' || m.status === 'completed');
    const currency = window.bishiStore.state.meta.currency || '₹';
    container.innerHTML = '';

    for (let w = 1; w <= 50; w++) {
      let fullyPaidCount = 0;
      let partialCount = 0;
      let totalWkAmount = 0;

      members.forEach(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        const wk = m.weeks.find(item => item.weekNumber === w);
        const paidAmt = Number(wk ? wk.amountPaid : 0) || 0;
        
        const isMemberDirectPaid = (wk && wk.status === 'paid' && paidAmt >= stats.weeklyAmount) || (paidAmt >= stats.weeklyAmount);
        const isMemberAdvanceCovered = !isMemberDirectPaid && (w <= stats.effectivePaidWeeks);
        const isMemberFullPaid = isMemberDirectPaid || isMemberAdvanceCovered;
        const isMemberPartial = !isMemberFullPaid && (paidAmt > 0 || (wk && wk.status === 'partial'));

        if (isMemberFullPaid) {
          fullyPaidCount++;
          totalWkAmount += paidAmt;
        } else if (isMemberPartial) {
          partialCount++;
          totalWkAmount += paidAmt;
        }
      });

      const isCompleted = members.length > 0 && fullyPaidCount === members.length;
      const hasDeposits = (fullyPaidCount > 0 && fullyPaidCount < members.length) || partialCount > 0 || totalWkAmount > 0;
      const isOverdue = (w < currentWeek) && !isCompleted && !hasDeposits;
      const isActive = (w === currentWeek);

      let statusClass = '';
      let statusTooltip = '';

      if (isCompleted) {
        statusClass = 'completed paid';
        statusTooltip = `आठवडा ${w}: पूर्ण जमा (${fullyPaidCount}/${members.length} सदस्य • ${currency}${totalWkAmount.toLocaleString('en-IN')})`;
      } else if (hasDeposits) {
        statusClass = 'has-deposits partial';
        statusTooltip = `आठवडा ${w}: हप्ते जमा (${fullyPaidCount}/${members.length} पूर्ण • ${currency}${totalWkAmount.toLocaleString('en-IN')})`;
      } else if (isOverdue) {
        statusClass = 'overdue';
        statusTooltip = `आठवडा ${w}: थकबाकी (०/${members.length} जमा)`;
      } else {
        statusClass = 'pending';
        statusTooltip = `आठवडा ${w}: प्रलंबित (०/${members.length} जमा)`;
      }

      const pill = document.createElement('button');
      pill.className = `week-pill ${isActive ? 'active' : ''} ${statusClass}`;
      pill.setAttribute('title', statusTooltip);
      pill.setAttribute('aria-label', statusTooltip);
      pill.innerHTML = `
        <span class="wk-label">आठवडा</span>
        <span class="wk-num">${w}</span>
        <span class="wk-status-dot" title="${statusTooltip}"></span>
      `;

      pill.addEventListener('click', () => {
        window.bishiStore.setCurrentWeek(w);
        this.renderAll();
        this.showToast(`आठवडा ${w} कलेक्शन दृश्य उघडले`, 'info');
      });

      container.appendChild(pill);

      if (isActive) {
        setTimeout(() => {
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);
      }
    }

    const titleEl = document.getElementById('currentWeekDisplayTitle');
    if (titleEl) titleEl.textContent = `आठवडा ${currentWeek}`;
  }

  // --- साप्ताहिक कलेक्शन टेबल (प्रशासक) ---
  renderMembersTable() {
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    const currentWeek = window.bishiStore.state.meta.currentWeek;
    const currency = window.bishiStore.state.meta.currency;
    const defaultFine = Number(window.bishiStore.state.meta.defaultFineAmount) || 0;
    
    const allActiveMembers = window.bishiStore.getMembers().filter(m => m.status === 'active' || m.status === 'completed');
    const fullyCompletedMembers = allActiveMembers.filter(m => window.bishiStore.calculateMemberStats(m).isFullyPaid);
    const alertBanner = document.getElementById('adminMaturityAlertBanner');
    const alertText = document.getElementById('adminMaturityAlertText');

    if (alertBanner) {
      if (fullyCompletedMembers.length > 0 && window.authManager.isAdmin()) {
        alertBanner.style.display = 'block';
        if (alertText) {
          const names = fullyCompletedMembers.map(m => m.name).join(', ');
          const totalMaturityPayoutSum = fullyCompletedMembers.reduce((sum, m) => sum + window.bishiStore.calculateMemberStats(m).maturityTotalPayout, 0);
          alertText.innerHTML = `<strong>${fullyCompletedMembers.length} सदस्य (${names})</strong> यांनी सर्व ५० साप्ताहिक हप्ते पूर्ण केले आहेत! ८% व्याज बोनस लागू (एकूण परतावा: <strong>${currency}${totalMaturityPayoutSum.toLocaleString('en-IN')}</strong>).`;
        }
      } else {
        alertBanner.style.display = 'none';
      }
    }

    let members = window.bishiStore.getMembers().filter(m => m.status === 'active' || m.status === 'completed');

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      members = members.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }

    if (this.currentFilter === 'paid') {
      members = members.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        const wk = m.weeks.find(w => w.weekNumber === currentWeek);
        return (wk && wk.status === 'paid' && Number(wk.amountPaid || 0) >= stats.weeklyAmount) || (currentWeek <= stats.effectivePaidWeeks);
      });
    } else if (this.currentFilter === 'pending') {
      members = members.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        const wk = m.weeks.find(w => w.weekNumber === currentWeek);
        const isPaid = (wk && wk.status === 'paid' && Number(wk.amountPaid || 0) >= stats.weeklyAmount) || (currentWeek <= stats.effectivePaidWeeks);
        return !isPaid;
      });
    } else if (this.currentFilter === 'overdue') {
      members = members.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        return stats.overdueWeeksCount > 0;
      });
    } else if (this.currentFilter === 'completed') {
      members = members.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        return stats.isFullyPaid;
      });
    }

    if (members.length === 0) {
      const isSearchOrFilter = this.searchQuery || this.currentFilter !== 'all';
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">👥</div>
            <div style="font-weight: 700; font-size: 1.2rem; color: var(--text-primary);">
              ${isSearchOrFilter ? 'कोणतेही जुळणारे सदस्य सापडले नाहीत' : 'अद्याप कोणतेही सदस्य जोडलेले नाहीत'}
            </div>
            <p style="font-size: 0.9rem; margin-top: 0.35rem; margin-bottom: 1.25rem;">
              ${isSearchOrFilter ? 'कृपया शोध शब्द तपासा किंवा फिल्टर बदला.' : '५०-आठवडे बीशी ग्रुपमध्ये नवीन सदस्य जोडून सुरुवात करा.'}
            </p>
            ${!isSearchOrFilter ? `
              <button class="btn btn-primary" onclick="window.ui.openAddMemberModal()">
                ➕ पहिला सदस्य जोडा
              </button>
            ` : ''}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';

    members.forEach(member => {
      const stats = window.bishiStore.calculateMemberStats(member);
      const weekData = member.weeks.find(w => w.weekNumber === currentWeek) || { status: 'pending', amountPaid: 0, finePaid: 0 };
      const paidAmt = Number(weekData.amountPaid || 0);
      const isFullPaidThisWeek = weekData.status === 'paid' && paidAmt >= stats.weeklyAmount;
      const isClearedThisWeek = !isFullPaidThisWeek && (currentWeek <= stats.effectivePaidWeeks);
      const isPartialThisWeek = paidAmt > 0 && paidAmt < stats.weeklyAmount && !isClearedThisWeek;
      const isOverdue = !isFullPaidThisWeek && !isClearedThisWeek && !isPartialThisWeek && (stats.overdueWeeksCount > 0 || (currentWeek > 1 && weekData.weekNumber < currentWeek));

      const depUpToCurrentWeek = member.weeks.filter(w => w.weekNumber <= currentWeek).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
      const expUpToCurrentWeek = currentWeek * stats.weeklyAmount;
      const advanceExtraThisWeek = isFullPaidThisWeek ? Math.max(0, depUpToCurrentWeek - expUpToCurrentWeek) : 0;
      const isAdvanceExtraThisWeek = isFullPaidThisWeek && (advanceExtraThisWeek > 0);

      let miniMatrixHTML = `<div class="week-matrix-preview" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="५०-आठवडे प्रगती (पासबुक पाहण्यासाठी क्लिक करा)">`;
      member.weeks.forEach(w => {
        let cls = '';
        const wPaidAmt = Number(w.amountPaid || 0);
        const isWkFullPaid = (w.status === 'paid' || wPaidAmt >= stats.weeklyAmount) && wPaidAmt >= stats.weeklyAmount;
        
        const depUpToW = member.weeks.filter(wk => wk.weekNumber <= w.weekNumber).reduce((sum, wk) => sum + (Number(wk.amountPaid) || 0), 0);
        const expUpToW = w.weekNumber * stats.weeklyAmount;
        const advAmt = Math.max(0, depUpToW - expUpToW);
        const isWkAdvanceExtra = isWkFullPaid && (advAmt > 0);
        const isWkCleared = (wPaidAmt < stats.weeklyAmount) && (w.weekNumber <= stats.effectivePaidWeeks);
        const isWkPartial = (wPaidAmt > 0 && wPaidAmt < stats.weeklyAmount && !isWkCleared);

        let dotTitle = '';
        if (isWkFullPaid) {
          cls = isWkAdvanceExtra ? 'paid has-extra' : 'paid';
          dotTitle = `आठवडा ${w.weekNumber}: जमा ₹${wPaidAmt}${isWkAdvanceExtra ? ` (+₹${advAmt} पुढील आठवड्यांसाठी अ‍ॅडव्हान्स/जादा)` : ''}${w.finePaid > 0 ? ` (दंड: ₹${w.finePaid})` : ''}`;
        } else if (isWkPartial) {
          cls = 'partial';
          dotTitle = `आठवडा ${w.weekNumber}: अपूर्ण जमा ₹${wPaidAmt} (बाकी: ₹${stats.weeklyAmount - wPaidAmt})`;
        } else if (isWkCleared) {
          cls = 'cleared';
          dotTitle = `आठवडा ${w.weekNumber}: थकबाकी/हप्ता क्लिअर (जादा भरणा)`;
        } else if (w.weekNumber === currentWeek) {
          cls = 'current';
          dotTitle = `आठवडा ${w.weekNumber}: चालू आठवडा`;
        } else if (w.status === 'overdue' || (w.weekNumber < currentWeek && !isWkCleared)) {
          cls = 'overdue';
          dotTitle = `आठवडा ${w.weekNumber}: थकबाकी`;
        } else {
          cls = 'pending';
          dotTitle = `आठवडा ${w.weekNumber}: प्रलंबित`;
        }
        miniMatrixHTML += `<span class="matrix-dot ${cls}" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" title="${dotTitle} • पासबुक उघडण्यासाठी क्लिक करा"></span>`;
      });
      miniMatrixHTML += '</div>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="member-cell">
            <div class="member-avatar ${stats.weeklyAmount >= 2000 ? 'gold' : ''}" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="सदस्य पासबुक पहा">
              ${member.name.charAt(0).toUpperCase()}
            </div>
            <div class="member-meta">
              <div class="member-name">
                <span onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="पासबुक पहा">${member.name}</span>
                ${(member.currentCycle && member.currentCycle > 1) ? `<span class="status-pill" style="font-size:0.65rem; padding:0.1rem 0.4rem; background: rgba(59, 130, 246, 0.2); color: var(--blue-400); border: 1px solid var(--blue-400);">सायकल ${member.currentCycle}</span>` : ''}
                ${stats.isFullyPaid ? `<button type="button" class="status-pill status-completed interactive" onclick="event.stopPropagation(); window.receiptManager.showPayoutVoucherModal('${member.id}')" style="font-size:0.68rem; padding:0.15rem 0.5rem; margin-left:0.35rem; font-weight:800;" title="५०-आठवडे मॅच्युरिटी व्हाउचर पहा">पूर्ण 🏆</button>` : ''}
              </div>
              <div class="member-phone">📞 ${member.phone} • <span class="member-id">${member.id}</span></div>
            </div>
          </div>
        </td>

        <td>
          <div class="amount-badge amount-weekly">
            ${currency}${stats.weeklyAmount.toLocaleString('en-IN')}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">प्रति आठवडा</div>
        </td>

        <td>
          ${isFullPaidThisWeek ? `
            <span class="status-pill status-paid" onclick="event.stopPropagation(); window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" style="cursor: pointer;" title="या आठवड्याची पावती पहा">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ${isAdvanceExtraThisWeek ? `जमा: ${currency}${paidAmt.toLocaleString('en-IN')}` : (paidAmt > stats.weeklyAmount ? `जमा: ${currency}${paidAmt.toLocaleString('en-IN')}` : `जमा (${weekData.paymentMode || 'रोख'})`)}
            </span>
            ${isAdvanceExtraThisWeek ? `<span class="extra-amount-pill">⭐ +${currency}${advanceExtraThisWeek.toLocaleString('en-IN')} जादा</span>` : ''}
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
              ${weekData.paidDate ? new Date(weekData.paidDate).toLocaleDateString('hi-IN', {day: '2-digit', month: 'short'}) : 'आज'}
              ${weekData.finePaid > 0 ? `• <span style="color: #fb7185; font-weight: 600;">+${currency}${weekData.finePaid} दंड</span>` : ''}
              ${(isAdvanceExtraThisWeek || paidAmt > stats.weeklyAmount) ? `• <span style="color: var(--gold-400); font-weight: 600;">(${weekData.paymentMode || 'UPI'})</span>` : ''}
            </div>
          ` : isPartialThisWeek ? `
            <span class="status-pill" onclick="event.stopPropagation(); window.ui.openCollectModal('${member.id}', ${currentWeek})" style="background: rgba(245, 158, 11, 0.18); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.45); cursor: pointer;" title="बाकी हप्ता जमा करा">
              ⚠️ अपूर्ण जमा: ${currency}${paidAmt.toLocaleString('en-IN')}
            </span>
            <div style="font-size: 0.72rem; color: #fb7185; font-weight: 700; margin-top: 0.2rem;">
              बाकी हप्ता: ${currency}${(stats.weeklyAmount - paidAmt).toLocaleString('en-IN')}
            </div>
          ` : isClearedThisWeek ? `
            <span class="status-pill status-paid" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.4); cursor: pointer;" title="पासबुक व क्लिअर तपशील पहा">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ✓ क्लिअर (जादा भरणा)
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
              जादा ठेवीतून थकबाकी क्लिअर
            </div>
          ` : `
            <span class="status-pill ${isOverdue ? 'status-overdue' : 'status-pending'}" onclick="event.stopPropagation(); window.ui.openCollectModal('${member.id}', ${currentWeek})" style="cursor: pointer;" title="हप्ता जमा करण्यासाठी क्लिक करा">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${isOverdue ? 'थकबाकी' : 'प्रलंबित'}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
              देय: ${currency}${stats.weeklyAmount.toLocaleString('en-IN')}
              ${isOverdue && defaultFine > 0 ? `• <span style="color: #fb7185; font-weight: 700;">+${currency}${defaultFine} दंड</span>` : ''}
            </div>
          `}
        </td>

        <td>
          <div class="amount-badge ${stats.isFullyPaid ? 'amount-gold' : 'amount-total'}" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="पासबुक उघडा">
            ${stats.isFullyPaid ? `${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}` : `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`}
          </div>
          <div class="progress-bar-container" style="max-width: 120px; cursor: pointer;" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" title="पासबुक उघडा">
            <div class="progress-bar-fill ${stats.isFullyPaid ? 'emerald' : 'gold'}" style="width: ${stats.progressPercent}%;"></div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
            ${stats.isFullyPaid 
              ? `<span style="color: var(--emerald-400); font-weight: 700;">५०/५० आठवडे (+${stats.maturityInterestPercent}%: +${currency}${stats.interestAmount.toLocaleString('en-IN')})</span>` 
              : `${stats.paidWeeksCount}/५० आठवडे (${stats.progressPercent}%)`}
            ${stats.totalFinePaid > 0 ? `• <span style="color: #fb7185;">${currency}${stats.totalFinePaid} दंड</span>` : ''}
          </div>
        </td>

        <td>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">
            ${stats.isFullyPaid ? `<button type="button" class="btn btn-emerald btn-sm" onclick="event.stopPropagation(); window.receiptManager.showPayoutVoucherModal('${member.id}')" style="font-size:0.75rem; padding:0.2rem 0.6rem; background: var(--emerald-600); color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:800;" title="५०-आठवडे मॅच्युरिटी व्हाउचर पहा">🎉 पूर्ण झाले (व्हाउचर)</button>` : `पुढील आठवडा ${stats.nextDueWeek}: <span style="color: var(--gold-400);">${currency}${stats.nextDueAmount.toLocaleString('en-IN')}</span>`}
          </div>
          <div class="amount-remaining">
            लक्ष्य: ${currency}${stats.totalTarget.toLocaleString('en-IN')} <span style="font-size: 0.68rem; color: var(--text-muted);">(+${stats.maturityInterestPercent}% = ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')})</span>
          </div>
        </td>

        <td>
          ${miniMatrixHTML}
        </td>

        <td>
          <div class="action-buttons">
            ${(isFullPaidThisWeek || isClearedThisWeek) ? `
              <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" title="पावती पहा / प्रिंट करा">
                🧾 पावती
              </button>
              <button class="btn btn-danger btn-sm" onclick="window.ui.handleUndoPayment('${member.id}', ${currentWeek})" title="पेमेंट रद्द करा">
                ✕
              </button>
            ` : isPartialThisWeek ? `
              <button class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" title="उर्वरित हप्ता जमा करा">
                💰 बाकी जमा
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" title="पावती पहा / प्रिंट करा">
                🧾 पावती
              </button>
              <button class="btn btn-danger btn-sm" onclick="window.ui.handleUndoPayment('${member.id}', ${currentWeek})" title="पेमेंट रद्द करा">
                ✕
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})">
                💰 जमा करा
              </button>
            `}
            ${!stats.isFullyPaid ? `
              <button class="btn btn-gold btn-sm" onclick="window.ui.openBulkPayModal('${member.id}')" title="उर्वरित सर्व ${stats.remainingWeeksCount} आठवडे एकाच वेळी भरा">
                ⚡ सर्व भरा (${stats.remainingWeeksCount} आठवडे)
              </button>
            ` : (stats.isPayoutCompleted ? `
              <button class="btn btn-gold btn-sm" onclick="window.receiptManager.showPayoutVoucherModal('${member.id}')" title="अधिकृत ५०-आठवडे मॅच्युरिटी व्हाउचर पहा">
                📜 व्हाउचर
              </button>
            ` : `
              <button class="btn btn-emerald btn-sm" onclick="window.ui.openPayoutCompleteModal('${member.id}')" title="सदस्याला ५०-आठवडे मॅच्युरिटी परतावा वाटप करा" style="background: var(--emerald-600); border-color: var(--emerald-500); font-weight: 800;">
                💰 परतावा वाटप
              </button>
            `)}
            ${stats.canRestartPlan ? `
              <button class="btn btn-emerald btn-sm" onclick="window.ui.openRestartPlanModal('${member.id}')" title="पुढील सायकल सुरू करा" style="background: linear-gradient(135deg, var(--emerald-600), var(--blue-600)); color: #fff; font-weight: 800; border: none;">
                🔄 नवीन प्लॅन
              </button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="window.ui.openPassbookModal('${member.id}')" title="संपूर्ण ५०-आठवडे पासबुक">
              📖 पासबुक
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.ui.openEditMemberModal('${member.id}')" title="सदस्य तपशील एडिट करा">
              ✏️ एडिट
            </button>
            <button class="btn btn-secondary btn-sm" style="color: var(--gold-400); border-color: rgba(245, 158, 11, 0.4);" onclick="window.ui.handleWipeMemberDeposits('${member.id}')" title="या सदस्याचा जमा भरणा डेटा पुसा (Wipe Deposits)">
              🧹 भरणा पुसा
            </button>
            <button class="btn btn-secondary btn-sm" style="color: var(--rose-400); border-color: rgba(244, 63, 94, 0.4);" onclick="window.ui.openSettleModal('${member.id}')" title="सदस्य डेटा व्यवस्थापन व डिलीट">
              🗑️ डिलीट
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  // --- हप्ता जमा मोडल उघडणे ---
  openCollectModal(memberId, weekNumber) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक पेमेंट नोंदवू शकतात.', 'error');
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    this.selectedMemberId = memberId;
    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency || '₹';
    const defaultFine = Number(window.bishiStore.state.meta.defaultFineAmount) || 0;
    const globalCurrentWeek = window.bishiStore.state.meta.currentWeek || 1;

    // मागील थकबाकी आठवडे शोधणे (Genuinely unpaid & uncleared previous weeks)
    const unpaidPastWeeks = member.weeks.filter(w => 
      w.weekNumber < globalCurrentWeek && 
      (w.status !== 'paid' || Number(w.amountPaid || 0) === 0) &&
      w.weekNumber > stats.effectivePaidWeeks &&
      w.status !== 'skipped'
    );
    const isPastDuePending = unpaidPastWeeks.length > 0 && stats.overdueWeeksCount > 0;
    const earliestUnpaidWeek = unpaidPastWeeks.length > 0 ? unpaidPastWeeks[0].weekNumber : globalCurrentWeek;

    // निवडलेला आठवडा वापरणे
    this.selectedCollectWeek = Number(weekNumber) || globalCurrentWeek;

    const currentWkData = member.weeks.find(w => w.weekNumber === this.selectedCollectWeek);
    const prevPaidOnSelectedWk = Number(currentWkData?.amountPaid || 0);
    const isTargetPartial = prevPaidOnSelectedWk > 0 && prevPaidOnSelectedWk < stats.weeklyAmount;
    const remainingOnSelectedWk = isTargetPartial ? (stats.weeklyAmount - prevPaidOnSelectedWk) : stats.weeklyAmount;

    const isPastDue = this.selectedCollectWeek < globalCurrentWeek && this.selectedCollectWeek > stats.effectivePaidWeeks;
    const initialFine = isPastDue ? defaultFine : 0;

    // डिफॉल्ट रक्कम ठरवणे
    let defaultAmount = isTargetPartial ? remainingOnSelectedWk : stats.weeklyAmount;
    if (this.selectedCollectWeek === globalCurrentWeek && isPastDuePending) {
      const countToRecent = Math.max(1, globalCurrentWeek - earliestUnpaidWeek + 1);
      defaultAmount = stats.weeklyAmount * countToRecent;
    }

    document.getElementById('collectModalMemberName').textContent = member.name;
    document.getElementById('collectModalMemberId').textContent = `${member.id} • 📞 ${member.phone}`;
    document.getElementById('collectModalWeekNumber').value = this.selectedCollectWeek;
    document.getElementById('collectModalWeekNumberDisplay').textContent = isTargetPartial
      ? `आठवडा ${this.selectedCollectWeek} / ५० (आधी जमा: ${currency}${prevPaidOnSelectedWk} • बाकी: ${currency}${remainingOnSelectedWk})`
      : (isPastDue ? `आठवडा ${this.selectedCollectWeek} / ५० (मागील थकबाकी)` : `आठवडा ${this.selectedCollectWeek} / ५०`);
    document.getElementById('collectModalAmount').value = defaultAmount;

    // स्मार्ट हप्ते कालावधी प्रीसेट बटणे तयार करणे (Smart Week Presets)
    const presetsContainer = document.getElementById('collectModalWeekPresets');
    if (presetsContainer) {
      let presetsHTML = '';

      if (isTargetPartial) {
        // केस: निवडलेल्या आठवड्यावर आधीच काही रक्कम जमा आहे (उर्वरित बाकी हप्ता)
        presetsHTML += `
          <button type="button" class="week-preset-btn active" data-start-week="${this.selectedCollectWeek}" data-amount="${remainingOnSelectedWk}">
            🟡 उर्वरित बाकी भरणा (${currency}${remainingOnSelectedWk.toLocaleString('en-IN')})
          </button>
          <button type="button" class="week-preset-btn" data-start-week="${this.selectedCollectWeek}" data-amount="${stats.weeklyAmount}">
            पूर्ण हप्ता (${currency}${stats.weeklyAmount.toLocaleString('en-IN')})
          </button>
        `;
      } else if (isPastDuePending) {
        // केस १: मागील हप्ते बाकी आहेत (फक्त थकबाकी बाकी असल्यासच हा पर्याय दिसेल)
        const countToRecent = Math.max(1, globalCurrentWeek - earliestUnpaidWeek + 1);
        const totalToRecent = stats.weeklyAmount * countToRecent;

        // १. चालू आठवड्यात सर्व रक्कम जमा (Combined all on this week)
        presetsHTML += `
          <button type="button" class="week-preset-btn btn-prev-recent active" data-start-week="${globalCurrentWeek}" data-amount="${totalToRecent}">
            🟢 चालू आठवडा ${globalCurrentWeek} (एकत्रित ${currency}${totalToRecent.toLocaleString('en-IN')} - मागील थकबाकीसह जमा)
          </button>
        `;

        // २. केवळ चालू नियमित १ हप्ता (Recent Week Only)
        presetsHTML += `
          <button type="button" class="week-preset-btn btn-recent" data-start-week="${globalCurrentWeek}" data-amount="${stats.weeklyAmount}">
            🟢 केवळ चालू हप्ता ${globalCurrentWeek} (${currency}${stats.weeklyAmount})
          </button>
        `;

        // ३. मागील थकबाकी हप्ता (Previous Overdue Week Only)
        presetsHTML += `
          <button type="button" class="week-preset-btn btn-prev" data-start-week="${earliestUnpaidWeek}" data-amount="${stats.weeklyAmount}">
            🔴 मागील आठवडा ${earliestUnpaidWeek} (${currency}${stats.weeklyAmount})
          </button>
        `;

        // ४. आगाऊ भरणा (Advance Weeks)
        const advanceWeeks = countToRecent + 1;
        presetsHTML += `
          <button type="button" class="week-preset-btn" data-start-week="${globalCurrentWeek}" data-amount="${stats.weeklyAmount * advanceWeeks}">
            ⚡ ${advanceWeeks} आठवडे (${currency}${(stats.weeklyAmount * advanceWeeks).toLocaleString('en-IN')} - आगाऊ)
          </button>
        `;

      } else {
        // केस २: मागील कोणतीही थकबाकी नाही (No pending weeks)
        presetsHTML += `
          <button type="button" class="week-preset-btn active" data-start-week="${this.selectedCollectWeek}" data-amount="${stats.weeklyAmount}">
            १ आठवडा (${currency}${stats.weeklyAmount})
          </button>
          <button type="button" class="week-preset-btn" data-start-week="${this.selectedCollectWeek}" data-amount="${stats.weeklyAmount * 2}">
            २ आठवडे (${currency}${(stats.weeklyAmount * 2).toLocaleString('en-IN')} - या आठवड्यात जमा)
          </button>
          <button type="button" class="week-preset-btn" data-start-week="${this.selectedCollectWeek}" data-amount="${stats.weeklyAmount * 3}">
            ३ आठवडे (${currency}${(stats.weeklyAmount * 3).toLocaleString('en-IN')})
          </button>
          <button type="button" class="week-preset-btn" data-start-week="${this.selectedCollectWeek}" data-amount="${stats.weeklyAmount * 4}">
            ४ आठवडे (${currency}${(stats.weeklyAmount * 4).toLocaleString('en-IN')})
          </button>
        `;
      }

      presetsContainer.innerHTML = presetsHTML;

      // बटणांना क्लिक इव्हेंट जोडणे
      presetsContainer.querySelectorAll('.week-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          presetsContainer.querySelectorAll('.week-preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const startWk = Number(btn.dataset.startWeek) || this.selectedCollectWeek;
          const targetAmt = Number(btn.dataset.amount) || stats.weeklyAmount;
          this.selectedCollectWeek = startWk;

          const wkInput = document.getElementById('collectModalWeekNumber');
          if (wkInput) wkInput.value = startWk;

          const amtInput = document.getElementById('collectModalAmount');
          if (amtInput) amtInput.value = targetAmt;

          // दंड अद्ययावत करणे (जर मागील आठवडा असेल तर दंड, चालू असेल तर ०)
          const isOverdueBtn = startWk < globalCurrentWeek && startWk > stats.effectivePaidWeeks;
          const fineInp = document.getElementById('collectModalFineAmount');
          if (fineInp) fineInp.value = isOverdueBtn ? defaultFine : 0;

          const overdueBanner = document.getElementById('collectModalOverdueAlert');
          if (overdueBanner) overdueBanner.style.display = isOverdueBtn ? 'flex' : 'none';

          this.updateCollectModalCalculations();
        });
      });
    }

    const fineInput = document.getElementById('collectModalFineAmount');
    if (fineInput) fineInput.value = initialFine;

    const overdueAlert = document.getElementById('collectModalOverdueAlert');
    if (overdueAlert) {
      overdueAlert.style.display = isPastDue ? 'flex' : 'none';
    }

    const modeSelect = document.getElementById('collectModalPaymentMode');
    if (modeSelect) modeSelect.value = 'UPI';
    const upiGroup = document.getElementById('collectModalUpiGroup');
    if (upiGroup) upiGroup.style.display = 'block';
    const upiInput = document.getElementById('collectModalUpiId');
    if (upiInput) {
      upiInput.value = '';
      upiInput.required = true;
    }

    this.updateCollectModalCalculations();
    document.getElementById('collectPaymentModal').classList.add('active');
  }

  updateCollectModalCalculations() {
    const member = window.bishiStore.getMember(this.selectedMemberId);
    if (!member) return;

    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency || '₹';
    const depositAmt = Number(document.getElementById('collectModalAmount')?.value) || 0;
    const fineAmt = Number(document.getElementById('collectModalFineAmount')?.value) || 0;
    const totalPayable = depositAmt + fineAmt;

    const totalPayableDisplay = document.getElementById('collectModalTotalPayableDisplay');
    if (totalPayableDisplay) {
      totalPayableDisplay.textContent = `${currency}${totalPayable.toLocaleString('en-IN')}`;
    }

    const runningTotalDisplay = document.getElementById('collectModalRunningTotalDisplay');
    if (runningTotalDisplay) {
      runningTotalDisplay.textContent = `${currency}${stats.totalDeposited.toLocaleString('en-IN')} ➔ ${currency}${(stats.totalDeposited + depositAmt).toLocaleString('en-IN')}`;
    }

    // हप्ते वाटप तपशील व बॅज अपडेट करणे
    const weeksBadge = document.getElementById('collectModalWeeksBadge');
    const breakdownBox = document.getElementById('collectModalAllocationBreakdown');
    const breakdownList = document.getElementById('collectModalAllocationList');

    const weeklyAmount = stats.weeklyAmount || 1000;
    const startWeekNum = Number(document.getElementById('collectModalWeekNumber')?.value) || this.selectedCollectWeek || 1;
    const globalCurrentWeek = window.bishiStore.state.meta.currentWeek || 1;

    const targetWeekData = member.weeks.find(w => w.weekNumber === startWeekNum);
    const prevPaidOnTarget = Number(targetWeekData?.amountPaid || 0);

    const unpaidPastWeeks = member.weeks.filter(w => 
      w.weekNumber < globalCurrentWeek && 
      (w.status !== 'paid' || Number(w.amountPaid || 0) === 0) &&
      w.weekNumber > stats.effectivePaidWeeks &&
      w.status !== 'skipped'
    );
    const hasPastUnpaid = unpaidPastWeeks.length > 0 && stats.overdueWeeksCount > 0;
    const isExtra = depositAmt > weeklyAmount;
    const extraAmt = isExtra ? (depositAmt - weeklyAmount) : 0;
    const isStartPast = startWeekNum < globalCurrentWeek && startWeekNum > stats.effectivePaidWeeks;
    const isPartialInput = prevPaidOnTarget > 0 && (prevPaidOnTarget + depositAmt < weeklyAmount);

    if (depositAmt > 0 && breakdownBox && breakdownList) {
      let allocHtml = '';

      if (isExtra) {
        allocHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(245, 158, 11, 0.12); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.35); margin-bottom: 0.35rem;">
            <div>
              <div style="font-weight: 800; color: var(--gold-400);">⭐ आठवडा ${startWeekNum} (या आठवड्यात पूर्ण ठेव जमा):</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">
                नियमित हप्ता: ${currency}${weeklyAmount.toLocaleString('en-IN')} + अतिरिक्त भरणा: ${currency}${extraAmt.toLocaleString('en-IN')}
              </div>
            </div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--gold-400);">${currency}${depositAmt.toLocaleString('en-IN')}</div>
          </div>
        `;
        if (hasPastUnpaid && !isStartPast) {
          allocHtml += `
            <div style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(0,0,0,0.25); padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); border: 1px dashed var(--border-color); line-height: 1.4;">
              ℹ️ मागील आठवड्यातील बाकी रक्कम या आठवड्यात (आठवडा ${startWeekNum}) एकत्रित भरली जात आहे. मागील आठवडे क्लिअर होतील आणि चालू आठवडा ${startWeekNum} मध्ये संपूर्ण <strong>${currency}${depositAmt.toLocaleString('en-IN')}</strong> जमा नोंदवले जाईल.
            </div>
          `;
        }
      } else if (prevPaidOnTarget > 0) {
        const finalWkAmt = prevPaidOnTarget + depositAmt;
        allocHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(245, 158, 11, 0.12); padding: 0.45rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.35);">
            <div>
              <div style="font-weight: 700; color: var(--gold-400);">🟡 आठवडा ${startWeekNum} हप्ता भरणा:</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">
                आधी जमा: ${currency}${prevPaidOnTarget} + आता जमा: ${currency}${depositAmt} = एकूण: ${currency}${finalWkAmt} / ${currency}${weeklyAmount}
              </div>
            </div>
            <span style="font-weight: 800; color: var(--gold-400);">${currency}${depositAmt.toLocaleString('en-IN')}</span>
          </div>
        `;
      } else {
        allocHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isStartPast ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.12)'}; padding: 0.45rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid ${isStartPast ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'};">
            <span>${isStartPast ? '🔴' : '🟢'} <strong>आठवडा ${startWeekNum} ${isStartPast ? '(मागील थकबाकी)' : '(नियमित हप्ता)'}:</strong></span>
            <span style="font-weight: 800; color: ${isStartPast ? 'var(--rose-400)' : 'var(--emerald-400)'};">${currency}${depositAmt.toLocaleString('en-IN')}</span>
          </div>
        `;
      }

      breakdownList.innerHTML = allocHtml;
      breakdownBox.style.display = 'block';

      // शीर्ष शीर्षक व बॅज अद्ययावत करणे
      const weekDisplayEl = document.getElementById('collectModalWeekNumberDisplay');
      if (weekDisplayEl) {
        weekDisplayEl.textContent = isExtra 
          ? `आठवडा ${startWeekNum} / ५० (एकत्रित ठेव: ${currency}${depositAmt.toLocaleString('en-IN')})`
          : `आठवडा ${startWeekNum} / ५० ${isStartPast ? '(मागील थकबाकी)' : ''}`;
      }

      if (weeksBadge) {
        if (isExtra) {
          weeksBadge.textContent = `आठवडा ${startWeekNum} पूर्ण जमा (+${currency}${extraAmt} जादा)`;
          weeksBadge.style.background = 'rgba(245, 158, 11, 0.2)';
          weeksBadge.style.color = 'var(--gold-400)';
          weeksBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else if (isPartialInput) {
          weeksBadge.textContent = `अपूर्ण भरणा (बाकी: ${currency}${weeklyAmount - (prevPaidOnTarget + depositAmt)})`;
          weeksBadge.style.background = 'rgba(245, 158, 11, 0.2)';
          weeksBadge.style.color = 'var(--gold-400)';
          weeksBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else if (isStartPast) {
          weeksBadge.textContent = '१ आठवडा (मागील थकबाकी)';
          weeksBadge.style.background = 'rgba(244, 63, 94, 0.15)';
          weeksBadge.style.color = 'var(--rose-400)';
          weeksBadge.style.borderColor = 'rgba(244, 63, 94, 0.3)';
        } else {
          weeksBadge.textContent = '१ आठवडा (चालू)';
          weeksBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          weeksBadge.style.color = 'var(--emerald-400)';
          weeksBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        }
      }
    } else {
      if (breakdownBox) breakdownBox.style.display = 'none';
      if (weeksBadge) {
        weeksBadge.textContent = '१ आठवडा';
        weeksBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    }

    // सिंक प्रीसेट बटण ॲक्टिव्ह स्टेट
    document.querySelectorAll('.week-preset-btn').forEach(btn => {
      const btnStart = Number(btn.dataset.startWeek) || startWeekNum;
      const btnAmt = Number(btn.dataset.amount) || stats.weeklyAmount;
      if (btnStart === startWeekNum && depositAmt === btnAmt) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  handleCollectSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक पेमेंट नोंदवू शकतात.', 'error');
      return;
    }

    const inputWk = Number(document.getElementById('collectModalWeekNumber')?.value);
    const targetWeek = inputWk || this.selectedCollectWeek;
    if (!this.selectedMemberId || !targetWeek) {
      this.showToast('⚠️ कृपया सदस्य व आठवडा निवडा.', 'error');
      return;
    }
    this.selectedCollectWeek = targetWeek;

    const depositAmount = Number(document.getElementById('collectModalAmount')?.value) || 0;
    const fineAmount = Number(document.getElementById('collectModalFineAmount')?.value) || 0;
    const paymentMode = document.getElementById('collectModalPaymentMode')?.value || 'Cash';
    const note = document.getElementById('collectModalNote')?.value || '';
    const upiId = document.getElementById('collectModalUpiId')?.value.trim() || '';

    if (depositAmount <= 0) {
      this.showToast('⚠️ कृपया वैध हप्ता रक्कम प्रविष्ट करा!', 'error');
      document.getElementById('collectModalAmount')?.focus();
      return;
    }

    try {
      const result = window.bishiStore.recordPayment(
        this.selectedMemberId,
        this.selectedCollectWeek,
        depositAmount,
        paymentMode,
        note,
        fineAmount,
        upiId
      );

      if (result) {
        document.getElementById('collectPaymentModal').classList.remove('active');
        this.renderAll();
        const totalCollected = depositAmount + fineAmount;
        const weeksInfo = result.weeksPaidCount > 1 
          ? ` (${result.weeksPaidCount} आठवडे: आठवडा ${result.paidWeeks.map(w => w.weekNumber).join(', ')})` 
          : ` (आठवडा ${this.selectedCollectWeek})`;
        this.showToast(`₹${totalCollected.toLocaleString('en-IN')} ${result.member.name}${weeksInfo} यांच्या खात्यात ${paymentMode} द्वारे जमा झाले!`, 'success');

        if (result.stats && (result.stats.isFullyPaid || result.isJustCompleted)) {
          const currency = window.bishiStore.state.meta.currency || '₹';
          this.showToast(`🏆 ५०-आठवड्यांचे चक्र पूर्ण! सदस्य ${result.member.name} यांनी सर्व ५० आठवडे पूर्ण केले आहेत! एकूण परतावा (+८% व्याज): ${currency}${result.stats.maturityTotalPayout.toLocaleString('en-IN')}`, 'success');

          if (window.authManager.isAdmin()) {
            const alertModal = document.getElementById('adminMilestoneCelebrationModal');
            if (alertModal) {
              const elName = document.getElementById('adminAlertMemberName');
              if (elName) elName.textContent = result.member.name;
              const elId = document.getElementById('adminAlertMemberId');
              if (elId) elId.textContent = `${result.member.id} • 📞 ${result.member.phone} • वारसदार: ${result.member.nominee || 'N/A'}`;
              const elSavings = document.getElementById('adminAlertSavingsAmt');
              if (elSavings) elSavings.textContent = `${currency}${result.stats.totalDeposited.toLocaleString('en-IN')}`;
              const elInterest = document.getElementById('adminAlertInterestAmt');
              if (elInterest) elInterest.textContent = `+${currency}${result.stats.interestAmount.toLocaleString('en-IN')} (${result.stats.maturityInterestPercent}%)`;
              const elPayout = document.getElementById('adminAlertTotalPayout');
              if (elPayout) elPayout.textContent = `${currency}${result.stats.maturityTotalPayout.toLocaleString('en-IN')}`;

              const btnDisburse = document.getElementById('btnAdminAlertDisbursePayout');
              if (btnDisburse) {
                btnDisburse.onclick = () => {
                  alertModal.classList.remove('active');
                  this.openPayoutCompleteModal(result.member.id);
                };
              }

              const btnReceipt = document.getElementById('btnAdminAlertViewReceipt');
              if (btnReceipt) {
                btnReceipt.onclick = () => {
                  alertModal.classList.remove('active');
                  window.receiptManager.showReceiptModal(result.member.id, this.selectedCollectWeek);
                };
              }

              alertModal.classList.add('active');
              return;
            }
          }
        }

        window.receiptManager.showReceiptModal(this.selectedMemberId, this.selectedCollectWeek);
      } else {
        this.showToast('⚠️ पेमेंट नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.', 'error');
      }
    } catch (err) {
      console.error('Collect payment error:', err);
      this.showToast(`⚠️ पेमेंट त्रुटी: ${err.message}`, 'error');
    }
  }

  handleUndoPayment(memberId, weekNumber) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक पेमेंट रद्द करू शकतात.', 'error');
      return;
    }

    if (confirm(`तुम्हाला आठवडा ${weekNumber} चे पेमेंट नक्की रद्द करायचे आहे का?`)) {
      window.bishiStore.removePayment(memberId, weekNumber);
      this.renderAll();
      this.showToast(`आठवडा ${weekNumber} चे पेमेंट रद्द झाले`, 'warning');
    }
  }

  // --- सदस्य ५०-आठवडे पासबुक मोडल ---
  openPassbookModal(memberId, cycleNumber = null) {
    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    this.selectedPassbookMemberId = member.id;
    const currency = window.bishiStore.state.meta.currency;
    const activeCycleNum = member.currentCycle || 1;
    const viewingCycle = cycleNumber ? Number(cycleNumber) : activeCycleNum;
    const isViewingArchived = viewingCycle < activeCycleNum;

    let viewWeeks = member.weeks;
    let stats = null;
    let pastCycleData = null;

    if (isViewingArchived) {
      pastCycleData = (member.pastCycles || []).find(c => c.cycleNumber === viewingCycle);
      if (pastCycleData) {
        viewWeeks = pastCycleData.weeks || [];
        stats = pastCycleData.stats || window.bishiStore.calculateMemberStats(pastCycleData);
      }
    }

    if (!stats) {
      stats = window.bishiStore.calculateMemberStats(member);
      viewWeeks = member.weeks;
    }

    document.getElementById('passbookModalMemberName').textContent = member.name;
    document.getElementById('passbookModalMemberInfo').textContent = `${member.id} • 📞 ${member.phone} • वारसदार: ${member.nominee || 'N/A'}${member.currentCycle > 1 ? ` • सायकल ${viewingCycle} / ${member.currentCycle}` : ''}`;
    document.getElementById('passbookWeeklyAmt').textContent = `${currency}${stats.weeklyAmount.toLocaleString('en-IN')}`;
    document.getElementById('passbookTotalPaid').textContent = `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`;
    document.getElementById('passbookWeeksCompleted').textContent = `${stats.paidWeeksCount} / ५०`;
    
    const matPayoutEl = document.getElementById('passbookMaturityPayout');
    if (matPayoutEl) {
      matPayoutEl.textContent = stats.isFullyPaid 
        ? `${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}` 
        : `${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')}`;
      matPayoutEl.title = `${stats.maturityInterestPercent}% मॅच्युरिटी व्याज बोनस समाविष्ट`;
    }

    document.getElementById('passbookRemainingAmt').textContent = `${currency}${stats.remainingAmount.toLocaleString('en-IN')}`;

    // सायकल स्विचर
    const switcherContainer = document.getElementById('passbookCycleSwitcherContainer');
    if (switcherContainer) {
      if (member.pastCycles && member.pastCycles.length > 0) {
        switcherContainer.style.display = 'flex';
        switcherContainer.style.alignItems = 'center';
        switcherContainer.style.gap = '0.5rem';
        switcherContainer.style.flexWrap = 'wrap';
        switcherContainer.style.background = 'rgba(0, 0, 0, 0.25)';
        switcherContainer.style.padding = '0.6rem 0.85rem';
        switcherContainer.style.borderRadius = 'var(--radius-md)';
        switcherContainer.style.border = '1px solid var(--border-color)';

        let html = `<span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">सायकल निवडा:</span>`;
        
        const isActiveSelected = viewingCycle === activeCycleNum;
        html += `
          <button type="button" class="btn btn-sm ${isActiveSelected ? 'btn-primary' : 'btn-secondary'}" onclick="window.ui.openPassbookModal('${member.id}', ${activeCycleNum})" style="${isActiveSelected ? 'font-weight: 800;' : ''}">
            🟢 सायकल ${activeCycleNum} (${stats.isFullyPaid ? 'पूर्ण' : 'सक्रिय'})
          </button>
        `;

        member.pastCycles.forEach(pc => {
          const isPastSelected = viewingCycle === pc.cycleNumber;
          html += `
            <button type="button" class="btn btn-sm ${isPastSelected ? 'btn-gold' : 'btn-secondary'}" onclick="window.ui.openPassbookModal('${member.id}', ${pc.cycleNumber})" style="${isPastSelected ? 'font-weight: 800;' : ''}">
              🏆 सायकल ${pc.cycleNumber} (जतन)
            </button>
          `;
        });

        switcherContainer.innerHTML = html;
      } else {
        switcherContainer.style.display = 'none';
      }
    }

    const matrixTitle = document.getElementById('passbookMatrixTitle');
    if (matrixTitle) {
      matrixTitle.textContent = isViewingArchived
        ? `सायकल ${viewingCycle} जतन मॅट्रिक्स (पूर्ण तारीख: ${pastCycleData?.completedDate || 'मॅच्युरिटी'})`
        : `५०-आठवडे बचत मॅट्रिक्स (पावती पाहण्यासाठी किंवा हप्ता नोंदवण्यासाठी क्लिक करा)`;
    }

    const grid = document.getElementById('passbookGridContainer');
    grid.innerHTML = '';

    viewWeeks.forEach(wk => {
      const paidAmt = Number(wk.amountPaid || 0);
      const weeklyReq = stats.weeklyAmount;
      
      // Calculate cumulative deposit up to this week to check if extra is advance for next weeks or past dues
      const depositedUpToW = viewWeeks.filter(w => w.weekNumber <= wk.weekNumber).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
      const expectedUpToW = wk.weekNumber * weeklyReq;
      const advanceExtraAmt = Math.max(0, depositedUpToW - expectedUpToW);
      const isAdvanceExtra = (paidAmt >= weeklyReq) && (advanceExtraAmt > 0);

      // Conditions
      const isCleared = (paidAmt < weeklyReq) && (wk.weekNumber <= stats.effectivePaidWeeks);
      const isFullPaid = (paidAmt >= weeklyReq);
      const isPartial = (paidAmt > 0 && paidAmt < weeklyReq && !isCleared);
      const isPastEmpty = !isViewingArchived && !isCleared && !isPartial && (wk.weekNumber < window.bishiStore.state.meta.currentWeek && paidAmt === 0);
      const isCurrent = !isViewingArchived && !isCleared && !isPartial && (wk.weekNumber === window.bishiStore.state.meta.currentWeek && paidAmt === 0);

      let boxClass = '';
      let displayAmt = '';
      let statusText = 'प्रलंबित';

      if (isFullPaid) {
        boxClass = isAdvanceExtra ? 'paid has-extra' : 'paid';
        displayAmt = `${currency}${paidAmt.toLocaleString('en-IN')}`;
        if (isAdvanceExtra) {
          statusText = `⭐ +₹${advanceExtraAmt.toLocaleString('en-IN')} जादा`;
        } else if (wk.finePaid > 0) {
          statusText = `✓ +₹${wk.finePaid}`;
        } else {
          statusText = '✓ जमा';
        }
      } else if (isPartial) {
        const pendingAmt = weeklyReq - paidAmt;
        boxClass = 'partial';
        displayAmt = `${currency}${paidAmt.toLocaleString('en-IN')}`;
        statusText = `⚠️ ₹${pendingAmt.toLocaleString('en-IN')} बाकी`;
      } else if (isCleared) {
        boxClass = 'cleared';
        displayAmt = '—';
        statusText = '✓ क्लिअर';
      } else if (isCurrent) {
        boxClass = 'current-due';
        displayAmt = `${currency}${weeklyReq.toLocaleString('en-IN')}`;
        statusText = 'चालू';
      } else if (isPastEmpty) {
        boxClass = 'empty-week overdue';
        displayAmt = `${currency}0`;
        statusText = 'थकबाकी';
      } else {
        boxClass = 'pending';
        displayAmt = `${currency}${weeklyReq.toLocaleString('en-IN')}`;
        statusText = 'प्रलंबित';
      }

      const box = document.createElement('div');
      box.className = `passbook-week-box ${boxClass}`;
      box.innerHTML = `
        <div class="box-wk-title">W${wk.weekNumber}</div>
        <div class="box-wk-amount">${displayAmt}</div>
        <div style="font-size: 0.65rem; text-transform: uppercase;">
          ${statusText}
        </div>
      `;

      if (isFullPaid) {
        box.title = `सायकल ${viewingCycle} • आठवडा ${wk.weekNumber} जमा: ₹${paidAmt}${isAdvanceExtra ? ` (+₹${advanceExtraAmt} पुढील आठवड्यांसाठी अ‍ॅडव्हान्स/जादा)` : ''} - पावती पाहण्यासाठी क्लिक करा`;
        box.style.cursor = 'pointer';
      } else if (isPartial) {
        const pendingAmt = weeklyReq - paidAmt;
        box.title = `आठवडा ${wk.weekNumber}: ₹${paidAmt} जमा (अपूर्ण भरणा • बाकी ₹${pendingAmt}) - उर्वरित पेमेंट भरण्यासाठी क्लिक करा`;
        box.style.cursor = 'pointer';
      } else if (isCleared) {
        box.title = `आठवडा ${wk.weekNumber}: थकबाकी क्लिअर (जादा भरण्यासोबत क्लिअर झाले)`;
        box.style.cursor = 'pointer';
      } else {
        box.title = `आठवडा ${wk.weekNumber} (${isPastEmpty ? 'रिकामे / हप्ता बाकी' : (isCurrent ? 'चालू' : 'प्रलंबित')}) - पेमेंट नोंदवण्यासाठी क्लिक करा`;
      }

      box.addEventListener('click', () => {
        if (isFullPaid) {
          window.receiptManager.showReceiptModal(member.id, wk.weekNumber, viewingCycle);
        } else if (isPartial) {
          if (!isViewingArchived && window.authManager && window.authManager.isAdmin()) {
            document.getElementById('passbookModal').classList.remove('active');
            this.openCollectModal(member.id, wk.weekNumber);
          } else {
            window.receiptManager.showReceiptModal(member.id, wk.weekNumber, viewingCycle);
          }
        } else if (isCleared) {
          this.showToast(`आठवडा ${wk.weekNumber} ची थकबाकी पुढील आठवड्यातील जादा भरण्यासोबत आधीच क्लिअर झाली आहे.`, 'info');
        } else if (!isViewingArchived && window.authManager && window.authManager.isAdmin()) {
          document.getElementById('passbookModal').classList.remove('active');
          this.openCollectModal(member.id, wk.weekNumber);
        } else {
          this.showToast(`आठवडा ${wk.weekNumber} चे पेमेंट बाकी आहे. हप्ते प्रशासक नोंदवतात.`, 'info');
        }
      });

      grid.appendChild(box);
    });

    const btnPayAll = document.getElementById('btnPassbookPayAll');
    if (btnPayAll) {
      if (!isViewingArchived && !stats.isFullyPaid && window.authManager && window.authManager.isAdmin()) {
        btnPayAll.style.display = 'inline-block';
        btnPayAll.textContent = `⚡ उर्वरित सर्व ${stats.remainingWeeksCount} आठवडे एकाच वेळी भरा (${currency}${stats.remainingAmount.toLocaleString('en-IN')})`;
        btnPayAll.onclick = () => {
          document.getElementById('passbookModal').classList.remove('active');
          this.openBulkPayModal(member.id);
        };
      } else {
        btnPayAll.style.display = 'none';
      }
    }

    const btnRestart = document.getElementById('btnPassbookRestartPlan');
    if (btnRestart) {
      if (stats.canRestartPlan && window.authManager && window.authManager.isAdmin()) {
        btnRestart.style.display = 'inline-block';
        btnRestart.onclick = () => {
          document.getElementById('passbookModal').classList.remove('active');
          this.openRestartPlanModal(member.id);
        };
      } else {
        btnRestart.style.display = 'none';
      }
    }

    const btnEdit = document.getElementById('passbookBtnEditMember');
    if (btnEdit) {
      if (window.authManager && window.authManager.isAdmin()) {
        btnEdit.style.display = 'inline-block';
        btnEdit.onclick = () => {
          document.getElementById('passbookModal').classList.remove('active');
          this.openEditMemberModal(member.id);
        };
      } else {
        btnEdit.style.display = 'none';
      }
    }

    const btnWipeHeader = document.getElementById('passbookBtnWipeDeposits');
    if (btnWipeHeader) {
      if (!isViewingArchived && window.authManager && window.authManager.isAdmin()) {
        btnWipeHeader.style.display = 'inline-block';
        btnWipeHeader.onclick = () => {
          this.handleWipeMemberDeposits(member.id);
        };
      } else {
        btnWipeHeader.style.display = 'none';
      }
    }

    const btnWipeFooter = document.getElementById('btnPassbookWipeDepositsFooter');
    if (btnWipeFooter) {
      if (!isViewingArchived && window.authManager && window.authManager.isAdmin()) {
        btnWipeFooter.style.display = 'inline-block';
        btnWipeFooter.onclick = () => {
          this.handleWipeMemberDeposits(member.id);
        };
      } else {
        btnWipeFooter.style.display = 'none';
      }
    }

    document.getElementById('passbookModal').classList.add('active');
  }

  // --- उर्वरित सर्व आठवडे एकाच वेळी भरा (प्रशासक) ---
  openBulkPayModal(memberId, onWeekNumber = null) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक एकरकमी पेमेंट नोंदवू शकतात.', 'error');
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) {
      this.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency;

    if (stats.isFullyPaid) {
      this.showToast(`🎉 ${member.name} यांनी आधीच सर्व ५० आठवडे पूर्ण केले आहेत!`, 'success');
      return;
    }

    this.selectedBulkMemberId = memberId;
    this.selectedBulkWeek = onWeekNumber ? Number(onWeekNumber) : (window.bishiStore.state.meta.currentWeek || 1);

    document.getElementById('bulkPayMemberName').textContent = member.name;
    document.getElementById('bulkPayMemberMeta').textContent = `${member.id} • ${currency}${member.weeklyAmount.toLocaleString('en-IN')}/आठवडा • भरणा आठवडा: आठवडा ${this.selectedBulkWeek}`;
    document.getElementById('bulkPayWeeksBadge').textContent = `${stats.remainingWeeksCount} पैकी ५० आठवडे बाकी`;
    document.getElementById('bulkPayTotalAmountDisplay').textContent = `${currency}${stats.remainingAmount.toLocaleString('en-IN')}`;
    document.getElementById('bulkPayUnpaidCount').textContent = `${stats.remainingWeeksCount} आठवडे (आठवडा ${this.selectedBulkWeek} मध्ये थेट जमा)`;
    document.getElementById('bulkPayBonusText').textContent = `+${stats.maturityInterestPercent}% बोनस: +${currency}${stats.projectedInterest.toLocaleString('en-IN')}`;
    document.getElementById('bulkPayTotalPayoutText').textContent = `एकूण परतावा: ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')}`;
    
    const modeSelect = document.getElementById('bulkPayPaymentMode');
    if (modeSelect) modeSelect.value = 'UPI';
    const upiGroup = document.getElementById('bulkPayUpiGroup');
    if (upiGroup) upiGroup.style.display = 'block';
    const upiInput = document.getElementById('bulkPayUpiId');
    if (upiInput) {
      upiInput.value = '';
      upiInput.required = true;
    }
    const noteInput = document.getElementById('bulkPayNote');
    if (noteInput) noteInput.value = '';

    document.getElementById('bulkPayModal').classList.add('active');
  }

  handleBulkPaySubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक पेमेंट नोंदवू शकतात.', 'error');
      return;
    }
    if (!this.selectedBulkMemberId) return;

    const paymentMode = document.getElementById('bulkPayPaymentMode')?.value || 'Cash';
    const upiId = document.getElementById('bulkPayUpiId')?.value.trim() || '';
    const note = document.getElementById('bulkPayNote')?.value.trim() || '';

    if (paymentMode.toLowerCase().includes('upi') && !upiId) {
      this.showToast('⚠️ UPI पेमेंटसाठी संदर्भ क्र. किंवा UPI आयडी आवश्यक आहे!', 'error');
      document.getElementById('bulkPayUpiId')?.focus();
      return;
    }

    const result = window.bishiStore.recordBulkPayment(
      this.selectedBulkMemberId,
      paymentMode,
      upiId,
      note,
      this.selectedBulkWeek
    );

    if (result) {
      document.getElementById('bulkPayModal').classList.remove('active');
      this.renderAll();
      const currency = window.bishiStore.state.meta.currency;

      this.showToast(`⚡ ${result.member.name} यांच्या सर्व ${result.unpaidWeeksCount} शिल्लक आठवड्यांचे पेमेंट (${currency}${result.totalLumpSumDeposit.toLocaleString('en-IN')}) आठवडा ${result.targetWeek} मध्ये ${paymentMode} द्वारे नोंदवले गेले!`, 'success');
      this.showToast(`🏆 ५०-आठवड्यांचे चक्र पूर्ण! एकूण परतावा (+८% व्याज): ${currency}${result.stats.maturityTotalPayout.toLocaleString('en-IN')}`, 'success');

      if (window.authManager.isAdmin()) {
        const alertModal = document.getElementById('adminMilestoneCelebrationModal');
        if (alertModal) {
          const elName = document.getElementById('adminAlertMemberName');
          if (elName) elName.textContent = result.member.name;
          const elId = document.getElementById('adminAlertMemberId');
          if (elId) elId.textContent = `${result.member.id} • 📞 ${result.member.phone} • वारसदार: ${result.member.nominee || 'N/A'}`;
          const elSavings = document.getElementById('adminAlertSavingsAmt');
          if (elSavings) elSavings.textContent = `${currency}${result.stats.totalDeposited.toLocaleString('en-IN')}`;
          const elInterest = document.getElementById('adminAlertInterestAmt');
          if (elInterest) elInterest.textContent = `+${currency}${result.stats.interestAmount.toLocaleString('en-IN')} (${result.stats.maturityInterestPercent}%)`;
          const elPayout = document.getElementById('adminAlertTotalPayout');
          if (elPayout) elPayout.textContent = `${currency}${result.stats.maturityTotalPayout.toLocaleString('en-IN')}`;

          const btnDisburse = document.getElementById('btnAdminAlertDisbursePayout');
          if (btnDisburse) {
            btnDisburse.onclick = () => {
              alertModal.classList.remove('active');
              this.openPayoutCompleteModal(result.member.id);
            };
          }

          const btnReceipt = document.getElementById('btnAdminAlertViewReceipt');
          if (btnReceipt) {
            btnReceipt.onclick = () => {
              alertModal.classList.remove('active');
              window.receiptManager.showReceiptModal(result.member.id, result.targetWeek || 1);
            };
          }

          alertModal.classList.add('active');
          return;
        }
      }

      window.receiptManager.showReceiptModal(result.member.id, result.targetWeek || 1);
    }
  }

  // --- ५०-आठवडे मॅच्युरिटी परतावा वाटप (प्रशासक) ---
  openPayoutCompleteModal(memberId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक परतावा वाटप करू शकतात.', 'error');
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency;

    if (!stats.isFullyPaid) {
      this.showToast('⚠️ सदस्याने अद्याप सर्व ५० आठवडे पूर्ण केलेले नाहीत.', 'warning');
      return;
    }

    this.selectedPayoutMemberId = memberId;

    document.getElementById('payoutModalMemberName').textContent = member.name;
    document.getElementById('payoutModalMemberMeta').textContent = `${member.id} • 📞 ${member.phone} • वारसदार: ${member.nominee || 'N/A'}`;
    document.getElementById('payoutModalTotalDisplay').textContent = `${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}`;
    document.getElementById('payoutModalSavingsAmount').textContent = `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`;
    document.getElementById('payoutModalBonusText').textContent = `${stats.maturityInterestPercent}% व्याज: +${currency}${stats.interestAmount.toLocaleString('en-IN')}`;

    const refInput = document.getElementById('payoutReference');
    if (refInput) refInput.value = '';
    const noteInput = document.getElementById('payoutNote');
    if (noteInput) noteInput.value = `५० आठवडे पूर्ण मॅच्युरिटी परतावा वाटप केला (${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')})`;

    document.getElementById('payoutCompleteModal').classList.add('active');
  }

  handlePayoutCompleteSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin() || !this.selectedPayoutMemberId) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक परतावा पूर्ण करू शकतात.', 'error');
      return;
    }

    const member = window.bishiStore.getMember(this.selectedPayoutMemberId);
    if (!member) return;

    const stats = window.bishiStore.calculateMemberStats(member);
    const paymentMode = document.getElementById('payoutPaymentMode')?.value || 'Cash';
    const reference = document.getElementById('payoutReference')?.value.trim() || '';
    const note = document.getElementById('payoutNote')?.value.trim() || '';

    const result = window.bishiStore.completePayout(
      this.selectedPayoutMemberId,
      stats.maturityTotalPayout,
      paymentMode,
      reference,
      note
    );

    if (result) {
      document.getElementById('payoutCompleteModal')?.classList.remove('active');
      this.renderAll();
      const currency = window.bishiStore?.state?.meta?.currency || '₹';
      const paidAmt = Number(result.payoutDetails?.amount || result.payoutDetails?.totalPayoutAmount || stats.maturityTotalPayout || 0);

      this.showToast(`✅ ${result.member.name} यांच्यासाठी ${currency}${paidAmt.toLocaleString('en-IN')} चा पूर्ण परतावा वाटप झाला!`, 'success');
      window.receiptManager.showPayoutVoucherModal(result.member.id);
    }
  }

  // --- नवीन बचत प्लॅन सुरू करणे (नवीन सायकल) ---
  openRestartPlanModal(memberId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक नवीन प्लॅन सुरू करू शकतात.', 'error');
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) {
      this.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const currency = window.bishiStore.state.meta.currency;
    const currentCycle = member.currentCycle || 1;
    const nextCycle = currentCycle + 1;

    document.getElementById('restartPlanMemberId').value = member.id;
    document.getElementById('restartPlanMemberName').textContent = member.name;
    document.getElementById('restartPlanMemberMeta').textContent = `${member.id} • 📞 ${member.phone} • वारसदार: ${member.nominee || 'N/A'}`;
    document.getElementById('restartPlanPrevCycleBadge').textContent = `सायकल ${currentCycle} पूर्ण 🏆`;

    const weeklyInput = document.getElementById('restartWeeklyAmount');
    if (weeklyInput) {
      weeklyInput.value = member.weeklyAmount || 1000;
    }

    document.querySelectorAll('#restartAmountPresets .preset-btn').forEach(btn => {
      if (Number(btn.dataset.amount) === (member.weeklyAmount || 1000)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const startWkInput = document.getElementById('restartStartWeek');
    if (startWkInput) startWkInput.value = 1;

    const initialCheck = document.getElementById('restartInitialDeposit');
    if (initialCheck) initialCheck.checked = false;

    const initialOpts = document.getElementById('restartInitialDepositOptions');
    if (initialOpts) initialOpts.style.display = 'none';

    const upiGrp = document.getElementById('restartUpiGroup');
    if (upiGrp) upiGrp.style.display = 'none';

    const payMode = document.getElementById('restartPaymentMode');
    if (payMode) payMode.value = 'Cash';

    const upiInput = document.getElementById('restartUpiId');
    if (upiInput) upiInput.value = '';

    const updateGoalPreview = () => {
      const wkAmt = Number(weeklyInput.value) || 0;
      const target = wkAmt * 50;
      const bonusPct = Number(window.bishiStore.state.meta.maturityInterestPercent !== undefined ? window.bishiStore.state.meta.maturityInterestPercent : 8);
      const bonusAmt = Math.round(target * (bonusPct / 100));
      const totalPayout = target + bonusAmt;

      const targetEl = document.getElementById('restartTotalGoalPreview');
      if (targetEl) targetEl.textContent = `${currency}${target.toLocaleString('en-IN')}`;
      const subEl = document.getElementById('restartTargetSub');
      if (subEl) subEl.textContent = `५० आठवडे × ${currency}${wkAmt.toLocaleString('en-IN')} (+${bonusPct}% बोनस = ${currency}${totalPayout.toLocaleString('en-IN')})`;
      const submitBtn = document.getElementById('btnConfirmRestartPlan');
      if (submitBtn) submitBtn.textContent = `🚀 सायकल ${nextCycle} सुरू करा`;
    };

    updateGoalPreview();
    weeklyInput.oninput = updateGoalPreview;

    document.getElementById('restartPlanModal').classList.add('active');
  }

  handleRestartPlanSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक प्लॅन रीस्टार्ट करू शकतात.', 'error');
      return;
    }

    const memberId = document.getElementById('restartPlanMemberId').value;
    const weeklyAmount = Number(document.getElementById('restartWeeklyAmount').value);
    const startWeek = Number(document.getElementById('restartStartWeek').value) || 1;
    const initialDepositChecked = document.getElementById('restartInitialDeposit').checked;
    const paymentMode = document.getElementById('restartPaymentMode').value;
    const upiId = document.getElementById('restartUpiId').value;

    if (!weeklyAmount || weeklyAmount <= 0) {
      this.showToast('कृपया योग्य साप्ताहिक बचत रक्कम टाका', 'warning');
      return;
    }

    if (initialDepositChecked && paymentMode === 'UPI' && !upiId.trim()) {
      this.showToast('UPI पेमेंटसाठी UPI आयडी किंवा संदर्भ क्रमांक आवश्यक आहे', 'warning');
      return;
    }

    const res = window.bishiStore.restartPlan(memberId, {
      weeklyAmount,
      startWeek,
      initialDeposit: initialDepositChecked ? weeklyAmount : 0,
      paymentMode,
      upiId
    });

    if (res && res.member) {
      document.getElementById('restartPlanModal').classList.remove('active');
      this.renderAll();
      this.showToast(`🎉 ${res.member.name} यांच्यासाठी सायकल ${res.newCycle} यशस्वीरीत्या सुरू झाली! मागील सर्व तपशील सुरक्षित जतन आहेत.`, 'success');
      this.openPassbookModal(memberId, res.newCycle);
    } else {
      this.showToast('प्लॅन सुरू करता आला नाही. कृपया सदस्य स्थिती तपासा.', 'error');
    }
  }

  // --- नवीन सदस्य जोडा (प्रशासक) ---
  openAddMemberModal() {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक नवीन सदस्य जोडू शकतात.', 'error');
      this.checkAuthView();
      return;
    }
    document.getElementById('addMemberStartWeek').value = window.bishiStore.state.meta.currentWeek;
    
    const initDepositCheck = document.getElementById('addMemberInitialDeposit');
    if (initDepositCheck) initDepositCheck.checked = false;
    const initOptions = document.getElementById('addMemberInitialDepositOptions');
    if (initOptions) initOptions.style.display = 'none';
    const upiGroup = document.getElementById('addMemberUpiGroup');
    if (upiGroup) upiGroup.style.display = 'none';
    const upiInput = document.getElementById('addMemberUpiId');
    if (upiInput) upiInput.value = '';

    this.updateAddMemberTargetCalc();
    document.getElementById('addMemberModal').classList.add('active');
  }

  handleAddMemberSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक सदस्य जोडू शकतात.', 'error');
      return;
    }

    const name = document.getElementById('addMemberName').value;
    const phone = document.getElementById('addMemberPhone').value;
    const password = document.getElementById('addMemberPassword')?.value || '';
    const weeklyAmount = document.getElementById('addMemberWeeklyAmount').value;
    const startWeek = document.getElementById('addMemberStartWeek').value;
    const nominee = document.getElementById('addMemberNominee').value;
    const notes = document.getElementById('addMemberNotes').value;
    const isPayingNow = document.getElementById('addMemberInitialDeposit').checked;
    const initialDeposit = isPayingNow ? weeklyAmount : 0;
    const paymentMode = document.getElementById('addMemberPaymentMode').value;
    const upiId = document.getElementById('addMemberUpiId')?.value.trim() || '';

    if (isPayingNow && paymentMode.toLowerCase().includes('upi') && !upiId) {
      this.showToast('⚠️ पहिल्या हप्त्यासाठी UPI आयडी किंवा संदर्भ क्रमांक आवश्यक आहे!', 'error');
      document.getElementById('addMemberUpiId')?.focus();
      return;
    }

    const newMember = window.bishiStore.addMember({
      name,
      phone,
      password,
      weeklyAmount,
      startWeek,
      nominee,
      notes,
      initialDeposit,
      paymentMode,
      upiId
    });

    if (newMember) {
      document.getElementById('addMemberForm').reset();
      document.getElementById('addMemberModal').classList.remove('active');
      this.renderAll();
      this.showToast(`नवीन सदस्य ${newMember.name} (${newMember.id}) यशस्वीरीत्या जोडले गेले!`, 'success');
    }
  }

  // --- सदस्य तपशील एडिट करा (प्रशासक) ---
  openEditMemberModal(memberId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक सदस्य माहिती एडिट करू शकतात.', 'error');
      this.checkAuthView();
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) {
      this.showToast('सदस्य सापडला नाही', 'error');
      return;
    }

    this.selectedEditMemberId = memberId;

    document.getElementById('editMemberIdBadge').textContent = member.id;
    const statusBadge = document.getElementById('editMemberStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = member.status === 'completed' ? '५० आठवडे पूर्ण' : 'सक्रिय सदस्य';
      statusBadge.className = `status-pill ${member.status === 'completed' ? 'status-completed' : 'status-active'}`;
    }

    document.getElementById('editMemberName').value = member.name || '';
    document.getElementById('editMemberPhone').value = member.phone || '';
    const editPassInput = document.getElementById('editMemberPassword');
    if (editPassInput) editPassInput.value = member.password || '';
    document.getElementById('editMemberWeeklyAmount').value = member.weeklyAmount || 1000;
    document.getElementById('editMemberNominee').value = member.nominee || '';
    document.getElementById('editMemberNotes').value = member.notes || '';

    document.querySelectorAll('#editAmountPresets .preset-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.amount) === Number(member.weeklyAmount));
    });

    const btnEditWipe = document.getElementById('btnEditWipeMemberDeposits');
    if (btnEditWipe) {
      btnEditWipe.onclick = () => {
        this.handleWipeMemberDeposits(member.id);
      };
    }

    this.updateEditMemberTargetCalc();
    document.getElementById('editMemberModal').classList.add('active');
  }

  updateEditMemberTargetCalc() {
    const weeklyAmt = Number(document.getElementById('editMemberWeeklyAmount')?.value) || 0;
    const totalGoal = weeklyAmt * 50;
    const interestPercent = window.bishiStore.state.meta.maturityInterestPercent || 8;
    const bonus = Math.round(totalGoal * (interestPercent / 100));
    const totalWithBonus = totalGoal + bonus;
    const currency = window.bishiStore.state.meta.currency || '₹';
    const previewEl = document.getElementById('editMemberTotalAccumulationPreview');
    if (previewEl) {
      previewEl.textContent = `${currency}${totalGoal.toLocaleString('en-IN')}`;
      previewEl.title = `एकूण लक्ष्य: ${currency}${totalGoal.toLocaleString('en-IN')} + ${interestPercent}% बोनस: +${currency}${bonus.toLocaleString('en-IN')} = ${currency}${totalWithBonus.toLocaleString('en-IN')}`;
    }
  }

  handleEditMemberSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin() || !this.selectedEditMemberId) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक सदस्य एडिट करू शकतात.', 'error');
      return;
    }

    const name = document.getElementById('editMemberName')?.value.trim();
    const phone = document.getElementById('editMemberPhone')?.value.trim();
    const password = document.getElementById('editMemberPassword')?.value.trim();
    const weeklyAmount = Number(document.getElementById('editMemberWeeklyAmount')?.value);
    const nominee = document.getElementById('editMemberNominee')?.value.trim();
    const notes = document.getElementById('editMemberNotes')?.value.trim();

    if (!name) {
      this.showToast('सदस्याचे पूर्ण नाव आवश्यक आहे', 'error');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      this.showToast('कृपया वैध १० अंकी मोबाईल नंबर टाका', 'error');
      return;
    }
    if (!weeklyAmount || weeklyAmount < 100) {
      this.showToast('साप्ताहिक हप्ता किमान ₹१०० असावा', 'error');
      return;
    }

    const updated = window.bishiStore.updateMember(this.selectedEditMemberId, {
      name,
      phone,
      password,
      weeklyAmount,
      nominee,
      notes
    });

    if (updated) {
      document.getElementById('editMemberModal').classList.remove('active');
      this.renderAll();
      this.showToast(`✅ ${updated.name} (${updated.id}) यांचे तपशील यशस्वीरीत्या जतन झाले!`, 'success');
    }
  }

  // --- सदस्य डेटा साफ व खाते व्यवस्थापन मोडल उघडणे ---
  openSettleModal(memberId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक सदस्य डेटा व्यवस्थापित करू शकतात.', 'error');
      this.checkAuthView();
      return;
    }

    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    this.selectedMemberId = memberId;
    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency;

    const elName = document.getElementById('settleMemberName');
    if (elName) elName.textContent = member.name;
    const elId = document.getElementById('settleMemberId');
    if (elId) elId.textContent = `${member.id} • 📞 ${member.phone}`;
    const elBadge = document.getElementById('settleMemberStatusBadge');
    if (elBadge) {
      elBadge.textContent = member.status === 'completed' ? 'पूर्ण 🏆' : (member.status === 'settled' ? 'सेटल झालेले' : 'सक्रिय');
      elBadge.className = `status-pill ${member.status === 'completed' ? 'status-completed' : (member.status === 'settled' ? 'status-settled' : 'status-active')}`;
    }
    const elWk = document.getElementById('settleTotalWeeksPaid');
    if (elWk) elWk.textContent = `${stats.paidWeeksCount} पैकी ५० आठवडे`;
    const elContr = document.getElementById('settleTotalContributed');
    if (elContr) elContr.textContent = `${currency}${stats.totalDeposited.toLocaleString('en-IN')}`;

    document.getElementById('settleModal')?.classList.add('active');
  }

  handleWipeMemberDeposits(memberId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 केवळ प्रशासक भरणा डेटा पुसू शकतात.', 'error');
      return;
    }
    const targetId = memberId || this.selectedMemberId || this.selectedPassbookMemberId || this.selectedEditMemberId;
    if (!targetId) return;

    const member = window.bishiStore.getMember(targetId);
    if (!member) {
      this.showToast('सदस्य सापडला नाही', 'error');
      return;
    }

    const memberName = member.name;
    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = window.bishiStore.state.meta.currency || '₹';

    if (!confirm(`🧹 भरणा डेटा साफ करा (Wipe Member Deposits):\n\nतुम्हाला नक्की ${memberName} (${targetId}) यांचे सर्व ५० आठवड्यांचे भरलेले हप्ते (एकूण जमा: ${currency}${stats.totalDeposited.toLocaleString('en-IN')}) आणि व्यवहार इतिहास शून्य (०) करून पुसायचे आहे का?\n\nसदस्याचे नाव व खाते सक्रिय राहील पण भरणा डेटा कोरा होईल.`)) {
      return;
    }

    const updated = window.bishiStore.resetMemberPayments(targetId);
    if (updated) {
      document.getElementById('passbookModal')?.classList.remove('active');
      document.getElementById('editMemberModal')?.classList.remove('active');
      document.getElementById('settleModal')?.classList.remove('active');
      this.selectedMemberId = null;
      this.selectedPassbookMemberId = null;
      this.selectedEditMemberId = null;
      this.renderAll();
      this.showToast(`🧹 ${memberName} (${targetId}) यांचा सर्व भरणा डेटा यशस्वीरीत्या पुसला व रीसेट झाला!`, 'success');
    }
  }

  handleResetSingleMemberPayments() {
    this.handleWipeMemberDeposits(this.selectedMemberId);
  }

  handleDeleteSingleMemberCompletely() {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 केवळ प्रशासक सदस्य डिलीट करू शकतात.', 'error');
      return;
    }
    if (!this.selectedMemberId) return;

    const member = window.bishiStore.getMember(this.selectedMemberId);
    const memberName = member ? member.name : 'सदस्य';
    const memberId = this.selectedMemberId;

    if (!confirm(`⚠️ सावधान: आपण नक्की ${memberName} (${memberId}) यांचे खाते कायमचे डिलीट करू इच्छिता?\n\nहा सदस्य आणि त्यांचे सर्व ५० आठवड्यांचे रेकॉर्ड्स वेबसाइट व Firebase क्लाउड डेटाबेसमधून कायमचे नष्ट होतील.`)) {
      return;
    }

    const removed = window.bishiStore.deleteMemberPermanently(memberId);
    if (removed) {
      document.getElementById('settleModal')?.classList.remove('active');
      this.selectedMemberId = null;
      this.renderAll();
      this.showToast(`🗑️ सदस्य ${memberName} (${memberId}) आणि त्यांचे सर्व रेकॉर्ड्स वेबसाइट व डेटाबेसमधून नष्ट झाले!`, 'success');
    }
  }

  // --- संपूर्ण वेबसाइट व डेटाबेस डेटा साफ करणे (Master Clear Data) ---
  openMasterClearDataModal() {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 प्रवेश नाकारला: केवळ प्रशासक डेटा साफ करू शकतात.', 'error');
      this.checkAuthView();
      return;
    }

    const confirmInput = document.getElementById('masterWipeConfirmInput');
    if (confirmInput) confirmInput.value = '';

    document.getElementById('masterClearDataModal')?.classList.add('active');
  }

  handleMasterClearPaymentsOnly() {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 केवळ प्रशासक डेटा साफ करू शकतात.', 'error');
      return;
    }

    if (!confirm('⚠️ आपण नक्की सर्व सदस्यांचे ५० आठवड्यांचे हप्ते, पावत्या व व्यवहार इतिहास साफ करू इच्छिता?\n\nसर्व सदस्यांची खाती तशीच राहतील, पण जमा रकमेचा हिशोब शून्य (०) होईल.')) {
      return;
    }

    window.bishiStore.clearAllPaymentsOnly();
    this.renderAll();
    document.getElementById('masterClearDataModal')?.classList.remove('active');
    this.showToast('🔄 सर्व सदस्यांचे हप्ते व व्यवहार इतिहास यशस्वीरीत्या साफ झाला!', 'success');
  }

  async handleMasterWipeEverything() {
    if (!window.authManager.isAdmin()) {
      this.showToast('🔒 केवळ प्रशासक डेटाबेस रिसेट करू शकतात.', 'error');
      return;
    }

    const confirmInput = document.getElementById('masterWipeConfirmInput')?.value?.trim().toUpperCase();
    if (confirmInput !== 'RESET' && confirmInput !== 'नक्की') {
      this.showToast('⚠️ पुष्टी करण्यासाठी कृपया चौकटीत RESET किंवा नक्की लिहा!', 'error');
      document.getElementById('masterWipeConfirmInput')?.focus();
      return;
    }

    if (!confirm('🔥 अंतिम पुष्टी: आपण संपूर्ण वेबसाइट, सर्व सदस्य आणि Firebase क्लाउड डेटाबेस पूर्णपणे नष्ट करून कोरा करू इच्छिता?')) {
      return;
    }

    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.wipeAndRecreateDatabase === 'function') {
      await window.firebaseSyncManager.wipeAndRecreateDatabase(true);
    } else {
      window.bishiStore.clearAllData();
      this.renderAll();
    }

    document.getElementById('masterClearDataModal')?.classList.remove('active');
    document.getElementById('exportModal')?.classList.remove('active');
    document.getElementById('firebaseDbModal')?.classList.remove('active');
    this.showToast('🎉 वेबसाइट व Firebase डेटाबेसमधून सर्व डेटा पूर्णपणे स्वच्छ करण्यात आला!', 'success');
  }

  renderAdminTransactionsTab() {
    const tbody = document.getElementById('adminTransactionsTableBody');
    if (!tbody) return;

    let txns = window.bishiStore.state.transactions || [];
    const currency = window.bishiStore.state.meta.currency;

    if (window.authManager && window.authManager.isCustomer()) {
      const curCust = window.authManager.getCurrentCustomerMember();
      if (curCust) {
        txns = txns.filter(t => t.memberId === curCust.id);
      }
    }

    const searchVal = document.getElementById('adminTxnSearchInput')?.value?.toLowerCase().trim() || '';
    const modeVal = document.getElementById('adminTxnModeFilter')?.value || 'all';

    if (searchVal) {
      txns = txns.filter(t => 
        (t.memberName || '').toLowerCase().includes(searchVal) ||
        (t.memberId || '').toLowerCase().includes(searchVal) ||
        (t.receiptNo || '').toLowerCase().includes(searchVal) ||
        (t.paymentMode || '').toLowerCase().includes(searchVal)
      );
    }

    if (modeVal !== 'all') {
      if (modeVal === 'fines') {
        txns = txns.filter(t => Number(t.fineAmount) > 0);
      } else {
        txns = txns.filter(t => (t.paymentMode || 'Cash').toLowerCase() === modeVal.toLowerCase());
      }
    }

    let totalDeposits = 0;
    let totalFines = 0;
    txns.forEach(t => {
      totalDeposits += Number(t.depositAmount || t.amount || 0);
      totalFines += Number(t.fineAmount || 0);
    });
    const grossTotal = totalDeposits + totalFines;

    const countEl = document.getElementById('adminTxnFilteredCount');
    if (countEl) countEl.textContent = txns.length;
    const depEl = document.getElementById('adminTxnTotalDeposits');
    if (depEl) depEl.textContent = `${currency}${totalDeposits.toLocaleString('en-IN')}`;
    const fineEl = document.getElementById('adminTxnTotalFines');
    if (fineEl) fineEl.textContent = `${currency}${totalFines.toLocaleString('en-IN')}`;
    const grossEl = document.getElementById('adminTxnGrossTotal');
    if (grossEl) grossEl.textContent = `${currency}${grossTotal.toLocaleString('en-IN')}`;

    if (txns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
            <div style="font-weight: 700; color: var(--text-primary);">कोणतेही ठेवी रेकॉर्ड सापडले नाहीत</div>
            <div style="font-size: 0.85rem; margin-top: 0.25rem;">कृपया शोध शब्द किंवा फिल्टर बदलून पहा.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    txns.forEach(t => {
      const mode = (t.paymentMode || 'Cash').toLowerCase();
      let modeCls = 'cash';
      if (mode.includes('upi')) modeCls = 'upi';
      else if (mode.includes('bank')) modeCls = 'bank';
      else if (mode.includes('cheque')) modeCls = 'cheque';

      const depAmt = Number(t.depositAmount || t.amount || 0);
      const fineAmt = Number(t.fineAmount || 0);
      const totalRec = depAmt + fineAmt;

      const member = window.bishiStore.getMember(t.memberId);
      const phone = member ? member.phone : '';
      const memberWeekly = member ? Number(member.weeklyAmount) : 1000;
      const isExtraDeposit = depAmt > memberWeekly && t.type !== 'payout' && (t.weekNumber || 0) > 0;
      const extraDepositAmt = isExtraDeposit ? (depAmt - memberWeekly) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">
          <strong>${t.receiptNo || t.id}</strong>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${t.memberName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${t.memberId} ${phone ? `• 📞 ${phone}` : ''}</div>
        </td>
        <td>
          <span class="status-pill status-paid" style="font-size: 0.75rem;">आठवडा ${t.weekNumber} / ५०</span>
          ${isExtraDeposit ? `<span class="extra-amount-pill" style="margin-top: 0.2rem;">⭐ +${currency}${extraDepositAmt} जादा</span>` : ''}
        </td>
        <td style="color: var(--emerald-400); font-weight: 800;">
          ${currency}${depAmt.toLocaleString('en-IN')}
          ${isExtraDeposit ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 600;">(नियमित ${currency}${memberWeekly} + ⭐ ${currency}${extraDepositAmt})</div>` : ''}
        </td>
        <td style="color: var(--rose-400); font-weight: 700;">${fineAmt > 0 ? `+${currency}${fineAmt}` : '₹0'}</td>
        <td style="color: #fff; font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</td>
        <td>
          <span class="mode-tag ${modeCls}">${t.paymentMode || 'Cash'}</span>
          ${t.upiId ? `<div style="font-size: 0.72rem; color: var(--blue-400); font-weight: 600; margin-top: 0.25rem; font-family: var(--font-mono);">UPI: ${t.upiId}</div>` : ''}
        </td>
        <td style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">
          ${new Date(t.date).toLocaleDateString('hi-IN', {day:'2-digit', month:'short'})} 
          <span style="font-size: 0.72rem; color: var(--text-muted);">${new Date(t.date).toLocaleTimeString('hi-IN', {hour:'2-digit', minute:'2-digit'})}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${t.memberId}', ${t.weekNumber})" title="पावती पहा / प्रिंट करा">
            🧾 पावती
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.ui.handleUndoPayment('${t.memberId}', ${t.weekNumber})" title="पेमेंट रद्द करा">
            ✕
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  updateInterestPreview(rate) {
    const numRate = Math.max(0, Number(rate) || 0);
    const currency = window.bishiStore?.state?.meta?.currency || '₹';
    const examplePrincipal = 50000;
    const exampleInterest = Math.round(examplePrincipal * (numRate / 100));
    const examplePayout = examplePrincipal + exampleInterest;

    const addedEl = document.getElementById('previewInterestAdded');
    if (addedEl) {
      addedEl.textContent = `+${currency}${exampleInterest.toLocaleString('en-IN')} व्याज (${numRate}%)`;
    }
    const payoutEl = document.getElementById('previewTotalPayout');
    if (payoutEl) {
      payoutEl.textContent = `${currency}${examplePayout.toLocaleString('en-IN')}`;
    }

    document.querySelectorAll('.interest-preset-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.rate) === numRate);
    });
  }

  renderAdminSettingsTab() {
    const meta = window.bishiStore.state.meta;
    document.getElementById('adminPanelBishiName').value = meta.bishiName;
    document.getElementById('adminPanelDefaultFine').value = meta.defaultFineAmount || 50;
    const rate = meta.maturityInterestPercent !== undefined ? meta.maturityInterestPercent : 8;
    const interestInput = document.getElementById('adminPanelMaturityInterest');
    if (interestInput) interestInput.value = rate;
    this.updateInterestPreview(rate);
    document.getElementById('adminPanelCurrency').value = meta.currency || '₹';
  }

  // --- इव्हेंट लिसनर्स सेटअप ---
  setupEventListeners() {
    // युनिफाईड लॉगिन फॉर्म
    document.getElementById('unifiedLoginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier')?.value || '';
      const pass = document.getElementById('loginPassword')?.value || '';
      const rem = document.getElementById('loginRemember')?.checked || false;
      const errBox = document.getElementById('unifiedLoginError');

      const res = window.authManager.loginUnified(identifier, pass, rem);
      if (res.success) {
        if (errBox) errBox.style.display = 'none';
        this.checkAuthView();
        if (res.role === 'admin') {
          this.showToast(`👑 स्वागत आहे प्रशासक महोदय!`, 'success');
        } else {
          this.showToast(`👤 स्वागत आहे, ${res.member.name}! आपले पासबुक उघडत आहे.`, 'success');
        }
      } else {
        if (errBox) {
          errBox.innerHTML = `<strong>⚠️ प्रवेश नाकारला:</strong> ${res.message}`;
          errBox.style.display = 'block';
        }
        this.showToast(res.message, 'error');
        const card = document.querySelector('.login-card');
        if (card) {
          card.style.animation = 'shake 0.4s';
          setTimeout(() => card.style.animation = '', 400);
        }
      }
    });

    // पासवर्ड पहा / लपवा बटण
    document.getElementById('btnToggleLoginPass')?.addEventListener('click', () => {
      const passInput = document.getElementById('loginPassword');
      const toggleBtn = document.getElementById('btnToggleLoginPass');
      if (passInput) {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (toggleBtn) toggleBtn.textContent = isPass ? 'लपवा' : 'पहा';
      }
    });

    // लॉगआउट
    document.getElementById('btnLogoutUser')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.authManager.logout();
    });

    // शोध इनपुट
    const searchInput = document.getElementById('memberSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderMembersTable();
      });
    }

    // फिल्टर बटणे
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderMembersTable();
      });
    });

    // प्रशासक सेटिंग्स मोडल
    document.getElementById('btnOpenAdminSettings')?.addEventListener('click', () => {
      this.renderAdminSettingsTab();
      document.getElementById('adminSettingsModal')?.classList.add('active');
    });

    // सर्व ठेवी खातावही मोडल
    document.getElementById('btnOpenTxnLog')?.addEventListener('click', () => {
      this.renderAdminTransactionsTab();
      document.getElementById('adminTxnModal')?.classList.add('active');
    });

    document.getElementById('adminTxnSearchInput')?.addEventListener('input', () => {
      this.renderAdminTransactionsTab();
    });

    document.getElementById('adminTxnModeFilter')?.addEventListener('change', () => {
      this.renderAdminTransactionsTab();
    });

    // आठवडा बदल बटणे
    document.getElementById('btnPrevWeek')?.addEventListener('click', () => {
      const cur = window.bishiStore.state.meta.currentWeek;
      if (cur > 1) {
        window.bishiStore.setCurrentWeek(cur - 1);
        this.renderAll();
      }
    });

    document.getElementById('btnNextWeek')?.addEventListener('click', () => {
      const cur = window.bishiStore.state.meta.currentWeek;
      if (cur < 50) {
        window.bishiStore.setCurrentWeek(cur + 1);
        this.renderAll();
      }
    });

    // नवीन सदस्य मोडल उघडणे
    document.getElementById('btnOpenAddMember')?.addEventListener('click', () => {
      this.openAddMemberModal();
    });

    // हप्ता रक्कम प्रीसेट बटणे
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const input = document.getElementById('addMemberWeeklyAmount');
        if (input) input.value = btn.dataset.amount;
        this.updateAddMemberTargetCalc();
      });
    });

    document.getElementById('collectModalAmount')?.addEventListener('input', () => {
      this.updateCollectModalCalculations();
    });
    document.getElementById('collectModalFineAmount')?.addEventListener('input', () => {
      this.updateCollectModalCalculations();
    });

    document.querySelectorAll('.fine-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fine-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const input = document.getElementById('collectModalFineAmount');
        if (input) {
          if (btn.dataset.fine === 'default') {
            input.value = window.bishiStore.state.meta.defaultFineAmount || 50;
          } else {
            input.value = btn.dataset.fine;
          }
          this.updateCollectModalCalculations();
        }
      });
    });

    document.getElementById('addMemberWeeklyAmount')?.addEventListener('input', () => {
      this.updateAddMemberTargetCalc();
    });

    document.getElementById('collectModalPaymentMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('collectModalUpiGroup');
      const upiInput = document.getElementById('collectModalUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    document.getElementById('addMemberInitialDeposit')?.addEventListener('change', (e) => {
      const options = document.getElementById('addMemberInitialDepositOptions');
      if (options) options.style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('addMemberPaymentMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('addMemberUpiGroup');
      const upiInput = document.getElementById('addMemberUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    // व्याज दर स्टेपर्स
    const interestInput = document.getElementById('adminPanelMaturityInterest');
    interestInput?.addEventListener('input', (e) => {
      this.updateInterestPreview(e.target.value);
    });

    document.getElementById('btnDecreaseInterest')?.addEventListener('click', () => {
      if (!interestInput) return;
      let val = Math.max(0, (parseFloat(interestInput.value) || 8) - 0.5);
      val = Math.round(val * 10) / 10;
      interestInput.value = val;
      this.updateInterestPreview(val);
    });

    document.getElementById('btnIncreaseInterest')?.addEventListener('click', () => {
      if (!interestInput) return;
      let val = Math.min(100, (parseFloat(interestInput.value) || 8) + 0.5);
      val = Math.round(val * 10) / 10;
      interestInput.value = val;
      this.updateInterestPreview(val);
    });

    document.querySelectorAll('.interest-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rate = Number(btn.dataset.rate);
        if (interestInput) interestInput.value = rate;
        this.updateInterestPreview(rate);
      });
    });

    document.getElementById('bulkPayPaymentMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('bulkPayUpiGroup');
      const upiInput = document.getElementById('bulkPayUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    document.querySelectorAll('#editAmountPresets .preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editAmountPresets .preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const amt = Number(btn.dataset.amount);
        const input = document.getElementById('editMemberWeeklyAmount');
        if (input) input.value = amt;
        this.updateEditMemberTargetCalc();
      });
    });

    document.getElementById('editMemberWeeklyAmount')?.addEventListener('input', () => {
      this.updateEditMemberTargetCalc();
    });

    // फॉर्म सबमिट हँडलर्स
    document.getElementById('addMemberForm')?.addEventListener('submit', (e) => this.handleAddMemberSubmit(e));
    document.getElementById('editMemberForm')?.addEventListener('submit', (e) => this.handleEditMemberSubmit(e));
    document.getElementById('collectPaymentForm')?.addEventListener('submit', (e) => this.handleCollectSubmit(e));
    document.getElementById('bulkPayForm')?.addEventListener('submit', (e) => this.handleBulkPaySubmit(e));
    document.getElementById('payoutCompleteForm')?.addEventListener('submit', (e) => this.handlePayoutCompleteSubmit(e));
    document.getElementById('restartPlanForm')?.addEventListener('submit', (e) => this.handleRestartPlanSubmit(e));
    document.getElementById('settleMemberForm')?.addEventListener('submit', (e) => this.handleSettleSubmit(e));

    document.querySelectorAll('#restartAmountPresets .preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#restartAmountPresets .preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const amt = Number(btn.dataset.amount);
        const input = document.getElementById('restartWeeklyAmount');
        if (input) {
          input.value = amt;
          input.dispatchEvent(new Event('input'));
        }
      });
    });

    document.getElementById('restartInitialDeposit')?.addEventListener('change', (e) => {
      const options = document.getElementById('restartInitialDepositOptions');
      if (options) options.style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('restartPaymentMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('restartUpiGroup');
      const upiInput = document.getElementById('restartUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    document.getElementById('btnVoucherRestartPlan')?.addEventListener('click', () => {
      document.getElementById('payoutVoucherModal')?.classList.remove('active');
      if (this.selectedPayoutMemberId) {
        this.openRestartPlanModal(this.selectedPayoutMemberId);
      }
    });

    document.getElementById('adminPanelSettingsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const bishiName = document.getElementById('adminPanelBishiName').value;
      const defaultFineAmount = Number(document.getElementById('adminPanelDefaultFine').value) || 0;
      const maturityInterestPercent = Number(document.getElementById('adminPanelMaturityInterest')?.value) || 8;
      const currency = document.getElementById('adminPanelCurrency').value;

      window.bishiStore.updateSettings({
        bishiName,
        defaultFineAmount,
        maturityInterestPercent,
        currency
      });

      this.showToast('बीशी नियम, दंड दर व ८% मॅच्युरिटी व्याज जतन झाले!', 'success');
      document.getElementById('adminSettingsModal')?.classList.remove('active');
      this.renderAll();
    });

    // मोडल बंद करणे (Universal Delegated Modal Close + Escape Key)
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal-close, [data-modal-close], .btn-close');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const modal = closeBtn.closest('.modal-overlay') || document.querySelector('.modal-overlay.active');
        if (modal) {
          modal.classList.remove('active');
        } else {
          this.closeAllModals();
        }
        return;
      }

      // पार्श्वभूमीवर (Overlay Backdrop) क्लिक केल्यास बंद करणे
      if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    }, true);

    // Keyboard 'Escape' की दाबल्यावर मोडल बंद करणे
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        this.closeAllModals();
      }
    });

    // ग्लोबल फंक्शन बाईंडिंग
    window.closeAllModals = () => this.closeAllModals();

    // थीम टॉगल
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sukhakarta_theme', newTheme);
    });

    const savedTheme = localStorage.getItem('sukhakarta_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // एक्सपोर्ट ट्रिगर्स
    document.getElementById('btnExportWeeklyCSV')?.addEventListener('click', () => {
      const cur = window.bishiStore.state.meta.currentWeek;
      window.exportManager.exportWeeklyCSV(cur);
    });

    document.getElementById('btnExportMasterCSV')?.addEventListener('click', () => {
      window.exportManager.exportMasterLedgerCSV();
    });

    document.getElementById('btnBackupJSON')?.addEventListener('click', () => {
      window.exportManager.backupJSON();
    });

    document.getElementById('restoreFileInput')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        window.exportManager.restoreJSON(e.target.files[0]);
      }
    });

    document.getElementById('btnClearAllData')?.addEventListener('click', () => {
      document.getElementById('exportModal')?.classList.remove('active');
      this.openMasterClearDataModal();
    });

    // सिंगल सदस्य डेटा व्यवस्थापन बटणे
    document.getElementById('btnSettleResetPayments')?.addEventListener('click', () => {
      this.handleResetSingleMemberPayments();
    });

    document.getElementById('btnSettleDeleteCompletely')?.addEventListener('click', () => {
      this.handleDeleteSingleMemberCompletely();
    });

    document.getElementById('btnOpenClearDataModal')?.addEventListener('click', () => {
      this.openMasterClearDataModal();
    });

    document.getElementById('btnEditWipeMemberDeposits')?.addEventListener('click', () => {
      if (this.selectedEditMemberId) {
        this.handleWipeMemberDeposits(this.selectedEditMemberId);
      }
    });

    document.getElementById('passbookBtnWipeDeposits')?.addEventListener('click', () => {
      if (this.selectedPassbookMemberId) {
        this.handleWipeMemberDeposits(this.selectedPassbookMemberId);
      }
    });

    document.getElementById('btnPassbookWipeDepositsFooter')?.addEventListener('click', () => {
      if (this.selectedPassbookMemberId) {
        this.handleWipeMemberDeposits(this.selectedPassbookMemberId);
      }
    });

    // मास्टर डेटा साफ बटणे
    document.getElementById('btnMasterClearPaymentsOnly')?.addEventListener('click', () => {
      this.handleMasterClearPaymentsOnly();
    });

    document.getElementById('btnMasterWipeEverything')?.addEventListener('click', () => {
      this.handleMasterWipeEverything();
    });
  }

  updateAddMemberTargetCalc() {
    const weeklyAmt = Number(document.getElementById('addMemberWeeklyAmount')?.value) || 0;
    const total50 = weeklyAmt * 50;
    const currency = window.bishiStore.state.meta.currency;
    const calcEl = document.getElementById('addMemberTotalAccumulationPreview');
    if (calcEl) {
      calcEl.textContent = `${currency}${total50.toLocaleString('en-IN')}`;
    }
  }
}

window.ui = new UIManager();
