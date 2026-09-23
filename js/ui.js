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
    this.membersPageFilter = 'all';
    this.membersPageSearchQuery = '';
    this.membersPageViewMode = 'table';
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
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    this.closeMobileDrawer();
  }

  toggleMobileDrawer() {
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileNavDrawerOverlay');
    if (!drawer || !overlay) return;
    const isOpen = drawer.classList.contains('active');
    if (isOpen) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  openMobileDrawer() {
    document.getElementById('mobileNavDrawer')?.classList.add('active');
    document.getElementById('mobileNavDrawerOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMobileDrawer() {
    document.getElementById('mobileNavDrawer')?.classList.remove('active');
    document.getElementById('mobileNavDrawerOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- ऑथेंटिकेशन व भूमिका तपासणी ---
  checkAuthView() {
    const isAuth = window.authManager.isAuthenticated();
    const loginOverlay = document.getElementById('adminLoginScreen');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const cloudStatusBadge = document.getElementById('cloudStatusBadge');
    const btnOpenAdminSettings = document.getElementById('btnOpenAdminSettings');
    const btnOpenTxnLog = document.getElementById('btnOpenTxnLog');
    const btnOpenAdminLoans = document.getElementById('btnOpenAdminLoans');
    const btnOpenAddMember = document.getElementById('btnOpenAddMember');
    const sidebarPrimaryAction = document.getElementById('sidebarPrimaryAction');
    const sidebarMainGroup = document.getElementById('sidebarMainGroup');
    const btnOpenExport = document.getElementById('btnOpenExport');
    const btnOpenClearDataModal = document.getElementById('btnOpenClearDataModal');

    const mobileBtnAddMember = document.getElementById('mobileBtnAddMember');
    const mobileDrawerAdminMenu = document.getElementById('mobileDrawerAdminMenu');
    const mobileDrawerCustomerMenu = document.getElementById('mobileDrawerCustomerMenu');
    const mobileDrawerAvatar = document.getElementById('mobileDrawerAvatar');
    const mobileDrawerUserName = document.getElementById('mobileDrawerUserName');
    const mobileDrawerUserRole = document.getElementById('mobileDrawerUserRole');

    const dashboardView = document.getElementById('dashboardView');
    const customerPortalView = document.getElementById('customerPortalView');

    if (!isAuth) {
      this.closeMobileDrawer();
      document.body.classList.remove('admin-mode', 'customer-mode');
      if (loginOverlay) loginOverlay.classList.remove('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'none';
      if (cloudStatusBadge) cloudStatusBadge.style.display = 'none';
      if (sidebarPrimaryAction) sidebarPrimaryAction.style.display = 'none';
      if (sidebarMainGroup) sidebarMainGroup.style.display = 'none';
      if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'none';
      if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'none';
      if (btnOpenAdminLoans) btnOpenAdminLoans.style.display = 'none';
      if (btnOpenAddMember) btnOpenAddMember.style.display = 'none';
      if (btnOpenExport) btnOpenExport.style.display = 'none';
      if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'none';
      if (mobileBtnAddMember) mobileBtnAddMember.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'none';
      if (customerPortalView) customerPortalView.style.display = 'none';
      const loansPageView = document.getElementById('loansPageView');
      if (loansPageView) loansPageView.style.display = 'none';
    } else {
      if (loginOverlay) loginOverlay.classList.add('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'flex';

      if (window.authManager.isAdmin()) {
        // प्रशासक दृश्य (Admin Dashboard)
        document.body.classList.remove('customer-mode');
        document.body.classList.add('admin-mode');

        const cur = window.authManager.getCurrentUser();
        const avatarEl = document.getElementById('userBadgeAvatar');
        if (avatarEl) {
          avatarEl.className = 'avatar-mini';
          avatarEl.textContent = '👑';
        }
        const nameEl = document.getElementById('userBadgeName');
        if (nameEl) nameEl.textContent = cur.name || 'मुख्य प्रशासक';

        if (mobileDrawerAvatar) mobileDrawerAvatar.textContent = '👑';
        if (mobileDrawerUserName) mobileDrawerUserName.textContent = cur.name || 'मुख्य प्रशासक';
        if (mobileDrawerUserRole) mobileDrawerUserRole.textContent = 'प्रशासक नियंत्रण पॅनल';
        if (sidebarPrimaryAction) sidebarPrimaryAction.style.display = 'block';
        if (sidebarMainGroup) sidebarMainGroup.style.display = 'block';
        if (mobileDrawerAdminMenu) mobileDrawerAdminMenu.style.display = 'block';
        if (mobileDrawerCustomerMenu) mobileDrawerCustomerMenu.style.display = 'none';
        if (mobileBtnAddMember) mobileBtnAddMember.style.display = 'inline-flex';

        if (cloudStatusBadge) cloudStatusBadge.style.display = 'inline-flex';
        if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'inline-flex';
        if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'inline-flex';
        if (btnOpenAdminLoans) btnOpenAdminLoans.style.display = 'inline-flex';
        if (btnOpenAddMember) btnOpenAddMember.style.display = 'flex';
        if (btnOpenExport) btnOpenExport.style.display = 'inline-flex';
        if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'inline-flex';
        if (customerPortalView) customerPortalView.style.display = 'none';
        
        const loansPageView = document.getElementById('loansPageView');
        const membersPageView = document.getElementById('membersPageView');
        if (window.location.hash === '#loans') {
          this.navigateToLoansPage();
        } else if (window.location.hash === '#members') {
          this.navigateToMembersPage();
        } else {
          if (loansPageView) loansPageView.style.display = 'none';
          if (membersPageView) membersPageView.style.display = 'none';
          if (dashboardView) dashboardView.style.display = 'block';
          this.renderAll();
        }
      } else if (window.authManager.isCustomer()) {
        // सदस्य दृश्य (Customer / Member View - No Admin Section)
        document.body.classList.remove('admin-mode');
        document.body.classList.add('customer-mode');

        const cur = window.authManager.getCurrentUser();
        const avatarEl = document.getElementById('userBadgeAvatar');
        if (avatarEl) {
          avatarEl.className = 'avatar-mini customer';
          avatarEl.textContent = '👤';
        }
        const nameEl = document.getElementById('userBadgeName');
        if (nameEl) nameEl.textContent = `${cur.name} (${cur.memberId})`;

        if (mobileDrawerAvatar) mobileDrawerAvatar.textContent = '👤';
        if (mobileDrawerUserName) mobileDrawerUserName.textContent = `${cur.name}`;
        if (mobileDrawerUserRole) mobileDrawerUserRole.textContent = `सदस्य आयडी: ${cur.memberId}`;
        
        // Strict hiding of ALL Admin tools & primary action
        if (sidebarPrimaryAction) sidebarPrimaryAction.style.display = 'none';
        if (sidebarMainGroup) sidebarMainGroup.style.display = 'none';
        if (mobileDrawerAdminMenu) mobileDrawerAdminMenu.style.display = 'none';
        if (mobileDrawerCustomerMenu) mobileDrawerCustomerMenu.style.display = 'block';
        if (mobileBtnAddMember) mobileBtnAddMember.style.display = 'none';

        if (cloudStatusBadge) cloudStatusBadge.style.display = 'none';
        if (btnOpenAdminSettings) btnOpenAdminSettings.style.display = 'none';
        if (btnOpenTxnLog) btnOpenTxnLog.style.display = 'none';
        if (btnOpenAdminLoans) btnOpenAdminLoans.style.display = 'none';
        if (btnOpenAddMember) btnOpenAddMember.style.display = 'none';
        if (btnOpenExport) btnOpenExport.style.display = 'none';
        if (btnOpenClearDataModal) btnOpenClearDataModal.style.display = 'none';
        if (dashboardView) dashboardView.style.display = 'none';
        const loansPageView = document.getElementById('loansPageView');
        if (loansPageView) loansPageView.style.display = 'none';
        const membersPageView = document.getElementById('membersPageView');
        if (membersPageView) membersPageView.style.display = 'none';
        if (customerPortalView) customerPortalView.style.display = 'block';

        this.renderCustomerPortal();
      }
    }
  }

  renderAll() {
    if (window.authManager.isAdmin()) {
      this.updateNavBadges();
      this.renderStats();
      this.renderWeekPills();
      this.renderMembersTable();
      this.renderSummaryBanner();
      this.renderDashboardLoans();
      if (this.currentAdminView === 'members') {
        this.renderMembersPage();
      } else if (this.currentAdminView === 'loans') {
        this.renderLoansPage();
      }
    } else if (window.authManager.isCustomer()) {
      this.renderCustomerPortal();
    }
  }

  setFilter(filterName) {
    this.currentFilter = filterName || 'all';
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
    this.renderMembersTable();
  }

  filterCompletedMembers() {
    this.searchQuery = '';
    const searchInput = document.getElementById('memberSearchInput');
    if (searchInput) searchInput.value = '';

    this.setFilter('completed');

    const completedCount = window.bishiStore.getMembers().filter(m => {
      const stats = window.bishiStore.calculateMemberStats(m);
      return stats.isFullyPaid || m.status === 'completed';
    }).length;

    this.showToast(`🏆 पूर्ण झालेले सदस्य फिल्टर केले आहेत (${completedCount} सदस्य)`, 'info');

    // Smooth scroll down to table
    setTimeout(() => {
      const target = document.querySelector('.toolbar-card') || document.getElementById('membersTableBody');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
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
    const isDirectPaidThisWeek = currentWeekData && ((currentWeekData.status === 'paid') || (Number(currentWeekData.amountPaid) >= stats.weeklyAmount));
    const isPaidThisWeek = isDirectPaidThisWeek || (currentCycleWeek <= stats.effectivePaidWeeks);
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

        // Conditions (direct payment or cumulative deposit coverage)
        const isDirectPaid = (wk.status === 'paid') || (paidAmt >= weeklyReq);
        const isCoveredByDeposit = !isDirectPaid && (wk.weekNumber <= stats.effectivePaidWeeks);
        const isFullPaid = isDirectPaid;
        const isCleared = isCoveredByDeposit;
        const remainderDeposit = stats.totalDeposited - (stats.effectivePaidWeeks * weeklyReq);
        const isPartial = !isDirectPaid && !isCoveredByDeposit && ((wk.weekNumber === stats.effectivePaidWeeks + 1 && remainderDeposit > 0) || (paidAmt > 0 && paidAmt < weeklyReq));
        const isPastEmpty = !isViewingArchived && !isDirectPaid && !isCoveredByDeposit && !isPartial && (wk.weekNumber < currentCycleWeek);
        const isCurrent = !isViewingArchived && !isDirectPaid && !isCoveredByDeposit && !isPartial && (wk.weekNumber === currentCycleWeek);

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
        } else if (isCleared) {
          boxClass = 'cleared';
          displayAmt = '—';
          statusText = '✓ क्लिअर';
        } else if (isPartial) {
          const pendingAmt = weeklyReq - (remainderDeposit > 0 ? remainderDeposit : paidAmt);
          boxClass = 'partial';
          displayAmt = `${currency}${(remainderDeposit > 0 ? remainderDeposit : paidAmt).toLocaleString('en-IN')}`;
          statusText = `⚠️ ₹${pendingAmt.toLocaleString('en-IN')} बाकी`;
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
        recordsToDisplay = cycleTxns.map(t => {
          const isLoanDisb = t.type === 'loan_disbursed';
          const isLoanInt = t.type === 'loan_interest_payment';
          const isLoanRep = t.type === 'loan_repayment';
          const isPayout = t.type === 'payout';

          let depAmt = 0;
          let fineAmt = 0;
          let totAmt = 0;

          if (isLoanDisb) {
            depAmt = Number(t.loanDisbursedAmount || t.totalAmount || 0);
            fineAmt = 0;
            totAmt = depAmt;
          } else if (isLoanInt) {
            depAmt = 0;
            fineAmt = Number(t.loanInterestAmount || t.totalAmount || 0);
            totAmt = fineAmt;
          } else if (isLoanRep) {
            depAmt = Number(t.loanRepaidAmount || t.totalAmount || 0);
            fineAmt = Number(t.loanInterestAmount || 0);
            totAmt = Number(t.totalAmount || (depAmt + fineAmt));
          } else if (isPayout) {
            totAmt = Number(t.totalAmount || 0);
            depAmt = totAmt;
            fineAmt = 0;
          } else {
            depAmt = Number(t.depositAmount || t.amount || 0);
            fineAmt = Number(t.fineAmount || 0);
            totAmt = Number(t.totalAmount || (depAmt + fineAmt));
          }

          return {
            receiptNo: t.receiptNo || `REC-${member.id}-W${t.weekNumber || 1}`,
            cycleNumber: Number(t.cycleNumber) || this.customerViewCycle,
            weekNumber: t.weekNumber,
            type: t.type || 'deposit',
            loanId: t.loanId,
            isPayout,
            isLoanDisb,
            isLoanInt,
            isLoanRep,
            depositAmount: depAmt,
            fineAmount: fineAmt,
            totalAmount: totAmt,
            paymentMode: t.paymentMode || 'Cash',
            upiId: t.upiId || '',
            date: t.date || t.paidDate,
            notes: t.note || t.notes || ''
          };
        });
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
            isLoanDisb: false,
            isLoanInt: false,
            isLoanRep: false,
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
            isLoanDisb: false,
            isLoanInt: false,
            isLoanRep: false,
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
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-bottom: 0.35rem;">
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
          const isLoanDisb = rec.isLoanDisb;
          const isLoanInt = rec.isLoanInt;
          const isLoanRep = rec.isLoanRep;
          const txnCycle = rec.cycleNumber;
          const isExtraDeposit = !isPayout && !isLoanDisb && !isLoanInt && !isLoanRep && depAmt > member.weeklyAmount && (rec.weekNumber || 0) > 0;
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

          let statusPillHtml = '';
          let depAmtHtml = '';
          let fineAmtHtml = '';
          let totalRecHtml = '';
          let receiptBtnHtml = '';

          if (isLoanDisb) {
            statusPillHtml = `<span class="status-pill" style="font-size: 0.72rem; background: rgba(59, 130, 246, 0.15); color: var(--blue-400); border: 1px solid rgba(59, 130, 246, 0.35); font-weight: 700;">💳 कर्ज वाटप (W${rec.weekNumber || 1})</span>`;
            depAmtHtml = `<span style="color: var(--blue-400); font-weight: 700;">${currency}${depAmt.toLocaleString('en-IN')}</span>`;
            fineAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
            totalRecHtml = `<span style="color: var(--blue-400); font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
            receiptBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${rec.loanId || rec.receiptNo?.replace('DISB-', '')}')" title="कर्ज व्हाऊचर पहा">📄 व्हाऊचर</button>`;
          } else if (isLoanInt) {
            statusPillHtml = `<span class="status-pill status-overdue" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 700;">💰 कर्ज व्याज (W${rec.weekNumber || 1})</span>`;
            depAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
            fineAmtHtml = `<span style="color: var(--gold-400); font-weight: 700;">+${currency}${fineAmt.toLocaleString('en-IN')} (३%)</span>`;
            totalRecHtml = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
            receiptBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanInterestReceiptModal('${rec.loanId}', '${rec.receiptNo}')" title="व्याज पावती पहा">🧾 पावती</button>`;
          } else if (isLoanRep) {
            statusPillHtml = `<span class="status-pill status-paid" style="font-size: 0.72rem; font-weight: 700;">✅ कर्ज परतफेड (W${rec.weekNumber || 1})</span>`;
            depAmtHtml = `<span style="color: var(--emerald-400); font-weight: 700;">मुद्दल: ${currency}${depAmt.toLocaleString('en-IN')}</span>`;
            fineAmtHtml = fineAmt > 0 ? `<span style="color: var(--gold-400); font-weight: 700;">+${currency}${fineAmt.toLocaleString('en-IN')}</span>` : `<span style="color: var(--text-muted);">₹०</span>`;
            totalRecHtml = `<span style="color: var(--emerald-400); font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
            receiptBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${rec.loanId}')" title="कर्ज परतफेड पावती पहा">🧾 पावती</button>`;
          } else if (isPayout) {
            statusPillHtml = `<span class="status-pill status-completed" style="font-weight: 700;">🏆 मॅच्युरिटी वाटप</span>`;
            depAmtHtml = `<span style="color: var(--gold-400); font-weight: 700;">${currency}${depAmt.toLocaleString('en-IN')}</span>`;
            fineAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
            totalRecHtml = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
            receiptBtnHtml = `<button type="button" class="btn btn-gold btn-sm" onclick="window.receiptManager.showPayoutVoucherModal('${member.id}', ${txnCycle})" title="व्हाउचर पहा व प्रिंट करा">📜 व्हाउचर</button>`;
          } else {
            statusPillHtml = `<span class="status-pill status-paid">आठवडा ${rec.weekNumber || 1} / ५०</span>`;
            depAmtHtml = `
              <span style="color: var(--emerald-400); font-weight: 700;">${currency}${depAmt.toLocaleString('en-IN')}</span>
              ${isExtraDeposit ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 600;">(नियमित ${currency}${member.weeklyAmount} + ⭐ ${currency}${extraDepositAmt} जादा)</div>` : ''}
            `;
            fineAmtHtml = `<span style="color: ${fineAmt > 0 ? 'var(--rose-400)' : 'var(--text-muted)'}; font-weight: 600;">${fineAmt > 0 ? `+${currency}${fineAmt.toLocaleString('en-IN')}` : '₹0'}</span>`;
            totalRecHtml = `<span style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
            receiptBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${rec.weekNumber || 1}, ${txnCycle})" title="पावती पहा व प्रिंट करा">🧾 पावती</button>`;
          }

          tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--gold-400); font-weight: 600;">
              ${rec.receiptNo}
            </td>
            <td>
              <span class="status-pill" style="font-size: 0.7rem; background: rgba(59, 130, 246, 0.15); color: var(--blue-400); margin-right: 0.3rem;">C${txnCycle}</span>
              ${statusPillHtml}
              ${isExtraDeposit ? `<span class="extra-amount-pill" style="margin-left: 0.3rem;">⭐ +${currency}${extraDepositAmt.toLocaleString('en-IN')} जादा</span>` : ''}
              ${rec.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">${rec.notes}</div>` : ''}
            </td>
            <td>
              ${depAmtHtml}
            </td>
            <td>
              ${fineAmtHtml}
            </td>
            <td>
              ${totalRecHtml}
            </td>
            <td>
              <span class="mode-tag ${(rec.paymentMode || 'cash').toLowerCase()}">${rec.paymentMode || 'Cash'}</span>
              ${rec.upiId ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.2rem;">${rec.upiId}</div>` : ''}
            </td>
            <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
              ${formattedDate}
            </td>
            <td style="text-align: right;">
              ${receiptBtnHtml}
            </td>
          `;
          historyTbody.appendChild(tr);
        });
      }
    }

    // ==========================================================================
    // सदस्य कर्ज व चालू हप्ता तपशील (Customer Loan Breakdown & Total You Have to Pay)
    // ==========================================================================
    const overallDue = window.bishiStore.calculateMemberOverallDue(member);
    const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);

    const totalOverallDueDisplay = document.getElementById('custTotalOverallDueDisplay');
    if (totalOverallDueDisplay) totalOverallDueDisplay.textContent = `${currency}${(overallDue?.grandTotalDue || 0).toLocaleString('en-IN')}`;

    const custDueWeeklyBishi = document.getElementById('custDueWeeklyBishi');
    if (custDueWeeklyBishi) custDueWeeklyBishi.textContent = `${currency}${(overallDue?.totalWeeklyBishiDue || 0).toLocaleString('en-IN')}`;

    const custDueLoanPrincipal = document.getElementById('custDueLoanPrincipal');
    const custDueLoanPrincipalBox = document.getElementById('custDueLoanPrincipalBox');
    const custDueLoanPrincipalPlus = document.getElementById('custDueLoanPrincipalPlus');
    if (custDueLoanPrincipal) {
      custDueLoanPrincipal.textContent = `${currency}${(overallDue?.loanPrincipalDue || 0).toLocaleString('en-IN')}`;
    }
    if (custDueLoanPrincipalBox && custDueLoanPrincipalPlus) {
      if ((overallDue?.loanPrincipalDue || 0) > 0) {
        custDueLoanPrincipalBox.style.display = 'block';
        custDueLoanPrincipalPlus.style.display = 'block';
      } else {
        custDueLoanPrincipalBox.style.display = 'none';
        custDueLoanPrincipalPlus.style.display = 'none';
      }
    }

    const custDueLoanInterest = document.getElementById('custDueLoanInterest');
    const custDueLoanInterestBox = document.getElementById('custDueLoanInterestBox');
    const custDueLoanInterestPlus = document.getElementById('custDueLoanInterestPlus');
    if (custDueLoanInterestBox && custDueLoanInterestPlus) {
      // व्याज फक्त ४ आठवडे पूर्ण झाल्यावरच (loanInterestDue > 0) दाखवले जाईल
      if (overallDue && overallDue.loanInterestDue > 0) {
        custDueLoanInterestBox.style.display = 'block';
        custDueLoanInterestPlus.style.display = 'block';
        if (custDueLoanInterest) {
          custDueLoanInterest.textContent = `+${currency}${overallDue.loanInterestDue.toLocaleString('en-IN')}`;
        }
      } else {
        custDueLoanInterestBox.style.display = 'none';
        custDueLoanInterestPlus.style.display = 'none';
      }
    }

    // सदस्य सक्रिय कर्ज कंटेनर
    const activeLoansContainer = document.getElementById('custActiveLoansContainer');
    if (activeLoansContainer) {
      if (!loanSummary || loanSummary.activeLoansCount === 0) {
        activeLoansContainer.innerHTML = `
          <div style="background: var(--bg-tertiary); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; color: var(--text-muted);">
            <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">💳</div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">सध्या कोणतेही सक्रिय कर्ज बाकी नाही</div>
            <div style="font-size: 0.8rem; margin-top: 0.2rem;">आपले कर्ज खाते पूर्णपणे क्लिअर आहे.</div>
          </div>
        `;
      } else {
        activeLoansContainer.innerHTML = '';
        loanSummary.activeLoans.forEach(({ loan, details }) => {
          const card = document.createElement('div');
          card.style.cssText = 'background: var(--bg-tertiary); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 0.85rem;';
          
          let cycleStatusHtml = '';
          if (details.isGracePeriodActive) {
            cycleStatusHtml = `<span class="status-pill status-paid" style="background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.35);">🟢 चक्र ${details.currentCycleNumber}: सवलतीत (०% व्याज • ${details.remainingGraceWeeks} आठवडे बाकी)</span>`;
          } else {
            cycleStatusHtml = `<span class="status-pill status-overdue" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);">⚠️ चक्र ${details.currentCycleNumber}: ४ आठवडे पूर्ण (+${currency}${details.interestAmount.toLocaleString('en-IN')} ३% व्याज देय)</span>`;
          }

          const hasPastInterest = Array.isArray(loan.interestPayments) && loan.interestPayments.length > 0;
          let pastInterestHtml = '';
          if (hasPastInterest) {
            pastInterestHtml = `
              <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.4rem;">
                  💰 जमा केलेल्या ४-आठवडे व्याजाच्या पावत्या (${loan.interestPayments.length} भरणा):
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  ${loan.interestPayments.map((p, idx) => `
                    <div style="background: var(--bg-card); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 0.35rem 0.65rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                      <span style="color: var(--gold-400); font-weight: 700;">चक्र ${p.cycleNumber || (idx + 1)}: ${currency}${Number(p.amount).toLocaleString('en-IN')}</span>
                      <span style="color: var(--text-muted); font-size: 0.7rem;">(W${p.paidWeek || '-'})</span>
                      <button type="button" class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;" onclick="window.receiptManager.showLoanInterestReceiptModal('${loan.id}', '${p.id}')">
                        🧾 पावती
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }

          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              <div>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-400); font-size: 0.88rem;">${loan.id}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.4rem;">(वाटप आठवडा ${loan.issueWeek || 1} • ${loan.issueDate || '-'})</span>
              </div>
              <div>${cycleStatusHtml}</div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; font-size: 0.85rem; margin-bottom: 0.85rem;">
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">मूळ कर्ज मुद्दल</div>
                <div style="font-weight: 800; color: var(--text-primary); font-size: 1.05rem;">${currency}${details.principal.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">कालावधी (एकूण / चालू चक्र)</div>
                <div style="font-weight: 700; color: var(--text-primary);">${details.elapsedWeeks} आठवडे (चालू: ${details.currentCycleElapsedWeeks}/४ आठवडे)</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">पुढील व्याज देय आठवडा</div>
                <div style="font-weight: 700; color: var(--blue-400);">आठवडा ${details.nextInterestDueWeek}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">चालू चक्र देय व्याज</div>
                <div style="font-weight: 700; color: ${details.interestAmount > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'};">${details.interestAmount > 0 ? `+${currency}${details.interestAmount.toLocaleString('en-IN')} (३% लागू)` : '₹० (४ आठवड्यांपर्यंत ०% सवलत)'}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">एकूण देय परतफेड</div>
                <div style="font-weight: 800; color: var(--gold-400); font-size: 1.05rem;">${currency}${details.totalPayable.toLocaleString('en-IN')}${details.interestAmount === 0 ? ' (फक्त मुद्दल)' : ''}</div>
              </div>
            </div>

            ${pastInterestHtml}

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 0.65rem; margin-top: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                🔒 <em>केवळ मुख्य प्रशासक ४-आठवडे व्याज व कर्ज परतफेड जमा करू शकतात.</em>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${loan.id}')" title="कर्ज पावती / व्हाउचर पहा">
                🧾 कर्ज वाटप व्हाऊचर पहा
              </button>
            </div>
          `;
          activeLoansContainer.appendChild(card);
        });
      }
    }

    // सदस्य मागील कर्ज इतिहास टेबल
    const custLoansTableBody = document.getElementById('custLoansTableBody');
    if (custLoansTableBody) {
      custLoansTableBody.innerHTML = '';
      if (!loanSummary || loanSummary.allLoans.length === 0) {
        custLoansTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
              कोणतेही कर्ज रेकॉर्ड उपलब्ध नाही
            </td>
          </tr>
        `;
      } else {
        loanSummary.allLoans.forEach(loan => {
          const details = window.bishiStore.calculateLoanDetails(loan);
          const isPaid = loan.status === 'paid';
          const interestCount = Array.isArray(loan.interestPayments) ? loan.interestPayments.length : 0;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--gold-400); font-weight: 700;">${loan.id}</td>
            <td style="font-weight: 700; color: var(--text-primary);">
              <div>${currency}${details.remainingPrincipal.toLocaleString('en-IN')}</div>
              ${details.isPartiallyPaid ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 600;">बाकी मुद्दल (मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')})</div>` : ''}
            </td>
            <td style="font-size: 0.82rem; color: var(--text-secondary);">W${loan.issueWeek || 1} • ${loan.issueDate || '-'}</td>
            <td style="font-size: 0.82rem;">${details.elapsedWeeks} आठवडे</td>
            <td style="font-size: 0.82rem; color: ${details.interestAmount > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'}; font-weight: 600;">
              ${isPaid 
                ? (loan.interestPaid > 0 ? `+${currency}${loan.interestPaid.toLocaleString('en-IN')} (३%)` : '₹० (सवलतीत)') 
                : (details.interestAmount > 0 ? `+${currency}${details.interestAmount.toLocaleString('en-IN')} (३% देय)` : '₹० (४ आठवडे सवलतीत)')}
              ${interestCount > 0 ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 700;">(${interestCount} चक्र व्याज जमा)</div>` : ''}
            </td>
            <td style="font-weight: 800; color: ${isPaid ? 'var(--emerald-400)' : 'var(--gold-400)'};">
              ${currency}${(isPaid ? (Number(loan.repaidAmount) || details.totalPayable) : details.totalPayable).toLocaleString('en-IN')}
            </td>
            <td>
              ${isPaid 
                ? `<span class="status-pill status-paid">✅ पूर्ण फेड (${loan.paidDate || '-'})</span>` 
                : (details.isPartiallyPaid
                    ? `<span class="status-pill status-overdue" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);">🟠 अंशतः भरले (${currency}${details.remainingPrincipal.toLocaleString('en-IN')} बाकी - Pending)</span>`
                    : `<span class="status-pill status-overdue">🔴 कर्ज बाकी (Pending)</span>`)}
            </td>
            <td style="text-align: right;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${loan.id}')" title="पावती पहा व प्रिंट करा">
                🧾 पावती
              </button>
            </td>
          `;
          custLoansTableBody.appendChild(tr);
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

    // नवीन कर्ज आकडेवारी (Top Dashboard Loan Metric Cards)
    const statActiveLoans = document.getElementById('statDashboardActiveLoans');
    if (statActiveLoans) statActiveLoans.textContent = `${currency}${(stats.totalActiveLoansPrincipal || 0).toLocaleString('en-IN')}`;
    const statActiveLoansSub = document.getElementById('statDashboardActiveLoansSub');
    if (statActiveLoansSub) statActiveLoansSub.textContent = `${stats.activeLoansCount || 0} सक्रिय कर्जे`;

    const statLoanInterest = document.getElementById('statDashboardLoanInterest');
    if (statLoanInterest) statLoanInterest.textContent = `${currency}${(stats.totalLoanInterestCollected || 0).toLocaleString('en-IN')}`;
    const statRepaidLoans = document.getElementById('statDashboardRepaidLoans');
    if (statRepaidLoans) statRepaidLoans.textContent = `${stats.repaidLoansCount || 0} कर्जे परतफेड`;
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

  // आठवड्याची संक्षिप्त तारीख (उदा. "०४ सप्टें" किंवा "04 सप्टें")
  formatWeekDateShort(date) {
    if (!date || isNaN(date.getTime())) return '';
    const monthsShort = ['जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'];
    const d = String(date.getDate()).padStart(2, '0');
    return `${d} ${monthsShort[date.getMonth()]}`;
  }

  // आठवड्याची सविस्तर तारीख (उदा. "शुक्रवार, ४ सप्टेंबर २०२६")
  formatWeekDateFull(date) {
    if (!date || isNaN(date.getTime())) return '';
    const monthsFull = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
    const days = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    return `${days[date.getDay()]}, ${date.getDate()} ${monthsFull[date.getMonth()]} ${date.getFullYear()}`;
  }

  renderWeekPills() {
    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;
    const members = window.bishiStore.getMembers().filter(m => m.status === 'active' || m.status === 'completed');
    const currency = window.bishiStore.state.meta.currency || '₹';

    // १. दोन्ही ठिकाणची शीर्षके अद्ययावत करणे (Dashboard & Loans Page)
    ['currentWeekDisplayTitle', 'currentWeekDisplayTitleLoans'].forEach(id => {
      const titleEl = document.getElementById(id);
      if (titleEl) {
        const curDate = window.bishiStore.getWeekDate(currentWeek);
        const curDateShort = this.formatWeekDateShort(curDate);
        const curDateFull = this.formatWeekDateFull(curDate);
        titleEl.textContent = `आठवडा ${currentWeek} • ${curDateShort}`;
        titleEl.title = `चालू आठवडा ${currentWeek} (${curDateFull})`;
      }
    });

    // २. थेट आठवडा निवड ड्रॉपडाऊन (Dashboard & Loans Page)
    ['weekDropdownSelect', 'weekDropdownSelectLoans'].forEach(id => {
      const dropdownSelect = document.getElementById(id);
      if (dropdownSelect) {
        dropdownSelect.innerHTML = '';
        for (let w = 1; w <= 50; w++) {
          const opt = document.createElement('option');
          opt.value = w;
          const wDate = window.bishiStore.getWeekDate(w);
          const wDateShort = this.formatWeekDateShort(wDate);
          opt.textContent = w === currentWeek ? `आठवडा ${w} (${wDateShort}) (चालू)` : `आठवडा ${w} (${wDateShort})`;
          if (w === currentWeek) opt.selected = true;
          dropdownSelect.appendChild(opt);
        }
        dropdownSelect.onchange = (e) => {
          const selectedWk = Number(e.target.value);
          if (selectedWk) {
            window.bishiStore.setCurrentWeek(selectedWk);
            this.renderAll();
            this.showToast(`आठवडा ${selectedWk} दृश्य उघडले`, 'info');
          }
        };
      }
    });

    // ३. ५०-आठवडे कॅरोसेल बार (Dashboard & Loans Page)
    const targetContainers = [
      document.getElementById('weekScrollContainer'),
      document.getElementById('weekScrollContainerLoans')
    ].filter(Boolean);

    if (targetContainers.length === 0) return;

    // प्री-कॅल्क्युलेट आठवडे आकडेवारी
    const weekDataList = [];
    for (let w = 1; w <= 50; w++) {
      let fullyPaidCount = 0;
      let partialCount = 0;
      let totalWkAmount = 0;

      members.forEach(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        const wk = m.weeks.find(item => item.weekNumber === w);
        const paidAmt = Number(wk ? wk.amountPaid : 0) || 0;
        
        const isMemberDirectPaid = (wk && wk.status === 'paid') || (paidAmt >= stats.weeklyAmount);
        const isMemberCovered = (w <= stats.effectivePaidWeeks);
        const isMemberFullPaid = isMemberDirectPaid || isMemberCovered;
        const remainder = stats.totalDeposited - (stats.effectivePaidWeeks * stats.weeklyAmount);
        const isMemberPartial = !isMemberFullPaid && (w === stats.effectivePaidWeeks + 1) && (remainder > 0 || (paidAmt > 0 && paidAmt < stats.weeklyAmount));

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

      const weekDate = window.bishiStore.getWeekDate(w);
      const weekDateShort = this.formatWeekDateShort(weekDate);
      const weekDateFull = this.formatWeekDateFull(weekDate);

      let statusClass = '';
      let statusTooltip = '';

      if (w > currentWeek) {
        if (isCompleted) {
          statusClass = 'completed paid';
          statusTooltip = `आठवडा ${w} (${weekDateFull}): सर्व सदस्यांचे आगाऊ जमा (${fullyPaidCount}/${members.length} सदस्य • ${currency}${totalWkAmount.toLocaleString('en-IN')})`;
        } else {
          statusClass = 'pending';
          statusTooltip = `आठवडा ${w} (${weekDateFull}): प्रलंबित (०/${members.length} जमा)`;
        }
      } else if (isCompleted) {
        statusClass = 'completed paid';
        statusTooltip = `आठवडा ${w} (${weekDateFull}): पूर्ण जमा (${fullyPaidCount}/${members.length} सदस्य • ${currency}${totalWkAmount.toLocaleString('en-IN')})`;
      } else if (hasDeposits) {
        statusClass = 'has-deposits partial';
        statusTooltip = `आठवडा ${w} (${weekDateFull}): हप्ते जमा (${fullyPaidCount}/${members.length} पूर्ण • ${currency}${totalWkAmount.toLocaleString('en-IN')})`;
      } else if (isOverdue) {
        statusClass = 'overdue';
        statusTooltip = `आठवडा ${w} (${weekDateFull}): थकबाकी (०/${members.length} जमा)`;
      } else {
        statusClass = 'pending';
        statusTooltip = `आठवडा ${w} (${weekDateFull}): प्रलंबित (०/${members.length} जमा)`;
      }

      weekDataList.push({ w, weekDateShort, weekDateFull, isActive, statusClass, statusTooltip });
    }

    targetContainers.forEach(container => {
      container.innerHTML = '';
      weekDataList.forEach(({ w, weekDateShort, weekDateFull, isActive, statusClass, statusTooltip }) => {
        const pill = document.createElement('button');
        pill.className = `week-pill ${isActive ? 'active' : ''} ${statusClass}`;
        pill.setAttribute('title', statusTooltip);
        pill.setAttribute('aria-label', `आठवडा ${w}, ${weekDateFull}`);
        pill.innerHTML = `
          <span class="wk-label">आठवडा</span>
          <span class="wk-num">${w}</span>
          <span class="wk-date">${weekDateShort}</span>
          <span class="wk-status-dot" title="${statusTooltip}"></span>
        `;

        pill.addEventListener('click', () => {
          window.bishiStore.setCurrentWeek(w);
          this.renderAll();
          this.showToast(`आठवडा ${w} दृश्य उघडले`, 'info');
        });

        container.appendChild(pill);

        if (isActive && container.offsetParent !== null) {
          setTimeout(() => {
            pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }, 100);
        }
      });
    });
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
        return stats.isFullyPaid || m.status === 'completed';
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
      const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);
      const weekData = member.weeks.find(w => w.weekNumber === currentWeek) || { status: 'pending', amountPaid: 0, finePaid: 0 };
      const paidAmt = Number(weekData.amountPaid || 0);
      const isDirectPaid = (weekData.status === 'paid') || (paidAmt >= stats.weeklyAmount);
      const isClearedThisWeek = !isDirectPaid && (currentWeek <= stats.effectivePaidWeeks);
      const isFullPaidThisWeek = isDirectPaid;
      const isPartialThisWeek = !isDirectPaid && !isClearedThisWeek && ((currentWeek === stats.effectivePaidWeeks + 1 && (stats.totalDeposited % stats.weeklyAmount > 0)) || (paidAmt > 0 && paidAmt < stats.weeklyAmount));
      const isViewingPastWeek = currentWeek < (window.bishiStore?.state?.meta?.currentWeek || 1);
      const isOverdue = !isDirectPaid && !isClearedThisWeek && !isPartialThisWeek && (isViewingPastWeek || stats.overdueWeeksCount > 0);

      const depUpToCurrentWeek = member.weeks.filter(w => w.weekNumber <= currentWeek).reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
      const expUpToCurrentWeek = currentWeek * stats.weeklyAmount;
      const advanceExtraThisWeek = isFullPaidThisWeek ? Math.max(0, depUpToCurrentWeek - expUpToCurrentWeek) : 0;
      const isAdvanceExtraThisWeek = isFullPaidThisWeek && (advanceExtraThisWeek > 0);

      let miniMatrixHTML = `<div class="week-matrix-preview" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="५०-आठवडे प्रगती (पासबुक पाहण्यासाठी क्लिक करा)">`;
      member.weeks.forEach(w => {
        let cls = '';
        const wPaidAmt = Number(w.amountPaid || 0);
        const isWkDirectPaid = (w.status === 'paid') || (wPaidAmt >= stats.weeklyAmount);
        const isWkCleared = !isWkDirectPaid && (w.weekNumber <= stats.effectivePaidWeeks);
        const isWkFullPaid = isWkDirectPaid;
        
        const depUpToW = member.weeks.filter(wk => wk.weekNumber <= w.weekNumber).reduce((sum, wk) => sum + (Number(wk.amountPaid) || 0), 0);
        const expUpToW = w.weekNumber * stats.weeklyAmount;
        const advAmt = Math.max(0, depUpToW - expUpToW);
        const isWkAdvanceExtra = isWkFullPaid && (advAmt > 0);

        const remainderDeposit = stats.totalDeposited - (stats.effectivePaidWeeks * stats.weeklyAmount);
        const isWkPartial = !isWkDirectPaid && !isWkCleared && ((w.weekNumber === stats.effectivePaidWeeks + 1 && remainderDeposit > 0) || (wPaidAmt > 0 && wPaidAmt < stats.weeklyAmount));

        let dotTitle = '';
        if (isWkFullPaid) {
          cls = isWkAdvanceExtra ? 'paid has-extra' : 'paid';
          dotTitle = `आठवडा ${w.weekNumber}: जमा ₹${wPaidAmt}${isWkAdvanceExtra ? ` (+₹${advAmt} पुढील आठवड्यांसाठी अ‍ॅडव्हान्स/जादा)` : ''}${w.finePaid > 0 ? ` (दंड: ₹${w.finePaid})` : ''}`;
        } else if (isWkCleared) {
          cls = 'cleared';
          dotTitle = `आठवडा ${w.weekNumber}: हप्ता क्लिअर (जादा भरण्यासोबत क्लिअर झाले)`;
        } else if (isWkPartial) {
          const partialAmt = remainderDeposit > 0 ? remainderDeposit : wPaidAmt;
          cls = 'partial';
          dotTitle = `आठवडा ${w.weekNumber}: अपूर्ण जमा ₹${partialAmt} (बाकी: ₹${stats.weeklyAmount - partialAmt})`;
        } else if (w.weekNumber === currentWeek) {
          cls = 'current';
          dotTitle = `आठवडा ${w.weekNumber}: चालू आठवडा`;
        } else if (w.weekNumber < currentWeek) {
          cls = 'overdue';
          dotTitle = `आठवडा ${w.weekNumber}: थकबाकी`;
        } else {
          cls = 'pending';
          dotTitle = `आठवडा ${w.weekNumber}: प्रलंबित`;
        }
        miniMatrixHTML += `<span class="matrix-dot ${cls}" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" title="${dotTitle} • पासबुक उघडण्यासाठी क्लिक करा"></span>`;
      });
      miniMatrixHTML += '</div>';

      const hasActiveLoan = loanSummary && loanSummary.activeLoansCount > 0;
      const firstActiveLoan = hasActiveLoan ? loanSummary.activeLoans[0] : null;
      const isInterestDueThisWeek = hasActiveLoan && loanSummary.activeInterest > 0;
      const isGraceActive = hasActiveLoan && !isInterestDueThisWeek && firstActiveLoan?.details?.isGracePeriodActive;
      const hasPaidInterestRecently = hasActiveLoan && Array.isArray(firstActiveLoan.loan.interestPayments) && firstActiveLoan.loan.interestPayments.some(p => p.paidWeek === currentWeek);

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
                ${hasActiveLoan ? `
                  <button type="button" class="status-pill" onclick="event.stopPropagation(); window.ui.openAdminLoansModal()" style="font-size:0.65rem; padding:0.12rem 0.45rem; background: rgba(59, 130, 246, 0.18); color: var(--blue-400); border: 1px solid rgba(59, 130, 246, 0.4); font-weight:700; cursor:pointer;" title="सक्रिय मुद्दल: ${currency}${loanSummary.activePrincipal.toLocaleString('en-IN')}${loanSummary.activeInterest > 0 ? ` (+३% व्याज: +${currency}${loanSummary.activeInterest.toLocaleString('en-IN')})` : ''} • कर्ज व्यवस्थापन पहा">💳 कर्ज: ${currency}${loanSummary.activePrincipal.toLocaleString('en-IN')}</button>
                  ${isInterestDueThisWeek ? `
                    <button type="button" class="status-pill status-overdue interactive" onclick="event.stopPropagation(); window.ui.openPayLoanInterestModal('${firstActiveLoan.loan.id}')" style="font-size:0.65rem; padding:0.12rem 0.45rem; background: rgba(245, 158, 11, 0.22); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.6); font-weight:800; cursor:pointer;" title="४ आठवड्यांचे ३% व्याज देय आहे (+${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}) • व्याज जमा करा">💰 ३% व्याज देय: +${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}</button>
                  ` : ''}
                ` : ''}
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

          ${hasActiveLoan ? `
            <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
              ${isInterestDueThisWeek ? `
                <button type="button" class="status-pill status-overdue interactive" onclick="event.stopPropagation(); window.ui.openPayLoanInterestModal('${firstActiveLoan.loan.id}')" style="font-size: 0.7rem; padding: 0.18rem 0.5rem; background: rgba(245, 158, 11, 0.22); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.6); font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;" title="या आठवड्यात ४-आठवड्यांचे ३% कर्ज व्याज देय आहे • व्याज जमा करण्यासाठी क्लिक करा">
                  💰 ३% कर्ज व्याज देय: +${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}
                </button>
                <button type="button" class="btn btn-sm" onclick="event.stopPropagation(); window.receiptManager.sendLoanInterestPendingReminder('${firstActiveLoan.loan.id}')" style="background: #25d366; color: #000; font-size: 0.68rem; padding: 0.15rem 0.45rem; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.2rem;" title="सदस्याला WhatsApp वर व्याज भरणा स्मरणपत्र पाठवा">
                  💬 मेसेज
                </button>
              ` : hasPaidInterestRecently ? `
                <span class="status-pill status-paid interactive" onclick="event.stopPropagation(); window.receiptManager.showLoanInterestReceiptModal('${firstActiveLoan.loan.id}')" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.35); font-weight: 700; cursor: pointer;" title="या आठवड्यात ३% कर्ज व्याज जमा झाले आहे • पावती पहा">
                  ✓ कर्ज व्याज जमा
                </span>
              ` : isGraceActive ? `
                <span class="status-pill" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; background: rgba(16, 185, 129, 0.1); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.25);" title="कर्ज ४ आठवड्यांच्या सवलतीत आहे. आठवडा ${firstActiveLoan.details.nextInterestDueWeek} ला ३% व्याज लागू होईल.">
                  ⏳ कर्ज सवलतीत (W${firstActiveLoan.details.nextInterestDueWeek} ला देय)
                </span>
              ` : ''}
            </div>
          ` : ''}
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
          ${isInterestDueThisWeek ? `
            <div style="font-size: 0.74rem; color: var(--gold-400); font-weight: 700; margin-top: 0.2rem;">
              + 💰 कर्ज व्याज: ${currency}${loanSummary.activeInterest.toLocaleString('en-IN')} (एकूण: ${currency}${(stats.nextDueAmount + loanSummary.activeInterest).toLocaleString('en-IN')})
            </div>
          ` : ''}
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
            ` : isPartialThisWeek ? `
              <button class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" title="उर्वरित हप्ता जमा करा">
                💰 बाकी जमा
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" title="पावती पहा / प्रिंट करा">
                🧾 पावती
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" title="चालू हप्ता जमा करा">
                💰 जमा करा
              </button>
            `}
            <select class="member-action-select" onchange="window.ui.handleMemberActionSelect(this, '${member.id}', ${currentWeek})" title="अधिक पर्याय व कृती निवडा">
              <option value="" selected disabled>⚙️ पर्याय ▾</option>
              ${(isFullPaidThisWeek || isClearedThisWeek || isPartialThisWeek) ? `
                <option value="receipt">🧾 पावती पहा (Receipt)</option>
                <option value="undo">✕ चालू आठवडा भरणा रद्द करा (Undo)</option>
              ` : `
                <option value="collect">💰 चालू आठवडा हप्ता जमा करा</option>
              `}
              ${isInterestDueThisWeek ? `
                <option value="pay_interest:${firstActiveLoan?.loan?.id || ''}">💰 ३% कर्ज व्याज जमा करा (+${currency}${loanSummary.activeInterest})</option>
                <option value="loan_msg:${firstActiveLoan?.loan?.id || ''}">💬 व्याज WhatsApp स्मरणपत्र</option>
              ` : ''}
              ${stats.isFullyPaid ? (stats.isPayoutCompleted ? `
                <option value="voucher">📜 मॅच्युरिटी व्हाउचर पहा</option>
              ` : `
                <option value="payout">💰 मॅच्युरिटी परतावा वाटप करा</option>
              `) : ''}
              ${stats.canRestartPlan ? `
                <option value="restart">🔄 नवीन ५०-आठवडे प्लॅन सुरू करा</option>
              ` : ''}
              ${loanSummary && loanSummary.hasLoan ? `
                <option value="view_loan_voucher">📄 कर्ज वाटप व्हाउचर पहा (Loan Assign Voucher)</option>
              ` : ''}
              <option value="loan">💳 सदस्यास कर्ज द्या</option>
              <option value="passbook">📖 ५०-आठवडे पासबुक पहा</option>
              <option value="edit">✏️ सदस्य तपशील एडिट करा</option>
              <option value="wipe">🧹 भरणा डेटा पुसा (Wipe)</option>
              <option value="settle">🗑️ सदस्य डिलीट / सेटल करा</option>
            </select>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  // --- सदस्य कृती ड्रॉपडाउन लिस्ट हँडलर ---
  handleMemberActionSelect(selectEl, memberId, currentWeek) {
    const rawVal = selectEl?.value;
    if (!rawVal) return;

    // सिलेक्ट रीसेट करा जेणेकरून पुढील कृतीसाठी तयार राहील
    setTimeout(() => {
      try { if (selectEl) selectEl.value = ''; } catch(e) {}
    }, 50);

    const parts = String(rawVal).split(':');
    const action = parts[0];
    const paramLoanId = parts[1] || null;

    switch (action) {
      case 'profile':
        this.openMemberProfileModal(memberId);
        break;
      case 'collect':
        this.openCollectModal(memberId, currentWeek);
        break;
      case 'receipt':
        window.receiptManager.showReceiptModal(memberId, currentWeek);
        break;
      case 'undo':
        this.handleUndoPayment(memberId, currentWeek);
        break;
      case 'pay_interest': {
        let loanId = paramLoanId;
        if (!loanId) {
          const loanSummary = window.bishiStore.getMemberLoanSummary(memberId);
          const firstActiveLoan = (loanSummary && loanSummary.activeLoans && loanSummary.activeLoans.length > 0)
            ? loanSummary.activeLoans[0].loan
            : (loanSummary?.allLoans ? loanSummary.allLoans.find(l => l.status !== 'paid') : null);
          loanId = firstActiveLoan?.id;
        }
        if (loanId) {
          this.openPayLoanInterestModal(loanId);
        } else {
          this.showToast('सक्रिय कर्ज सापडले नाही', 'warning');
        }
        break;
      }
      case 'loan_msg': {
        let loanId = paramLoanId;
        if (!loanId) {
          const loanSummary = window.bishiStore.getMemberLoanSummary(memberId);
          const firstActiveLoan = (loanSummary && loanSummary.activeLoans && loanSummary.activeLoans.length > 0)
            ? loanSummary.activeLoans[0].loan
            : (loanSummary?.allLoans ? loanSummary.allLoans.find(l => l.status !== 'paid') : null);
          loanId = firstActiveLoan?.id;
        }
        if (loanId) {
          window.receiptManager.sendLoanInterestPendingReminder(loanId);
        } else {
          this.showToast('सक्रिय कर्ज सापडले नाही', 'warning');
        }
        break;
      }
      case 'payout':
        this.openPayoutCompleteModal(memberId);
        break;
      case 'voucher':
        window.receiptManager.showPayoutVoucherModal(memberId);
        break;
      case 'restart':
        this.openRestartPlanModal(memberId);
        break;
      case 'view_loan_voucher': {
        const memberLoans = window.bishiStore.getMemberLoans(memberId);
        if (memberLoans && memberLoans.length > 0) {
          const latestLoan = memberLoans[memberLoans.length - 1];
          if (window.receiptManager && typeof window.receiptManager.showLoanAssignVoucherModal === 'function') {
            window.receiptManager.showLoanAssignVoucherModal(latestLoan.id);
          } else if (window.receiptManager && typeof window.receiptManager.showLoanReceiptModal === 'function') {
            window.receiptManager.showLoanReceiptModal(latestLoan.id);
          }
        } else {
          this.showToast('या सदस्याचे कोणतेही कर्ज सापडले नाही', 'info');
        }
        break;
      }
      case 'loan':
        this.openGiveLoanModal(memberId);
        break;
      case 'passbook':
        this.openPassbookModal(memberId);
        break;
      case 'edit':
        this.openEditMemberModal(memberId);
        break;
      case 'wipe':
        this.handleWipeMemberDeposits(memberId);
        break;
      case 'settle':
        this.openSettleModal(memberId);
        break;
      default:
        console.warn('Unknown member action:', action);
    }
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

    // १. जर सदस्याचे सर्व ५० आठवडे आधीच पूर्ण भरले असतील तर पेमेंट पर्याय बंद (No access to pay)
    if (stats.isFullyPaid) {
      this.showToast(`🎉 सदस्य ${member.name} यांचे सर्व ५० आठवडे आधीच पूर्ण झाले आहेत! कोणताही हप्ता बाकी नाही.`, 'info');
      window.receiptManager.showPayoutVoucherModal(member.id);
      return;
    }

    // २. निवडलेला आठवडा तपासणे
    this.selectedCollectWeek = Number(weekNumber) || globalCurrentWeek;
    const targetWkData = member.weeks.find(w => w.weekNumber === this.selectedCollectWeek);
    const prevPaidOnSelectedWk = Number(targetWkData?.amountPaid || 0);
    const isTargetFullPaid = targetWkData && (targetWkData.status === 'paid' || prevPaidOnSelectedWk >= stats.weeklyAmount);
    const isTargetCleared = !isTargetFullPaid && (this.selectedCollectWeek <= stats.effectivePaidWeeks);

    // ३. जर निवडलेला आठवडा आधीच पूर्ण भरला गेला असेल, पेमेंट पर्याय दाखवू नका आणि पेमेंटची परवानगी नाकारा (No access to pay)
    if (isTargetFullPaid || isTargetCleared) {
      this.showToast(`🔒 आठवडा ${this.selectedCollectWeek} चा हप्ता आधीच पूर्ण भरला गेला आहे! हा आठवडा पुन्हा भरता येणार नाही.`, 'warning');
      window.receiptManager.showReceiptModal(member.id, this.selectedCollectWeek);
      return;
    }

    // मागील थकबाकी आठवडे शोधणे (Genuinely unpaid & uncleared previous weeks)
    const unpaidPastWeeks = member.weeks.filter(w => 
      w.weekNumber < globalCurrentWeek && 
      (w.status !== 'paid' || Number(w.amountPaid || 0) === 0) &&
      w.weekNumber > stats.effectivePaidWeeks &&
      w.status !== 'skipped'
    );
    const isPastDuePending = unpaidPastWeeks.length > 0 && stats.overdueWeeksCount > 0;
    const earliestUnpaidWeek = unpaidPastWeeks.length > 0 ? unpaidPastWeeks[0].weekNumber : globalCurrentWeek;

    const currentWkData = targetWkData;
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

    const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);
    const loanInterestAlert = document.getElementById('collectModalLoanInterestAlert');
    const loanInterestText = document.getElementById('collectModalLoanInterestText');
    const btnPayInterest = document.getElementById('btnCollectModalPayInterest');

    if (loanInterestAlert && loanSummary) {
      if (loanSummary.activeInterest > 0 && loanSummary.activeLoansCount > 0) {
        loanInterestAlert.style.display = 'flex';
        if (loanInterestText) {
          loanInterestText.textContent = `४-आठवड्यांचे ३% कर्ज व्याज देय: +${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}`;
        }
        if (btnPayInterest) {
          btnPayInterest.onclick = () => {
            document.getElementById('collectPaymentModal')?.classList.remove('active');
            window.ui.openPayLoanInterestModal(loanSummary.activeLoans[0].loan.id);
          };
        }
      } else {
        loanInterestAlert.style.display = 'none';
      }
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

    const member = window.bishiStore.getMember(this.selectedMemberId);
    if (!member) return;
    const stats = window.bishiStore.calculateMemberStats(member);
    const targetWkData = member.weeks.find(w => w.weekNumber === this.selectedCollectWeek);
    const prevPaid = Number(targetWkData?.amountPaid || 0);
    const isTargetFullPaid = targetWkData && (targetWkData.status === 'paid' || prevPaid >= stats.weeklyAmount);

    if (isTargetFullPaid) {
      this.showToast(`🔒 प्रवेश नाकारला: आठवडा ${this.selectedCollectWeek} चे पेमेंट आधीच पूर्ण झाले आहे! पुन्हा पेमेंट करता येणार नाही.`, 'error');
      document.getElementById('collectPaymentModal')?.classList.remove('active');
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

      // Conditions (direct payment or cumulative deposit coverage)
      const isDirectPaid = (wk.status === 'paid') || (paidAmt >= weeklyReq);
      const isCoveredByDeposit = !isDirectPaid && (wk.weekNumber <= stats.effectivePaidWeeks);
      const isFullPaid = isDirectPaid;
      const isCleared = isCoveredByDeposit;
      const remainderDeposit = stats.totalDeposited - (stats.effectivePaidWeeks * weeklyReq);
      const isPartial = !isDirectPaid && !isCoveredByDeposit && ((wk.weekNumber === stats.effectivePaidWeeks + 1 && remainderDeposit > 0) || (paidAmt > 0 && paidAmt < weeklyReq));
      const isPastEmpty = !isViewingArchived && !isDirectPaid && !isCoveredByDeposit && !isPartial && (wk.weekNumber < window.bishiStore.state.meta.currentWeek);
      const isCurrent = !isViewingArchived && !isDirectPaid && !isCoveredByDeposit && !isPartial && (wk.weekNumber === window.bishiStore.state.meta.currentWeek);

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
      } else if (isCleared) {
        boxClass = 'cleared';
        displayAmt = '—';
        statusText = '✓ क्लिअर';
      } else if (isPartial) {
        const partialAmt = remainderDeposit > 0 ? remainderDeposit : paidAmt;
        const pendingAmt = weeklyReq - partialAmt;
        boxClass = 'partial';
        displayAmt = `${currency}${partialAmt.toLocaleString('en-IN')}`;
        statusText = `⚠️ ₹${pendingAmt.toLocaleString('en-IN')} बाकी`;
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
    let grossTotal = 0;
    txns.forEach(t => {
      if (t.type === 'loan_disbursed') {
        grossTotal += Number(t.loanDisbursedAmount || t.totalAmount || 0);
      } else if (t.type === 'loan_interest_payment') {
        const intAmt = Number(t.loanInterestAmount || t.totalAmount || 0);
        totalFines += intAmt;
        grossTotal += intAmt;
      } else if (t.type === 'loan_repayment') {
        const repAmt = Number(t.loanRepaidAmount || t.totalAmount || 0);
        const intAmt = Number(t.loanInterestAmount || 0);
        totalDeposits += repAmt;
        totalFines += intAmt;
        grossTotal += Number(t.totalAmount || (repAmt + intAmt));
      } else if (t.type === 'payout') {
        grossTotal += Number(t.totalAmount || 0);
      } else {
        const dep = Number(t.depositAmount || t.amount || 0);
        const fine = Number(t.fineAmount || 0);
        totalDeposits += dep;
        totalFines += fine;
        grossTotal += Number(t.totalAmount || (dep + fine));
      }
    });

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

      const member = window.bishiStore.getMember(t.memberId);
      const phone = member ? member.phone : '';
      const memberWeekly = member ? Number(member.weeklyAmount) : 1000;

      let statusPillHtml = '';
      let depAmtHtml = '';
      let fineAmtHtml = '';
      let totalRecHtml = '';
      let receiptBtnHtml = '';

      if (t.type === 'loan_disbursed') {
        const amt = Number(t.loanDisbursedAmount || t.totalAmount || 0);
        statusPillHtml = `<span class="status-pill" style="font-size: 0.72rem; background: rgba(59, 130, 246, 0.15); color: var(--blue-400); border: 1px solid rgba(59, 130, 246, 0.35); font-weight: 700;">💳 कर्ज वाटप (W${t.weekNumber || 1})</span>`;
        depAmtHtml = `<span style="color: var(--blue-400); font-weight: 800;">${currency}${amt.toLocaleString('en-IN')}</span>`;
        fineAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
        totalRecHtml = `<span style="color: var(--blue-400); font-weight: 800;">${currency}${amt.toLocaleString('en-IN')}</span>`;
        receiptBtnHtml = `<button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${t.loanId || t.receiptNo?.replace('DISB-', '')}')" title="कर्ज व्हाऊचर पहा">📄 व्हाऊचर</button>`;
      } else if (t.type === 'loan_interest_payment') {
        const intAmt = Number(t.loanInterestAmount || t.totalAmount || 0);
        statusPillHtml = `<span class="status-pill status-overdue" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 700;">💰 कर्ज व्याज (चक्र ${t.cycleNumber || 1} • W${t.weekNumber || 1})</span>`;
        depAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
        fineAmtHtml = `<span style="color: var(--gold-400); font-weight: 700;">+${currency}${intAmt.toLocaleString('en-IN')} (३%)</span>`;
        totalRecHtml = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${intAmt.toLocaleString('en-IN')}</span>`;
        receiptBtnHtml = `<button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanInterestReceiptModal('${t.loanId}', '${t.receiptNo || t.id}')" title="व्याज पावती पहा">🧾 पावती</button>`;
      } else if (t.type === 'loan_repayment') {
        const repAmt = Number(t.loanRepaidAmount || t.totalAmount || 0);
        const intAmt = Number(t.loanInterestAmount || 0);
        const tot = Number(t.totalAmount || (repAmt + intAmt));
        statusPillHtml = `<span class="status-pill status-paid" style="font-size: 0.72rem; font-weight: 700;">✅ कर्ज परतफेड (W${t.weekNumber || 1})</span>`;
        depAmtHtml = `<span style="color: var(--emerald-400); font-weight: 800;">मुद्दल: ${currency}${repAmt.toLocaleString('en-IN')}</span>`;
        fineAmtHtml = intAmt > 0 ? `<span style="color: var(--gold-400); font-weight: 700;">+${currency}${intAmt.toLocaleString('en-IN')}</span>` : `<span style="color: var(--text-muted);">₹०</span>`;
        totalRecHtml = `<span style="color: var(--emerald-400); font-weight: 800;">${currency}${tot.toLocaleString('en-IN')}</span>`;
        receiptBtnHtml = `<button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showLoanReceiptModal('${t.loanId}')" title="कर्ज परतफेड पावती पहा">🧾 पावती</button>`;
      } else if (t.type === 'payout') {
        const tot = Number(t.totalAmount || 0);
        statusPillHtml = `<span class="status-pill status-completed" style="font-size: 0.72rem; font-weight: 700;">🏆 मॅच्युरिटी वाटप</span>`;
        depAmtHtml = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${tot.toLocaleString('en-IN')}</span>`;
        fineAmtHtml = `<span style="color: var(--text-muted);">—</span>`;
        totalRecHtml = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${tot.toLocaleString('en-IN')}</span>`;
        receiptBtnHtml = `<button class="btn btn-gold btn-sm" onclick="window.receiptManager.showPayoutVoucherModal('${t.memberId}', ${t.cycleNumber || 1})" title="व्हाउचर पहा">📜 व्हाउचर</button>`;
      } else {
        const depAmt = Number(t.depositAmount || t.amount || 0);
        const fineAmt = Number(t.fineAmount || 0);
        const totalRec = Number(t.totalAmount || (depAmt + fineAmt));
        const isExtraDeposit = depAmt > memberWeekly && (t.weekNumber || 0) > 0;
        const extraDepositAmt = isExtraDeposit ? (depAmt - memberWeekly) : 0;

        statusPillHtml = `
          <span class="status-pill status-paid" style="font-size: 0.75rem;">आठवडा ${t.weekNumber} / ५०</span>
          ${isExtraDeposit ? `<span class="extra-amount-pill" style="margin-top: 0.2rem;">⭐ +${currency}${extraDepositAmt} जादा</span>` : ''}
        `;
        depAmtHtml = `
          <span style="color: var(--emerald-400); font-weight: 800;">${currency}${depAmt.toLocaleString('en-IN')}</span>
          ${isExtraDeposit ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 600;">(नियमित ${currency}${memberWeekly} + ⭐ ${currency}${extraDepositAmt})</div>` : ''}
        `;
        fineAmtHtml = `<span style="color: var(--rose-400); font-weight: 700;">${fineAmt > 0 ? `+${currency}${fineAmt}` : '₹0'}</span>`;
        totalRecHtml = `<span style="color: var(--text-primary); font-weight: 800;">${currency}${totalRec.toLocaleString('en-IN')}</span>`;
        receiptBtnHtml = `<button class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${t.memberId}', ${t.weekNumber})" title="पावती पहा / प्रिंट करा">🧾 पावती</button>`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">
          <strong>${t.receiptNo || t.id}</strong>
          ${t.note ? `<div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-sans); margin-top: 0.2rem;">${t.note}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${t.memberName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${t.memberId} ${phone ? `• 📞 ${phone}` : ''}</div>
        </td>
        <td>
          ${statusPillHtml}
        </td>
        <td>
          ${depAmtHtml}
        </td>
        <td>
          ${fineAmtHtml}
        </td>
        <td>
          ${totalRecHtml}
        </td>
        <td>
          <span class="mode-tag ${modeCls}">${t.paymentMode || 'Cash'}</span>
          ${t.upiId ? `<div style="font-size: 0.72rem; color: var(--blue-400); font-weight: 600; margin-top: 0.25rem; font-family: var(--font-mono);">UPI: ${t.upiId}</div>` : ''}
        </td>
        <td style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">
          ${new Date(t.date).toLocaleDateString('hi-IN', {day:'2-digit', month:'short'})} 
          <span style="font-size: 0.72rem; color: var(--text-muted);">${new Date(t.date).toLocaleTimeString('hi-IN', {hour:'2-digit', minute:'2-digit'})}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          ${receiptBtnHtml}
          ${t.type === 'deposit' || !t.type ? `
            <button class="btn btn-danger btn-sm" onclick="window.ui.handleUndoPayment('${t.memberId}', ${t.weekNumber})" title="पेमेंट रद्द करा">
              ✕
            </button>
          ` : ''}
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
    const startDateInput = document.getElementById('adminPanelStartDate');
    if (startDateInput) startDateInput.value = meta.startDate || new Date().toISOString().split('T')[0];
    document.getElementById('adminPanelDefaultFine').value = meta.defaultFineAmount || 50;
    const rate = meta.maturityInterestPercent !== undefined ? meta.maturityInterestPercent : 8;
    const interestInput = document.getElementById('adminPanelMaturityInterest');
    if (interestInput) interestInput.value = rate;
    this.updateInterestPreview(rate);
    document.getElementById('adminPanelCurrency').value = meta.currency || '₹';
  }

  // ==========================================================================
  // 💳 सदस्य कर्ज व्यवस्थापन (Admin Loan Controller & Ledger)
  // ==========================================================================

  openAdminLoansModal() {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज व्यवस्थापन पाहू शकतात', 'error');
      return;
    }
    this.adminLoansSearchQuery = '';
    this.adminLoansStatusFilter = 'all';
    const searchInput = document.getElementById('adminLoansSearchInput');
    if (searchInput) searchInput.value = '';
    const statusSelect = document.getElementById('adminLoansStatusFilter');
    if (statusSelect) statusSelect.value = 'all';

    this.renderAdminLoansModal();
    document.getElementById('adminLoansModal')?.classList.add('active');
  }

  // --- कर्ज कृती ड्रॉपडाउन लिस्ट सेल HTML (Loan Table Action Dropdown List) ---
  renderLoanActionCellHtml(loan, details, isPaid, interestPaymentsList, currency) {
    const hasGraceBadge = !isPaid && details.isGracePeriodActive;
    const hasInterestDue = !isPaid && !details.isGracePeriodActive;
    const isPartiallyPaid = Boolean(details && details.isPartiallyPaid);

    return `
      <div class="loan-action-cell">
        ${hasGraceBadge ? `
          <span class="status-pill status-paid" style="font-size: 0.72rem; padding: 0.22rem 0.5rem; background: rgba(16, 185, 129, 0.12); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.3); white-space: nowrap;" title="पहिल्या ४ आठवड्यांत ०% व्याज सवलत आहे. आठवडा ${details.nextInterestDueWeek} ला ३% व्याज देय होईल.">
            ⏳ सवलतीत (W${details.nextInterestDueWeek} ला देय)
          </span>
        ` : ''}
        ${hasInterestDue ? `
          <span class="status-pill status-overdue" style="font-size: 0.72rem; padding: 0.22rem 0.5rem; background: rgba(245, 158, 11, 0.18); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.5); font-weight: 700; white-space: nowrap;" title="४ आठवड्यांचे ३% व्याज देय आहे (+${currency}${details.interestAmount})">
            💰 व्याज देय
          </span>
        ` : ''}
        <select class="loan-action-select" onchange="window.ui.handleLoanActionSelect(this, '${loan.id}')" aria-label="कर्ज कृती निवडा" title="कर्ज कृती निवडा">
          <option value="" selected disabled>⚡ कृती निवडा ▾</option>
          <option value="loanAssignVoucher">📄 कर्ज वाटप व्हाउचर (Loan Assign Voucher)</option>
          ${!isPaid ? `
            <option value="payLoan">✅ कर्ज फेड नोंदवा (Pay Loan)</option>
          ` : `
            <option value="loanRepaymentReceipt">🧾 कर्ज परतफेड पावती (Repayment Receipt)</option>
          `}
          ${hasInterestDue ? `
            <option value="payInterest">💰 व्याज जमा करा (+${currency}${details.interestAmount})</option>
            <option value="sendReminder">💬 WhatsApp व्याज मेसेज</option>
          ` : ''}
          ${interestPaymentsList && interestPaymentsList.length > 0 ? `
            <option value="interestReceipt">🧾 व्याज पावती पहा (Interest Receipt)</option>
          ` : ''}
          ${isPartiallyPaid && !isPaid ? `
            <option value="loanRepaymentReceipt">🧾 हप्ता पावती पहा (Partial Repayment Receipt)</option>
          ` : ''}
          <option value="cancelLoan">❌ कर्ज नोंद रद्द करा</option>
        </select>
      </div>
    `;
  }

  // कर्ज ड्रॉपडाउन कृती निवड हँडलर (Handle Loan Action Dropdown Selection)
  handleLoanActionSelect(selectEl, loanId) {
    if (!selectEl) return;
    const action = selectEl.value;
    selectEl.selectedIndex = 0; // Reset placeholder
    if (!action) return;

    if (action === 'loanAssignVoucher') {
      if (window.receiptManager && typeof window.receiptManager.showLoanAssignVoucherModal === 'function') {
        window.receiptManager.showLoanAssignVoucherModal(loanId);
      } else if (window.receiptManager && typeof window.receiptManager.showLoanReceiptModal === 'function') {
        window.receiptManager.showLoanReceiptModal(loanId);
      }
    } else if (action === 'loanRepaymentReceipt' || action === 'loanReceipt') {
      if (window.receiptManager && typeof window.receiptManager.showLoanReceiptModal === 'function') {
        window.receiptManager.showLoanReceiptModal(loanId);
      }
    } else if (action === 'payLoan') {
      this.openMarkLoanPaidModal(loanId);
    } else if (action === 'payInterest') {
      this.openPayLoanInterestModal(loanId);
    } else if (action === 'sendReminder') {
      if (window.receiptManager && typeof window.receiptManager.sendLoanInterestPendingReminder === 'function') {
        window.receiptManager.sendLoanInterestPendingReminder(loanId);
      }
    } else if (action === 'interestReceipt') {
      if (window.receiptManager && typeof window.receiptManager.showLoanInterestReceiptModal === 'function') {
        window.receiptManager.showLoanInterestReceiptModal(loanId);
      }
    } else if (action === 'cancelLoan') {
      this.handleCancelLoan(loanId);
    }
  }

  renderAdminLoansModal() {
    const stats = window.bishiStore.getDashboardStats();
    const currency = window.bishiStore.state.meta.currency || '₹';

    // KPI कार्ड्स
    const disbEl = document.getElementById('adminLoansTotalDisbursed');
    if (disbEl) disbEl.textContent = `${currency}${(stats.totalLoansDisbursed || 0).toLocaleString('en-IN')}`;

    const activePrincEl = document.getElementById('adminLoansActivePrincipal');
    if (activePrincEl) activePrincEl.textContent = `${currency}${(stats.totalActiveLoansPrincipal || 0).toLocaleString('en-IN')}`;

    const repaidEl = document.getElementById('adminLoansTotalRepaid');
    if (repaidEl) repaidEl.textContent = `${currency}${(stats.totalLoansRepaidAmount || 0).toLocaleString('en-IN')}`;

    const intCollectedEl = document.getElementById('adminLoansInterestCollected');
    if (intCollectedEl) intCollectedEl.textContent = `${currency}${(stats.totalLoanInterestCollected || 0).toLocaleString('en-IN')}`;

    const tbody = document.getElementById('adminLoansTableBody');
    if (!tbody) return;

    let loans = window.bishiStore.state.loans || [];

    // Filter by Status
    const statusFilter = document.getElementById('adminLoansStatusFilter')?.value || this.adminLoansStatusFilter || 'all';
    if (statusFilter === 'active') {
      loans = loans.filter(l => l.status === 'active');
    } else if (statusFilter === 'paid') {
      loans = loans.filter(l => l.status === 'paid');
    }

    // Filter by Search Query
    const query = (document.getElementById('adminLoansSearchInput')?.value || this.adminLoansSearchQuery || '').toLowerCase().trim();
    if (query) {
      loans = loans.filter(l => 
        (l.memberName || '').toLowerCase().includes(query) ||
        (l.memberId || '').toLowerCase().includes(query) ||
        (l.id || '').toLowerCase().includes(query) ||
        (l.memberPhone || '').includes(query)
      );
    }

    if (loans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem 1.5rem; color: var(--text-muted);">
            <div style="position: sticky; left: 0; display: inline-block; max-width: calc(100vw - 2.5rem); margin: 0 auto;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">💳</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">कोणतीही कर्ज नोंद सापडली नाही</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">नवीन कर्ज देण्यासाठी 'नवीन कर्ज द्या' बटणावर क्लिक करा.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    loans.forEach(loan => {
      const details = window.bishiStore.calculateLoanDetails(loan);
      const isPaid = loan.status === 'paid';
      const tr = document.createElement('tr');

      let graceHtml = '';
      if (isPaid) {
        graceHtml = loan.interestPaid > 0 
          ? `<span style="color: var(--rose-400); font-weight: 700;">+${currency}${loan.interestPaid.toLocaleString('en-IN')} (३% व्याज)</span>` 
          : `<span style="color: var(--emerald-400); font-weight: 700;">₹० (०% सवलतीत पूर्ण)</span>`;
      } else if (details.isGracePeriodActive) {
        graceHtml = `<span class="status-pill status-paid" style="font-size: 0.72rem; background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.35);">🟢 चक्र ${details.currentCycleNumber}: सवलतीत (०% व्याज • ${details.remainingGraceWeeks} आठवडे बाकी)</span>`;
      } else {
        graceHtml = `<span class="status-pill status-overdue" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);">⚠️ चक्र ${details.currentCycleNumber}: +${currency}${details.interestAmount.toLocaleString('en-IN')} (४ आठवडे पूर्ण - ३% व्याज देय)</span>`;
      }

      const totalInterestCollectedOnLoan = Number(loan.totalInterestPaid || 0);
      const interestPaymentsList = Array.isArray(loan.interestPayments) ? loan.interestPayments : [];

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-400); font-size: 0.82rem;">
          ${loan.id}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${loan.memberName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${loan.memberId} • 📞 ${loan.memberPhone || '-'}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--text-primary); font-size: 0.95rem;">
            ${currency}${details.remainingPrincipal.toLocaleString('en-IN')}
          </div>
          ${details.isPartiallyPaid ? `
            <div style="font-size: 0.72rem; color: var(--gold-400); font-weight: 600;">
              बाकी मुद्दल (मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')} • भरले: ${currency}${details.principalRepaid.toLocaleString('en-IN')})
            </div>
          ` : (isPaid ? `
            <div style="font-size: 0.72rem; color: var(--emerald-400); font-weight: 600;">
              मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')} (पूर्ण फेड)
            </div>
          ` : '')}
        </td>
        <td style="font-size: 0.82rem; color: var(--text-secondary);">
          <div>वाटप: W${loan.issueWeek || 1}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${loan.issueDate || '-'}</div>
        </td>
        <td style="font-size: 0.82rem;">
          <div>${details.elapsedWeeks} आठवडे एकूण</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">चालू: ${details.currentCycleElapsedWeeks}/४ आठवडे</div>
        </td>
        <td>
          ${graceHtml}
          ${totalInterestCollectedOnLoan > 0 ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 700; margin-top: 0.2rem;">💰 जमा व्याज: ${currency}${totalInterestCollectedOnLoan.toLocaleString('en-IN')} (${interestPaymentsList.length} चक्र)</div>` : ''}
        </td>
        <td style="font-weight: 800; color: ${isPaid ? 'var(--emerald-400)' : 'var(--gold-400)'}; font-size: 0.95rem;">
          ${currency}${(isPaid ? (Number(loan.repaidAmount) || details.totalPayable) : details.totalPayable).toLocaleString('en-IN')}
          ${isPaid ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 600;">(पूर्ण जमा)</div>` : ''}
          ${!isPaid && details.isPartiallyPaid ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 700;">(उर्वरित बाकी + व्याज)</div>` : ''}
          ${!isPaid && !details.isPartiallyPaid && details.isGracePeriodActive ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 600;">(फक्त मुद्दल)</div>` : ''}
          ${!isPaid && !details.isPartiallyPaid && !details.isGracePeriodActive ? `<div style="font-size: 0.7rem; color: var(--rose-400); font-weight: 700;">(+३% व्याज)</div>` : ''}
        </td>
        <td>
          ${isPaid 
            ? `<span class="status-pill status-paid">✅ पूर्ण फेड (${loan.paidDate || '-'})</span>` 
            : (details.isPartiallyPaid
                ? `<span class="status-pill status-overdue" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);" title="मूळ कर्ज: ₹${details.originalPrincipal}, भरले: ₹${details.principalRepaid}, बाकी: ₹${details.remainingPrincipal}">🟠 अंशतः भरले (${currency}${details.remainingPrincipal.toLocaleString('en-IN')} बाकी - Pending)</span>`
                : `<span class="status-pill status-overdue">🔴 कर्ज बाकी (Pending)</span>`)}
        </td>
        <td style="text-align: right;">
          ${this.renderLoanActionCellHtml(loan, details, isPaid, interestPaymentsList, currency)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- स्वतंत्र कर्ज व्यवस्थापन व खातावही पेज (Dedicated Loans Page View) ---
  navigateToLoansPage() {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज खातावही पाहू शकतात', 'warning');
      return;
    }
    this.currentAdminView = 'loans';
    const dashboardView = document.getElementById('dashboardView');
    const loansPageView = document.getElementById('loansPageView');
    const membersPageView = document.getElementById('membersPageView');
    const customerPortalView = document.getElementById('customerPortalView');

    if (dashboardView) dashboardView.style.display = 'none';
    if (membersPageView) membersPageView.style.display = 'none';
    if (customerPortalView) customerPortalView.style.display = 'none';
    if (loansPageView) {
      loansPageView.style.display = 'block';
      loansPageView.classList.remove('view-page-transition');
      void loansPageView.offsetWidth;
      loansPageView.classList.add('view-page-transition');
    }

    const btnNavLoans = document.getElementById('btnOpenAdminLoans');
    if (btnNavLoans) {
      btnNavLoans.classList.add('active');
    }
    const btnNavDashboard = document.getElementById('btnNavDashboard');
    if (btnNavDashboard) {
      btnNavDashboard.classList.remove('active');
    }
    const btnNavMembers = document.getElementById('btnNavMembers');
    if (btnNavMembers) {
      btnNavMembers.classList.remove('active');
    }

    if (window.location.hash !== '#loans') {
      try { history.pushState(null, '', '#loans'); } catch (_) { window.location.hash = 'loans'; }
    }

    this.initLoansViewMode();
    this.renderLoansPage();
    this.renderWeekPills();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToDashboard() {
    this.currentAdminView = 'dashboard';
    const dashboardView = document.getElementById('dashboardView');
    const loansPageView = document.getElementById('loansPageView');
    const membersPageView = document.getElementById('membersPageView');
    const customerPortalView = document.getElementById('customerPortalView');

    if (loansPageView) loansPageView.style.display = 'none';
    if (membersPageView) membersPageView.style.display = 'none';
    if (customerPortalView) customerPortalView.style.display = 'none';
    if (dashboardView) {
      dashboardView.style.display = 'block';
      dashboardView.classList.remove('view-page-transition');
      void dashboardView.offsetWidth;
      dashboardView.classList.add('view-page-transition');
    }

    const btnNavLoans = document.getElementById('btnOpenAdminLoans');
    if (btnNavLoans) {
      btnNavLoans.classList.remove('active');
    }
    const btnNavMembers = document.getElementById('btnNavMembers');
    if (btnNavMembers) {
      btnNavMembers.classList.remove('active');
    }
    const btnNavDashboard = document.getElementById('btnNavDashboard');
    if (btnNavDashboard) {
      btnNavDashboard.classList.add('active');
    }

    if (window.location.hash === '#loans' || window.location.hash === '#members') {
      try { history.pushState(null, '', '#dashboard'); } catch (_) { window.location.hash = 'dashboard'; }
    }

    this.renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- स्वतंत्र सर्व सदस्य डेटा पेज (Dedicated All Members Data Page View) ---
  navigateToMembersPage() {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक सर्व सदस्य डेटा पाहू शकतात', 'warning');
      return;
    }
    this.currentAdminView = 'members';
    const dashboardView = document.getElementById('dashboardView');
    const loansPageView = document.getElementById('loansPageView');
    const membersPageView = document.getElementById('membersPageView');
    const customerPortalView = document.getElementById('customerPortalView');

    if (dashboardView) dashboardView.style.display = 'none';
    if (loansPageView) loansPageView.style.display = 'none';
    if (customerPortalView) customerPortalView.style.display = 'none';
    if (membersPageView) {
      membersPageView.style.display = 'block';
      membersPageView.classList.remove('view-page-transition');
      void membersPageView.offsetWidth;
      membersPageView.classList.add('view-page-transition');
    }

    const btnNavLoans = document.getElementById('btnOpenAdminLoans');
    if (btnNavLoans) {
      btnNavLoans.classList.remove('active');
    }
    const btnNavDashboard = document.getElementById('btnNavDashboard');
    if (btnNavDashboard) {
      btnNavDashboard.classList.remove('active');
    }
    const btnNavMembers = document.getElementById('btnNavMembers');
    if (btnNavMembers) {
      btnNavMembers.classList.add('active');
    }

    if (window.location.hash !== '#members') {
      try { history.pushState(null, '', '#members'); } catch (_) { window.location.hash = 'members'; }
    }

    this.renderMembersPage();
    this.renderWeekPills();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateNavBadges() {
    const allMembers = window.bishiStore.getMembers();
    const stats = window.bishiStore.getDashboardStats();
    
    const membersBadge = document.getElementById('navMembersCountBadge');
    if (membersBadge) {
      membersBadge.textContent = `${allMembers.length}`;
    }

    const dashMemberBadge = document.getElementById('dashMemberSectionBadge');
    if (dashMemberBadge) {
      const activeCount = allMembers.filter(m => m.status === 'active').length;
      dashMemberBadge.textContent = `${allMembers.length} सदस्य (${activeCount} सक्रिय)`;
    }

    const loansBadge = document.getElementById('navLoansActiveBadge');
    if (loansBadge) {
      loansBadge.textContent = `${stats.activeLoansCount || 0}`;
    }
  }

  renderMembersPage() {
    this.updateNavBadges();
    const allMembers = window.bishiStore.getMembers();
    const activeMembers = allMembers.filter(m => m.status === 'active' || m.status === 'completed');
    const currency = window.bishiStore.state.meta.currency || '₹';
    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;

    // १. KPI आकडेवारी अद्ययावत करणे (Top 4 KPIs)
    const totalMemEl = document.getElementById('mpStatTotalMembers');
    if (totalMemEl) totalMemEl.textContent = `${allMembers.length}`;
    const totalMemSubEl = document.getElementById('mpStatTotalMembersSub');
    if (totalMemSubEl) totalMemSubEl.textContent = `${activeMembers.length} सक्रिय / चालू सायकल`;

    const activeMemEl = document.getElementById('mpStatActiveMembers');
    if (activeMemEl) activeMemEl.textContent = `${activeMembers.length} सक्रिय बचतकर्ते`;

    const totalWeeklyPool = activeMembers.reduce((sum, m) => sum + (Number(m.weeklyAmount) || 0), 0);
    const weeklyPoolEl = document.getElementById('mpStatWeeklyPool');
    if (weeklyPoolEl) weeklyPoolEl.textContent = `${currency}${totalWeeklyPool.toLocaleString('en-IN')}`;

    let totalDepositedSum = 0;
    let totalMaturityTargetSum = 0;
    let completedCount = 0;
    allMembers.forEach(m => {
      const mStats = window.bishiStore.calculateMemberStats(m);
      totalDepositedSum += mStats.totalDeposited;
      totalMaturityTargetSum += mStats.projectedMaturityTotal;
      if (mStats.isFullyPaid || m.status === 'completed') {
        completedCount++;
      }
    });

    const completedCountEl = document.getElementById('mpStatCompletedCount');
    if (completedCountEl) completedCountEl.textContent = `${completedCount} सदस्य पूर्ण (५० आठवडे)`;

    const totalDepEl = document.getElementById('mpStatTotalDeposited');
    if (totalDepEl) totalDepEl.textContent = `${currency}${totalDepositedSum.toLocaleString('en-IN')}`;
    const totalDepSubEl = document.getElementById('mpStatTotalDepositedSub');
    if (totalDepSubEl) totalDepSubEl.textContent = `५० आठवड्यांचे एकूण लक्ष्य: ${currency}${(totalWeeklyPool * 50).toLocaleString('en-IN')}`;

    const maturityTargetEl = document.getElementById('mpStatMaturityTarget');
    if (maturityTargetEl) maturityTargetEl.textContent = `${currency}${totalMaturityTargetSum.toLocaleString('en-IN')}`;

    // बॅज अद्ययावत
    const badgeEl = document.getElementById('membersPageCountBadge');
    if (badgeEl) badgeEl.textContent = `${allMembers.length} नोंदणीकृत सदस्य`;

    // २. शोध व फिल्टर लागू करणे (Search & Filter)
    let filteredMembers = [...allMembers];

    const q = (this.membersPageSearchQuery || '').toLowerCase().trim();
    if (q) {
      filteredMembers = filteredMembers.filter(m => 
        (m.name || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        (m.id || '').toLowerCase().includes(q) ||
        (m.nominee || '').toLowerCase().includes(q) ||
        (m.notes || '').toLowerCase().includes(q)
      );
    }

    const filter = this.membersPageFilter || 'all';
    if (filter === 'active') {
      filteredMembers = filteredMembers.filter(m => m.status === 'active');
    } else if (filter === 'completed') {
      filteredMembers = filteredMembers.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        return stats.isFullyPaid || m.status === 'completed';
      });
    } else if (filter === 'with-loans') {
      filteredMembers = filteredMembers.filter(m => {
        const loanSummary = window.bishiStore.getMemberLoanSummary(m.id);
        return loanSummary && loanSummary.activeLoansCount > 0;
      });
    } else if (filter === 'overdue') {
      filteredMembers = filteredMembers.filter(m => {
        const stats = window.bishiStore.calculateMemberStats(m);
        return stats.overdueWeeksCount > 0;
      });
    }

    // ३. टेबल बॉडी रेंडरिंग (Table Mode)
    const tbody = document.getElementById('membersPageTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (filteredMembers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
              <div style="font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">कोणतेही सदस्य सापडले नाहीत</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">शोध शब्द तपासा किंवा फिल्टर पर्याय बदला.</p>
            </td>
          </tr>
        `;
      } else {
        filteredMembers.forEach(member => {
          const stats = window.bishiStore.calculateMemberStats(member);
          const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);
          const hasActiveLoan = loanSummary && loanSummary.activeLoansCount > 0;
          const cleanPhone = (member.phone || '').replace(/\D/g, '');

          // ५०-आठवडे मिनी प्रोग्रेस मॅट्रिक्स
          let miniMatrixHTML = `<div class="week-matrix-preview" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="५०-आठवडे प्रगती (पासबुक पाहण्यासाठी क्लिक करा)">`;
          (member.weeks || []).forEach(w => {
            let cls = '';
            const wPaidAmt = Number(w.amountPaid || 0);
            const isWkDirectPaid = (w.status === 'paid') || (wPaidAmt >= stats.weeklyAmount);
            const isWkCleared = !isWkDirectPaid && (w.weekNumber <= stats.effectivePaidWeeks);
            const isWkFullPaid = isWkDirectPaid;
            
            const depUpToW = member.weeks.filter(wk => wk.weekNumber <= w.weekNumber).reduce((sum, wk) => sum + (Number(wk.amountPaid) || 0), 0);
            const expUpToW = w.weekNumber * stats.weeklyAmount;
            const advAmt = Math.max(0, depUpToW - expUpToW);
            const isWkAdvanceExtra = isWkFullPaid && (advAmt > 0);

            const remainderDeposit = stats.totalDeposited - (stats.effectivePaidWeeks * stats.weeklyAmount);
            const isWkPartial = !isWkDirectPaid && !isWkCleared && ((w.weekNumber === stats.effectivePaidWeeks + 1 && remainderDeposit > 0) || (wPaidAmt > 0 && wPaidAmt < stats.weeklyAmount));

            let dotTitle = '';
            if (isWkFullPaid) {
              cls = isWkAdvanceExtra ? 'paid has-extra' : 'paid';
              dotTitle = `आठवडा ${w.weekNumber}: जमा ₹${wPaidAmt}`;
            } else if (isWkCleared) {
              cls = 'cleared';
              dotTitle = `आठवडा ${w.weekNumber}: हप्ता क्लिअर`;
            } else if (isWkPartial) {
              cls = 'partial';
              dotTitle = `आठवडा ${w.weekNumber}: अपूर्ण जमा`;
            } else if (w.weekNumber === currentWeek) {
              cls = 'current';
              dotTitle = `आठवडा ${w.weekNumber}: चालू आठवडा`;
            } else if (w.weekNumber < currentWeek) {
              cls = 'overdue';
              dotTitle = `आठवडा ${w.weekNumber}: थकबाकी`;
            } else {
              cls = 'pending';
              dotTitle = `आठवडा ${w.weekNumber}: प्रलंबित`;
            }
            miniMatrixHTML += `<span class="matrix-dot ${cls}" title="${dotTitle}"></span>`;
          });
          miniMatrixHTML += '</div>';

          const curWkData = member.weeks.find(w => w.weekNumber === currentWeek);
          const curPaidAmt = Number(curWkData?.amountPaid || 0);
          const isFullPaidThisWeek = curWkData && (curWkData.status === 'paid' || curPaidAmt >= stats.weeklyAmount);
          const isClearedThisWeek = !isFullPaidThisWeek && (currentWeek <= stats.effectivePaidWeeks);
          const isPartialThisWeek = !isFullPaidThisWeek && !isClearedThisWeek && (curPaidAmt > 0 && curPaidAmt < stats.weeklyAmount);

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <!-- १. सदस्य प्रोफाईल व संपर्क -->
            <td>
              <div class="member-cell">
                <div class="member-avatar ${stats.weeklyAmount >= 2000 ? 'gold' : ''}" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="पासबुक पहा">
                  ${(member.name || 'स').charAt(0).toUpperCase()}
                </div>
                <div class="member-meta">
                  <div class="member-name">
                    <span onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="cursor: pointer;" title="पासबुक पहा">${member.name}</span>
                    ${stats.isFullyPaid ? `<span class="status-pill status-completed" style="font-size:0.65rem; padding:0.1rem 0.4rem;">पूर्ण 🏆</span>` : ''}
                    ${member.currentCycle > 1 ? `<span class="status-pill" style="font-size:0.65rem; padding:0.1rem 0.4rem; background: rgba(59, 130, 246, 0.2); color: var(--blue-400); border: 1px solid var(--blue-400);">सायकल ${member.currentCycle}</span>` : ''}
                  </div>
                  <div class="member-phone" style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                    <span>📞 ${member.phone}</span>
                    ${cleanPhone.length >= 10 ? `
                      <a href="https://wa.me/91${cleanPhone}" target="_blank" rel="noopener noreferrer" style="color: #25d366; text-decoration: none; font-size: 0.75rem; font-weight: 700;" title="WhatsApp वर चॅट करा">
                        💬 WA
                      </a>
                    ` : ''}
                    <span class="member-id">${member.id}</span>
                  </div>
                  ${member.nominee ? `
                    <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.15rem;">
                      👤 वारस: <strong style="color: var(--text-secondary);">${member.nominee}</strong>
                    </div>
                  ` : ''}
                  ${member.notes ? `
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${member.notes}">
                      📍 ${member.notes}
                    </div>
                  ` : ''}
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">
                    🔑 पिन: <code style="background: var(--bg-tertiary); padding: 0.08rem 0.35rem; border-radius: 4px; font-weight: 700; color: var(--gold-400);">${member.password || '1234'}</code>
                  </div>
                </div>
              </div>
            </td>

            <!-- २. साप्ताहिक हप्ता व लक्ष्य -->
            <td>
              <div class="amount-badge amount-weekly">
                ${currency}${stats.weeklyAmount.toLocaleString('en-IN')}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">प्रति आठवडा हप्ता</div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
                ५० आठवडे लक्ष्य: ${currency}${stats.totalTarget.toLocaleString('en-IN')}
              </div>
            </td>

            <!-- ३. एकूण ठेव व परतावा -->
            <td>
              <div class="amount-badge ${stats.isFullyPaid ? 'amount-gold' : 'amount-total'}" onclick="event.stopPropagation(); window.ui.openMemberProfileModal('${member.id}')" style="cursor: pointer;" title="संपूर्ण प्रोफाईल व पासबुक पहा">
                ${currency}${stats.totalDeposited.toLocaleString('en-IN')}
              </div>
              <div class="progress-bar-container" style="max-width: 140px; margin-top: 0.35rem; cursor: pointer;" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" title="पासबुक उघडा">
                <div class="progress-bar-fill ${stats.isFullyPaid ? 'emerald' : 'gold'}" style="width: ${stats.progressPercent}%;"></div>
              </div>
              <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.25rem;">
                ${stats.paidWeeksCount}/५० आठवडे (${stats.progressPercent}%)
              </div>
              <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.15rem;">
                बाकी: <strong style="color: ${stats.totalTarget - stats.totalDeposited > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'};">${currency}${Math.max(0, stats.totalTarget - stats.totalDeposited).toLocaleString('en-IN')}</strong>
              </div>
              <div style="font-size: 0.75rem; color: var(--emerald-400); font-weight: 700; margin-top: 0.2rem;">
                +८% परतावा: ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}
              </div>
            </td>

            <!-- ४. सक्रिय कर्ज स्थिती -->
            <td>
              ${hasActiveLoan ? `
                <div style="font-weight: 800; color: var(--blue-400); font-size: 0.95rem;">
                  ${currency}${loanSummary.activePrincipal.toLocaleString('en-IN')}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">सक्रिय बाकी मुद्दल</div>
                ${loanSummary.activeInterest > 0 ? `
                  <div style="font-size: 0.75rem; color: var(--gold-400); font-weight: 700; margin-top: 0.2rem;">
                    💰 ३% व्याज देय: +${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}
                  </div>
                ` : `
                  <div style="font-size: 0.72rem; color: var(--emerald-400); font-weight: 600; margin-top: 0.2rem;">
                    ⏳ सवलतीत / नियमित
                  </div>
                `}
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.ui.navigateToLoansPage();" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; margin-top: 0.3rem;" title="कर्ज खातावही पहा">
                  कर्ज तपशील ↗
                </button>
              ` : `
                <span class="status-pill status-paid" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
                  ✓ कोणतेही कर्ज नाही
                </span>
                <div style="margin-top: 0.35rem;">
                  <button type="button" class="btn btn-sm" onclick="event.stopPropagation(); window.ui.openGiveLoanModal('${member.id}')" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; background: rgba(59, 130, 246, 0.15); color: var(--blue-400); border: 1px solid rgba(59, 130, 246, 0.3);" title="या सदस्यास कर्ज द्या">
                    ➕ कर्ज द्या
                  </button>
                </div>
              `}
            </td>

            <!-- ५. ५०-आठवडे प्रगती (पासबुक) -->
            <td>
              ${miniMatrixHTML}
              <div style="margin-top: 0.35rem;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.ui.openPassbookModal('${member.id}')" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; font-weight: 600;" title="पासबुक पहा">
                  📖 संपूर्ण पासबुक पहा
                </button>
              </div>
            </td>

            <!-- ६. व्यवस्थापन क्रिया -->
            <td style="text-align: right;">
              <div class="action-buttons" style="justify-content: flex-end;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.ui.openMemberProfileModal('${member.id}')" title="संपूर्ण प्रोफाईल व सर्व तपशील पहा" style="font-weight: 700;">
                  👤 प्रोफाईल
                </button>
                ${stats.isFullyPaid ? `
                  <button type="button" class="btn btn-gold btn-sm" onclick="event.stopPropagation(); window.receiptManager.showPayoutVoucherModal('${member.id}')" style="font-weight: 800; font-size: 0.75rem;" title="मॅच्युरिटी व्हाउचर पहा">
                    🎉 व्हाउचर
                  </button>
                ` : (isFullPaidThisWeek || isClearedThisWeek) ? `
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" title="पावती पहा">
                    🧾 पावती
                  </button>
                ` : isPartialThisWeek ? `
                  <button type="button" class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" title="बाकी हप्ता जमा करा">
                    💰 बाकी जमा
                  </button>
                ` : `
                  <button type="button" class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" title="हप्ता जमा करा">
                    💰 हप्ता जमा
                  </button>
                `}
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openEditMemberModal('${member.id}')" title="तपशील बदला">
                  ✏️ एडिट
                </button>
                <select class="member-action-select" onchange="window.ui.handleMemberActionSelect(this, '${member.id}', ${currentWeek})" title="अधिक पर्याय">
                  <option value="" selected disabled>⚙️ अधिक ▾</option>
                  <option value="profile">👤 संपूर्ण प्रोफाईल तपशील</option>
                  <option value="passbook">📖 ५०-आठवडे पासबुक</option>
                  ${(isFullPaidThisWeek || isClearedThisWeek || stats.isFullyPaid) ? `
                    <option value="receipt">🧾 पावती पहा (Receipt)</option>
                  ` : isPartialThisWeek ? `
                    <option value="collect">💰 बाकी हप्ता जमा करा</option>
                  ` : `
                    <option value="collect">💰 हप्ता जमा करा</option>
                  `}
                  <option value="loan">💳 कर्ज द्या</option>
                  <option value="edit">✏️ तपशील बदला</option>
                  ${stats.isFullyPaid ? `<option value="voucher">📜 मॅच्युरिटी व्हाउचर</option>` : ''}
                  <option value="wipe">🧹 हप्ते पुसा (Wipe)</option>
                  <option value="settle">🗑️ डिलीट / सेटल</option>
                </select>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // ४. ग्रीड बॉडी रेंडरिंग (Card Grid Mode)
    const gridBody = document.getElementById('membersPageGridBody');
    if (gridBody) {
      gridBody.innerHTML = '';
      if (filteredMembers.length === 0) {
        gridBody.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
            <div style="font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">कोणतेही सदस्य सापडले नाहीत</div>
          </div>
        `;
      } else {
        filteredMembers.forEach(member => {
          const stats = window.bishiStore.calculateMemberStats(member);
          const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);
          const hasActiveLoan = loanSummary && loanSummary.activeLoansCount > 0;
          const cleanPhone = (member.phone || '').replace(/\D/g, '');

          const card = document.createElement('div');
          card.className = 'glass-card member-grid-card';
          card.style.padding = '1.25rem';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '0.9rem';
          card.style.position = 'relative';

          card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="member-avatar ${stats.weeklyAmount >= 2000 ? 'gold' : ''}" onclick="window.ui.openMemberProfileModal('${member.id}')" style="cursor: pointer;" title="संपूर्ण प्रोफाईल पहा">
                  ${(member.name || 'स').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary); cursor: pointer;" onclick="window.ui.openMemberProfileModal('${member.id}')" title="संपूर्ण प्रोफाईल पहा">
                    ${member.name}
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
                    ${member.id}
                  </div>
                </div>
              </div>
              <div>
                ${stats.isFullyPaid ? `<span class="status-pill status-completed">पूर्ण 🏆</span>` : `<span class="status-pill status-paid">सक्रिय</span>`}
              </div>
            </div>

            <!-- संपर्क व वारस तपशील -->
            <div style="background: var(--bg-tertiary); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted);">📞 संपर्क:</span>
                <span style="font-weight: 600; color: var(--text-primary);">
                  ${member.phone}
                  ${cleanPhone.length >= 10 ? `<a href="https://wa.me/91${cleanPhone}" target="_blank" rel="noopener noreferrer" style="color: #25d366; text-decoration: none; margin-left: 0.25rem; font-weight: 700;">💬 WA</a>` : ''}
                </span>
              </div>
              ${member.nominee ? `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: var(--text-muted);">👤 वारस:</span>
                  <span style="font-weight: 600; color: var(--text-primary);">${member.nominee}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted);">🔑 लॉगिन पिन:</span>
                <code style="color: var(--gold-400); font-weight: 700; font-size: 0.85rem;">${member.password || '1234'}</code>
              </div>
              ${member.notes ? `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: var(--text-muted);">📍 पत्ता / नोंद:</span>
                  <span style="color: var(--text-secondary); max-width: 180px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${member.notes}">${member.notes}</span>
                </div>
              ` : ''}
            </div>

            <!-- आर्थिक आकडेवारी ग्रीड -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
              <div style="background: var(--bg-primary); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">साप्ताहिक हप्ता</div>
                <div style="font-weight: 800; color: var(--gold-400); font-size: 1rem; margin-top: 0.15rem;">
                  ${currency}${stats.weeklyAmount.toLocaleString('en-IN')}
                </div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">लक्ष्य: ${currency}${stats.totalTarget.toLocaleString('en-IN')}</div>
              </div>
              <div style="background: var(--bg-primary); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">एकूण ठेव बचत</div>
                <div style="font-weight: 800; color: var(--emerald-400); font-size: 1rem; margin-top: 0.15rem;">
                  ${currency}${stats.totalDeposited.toLocaleString('en-IN')}
                </div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">${stats.paidWeeksCount}/५० आठवडे (${stats.progressPercent}%)</div>
              </div>
              <div style="background: var(--bg-primary); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">८% मॅच्युरिटी परतावा</div>
                <div style="font-weight: 800; color: var(--purple-400, #a855f7); font-size: 1rem; margin-top: 0.15rem;">
                  ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}
                </div>
                <div style="font-size: 0.68rem; color: var(--emerald-400);">+${currency}${stats.interestAmount.toLocaleString('en-IN')} व्याज</div>
              </div>
              <div style="background: var(--bg-primary); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">कर्ज स्थिती</div>
                <div style="font-weight: 800; color: ${hasActiveLoan ? 'var(--blue-400)' : 'var(--text-muted)'}; font-size: 0.95rem; margin-top: 0.15rem;">
                  ${hasActiveLoan ? `${currency}${loanSummary.activePrincipal.toLocaleString('en-IN')}` : 'नाही'}
                </div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">${hasActiveLoan ? 'सक्रिय बाकी' : 'कर्जमुक्त'}</div>
              </div>
            </div>

            <!-- प्रोग्रेस बार -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                <span style="color: var(--text-muted);">५० आठवडे ठेव प्रगती</span>
                <span style="font-weight: 700; color: var(--text-primary);">${stats.progressPercent}%</span>
              </div>
              <div class="progress-bar-container" style="height: 6px;">
                <div class="progress-bar-fill ${stats.isFullyPaid ? 'emerald' : 'gold'}" style="width: ${stats.progressPercent}%;"></div>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; display: flex; justify-content: space-between;">
                <span>शिल्लक बाकी: <strong style="color: ${stats.totalTarget - stats.totalDeposited > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'};">${currency}${Math.max(0, stats.totalTarget - stats.totalDeposited).toLocaleString('en-IN')}</strong></span>
                <span>${50 - stats.paidWeeksCount} आठवडे बाकी</span>
              </div>
            </div>

            <!-- कृती बटणे -->
            ${(() => {
              const curWkData = member.weeks.find(w => w.weekNumber === currentWeek);
              const curPaidAmt = Number(curWkData?.amountPaid || 0);
              const isFullPaidThisWeek = curWkData && (curWkData.status === 'paid' || curPaidAmt >= stats.weeklyAmount);
              const isClearedThisWeek = !isFullPaidThisWeek && (currentWeek <= stats.effectivePaidWeeks);
              const isPartialThisWeek = !isFullPaidThisWeek && !isClearedThisWeek && (curPaidAmt > 0 && curPaidAmt < stats.weeklyAmount);

              return `
                <div style="display: flex; gap: 0.4rem; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-color); flex-wrap: wrap;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openMemberProfileModal('${member.id}')" style="flex: 1; justify-content: center; font-weight: 700;" title="संपूर्ण प्रोफाईल पहा">
                    👤 प्रोफाईल
                  </button>
                  ${stats.isFullyPaid ? `
                    <button type="button" class="btn btn-gold btn-sm" onclick="window.receiptManager.showPayoutVoucherModal('${member.id}')" style="flex: 1; justify-content: center; font-weight: 800;" title="५०-आठवडे मॅच्युरिटी व्हाउचर पहा">
                      🎉 व्हाउचर
                    </button>
                  ` : (isFullPaidThisWeek || isClearedThisWeek) ? `
                    <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.showReceiptModal('${member.id}', ${currentWeek})" style="flex: 1; justify-content: center; font-weight: 700;" title="पावती पहा">
                      🧾 पावती
                    </button>
                  ` : isPartialThisWeek ? `
                    <button type="button" class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" style="flex: 1; justify-content: center; font-weight: 700;" title="बाकी हप्ता जमा करा">
                      💰 बाकी जमा
                    </button>
                  ` : `
                    <button type="button" class="btn btn-primary btn-sm" onclick="window.ui.openCollectModal('${member.id}', ${currentWeek})" style="flex: 1; justify-content: center; font-weight: 700;" title="हप्ता जमा करा">
                      💰 हप्ता
                    </button>
                  `}
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openPassbookModal('${member.id}')" style="flex: 1; justify-content: center;" title="पासबुक पहा">
                    📖 पासबुक
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.ui.openEditMemberModal('${member.id}')" title="एडिट">
                    ✏️
                  </button>
                </div>
              `;
            })()}
          `;
          gridBody.appendChild(card);
        });
      }
    }
  }

  // --- संपूर्ण सदस्य प्रोफाईल व सर्व तपशील मोडल (Comprehensive Full Member Profile Modal) ---
  openMemberProfileModal(memberId) {
    const member = window.bishiStore.getMemberById(memberId);
    if (!member) {
      this.showToast('सदस्य सापडला नाही', 'error');
      return;
    }

    const stats = window.bishiStore.calculateMemberStats(member);
    const loanSummary = window.bishiStore.getMemberLoanSummary(member.id);
    const hasActiveLoan = loanSummary && loanSummary.activeLoansCount > 0;
    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    const currency = window.bishiStore.state.meta.currency || '₹';
    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;
    const remainingToPay = Math.max(0, stats.totalTarget - stats.totalDeposited);

    const curWkData = member.weeks.find(w => w.weekNumber === currentWeek);
    const curPaidAmt = Number(curWkData?.amountPaid || 0);
    const isFullPaidThisWeek = curWkData && (curWkData.status === 'paid' || curPaidAmt >= stats.weeklyAmount);
    const isClearedThisWeek = !isFullPaidThisWeek && (currentWeek <= stats.effectivePaidWeeks);
    const isPartialThisWeek = !isFullPaidThisWeek && !isClearedThisWeek && (curPaidAmt > 0 && curPaidAmt < stats.weeklyAmount);

    // ५०-आठवडे प्रोग्रेस मॅट्रिक्स
    let miniMatrixHTML = `<div class="week-matrix-preview" style="display: flex; flex-wrap: wrap; gap: 4px; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">`;
    (member.weeks || []).forEach(w => {
      let cls = '';
      const wPaidAmt = Number(w.amountPaid || 0);
      const isWkDirectPaid = (w.status === 'paid') || (wPaidAmt >= stats.weeklyAmount);
      const isWkCleared = !isWkDirectPaid && (w.weekNumber <= stats.effectivePaidWeeks);
      const isWkFullPaid = isWkDirectPaid;
      
      const depUpToW = member.weeks.filter(wk => wk.weekNumber <= w.weekNumber).reduce((sum, wk) => sum + (Number(wk.amountPaid) || 0), 0);
      const expUpToW = w.weekNumber * stats.weeklyAmount;
      const advAmt = Math.max(0, depUpToW - expUpToW);
      const isWkAdvanceExtra = isWkFullPaid && (advAmt > 0);

      const remainderDeposit = stats.totalDeposited - (stats.effectivePaidWeeks * stats.weeklyAmount);
      const isWkPartial = !isWkDirectPaid && !isWkCleared && ((w.weekNumber === stats.effectivePaidWeeks + 1 && remainderDeposit > 0) || (wPaidAmt > 0 && wPaidAmt < stats.weeklyAmount));

      let dotTitle = '';
      if (isWkFullPaid) {
        cls = isWkAdvanceExtra ? 'paid has-extra' : 'paid';
        dotTitle = `आठवडा ${w.weekNumber}: जमा ${currency}${wPaidAmt.toLocaleString('en-IN')}`;
      } else if (isWkCleared) {
        cls = 'cleared';
        dotTitle = `आठवडा ${w.weekNumber}: हप्ता क्लिअर`;
      } else if (isWkPartial) {
        cls = 'partial';
        dotTitle = `आठवडा ${w.weekNumber}: अपूर्ण जमा`;
      } else if (w.weekNumber === currentWeek) {
        cls = 'current';
        dotTitle = `आठवडा ${w.weekNumber}: चालू आठवडा`;
      } else if (w.weekNumber < currentWeek) {
        cls = 'overdue';
        dotTitle = `आठवडा ${w.weekNumber}: थकबाकी`;
      } else {
        cls = 'pending';
        dotTitle = `आठवडा ${w.weekNumber}: प्रलंबित`;
      }
      miniMatrixHTML += `<span class="matrix-dot ${cls}" style="width: 13px; height: 13px; border-radius: 3px;" title="${dotTitle}"></span>`;
    });
    miniMatrixHTML += '</div>';

    const bodyEl = document.getElementById('memberProfileModalBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <!-- १. सदस्य हेडर व प्रोफाइल कार्ड -->
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="member-avatar ${stats.weeklyAmount >= 2000 ? 'gold' : ''}" style="width: 58px; height: 58px; font-size: 1.7rem; border-radius: var(--radius-md);">
                ${(member.name || 'स').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0;">${member.name}</h2>
                  ${stats.isFullyPaid ? `<span class="status-pill status-completed">५० आठवडे पूर्ण 🏆</span>` : `<span class="status-pill status-paid">सक्रिय बचतकर्ता</span>`}
                  ${member.currentCycle > 1 ? `<span class="status-pill" style="background: rgba(59,130,246,0.15); color: var(--blue-400); border: 1px solid var(--blue-400);">सायकल ${member.currentCycle}</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem; flex-wrap: wrap;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); background: var(--bg-primary); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
                    आयडी: ${member.id}
                  </span>
                  <span>📞 ${member.phone}</span>
                  ${cleanPhone.length >= 10 ? `
                    <a href="https://wa.me/91${cleanPhone}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #25d366; color: #fff; padding: 0.15rem 0.6rem; font-size: 0.75rem; font-weight: 700; border-radius: 9999px; text-decoration: none;">
                      💬 WhatsApp वर बोला
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- द्रुत कृती बटणे -->
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              ${stats.isFullyPaid ? `
                <button type="button" class="btn btn-gold btn-sm" onclick="window.closeAllModals(); window.receiptManager.showPayoutVoucherModal('${member.id}');" style="font-weight: 800; padding: 0.45rem 0.9rem;">
                  🎉 व्हाउचर पहा
                </button>
              ` : (isFullPaidThisWeek || isClearedThisWeek) ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.closeAllModals(); window.receiptManager.showReceiptModal('${member.id}', ${currentWeek});" style="font-weight: 700; padding: 0.45rem 0.9rem;">
                  🧾 पावती पहा
                </button>
              ` : isPartialThisWeek ? `
                <button type="button" class="btn btn-primary btn-sm" onclick="window.closeAllModals(); window.ui.openCollectModal('${member.id}', ${currentWeek});" style="font-weight: 700; padding: 0.45rem 0.9rem;">
                  💰 बाकी जमा करा
                </button>
              ` : `
                <button type="button" class="btn btn-primary btn-sm" onclick="window.closeAllModals(); window.ui.openCollectModal('${member.id}', ${currentWeek});" style="font-weight: 700; padding: 0.45rem 0.9rem;">
                  💰 हप्ता जमा करा
                </button>
              `}
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.closeAllModals(); window.ui.openPassbookModal('${member.id}');" style="font-weight: 700; padding: 0.45rem 0.9rem;">
                📖 पासबुक उघडा
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.closeAllModals(); window.ui.openEditMemberModal('${member.id}');" style="font-weight: 700; padding: 0.45rem 0.85rem;">
                ✏️ एडिट
              </button>
            </div>
          </div>

          <!-- वैयक्तिक नोंदणी व संपर्क माहिती ग्रीड -->
          <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px dashed var(--border-color); display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.83rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.73rem; text-transform: uppercase; font-weight: 700; display: block;">वारसदार (Nominee)</span>
              <span style="font-weight: 600; color: var(--text-primary);">${member.nominee || 'नोंदणी केलेली नाही'}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.73rem; text-transform: uppercase; font-weight: 700; display: block;">लॉगिन पासवर्ड / पिन</span>
              <code style="font-weight: 800; color: var(--gold-400); background: var(--bg-primary); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.88rem;">${member.password || '1234'}</code>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.73rem; text-transform: uppercase; font-weight: 700; display: block;">पत्ता / लँडमार्क नोंद</span>
              <span style="color: var(--text-secondary);">${member.notes || 'माहिती उपलब्ध नाही'}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.73rem; text-transform: uppercase; font-weight: 700; display: block;">नोंदणी सायकल</span>
              <span style="font-weight: 600; color: var(--emerald-400);">सायकल ${member.currentCycle || 1} (५० आठवडे)</span>
            </div>
          </div>
        </div>

        <!-- २. मुख्य ४ आर्थिक आकडेवारी कार्ड्स -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 0.85rem; margin-bottom: 1.25rem;">
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">साप्ताहिक हप्ता</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--gold-400); margin-top: 0.2rem;">
              ${currency}${stats.weeklyAmount.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
              ५० आठवडे लक्ष्य: ${currency}${stats.totalTarget.toLocaleString('en-IN')}
            </div>
          </div>

          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">आतापर्यंत एकूण जमा</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--emerald-400); margin-top: 0.2rem;">
              ${currency}${stats.totalDeposited.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
              ${stats.paidWeeksCount} / ५० आठवडे पूर्ण (${stats.progressPercent}%)
            </div>
          </div>

          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">उर्वरित शिल्लक बाकी</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: ${remainingToPay > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'}; margin-top: 0.2rem;">
              ${currency}${remainingToPay.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
              ${remainingToPay > 0 ? `${50 - stats.paidWeeksCount} आठवडे भरणे बाकी` : 'सर्व हप्ते पूर्ण! 🎉'}
            </div>
          </div>

          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">८% मॅच्युरिटी परतावा</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--purple-400, #a855f7); margin-top: 0.2rem;">
              ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 0.75rem; color: var(--emerald-400); font-weight: 600; margin-top: 0.2rem;">
              +${currency}${stats.interestAmount.toLocaleString('en-IN')} व्याज बोनस
            </div>
          </div>
        </div>

        <!-- ३. कर्ज स्थिती व ३% व्याज तपशील -->
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.15rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
                <span>💳</span> सदस्य कर्ज व्यवस्थापन व ३% व्याज स्थिती
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                ${hasActiveLoan ? `या सदस्यावर सक्रिय कर्ज आहे. दर ४ आठवड्यांनी ३% व्याज आकारले जाते.` : `या सदस्यावर कोणतेही सक्रिय कर्ज नाही.`}
              </div>
            </div>

            <div>
              ${hasActiveLoan ? `
                <div style="display: flex; gap: 1rem; align-items: center;">
                  <div style="text-align: right;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--blue-400);">${currency}${loanSummary.activePrincipal.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">सक्रिय बाकी मुद्दल</div>
                  </div>
                  ${loanSummary.activeInterest > 0 ? `
                    <div style="text-align: right;">
                      <div style="font-size: 1.15rem; font-weight: 800; color: var(--gold-400);">+${currency}${loanSummary.activeInterest.toLocaleString('en-IN')}</div>
                      <div style="font-size: 0.72rem; color: var(--gold-400); font-weight: 700;">३% व्याज देय</div>
                    </div>
                  ` : ''}
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.closeAllModals(); window.ui.navigateToLoansPage();" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    कर्ज खातावही ➔
                  </button>
                </div>
              ` : `
                <button type="button" class="btn btn-sm" onclick="window.closeAllModals(); window.ui.openGiveLoanModal('${member.id}');" style="background: rgba(59, 130, 246, 0.15); color: var(--blue-400); border: 1px solid rgba(59, 130, 246, 0.35); font-weight: 700; padding: 0.4rem 0.85rem;">
                  ➕ या सदस्यास कर्ज द्या
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- ४. ५०-आठवडे बचत मॅट्रिक्स व प्रगती -->
        <div style="margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
              ५०-आठवडे बचत प्रगती खातावही (${stats.paidWeeksCount}/५० आठवडे - ${stats.progressPercent}%)
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">
              🟢 जमा • 🔵 क्लिअर • 🟡 चालू हप्ता • 🔴 थकबाकी • ⚪ प्रलंबित
            </div>
          </div>
          ${miniMatrixHTML}
        </div>
      `;
    }

    const footerEl = document.getElementById('mpModalFooterActions');
    if (footerEl) {
      footerEl.innerHTML = `
        ${stats.isFullyPaid ? `
          <button type="button" class="btn btn-gold" onclick="window.closeAllModals(); window.receiptManager.showPayoutVoucherModal('${member.id}');" style="font-weight: 800;">
            📜 मॅच्युरिटी व्हाउचर
          </button>
        ` : (isFullPaidThisWeek || isClearedThisWeek) ? `
          <button type="button" class="btn btn-secondary" onclick="window.closeAllModals(); window.receiptManager.showReceiptModal('${member.id}', ${currentWeek});" style="font-weight: 700;">
            🧾 आठवडा ${currentWeek} पावती
          </button>
        ` : isPartialThisWeek ? `
          <button type="button" class="btn btn-primary" onclick="window.closeAllModals(); window.ui.openCollectModal('${member.id}', ${currentWeek});" style="font-weight: 700;">
            💰 उर्वरित बाकी जमा करा
          </button>
        ` : `
          <button type="button" class="btn btn-primary" onclick="window.closeAllModals(); window.ui.openCollectModal('${member.id}', ${currentWeek});" style="font-weight: 700;">
            💰 हप्ता जमा करा
          </button>
        `}
        <button type="button" class="btn btn-secondary" onclick="window.closeAllModals(); window.ui.openPassbookModal('${member.id}');" style="font-weight: 700;">
          📖 संपूर्ण पासबुक
        </button>
        ${cleanPhone.length >= 10 ? `
          <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`सुखकर्ता बीशी: नमस्कार ${member.name}, आपले सदस्य आयडी ${member.id} आहे. आतापर्यंत जमा बचत ₹${stats.totalDeposited.toLocaleString('en-IN')} (${stats.paidWeeksCount}/५० आठवडे पूर्ण). शिल्लक बाकी ₹${remainingToPay.toLocaleString('en-IN')}.`)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="background: rgba(37,211,102,0.1); color: #25d366; border-color: rgba(37,211,102,0.3); font-weight: 700; text-decoration: none;">
            💬 खातावही WhatsApp करा
          </a>
        ` : ''}
      `;
    }

    const modal = document.getElementById('memberProfileModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  renderDashboardLoans() {
    this.renderLoansPage();
  }

  renderLoansPage() {
    const stats = window.bishiStore.getDashboardStats();
    const currency = window.bishiStore.state.meta.currency || '₹';

    // १. बॅज व मिनी KPI अद्ययावत करणे
    const badge = document.getElementById('loansPageBadge') || document.getElementById('dashLoansBadge');
    if (badge) {
      badge.textContent = `${stats.activeLoansCount || 0} सक्रिय कर्जे`;
    }

    const navBadge = document.getElementById('navLoansActiveBadge');
    if (navBadge) {
      navBadge.textContent = `${stats.activeLoansCount || 0}`;
    }

    const disbEl = document.getElementById('loansPageTotalDisbursed') || document.getElementById('dashLoanDisbursed');
    if (disbEl) disbEl.textContent = `${currency}${(stats.totalLoansDisbursed || 0).toLocaleString('en-IN')}`;
    const disbCountEl = document.getElementById('loansPageDisbursedCount') || document.getElementById('dashLoanDisbursedCount');
    if (disbCountEl) disbCountEl.textContent = `${(stats.activeLoansCount || 0) + (stats.repaidLoansCount || 0)} कर्जे वाटप`;

    const activeEl = document.getElementById('loansPageActivePrincipal') || document.getElementById('dashLoanActivePrincipal');
    if (activeEl) activeEl.textContent = `${currency}${(stats.totalActiveLoansPrincipal || 0).toLocaleString('en-IN')}`;
    const activeCountEl = document.getElementById('loansPageActiveCount') || document.getElementById('dashLoanActiveCount');
    if (activeCountEl) activeCountEl.textContent = `${stats.activeLoansCount || 0} सक्रिय बाकी`;

    const intEl = document.getElementById('loansPageInterestCollected') || document.getElementById('dashLoanInterestCollected');
    if (intEl) intEl.textContent = `${currency}${(stats.totalLoanInterestCollected || 0).toLocaleString('en-IN')}`;

    const repEl = document.getElementById('loansPageRepaidAmount') || document.getElementById('dashLoanRepaidAmount');
    if (repEl) repEl.textContent = `${currency}${(stats.totalLoansRepaidAmount || 0).toLocaleString('en-IN')}`;
    const repCountEl = document.getElementById('loansPageRepaidCount') || document.getElementById('dashLoanRepaidCount');
    if (repCountEl) repCountEl.textContent = `${stats.repaidLoansCount || 0} कर्जे पूर्ण`;

    // २. टेबल बॉडी
    const tbody = document.getElementById('loansPageTableBody') || document.getElementById('dashLoansTableBody');
    if (!tbody) return;

    let loans = window.bishiStore.state.loans || [];

    // फिल्टर (Status filter)
    const statusFilter = document.getElementById('loansPageStatusFilter')?.value || document.getElementById('dashLoansStatusFilter')?.value || 'all';
    if (statusFilter === 'active') {
      loans = loans.filter(l => l.status === 'active');
    } else if (statusFilter === 'paid') {
      loans = loans.filter(l => l.status === 'paid');
    }

    // शोध (Search Query)
    const searchInput = document.getElementById('loansPageSearchInput') || document.getElementById('dashLoansSearchInput');
    const query = (searchInput?.value || '').toLowerCase().trim();
    if (query) {
      loans = loans.filter(l => 
        (l.memberName || '').toLowerCase().includes(query) ||
        (l.memberId || '').toLowerCase().includes(query) ||
        (l.id || '').toLowerCase().includes(query) ||
        (l.memberPhone || '').includes(query)
      );
    }

    const gridBody = document.getElementById('loansPageGridBody');
    if (gridBody) gridBody.innerHTML = '';

    if (loans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.75rem 1.5rem; color: var(--text-muted);">
            <div style="position: sticky; left: 0; display: inline-block; max-width: calc(100vw - 2.5rem); margin: 0 auto;">
              <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">💳</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">कोणतीही कर्ज नोंद सापडली नाही</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
                नवीन कर्ज वाटप करण्यासाठी वरील <strong>'➕ नवीन कर्ज'</strong> बटणावर क्लिक करा.
              </div>
            </div>
          </td>
        </tr>
      `;

      if (gridBody) {
        gridBody.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
            <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">💳</div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">कोणतीही कर्ज नोंद सापडली नाही</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
              नवीन कर्ज वाटप करण्यासाठी वरील <strong>'➕ नवीन कर्ज'</strong> बटणावर क्लिक करा.
            </div>
          </div>
        `;
      }
      return;
    }

    tbody.innerHTML = '';
    loans.forEach(loan => {
      const details = window.bishiStore.calculateLoanDetails(loan);
      const isPaid = loan.status === 'paid';
      const tr = document.createElement('tr');

      let graceHtml = '';
      if (isPaid) {
        graceHtml = loan.interestPaid > 0 
          ? `<span style="color: var(--rose-400); font-weight: 700;">+${currency}${loan.interestPaid.toLocaleString('en-IN')} (३% व्याज)</span>` 
          : `<span style="color: var(--emerald-400); font-weight: 700;">₹० (०% सवलतीत पूर्ण)</span>`;
      } else if (details.isGracePeriodActive) {
        graceHtml = `<span class="status-pill status-paid" style="font-size: 0.72rem; background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid rgba(16, 185, 129, 0.35);">🟢 चक्र ${details.currentCycleNumber}: सवलत चालू (०% व्याज • ${details.remainingGraceWeeks} आठवडे बाकी)</span>`;
      } else {
        graceHtml = `<span class="status-pill status-overdue" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);">⚠️ चक्र ${details.currentCycleNumber}: +${currency}${details.interestAmount.toLocaleString('en-IN')} (४ आठवडे पूर्ण • ३% व्याज देय)</span>`;
      }

      const totalInterestCollectedOnLoan = Number(loan.totalInterestPaid || 0);
      const interestPaymentsList = Array.isArray(loan.interestPayments) ? loan.interestPayments : [];

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-400); font-size: 0.85rem; white-space: nowrap;">
          ${loan.id}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${loan.memberName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${loan.memberId} • 📞 ${loan.memberPhone || '-'}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--text-primary); font-size: 0.95rem;">
            ${currency}${details.remainingPrincipal.toLocaleString('en-IN')}
          </div>
          ${details.isPartiallyPaid ? `
            <div style="font-size: 0.72rem; color: var(--gold-400); font-weight: 600;">
              बाकी मुद्दल (मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')} • भरले: ${currency}${details.principalRepaid.toLocaleString('en-IN')})
            </div>
          ` : (isPaid ? `
            <div style="font-size: 0.72rem; color: var(--emerald-400); font-weight: 600;">
              मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')} (पूर्ण फेड)
            </div>
          ` : '')}
        </td>
        <td style="font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
          <div>वाटप: W${loan.issueWeek || 1}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${loan.issueDate || '-'}</div>
        </td>
        <td style="font-size: 0.82rem; white-space: nowrap;">
          <div>${details.elapsedWeeks} आठवडे एकूण</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">चालू सायकल: ${details.currentCycleElapsedWeeks}/४ आठवडे</div>
        </td>
        <td>
          ${graceHtml}
          ${totalInterestCollectedOnLoan > 0 ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 700; margin-top: 0.2rem;">💰 जमा व्याज: ${currency}${totalInterestCollectedOnLoan.toLocaleString('en-IN')} (${interestPaymentsList.length} चक्र)</div>` : ''}
        </td>
        <td style="font-weight: 800; color: ${isPaid ? 'var(--emerald-400)' : 'var(--gold-400)'}; font-size: 0.95rem; white-space: nowrap;">
          ${currency}${(isPaid ? (Number(loan.repaidAmount) || details.totalPayable) : details.totalPayable).toLocaleString('en-IN')}
          ${isPaid ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 600;">(पूर्ण जमा)</div>` : ''}
          ${!isPaid && details.isPartiallyPaid ? `<div style="font-size: 0.7rem; color: var(--gold-400); font-weight: 700;">(उर्वरित बाकी + व्याज)</div>` : ''}
          ${!isPaid && !details.isPartiallyPaid && details.isGracePeriodActive ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 600;">(फक्त मुद्दल)</div>` : ''}
          ${!isPaid && !details.isPartiallyPaid && !details.isGracePeriodActive ? `<div style="font-size: 0.7rem; color: var(--rose-400); font-weight: 700;">(+३% व्याज)</div>` : ''}
        </td>
        <td style="white-space: nowrap;">
          ${isPaid 
            ? `<span class="status-pill status-paid">✅ पूर्ण फेड (${loan.paidDate || '-'})</span>` 
            : (details.isPartiallyPaid
                ? `<span class="status-pill status-overdue" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);" title="मूळ कर्ज: ₹${details.originalPrincipal}, भरले: ₹${details.principalRepaid}, बाकी: ₹${details.remainingPrincipal}">🟠 अंशतः भरले (${currency}${details.remainingPrincipal.toLocaleString('en-IN')} बाकी)</span>`
                : `<span class="status-pill status-overdue">🔴 कर्ज बाकी (Pending)</span>`)}
        </td>
        <td style="text-align: right; white-space: nowrap;">
          ${this.renderLoanActionCellHtml(loan, details, isPaid, interestPaymentsList, currency)}
        </td>
      `;
      tbody.appendChild(tr);

      // मोबाईल कार्ड्स व्ह्यूमध्ये कार्ड तयार करणे
      if (gridBody) {
        const card = document.createElement('div');
        card.className = 'loan-mobile-card';
        card.innerHTML = `
          <div class="loan-card-header">
            <div class="loan-card-member">
              <div class="loan-card-member-name">${loan.memberName}</div>
              <div class="loan-card-member-meta">
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-400);">${loan.id}</span>
                <span>• ${loan.memberId}</span>
                <span>• 📞 ${loan.memberPhone || '-'}</span>
              </div>
            </div>
            <div>
              ${isPaid 
                ? `<span class="status-pill status-paid" style="font-size: 0.72rem;">✅ पूर्ण फेड</span>` 
                : (details.isPartiallyPaid
                    ? `<span class="status-pill status-overdue" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: var(--gold-400); border: 1px solid rgba(245, 158, 11, 0.35);">🟠 बाकी</span>`
                    : `<span class="status-pill status-overdue" style="font-size: 0.72rem;">🔴 कर्ज बाकी</span>`)}
            </div>
          </div>

          <div class="loan-card-body">
            <div class="loan-data-row">
              <span class="loan-data-label">बाकी मुद्दल / मूळ कर्ज</span>
              <span class="loan-data-val" style="font-size: 1rem;">
                ${currency}${details.remainingPrincipal.toLocaleString('en-IN')}
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(मूळ: ${currency}${details.originalPrincipal.toLocaleString('en-IN')})</span>
              </span>
            </div>

            <div class="loan-data-row">
              <span class="loan-data-label">एकूण देय रक्कम</span>
              <span class="loan-data-val" style="font-size: 1rem; color: ${isPaid ? 'var(--emerald-400)' : 'var(--gold-400)'};">
                ${currency}${(isPaid ? (Number(loan.repaidAmount) || details.totalPayable) : details.totalPayable).toLocaleString('en-IN')}
              </span>
            </div>

            <div class="loan-data-row">
              <span class="loan-data-label">वाटप आठवडा व तारीख</span>
              <span class="loan-data-val" style="font-size: 0.82rem; color: var(--text-secondary);">
                W${loan.issueWeek || 1} • ${loan.issueDate || '-'}
              </span>
            </div>

            <div class="loan-data-row">
              <span class="loan-data-label">कालावधी व सायकल</span>
              <span class="loan-data-val" style="font-size: 0.82rem; color: var(--text-secondary);">
                ${details.elapsedWeeks} आठवडे (सायकल ${details.currentCycleElapsedWeeks}/४)
              </span>
            </div>

            <div class="loan-data-row" style="grid-column: 1 / -1;">
              <span class="loan-data-label">३% व्याज स्थिती</span>
              <div style="margin-top: 0.2rem;">
                ${graceHtml}
                ${totalInterestCollectedOnLoan > 0 ? `<div style="font-size: 0.7rem; color: var(--emerald-400); font-weight: 700; margin-top: 0.25rem;">💰 जमा व्याज: ${currency}${totalInterestCollectedOnLoan.toLocaleString('en-IN')} (${interestPaymentsList.length} चक्र)</div>` : ''}
              </div>
            </div>
          </div>

          <div class="loan-card-footer">
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ${isPaid ? `पूर्ण फेड तारीख: <strong>${loan.paidDate || '-'}</strong>` : `स्थिती: <strong>${details.isGracePeriodActive ? '०% सवलत चालू' : '३% व्याज लागू'}</strong>`}
            </div>
            <div style="flex: 1; display: flex; justify-content: flex-end; min-width: 140px;">
              ${this.renderLoanActionCellHtml(loan, details, isPaid, interestPaymentsList, currency)}
            </div>
          </div>
        `;
        gridBody.appendChild(card);
      }
    });
  }

  initLoansViewMode() {
    if (!this.loansPageViewMode) {
      this.loansPageViewMode = window.innerWidth <= 768 ? 'grid' : 'table';
    }
    this.updateLoansViewModeUi();
  }

  updateLoansViewModeUi() {
    const btnTable = document.getElementById('btnLoansViewTable');
    const btnGrid = document.getElementById('btnLoansViewGrid');
    const tableContainer = document.getElementById('loansTableViewContainer');
    const gridContainer = document.getElementById('loansGridViewContainer');

    const isGrid = this.loansPageViewMode === 'grid';
    if (btnTable) {
      btnTable.classList.toggle('btn-primary', !isGrid);
      btnTable.classList.toggle('btn-secondary', isGrid);
    }
    if (btnGrid) {
      btnGrid.classList.toggle('btn-primary', isGrid);
      btnGrid.classList.toggle('btn-secondary', !isGrid);
    }
    if (tableContainer) tableContainer.style.display = isGrid ? 'none' : 'block';
    if (gridContainer) gridContainer.style.display = isGrid ? 'block' : 'none';
  }

  openGiveLoanModal(memberId = null) {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक सदस्यास कर्ज देऊ शकतात', 'error');
      return;
    }

    const select = document.getElementById('giveLoanMemberSelect');
    if (select) {
      select.innerHTML = '<option value="">-- सदस्य निवडा --</option>';
      const activeMembers = window.bishiStore.getMembers().filter(m => m.status === 'active' || m.status === 'completed');
      activeMembers.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.name} (${m.id} • ${m.phone})`;
        if (memberId && m.id === memberId) opt.selected = true;
        select.appendChild(opt);
      });
    }

    const issueWeekInput = document.getElementById('giveLoanIssueWeek');
    if (issueWeekInput) issueWeekInput.value = window.bishiStore.state.meta.currentWeek || 1;

    const issueDateInput = document.getElementById('giveLoanIssueDate');
    if (issueDateInput) issueDateInput.value = new Date().toISOString().split('T')[0];

    const amountInput = document.getElementById('giveLoanAmount');
    if (amountInput) amountInput.value = 10000;

    const notesInput = document.getElementById('giveLoanNotes');
    if (notesInput) notesInput.value = '';

    const upiGroup = document.getElementById('giveLoanUpiGroup');
    if (upiGroup) upiGroup.style.display = 'none';
    const upiInput = document.getElementById('giveLoanUpiId');
    if (upiInput) upiInput.value = '';

    const modeSelect = document.getElementById('giveLoanPaymentMode');
    if (modeSelect) modeSelect.value = 'Cash';

    // Amount preset active state
    document.querySelectorAll('#giveLoanAmountPresets .preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.amount === '10000');
    });

    document.getElementById('giveLoanModal')?.classList.add('active');
  }

  handleGiveLoanSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक सदस्यास कर्ज देऊ शकतात', 'error');
      return;
    }

    const memberId = document.getElementById('giveLoanMemberSelect')?.value;
    if (!memberId) {
      this.showToast('कृपया सदस्य निवडा', 'warning');
      return;
    }

    const principalAmount = Number(document.getElementById('giveLoanAmount')?.value) || 0;
    if (principalAmount <= 0) {
      this.showToast('कृपया वैध कर्ज रक्कम टाका', 'warning');
      return;
    }

    const issueWeek = Number(document.getElementById('giveLoanIssueWeek')?.value) || window.bishiStore.state.meta.currentWeek || 1;
    const issueDate = document.getElementById('giveLoanIssueDate')?.value || new Date().toISOString().split('T')[0];
    const disbursementMode = document.getElementById('giveLoanPaymentMode')?.value || 'Cash';
    const disbursementUpiId = document.getElementById('giveLoanUpiId')?.value || '';
    const notes = document.getElementById('giveLoanNotes')?.value || '';

    const res = window.bishiStore.issueLoan({
      memberId,
      principalAmount,
      issueWeek,
      issueDate,
      disbursementMode,
      disbursementUpiId,
      notes
    });

    if (res.success) {
      document.getElementById('giveLoanModal')?.classList.remove('active');
      this.renderAll();
      this.renderAdminLoansModal();
      this.showToast(res.message, 'success');
      if (res.loan) {
        setTimeout(() => {
          window.receiptManager.showLoanReceiptModal(res.loan.id);
        }, 300);
      }
    } else {
      this.showToast(res.message || 'कर्ज वाटप अयशस्वी', 'error');
    }
  }

  // --- ४-आठवडे कर्ज व्याज जमा मोडल उघडणे (Admin Pay Loan Interest Modal) ---
  openPayLoanInterestModal(loanId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज व्याज जमा नोंदवू शकतात', 'error');
      return;
    }

    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) {
      this.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const details = window.bishiStore.calculateLoanDetails(loan);
    const currency = window.bishiStore.state.meta.currency || '₹';
    const suggestedInterest = details.singleCycleInterestAmount || Math.round(details.principal * 0.03);
    const interestToPay = details.interestAmount > 0 ? details.interestAmount : suggestedInterest;
    const currentCycleNum = (loan.interestPayments ? loan.interestPayments.length : 0) + 1;

    document.getElementById('payLoanInterestLoanId').value = loan.id;
    document.getElementById('payLoanInterestMemberName').textContent = loan.memberName;
    document.getElementById('payLoanInterestMemberMeta').textContent = `${loan.memberId} • कर्ज क्र.: ${loan.id} (वाटप: W${loan.issueWeek || 1} • ${loan.issueDate || '-'})`;
    
    const badge = document.getElementById('payLoanInterestCycleBadge');
    if (badge) {
      if (details.isGracePeriodActive) {
        badge.className = 'status-pill status-paid';
        badge.textContent = `चक्र ${currentCycleNum}: सवलत चालू (आठवडा ${details.nextInterestDueWeek} ला ३% देय)`;
      } else {
        badge.className = 'status-pill status-overdue';
        badge.textContent = `चक्र ${currentCycleNum}: ४ आठवडे पूर्ण (३% देय)`;
      }
    }

    document.getElementById('payLoanInterestAmountDisplay').textContent = `${currency}${interestToPay.toLocaleString('en-IN')}`;
    document.getElementById('payLoanInterestPrincipalDisplay').textContent = `${currency}${details.principal.toLocaleString('en-IN')}`;
    document.getElementById('payLoanInterestLastPaidDisplay').textContent = `आठवडा ${loan.lastInterestPaidWeek || loan.issueWeek || 1} (${loan.lastInterestPaidDate || loan.issueDate || '-'})`;
    
    let durationText = `${details.currentCycleElapsedWeeks} आठवडे `;
    if (details.isGracePeriodActive) {
      durationText += `(🟢 सवलतीत: ${details.remainingGraceWeeks} आठवडे बाकी)`;
    } else {
      durationText += `(⚠️ ४ आठवडे पूर्ण • ३% व्याज देय)`;
    }
    document.getElementById('payLoanInterestDurationDisplay').textContent = durationText;
    document.getElementById('payLoanInterestTotalPaidDisplay').textContent = `${currency}${(loan.totalInterestPaid || 0).toLocaleString('en-IN')}`;

    const amtInput = document.getElementById('payLoanInterestAmountInput');
    if (amtInput) amtInput.value = interestToPay;

    // फक्त ४-आठवड्यांचे पूर्ण सायकल आठवडेच ड्रॉपडाउनमध्ये दाखवा (सर्व आठवडे दाखवू नका)
    const weekSelect = document.getElementById('payLoanInterestWeek');
    if (weekSelect) {
      weekSelect.innerHTML = '';
      const baseWeek = Number(loan.lastInterestPaidWeek || loan.issueWeek || 1);
      const milestoneWeeks = [];
      for (let w = baseWeek + 4; w <= 50; w += 4) {
        milestoneWeeks.push(w);
      }
      if (milestoneWeeks.length === 0 || !milestoneWeeks.includes(details.nextInterestDueWeek)) {
        milestoneWeeks.unshift(details.nextInterestDueWeek);
      }
      const currentWk = Number(window.bishiStore.state.meta.currentWeek || 1);
      if (currentWk >= baseWeek + 4 && !milestoneWeeks.includes(currentWk)) {
        milestoneWeeks.push(currentWk);
        milestoneWeeks.sort((a, b) => a - b);
      }

      milestoneWeeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `आठवडा ${w} (४ आठवडे पूर्ण चक्र)`;
        if (w === details.nextInterestDueWeek || (currentWk >= baseWeek + 4 && w === currentWk)) {
          opt.selected = true;
        }
        weekSelect.appendChild(opt);
      });
    }

    const dateInput = document.getElementById('payLoanInterestDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const modeSelect = document.getElementById('payLoanInterestMode');
    if (modeSelect) modeSelect.value = 'Cash';

    const upiGroup = document.getElementById('payLoanInterestUpiGroup');
    if (upiGroup) upiGroup.style.display = 'none';
    const upiInput = document.getElementById('payLoanInterestUpiId');
    if (upiInput) upiInput.value = '';

    const notesInput = document.getElementById('payLoanInterestNotes');
    if (notesInput) notesInput.value = `४ आठवड्यांचे ३% व्याज जमा (चक्र ${currentCycleNum})`;

    const btnSendReminder = document.getElementById('btnPayLoanModalSendReminder');
    if (btnSendReminder) {
      btnSendReminder.onclick = () => {
        window.receiptManager.sendLoanInterestPendingReminder(loan.id);
      };
    }

    document.getElementById('payLoanInterestModal')?.classList.add('active');
  }

  handlePayLoanInterestSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज व्याज जमा नोंदवू शकतात', 'error');
      return;
    }

    const loanId = document.getElementById('payLoanInterestLoanId')?.value;
    const amount = Number(document.getElementById('payLoanInterestAmountInput')?.value) || 0;
    const paidWeek = Number(document.getElementById('payLoanInterestWeek')?.value) || window.bishiStore.state.meta.currentWeek || 1;
    const paidDate = document.getElementById('payLoanInterestDate')?.value || new Date().toISOString().split('T')[0];
    const paymentMode = document.getElementById('payLoanInterestMode')?.value || 'Cash';
    const upiId = document.getElementById('payLoanInterestUpiId')?.value || '';
    const notes = document.getElementById('payLoanInterestNotes')?.value || '';

    if (amount <= 0) {
      this.showToast('कृपया योग्य व्याज रक्कम टाका', 'warning');
      return;
    }

    const res = window.bishiStore.payLoanInterest(loanId, {
      amount,
      paidWeek,
      paidDate,
      paymentMode,
      upiId,
      notes
    });

    if (res.success) {
      document.getElementById('payLoanInterestModal')?.classList.remove('active');
      this.renderAll();
      this.renderAdminLoansModal();
      this.showToast(res.message, 'success');
      setTimeout(() => {
        window.receiptManager.showLoanInterestReceiptModal(loanId, res.receiptNo);
      }, 300);
    } else {
      this.showToast(res.message || 'व्याज नोंद अयशस्वी', 'error');
    }
  }

  openMarkLoanPaidModal(loanId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज परतफेड नोंदवू शकतात', 'error');
      return;
    }

    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) {
      this.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const details = window.bishiStore.calculateLoanDetails(loan);
    const currency = window.bishiStore.state.meta.currency || '₹';

    document.getElementById('markLoanPaidId').value = loan.id;
    document.getElementById('markLoanPaidMemberName').textContent = loan.memberName;
    document.getElementById('markLoanPaidMemberMeta').textContent = `${loan.memberId} • कर्ज क्र.: ${loan.id} (वाटप: W${loan.issueWeek || 1} • ${loan.issueDate || '-'})`;
    
    const badgeEl = document.getElementById('markLoanPaidStatusBadge');
    if (badgeEl) {
      if (details.isPartiallyPaid) {
        badgeEl.className = 'status-pill status-overdue';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
        badgeEl.style.color = 'var(--gold-400)';
        badgeEl.style.border = '1px solid rgba(245, 158, 11, 0.35)';
        badgeEl.textContent = `🟠 अंशतः भरले (${currency}${details.remainingPrincipal.toLocaleString('en-IN')} बाकी - Pending)`;
      } else {
        badgeEl.className = 'status-pill status-overdue';
        badgeEl.style.background = '';
        badgeEl.style.color = '';
        badgeEl.style.border = '';
        badgeEl.textContent = '🔴 कर्ज बाकी (Pending)';
      }
    }

    document.getElementById('markLoanPaidTotalDisplay').textContent = `${currency}${details.totalPayable.toLocaleString('en-IN')}`;
    document.getElementById('markLoanPaidPrincipalDisplay').textContent = `${currency}${details.remainingPrincipal.toLocaleString('en-IN')}`;
    
    const origDisplay = document.getElementById('markLoanPaidOriginalDisplay');
    if (origDisplay) {
      origDisplay.textContent = `${currency}${details.originalPrincipal.toLocaleString('en-IN')}${details.principalRepaid > 0 ? ` (भरलेली मुद्दल: ${currency}${details.principalRepaid.toLocaleString('en-IN')})` : ''}`;
    }

    let durationText = `${details.elapsedWeeks} आठवडे (${details.daysElapsed} दिवस) `;
    if (details.isGracePeriodActive) {
      durationText += `(🟢 ०% सवलतीत: ${details.remainingGraceWeeks} आठवडे बाकी)`;
    } else {
      durationText += `(⚠️ ४ आठवड्यांच्या पुढे)`;
    }
    document.getElementById('markLoanPaidDurationDisplay').textContent = durationText;

    if (details.interestAmount > 0) {
      document.getElementById('markLoanPaidInterestDisplay').textContent = `+${currency}${details.interestAmount.toLocaleString('en-IN')} (३% व्याज)`;
    } else {
      document.getElementById('markLoanPaidInterestDisplay').textContent = `₹० (०% सवलतीत)`;
    }

    const amtInput = document.getElementById('markLoanPaidAmountInput');
    if (amtInput) amtInput.value = details.totalPayable;

    const intInput = document.getElementById('markLoanPaidInterestInput');
    if (intInput) intInput.value = details.interestAmount;

    // जलद निवड (Quick Presets) बटणे जोडणे
    const halfBtn = document.getElementById('btnMarkLoanPayHalf');
    if (halfBtn) {
      const halfPrinc = Math.round(details.remainingPrincipal / 2);
      halfBtn.textContent = `🌓 ५०% अर्धे फेड (${currency}${halfPrinc.toLocaleString('en-IN')})`;
      halfBtn.onclick = () => {
        const intVal = Number(document.getElementById('markLoanPaidInterestInput')?.value) || 0;
        if (amtInput) amtInput.value = halfPrinc + intVal;
        updateRemainingPreview();
      };
    }

    const fullBtn = document.getElementById('btnMarkLoanPayFull');
    if (fullBtn) {
      fullBtn.textContent = `💯 १००% पूर्ण फेड (${currency}${details.totalPayable.toLocaleString('en-IN')})`;
      fullBtn.onclick = () => {
        const intVal = Number(document.getElementById('markLoanPaidInterestInput')?.value) || 0;
        if (amtInput) amtInput.value = details.remainingPrincipal + intVal;
        updateRemainingPreview();
      };
    }

    const updateRemainingPreview = () => {
      const a = Number(amtInput?.value) || 0;
      const intVal = Number(document.getElementById('markLoanPaidInterestInput')?.value) || 0;
      const princPaid = Math.max(0, a - intVal);
      const remAfter = Math.max(0, details.remainingPrincipal - princPaid);
      const prevVal = document.getElementById('markLoanPaidRemainingPreviewVal');
      const dispTotal = document.getElementById('markLoanPaidTotalDisplay');
      if (dispTotal) dispTotal.textContent = `${currency}${a.toLocaleString('en-IN')}`;
      if (prevVal) {
        if (remAfter <= 0) {
          prevVal.innerHTML = `<span style="color: var(--emerald-400); font-weight: 800;">₹० (✅ पूर्ण फेड होईल - Paid)</span>`;
        } else {
          prevVal.innerHTML = `<span style="color: var(--gold-400); font-weight: 800;">${currency}${remAfter.toLocaleString('en-IN')} बाकी (🔴 कर्ज बाकी - Pending)</span>`;
        }
      }
    };
    this._updateMarkLoanPaidRemaining = updateRemainingPreview;
    updateRemainingPreview();

    const weekInput = document.getElementById('markLoanPaidWeek');
    if (weekInput) weekInput.value = window.bishiStore.state.meta.currentWeek || 1;

    const dateInput = document.getElementById('markLoanPaidDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const modeSelect = document.getElementById('markLoanPaidMode');
    if (modeSelect) modeSelect.value = 'Cash';

    const upiGroup = document.getElementById('markLoanPaidUpiGroup');
    if (upiGroup) upiGroup.style.display = 'none';
    const upiInput = document.getElementById('markLoanPaidUpiId');
    if (upiInput) upiInput.value = '';

    const notesInput = document.getElementById('markLoanPaidNotes');
    if (notesInput) notesInput.value = '';

    document.getElementById('markLoanPaidModal')?.classList.add('active');
  }

  handleMarkLoanPaidSubmit(e) {
    e.preventDefault();
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज परतफेड नोंदवू शकतात', 'error');
      return;
    }

    const loanId = document.getElementById('markLoanPaidId')?.value;
    const repaidAmount = Number(document.getElementById('markLoanPaidAmountInput')?.value) || 0;
    const interestAmount = Number(document.getElementById('markLoanPaidInterestInput')?.value) || 0;
    const paidWeek = Number(document.getElementById('markLoanPaidWeek')?.value) || window.bishiStore.state.meta.currentWeek || 1;
    const paidDate = document.getElementById('markLoanPaidDate')?.value || new Date().toISOString().split('T')[0];
    const paymentMode = document.getElementById('markLoanPaidMode')?.value || 'Cash';
    const upiId = document.getElementById('markLoanPaidUpiId')?.value || '';
    const notes = document.getElementById('markLoanPaidNotes')?.value || '';

    const res = window.bishiStore.markLoanPaid(loanId, {
      repaidAmount,
      interestAmount,
      paidWeek,
      paidDate,
      paymentMode,
      upiId,
      notes
    });

    if (res.success) {
      document.getElementById('markLoanPaidModal')?.classList.remove('active');
      this.renderAll();
      this.renderAdminLoansModal();
      this.showToast(res.message, 'success');
      setTimeout(() => {
        window.receiptManager.showLoanReceiptModal(loanId);
      }, 300);
    } else {
      this.showToast(res.message || 'परतफेड नोंद अयशस्वी', 'error');
    }
  }

  handleCancelLoan(loanId) {
    if (!window.authManager.isAdmin()) {
      this.showToast('केवळ प्रशासक कर्ज रद्द करू शकतात', 'error');
      return;
    }

    if (confirm(`खात्री करा: कर्ज ${loanId} ची नोंद सिस्टममधून काढून टाकायची आहे का?`)) {
      const res = window.bishiStore.cancelLoan(loanId);
      if (res.success) {
        this.renderAll();
        this.renderAdminLoansModal();
        if (typeof this.renderLoansPage === 'function') {
          this.renderLoansPage();
        }
        this.showToast(res.message, 'success');
      } else {
        this.showToast(res.message || 'रद्द करता आले नाही', 'error');
      }
    }
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
        this.setFilter(btn.dataset.filter);
      });
    });

    // पूर्ण झालेले सदस्य पहा बटण
    document.getElementById('btnFilterCompletedMembers')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.filterCompletedMembers();
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

    // सदस्य कर्ज व्यवस्थापन मोडल (प्रशासक)
    document.getElementById('btnOpenAdminLoans')?.addEventListener('click', () => {
      this.openAdminLoansModal();
    });

    document.getElementById('btnOpenGiveLoanModal')?.addEventListener('click', () => {
      this.openGiveLoanModal();
    });

    document.getElementById('btnExportLoansCSV')?.addEventListener('click', () => {
      window.exportManager.exportLoansCSV();
    });

    document.getElementById('adminLoansSearchInput')?.addEventListener('input', () => {
      this.renderAdminLoansModal();
    });

    document.getElementById('adminLoansStatusFilter')?.addEventListener('change', () => {
      this.renderAdminLoansModal();
    });

    // स्वतंत्र कर्ज व्यवस्थापन पेज सर्च व स्टेटस फिल्टर
    document.getElementById('loansPageSearchInput')?.addEventListener('input', () => {
      this.renderLoansPage();
    });

    document.getElementById('loansPageStatusFilter')?.addEventListener('change', () => {
      this.renderLoansPage();
    });

    // कर्ज खातावही पेज: व्ह्यू स्विचर (टेबल / कार्ड्स)
    document.getElementById('btnLoansViewTable')?.addEventListener('click', () => {
      this.loansPageViewMode = 'table';
      this.updateLoansViewModeUi();
    });

    document.getElementById('btnLoansViewGrid')?.addEventListener('click', () => {
      this.loansPageViewMode = 'grid';
      this.updateLoansViewModeUi();
    });

    // सर्व सदस्य डेटा पेज: सर्च इनपुट
    document.getElementById('membersPageSearchInput')?.addEventListener('input', (e) => {
      this.membersPageSearchQuery = e.target.value;
      this.renderMembersPage();
    });

    // सर्व सदस्य डेटा पेज: फिल्टर बटणे
    document.querySelectorAll('[data-mp-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mp-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.membersPageFilter = btn.getAttribute('data-mp-filter') || 'all';
        this.renderMembersPage();
      });
    });

    // सर्व सदस्य डेटा पेज: व्ह्यू स्विचर (टेबल / कार्ड्स)
    const btnMpTable = document.getElementById('btnMpViewTable');
    const btnMpGrid = document.getElementById('btnMpViewGrid');
    const mpTableContainer = document.getElementById('mpTableViewContainer');
    const mpGridContainer = document.getElementById('mpGridViewContainer');

    btnMpTable?.addEventListener('click', () => {
      this.membersPageViewMode = 'table';
      btnMpTable.classList.add('btn-primary');
      btnMpTable.classList.remove('btn-secondary');
      btnMpGrid?.classList.add('btn-secondary');
      btnMpGrid?.classList.remove('btn-primary');
      if (mpTableContainer) mpTableContainer.style.display = 'block';
      if (mpGridContainer) mpGridContainer.style.display = 'none';
    });

    btnMpGrid?.addEventListener('click', () => {
      this.membersPageViewMode = 'grid';
      btnMpGrid.classList.add('btn-primary');
      btnMpGrid.classList.remove('btn-secondary');
      btnMpTable?.classList.add('btn-secondary');
      btnMpTable?.classList.remove('btn-primary');
      if (mpTableContainer) mpTableContainer.style.display = 'none';
      if (mpGridContainer) mpGridContainer.style.display = 'block';
    });

    // Hash change router (उदा. #loans, #members किंवा #dashboard)
    window.addEventListener('hashchange', () => {
      if (window.authManager && window.authManager.isAdmin()) {
        if (window.location.hash === '#loans') {
          this.navigateToLoansPage();
        } else if (window.location.hash === '#members') {
          this.navigateToMembersPage();
        } else if (window.location.hash === '#dashboard' || !window.location.hash) {
          this.navigateToDashboard();
        }
      }
    });

    // कर्ज देणे फॉर्म व प्रीसेट्स
    document.querySelectorAll('#giveLoanAmountPresets .preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#giveLoanAmountPresets .preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const input = document.getElementById('giveLoanAmount');
        if (input) input.value = btn.dataset.amount;
      });
    });

    document.getElementById('giveLoanPaymentMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('giveLoanUpiGroup');
      const upiInput = document.getElementById('giveLoanUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    document.getElementById('giveLoanForm')?.addEventListener('submit', (e) => this.handleGiveLoanSubmit(e));

    // कर्ज परतफेड फॉर्म
    document.getElementById('markLoanPaidMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('markLoanPaidUpiGroup');
      const upiInput = document.getElementById('markLoanPaidUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    const markAmtIn = document.getElementById('markLoanPaidAmountInput');
    const markIntIn = document.getElementById('markLoanPaidInterestInput');
    const updateMarkDisplay = () => {
      const a = Number(markAmtIn?.value) || 0;
      const currency = window.bishiStore.state.meta.currency || '₹';
      const disp = document.getElementById('markLoanPaidTotalDisplay');
      if (disp) disp.textContent = `${currency}${a.toLocaleString('en-IN')}`;
      if (typeof this._updateMarkLoanPaidRemaining === 'function') {
        this._updateMarkLoanPaidRemaining();
      }
    };
    markAmtIn?.addEventListener('input', updateMarkDisplay);
    markIntIn?.addEventListener('input', updateMarkDisplay);

    document.getElementById('markLoanPaidForm')?.addEventListener('submit', (e) => this.handleMarkLoanPaidSubmit(e));

    // ४-आठवडे कर्ज व्याज जमा फॉर्म
    document.getElementById('payLoanInterestMode')?.addEventListener('change', (e) => {
      const isUpi = e.target.value.toLowerCase().includes('upi');
      const upiGroup = document.getElementById('payLoanInterestUpiGroup');
      const upiInput = document.getElementById('payLoanInterestUpiId');
      if (upiGroup) upiGroup.style.display = isUpi ? 'block' : 'none';
      if (upiInput) upiInput.required = isUpi;
    });

    document.getElementById('payLoanInterestAmountInput')?.addEventListener('input', (e) => {
      const a = Number(e.target.value) || 0;
      const currency = window.bishiStore.state.meta.currency || '₹';
      const disp = document.getElementById('payLoanInterestAmountDisplay');
      if (disp) disp.textContent = `${currency}${a.toLocaleString('en-IN')}`;
    });

    document.getElementById('payLoanInterestForm')?.addEventListener('submit', (e) => this.handlePayLoanInterestSubmit(e));

    // आठवडा बदल बटणे (मुख्य डॅशबोर्ड)
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

    // आठवडा बदल बटणे (कर्ज खातावही पेज)
    document.getElementById('btnPrevWeekLoans')?.addEventListener('click', () => {
      const cur = window.bishiStore.state.meta.currentWeek;
      if (cur > 1) {
        window.bishiStore.setCurrentWeek(cur - 1);
        this.renderAll();
        this.renderLoansPage();
      }
    });

    document.getElementById('btnNextWeekLoans')?.addEventListener('click', () => {
      const cur = window.bishiStore.state.meta.currentWeek;
      if (cur < 50) {
        window.bishiStore.setCurrentWeek(cur + 1);
        this.renderAll();
        this.renderLoansPage();
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
      const startDate = document.getElementById('adminPanelStartDate')?.value;
      const defaultFineAmount = Number(document.getElementById('adminPanelDefaultFine').value) || 0;
      const maturityInterestPercent = Number(document.getElementById('adminPanelMaturityInterest')?.value) || 8;
      const currency = document.getElementById('adminPanelCurrency').value;

      window.bishiStore.updateSettings({
        bishiName,
        startDate,
        defaultFineAmount,
        maturityInterestPercent,
        currency
      });

      this.showToast('बीशी नियम, सुरू तारीख, दंड दर व मॅच्युरिटी व्याज जतन झाले!', 'success');
      document.getElementById('adminSettingsModal')?.classList.remove('active');
      this.renderAll();
    });

    // मोडल व मोबाईल ड्रॉवर बंद करणे (Universal Delegated Modal & Drawer Close)
    document.addEventListener('click', (e) => {
      // ड्रॉवर क्लोज बटण किंवा ड्रॉवर ओव्हरले
      if (e.target.closest('#btnMobileDrawerClose, .drawer-close-btn, #mobileNavDrawerOverlay')) {
        e.preventDefault();
        e.stopPropagation();
        this.closeMobileDrawer();
        return;
      }

      const closeBtn = e.target.closest('.modal-close, [data-modal-close], .btn-close');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const drawer = closeBtn.closest('.mobile-nav-drawer');
        if (drawer) {
          this.closeMobileDrawer();
          return;
        }
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
      if (e.target.id === 'mobileNavDrawerOverlay') {
        this.closeMobileDrawer();
      }
    }, true);

    // Keyboard 'Escape' की दाबल्यावर मोडल किंवा ड्रॉवर बंद करणे
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        this.closeAllModals();
        this.closeMobileDrawer();
      }
    });

    // थेट मोबाईल ड्रॉवर बटण इव्हेंट बाईंडिंग
    document.getElementById('btnMobileDrawerClose')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMobileDrawer();
    });

    document.getElementById('mobileNavDrawerOverlay')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeMobileDrawer();
    });

    // ग्लोबल फंक्शन बाईंडिंग
    window.closeAllModals = () => this.closeAllModals();
    window.closeMobileDrawer = () => this.closeMobileDrawer();

    // थीम व्यवस्थापन: डिफॉल्ट लाईट थीम सक्तीने लागू करणे (Default Light Theme)
    try {
      localStorage.removeItem('sukhakarta_theme'); // जुना डार्क की नष्ट करा
    } catch (e) {}

    const savedTheme = localStorage.getItem('sukhakarta_theme_v2') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const toggleThemeHandler = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('sukhakarta_theme_v2', nextTheme);
      if (typeof this.showToast === 'function') {
        this.showToast(nextTheme === 'light' ? '☀️ लाईट थीम सक्रिय झाली' : '🌙 डार्क थीम सक्रिय झाली', 'info');
      }
    };

    document.getElementById('themeToggleBtn')?.addEventListener('click', toggleThemeHandler);
    document.getElementById('mobileThemeToggleBtn')?.addEventListener('click', toggleThemeHandler);

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
