/**
 * ==========================================================================
 * सुखकर्ता बीशी - PRODUCTION DATABASE & STATE MANAGEMENT ENGINE
 * (५०-आठवडे बचत, हप्ता खातावही, मॅच्युरिटी परतावा व लेट फी इंजिन)
 * ==========================================================================
 */

const STORAGE_KEY = 'sukhakarta_bishi_live_v1';

// डिफॉल्ट स्वच्छ डेटाबेस संरचना (Zero Dummy Data - Clean Slate)
const defaultState = {
  meta: {
    bishiName: 'सुखकर्ता बीशी',
    subtitle: '५०-आठवडे बचत व फंड व्यवस्थापन',
    currency: '₹',
    totalWeeks: 50,
    currentWeek: 1,
    defaultFineAmount: 50, // थकबाकी हप्ता नियमित दंड (₹)
    maturityInterestPercent: 8, // ५० आठवडे पूर्ण झाल्यावर एकूण बचतीवर ८% मॅच्युरिटी व्याज
    autoApplyFine: true,
    startDate: new Date().toISOString().split('T')[0],
    lastUpdated: Date.now(),
    updateVersion: 1
  },
  members: [],
  settledMembers: [],
  transactions: []
};

class BishiStore {
  constructor() {
    this.cleanLegacyStorageKeys();
    this.state = this.loadState();
    this.ensureIntegrity();
  }

  // जुन्या चाचणी कीज स्वच्छ करणे (Purge Old Dummy Keys)
  cleanLegacyStorageKeys() {
    try {
      const oldKeys = [
        'sukhakarta_bishi_production_v1',
        'sukhakarta_bishi_db_clean_v2',
        'sukhakarta_bishi_db_v2',
        'sukhakarta_bishi_state_v1',
        'sukhakarta_bishi_state'
      ];
      oldKeys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }

  // डेटाबेस इंटिग्रिटी तपासणी व दुरुस्ती
  ensureIntegrity() {
    if (!this.state || typeof this.state !== 'object') {
      this.state = JSON.parse(JSON.stringify(defaultState));
    }
    if (!this.state.meta) {
      this.state.meta = JSON.parse(JSON.stringify(defaultState.meta));
    }
    if (!Array.isArray(this.state.members)) {
      this.state.members = [];
    }
    if (!Array.isArray(this.state.settledMembers)) {
      this.state.settledMembers = [];
    }
    if (!Array.isArray(this.state.transactions)) {
      this.state.transactions = [];
    }
    if (this.state.meta.defaultFineAmount === undefined) {
      this.state.meta.defaultFineAmount = 50;
    }
    if (this.state.meta.maturityInterestPercent === undefined) {
      this.state.meta.maturityInterestPercent = 8;
    }
    if (!this.state.meta.bishiName) {
      this.state.meta.bishiName = 'सुखकर्ता बीशी';
    }
    if (!this.state.meta.currency) {
      this.state.meta.currency = '₹';
    }
    if (!this.state.meta.lastUpdated) {
      this.state.meta.lastUpdated = Date.now();
    }
    if (!this.state.meta.updateVersion) {
      this.state.meta.updateVersion = 1;
    }
  }

  // स्थानिक स्टोरेजमधून डेटा लोड करणे
  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed && typeof parsed === 'object' && parsed.meta) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  // स्थानिक सेव्ह (Local Only)
  saveStateLocalOnly() {
    try {
      if (!this.state.meta) this.state.meta = {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  // संपूर्ण सेव्ह व क्लाउड ऑटो-सिंक (Local + Cloud Auto Sync)
  saveState() {
    if (!this.state.meta) this.state.meta = {};
    this.state.meta.lastUpdated = Date.now();
    this.state.meta.updateVersion = (this.state.meta.updateVersion || 0) + 1;
    this.saveStateLocalOnly();

    // Firebase वर तात्काळ ऑटो-सिंक
    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.saveCurrentStateToCloud === 'function') {
      window.firebaseSyncManager.saveCurrentStateToCloud(true);
    }
  }

  // संपूर्ण डेटा साफ करणे (Clear All Data)
  clearAllData() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.state.meta.lastUpdated = Date.now();
    this.state.meta.updateVersion = (this.state.meta.updateVersion || 0) + 1;
    this.saveState();
  }

  resetAllData() {
    this.clearAllData();
  }

  // ग्रुप सेटिंग्स व नियम बदलणे
  updateSettings(settings) {
    if (settings.bishiName) this.state.meta.bishiName = settings.bishiName.trim();
    if (settings.defaultFineAmount !== undefined) {
      this.state.meta.defaultFineAmount = Math.max(0, Number(settings.defaultFineAmount) || 0);
    }
    if (settings.maturityInterestPercent !== undefined) {
      this.state.meta.maturityInterestPercent = Math.max(0, Number(settings.maturityInterestPercent) || 8);
    }
    if (settings.currency) this.state.meta.currency = settings.currency.trim();
    this.saveState();
    return this.state.meta;
  }

  // ==========================================================================
  // 👥 सदस्य व्यवस्थापन (Member Management Operations)
  // ==========================================================================

  // युनिक सदस्य आयडी जनरेट करणे (उदा. SKB-001)
  generateMemberId() {
    const existingIds = this.state.members.map(m => m.id).concat(this.state.settledMembers.map(s => s.id));
    let num = 1;
    while (existingIds.includes(`SKB-${String(num).padStart(3, '0')}`)) {
      num++;
    }
    return `SKB-${String(num).padStart(3, '0')}`;
  }

  // सर्व सक्रिय सदस्य मिळवणे
  getMembers() {
    return this.state.members || [];
  }

  // विशिष्ट सदस्य आयडीने शोधणे
  getMember(id) {
    if (!id) return null;
    const cleanId = String(id).trim().toUpperCase();
    return this.state.members.find(m => m.id.toUpperCase() === cleanId) || 
           this.state.settledMembers.find(s => s.id.toUpperCase() === cleanId) || null;
  }

  // नवीन सदस्य जोडणे (Add Member)
  addMember(data) {
    if (window.authManager && !window.authManager.isAdmin()) {
      console.warn('Unauthorized attempt to add member: Admin login required');
      return null;
    }

    const memberId = this.generateMemberId();
    const weeklyAmount = Number(data.weeklyAmount) || 1000;
    const startWeek = Number(data.startWeek) || 1;
    const rawPhone = data.phone ? data.phone.trim() : '';
    const defaultPass = rawPhone ? rawPhone.replace(/\D/g, '').slice(-4) || '1234' : '1234';
    const memberPassword = (data.password || '').trim() || defaultPass;

    const newMember = {
      id: memberId,
      name: data.name.trim(),
      phone: rawPhone,
      password: memberPassword,
      weeklyAmount: weeklyAmount,
      startWeek: startWeek,
      nominee: (data.nominee || '').trim(),
      notes: (data.notes || '').trim(),
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      status: 'active',
      currentCycle: 1,
      pastCycles: [],
      payoutStatus: 'pending',
      payoutDetails: null,
      weeks: []
    };

    // ५० आठवड्यांचे वेळापत्रक तयार करणे
    for (let w = 1; w <= 50; w++) {
      newMember.weeks.push({
        weekNumber: w,
        status: w < startWeek ? 'skipped' : 'pending',
        amountPaid: 0,
        finePaid: 0,
        paidDate: null,
        paymentMode: '',
        receiptNo: null,
        notes: ''
      });
    }

    // पहिल्या आठवड्याचा हप्ता त्वरित जमा करणे (संपूर्ण रक्कम निवडलेल्या आठवड्यात जमा करणे)
    if (data.initialDeposit && Number(data.initialDeposit) > 0) {
      const initAmt = Number(data.initialDeposit);
      const currentWk = startWeek;
      const todayStr = new Date().toISOString().split('T')[0];
      const isUpi = (data.paymentMode || '').toLowerCase().includes('upi');
      const upiId = isUpi ? (data.upiId || '').trim() : '';
      const receiptNo = `REC-${memberId}-W${currentWk}-${Date.now().toString().slice(-4)}`;
      const initStatus = initAmt >= weeklyAmount ? 'paid' : (initAmt > 0 ? 'partial' : 'pending');

      newMember.weeks[currentWk - 1] = {
        weekNumber: currentWk,
        status: initStatus,
        amountPaid: initAmt,
        finePaid: 0,
        paidDate: todayStr,
        paymentMode: data.paymentMode || 'Cash',
        upiId: upiId,
        receiptNo: receiptNo,
        notes: initAmt > weeklyAmount ? `नवीन सदस्य प्रवेश हप्ता (अतिरिक्त भरणा: ₹${initAmt - weeklyAmount})` : 'नवीन सदस्य प्रवेश हप्ता'
      };

      this.state.transactions.unshift({
        id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        memberId: memberId,
        memberName: newMember.name,
        cycleNumber: 1,
        weekNumber: currentWk,
        depositAmount: initAmt,
        fineAmount: 0,
        totalAmount: initAmt,
        date: new Date().toISOString(),
        paymentMode: data.paymentMode || 'Cash',
        upiId: upiId,
        receiptNo: receiptNo,
        note: 'नवीन सदस्य प्रारंभिक हप्ता भरणा'
      });
    }

    this.state.members.push(newMember);
    this.saveState();
    return newMember;
  }

  // सदस्य तपशील एडिट करणे (Update Member)
  updateMember(id, updateData) {
    const member = this.getMember(id);
    if (!member) return null;

    if (updateData.name) member.name = updateData.name.trim();
    if (updateData.phone) member.phone = updateData.phone.trim();
    if (updateData.password !== undefined && updateData.password.trim() !== '') {
      member.password = updateData.password.trim();
    }
    if (updateData.nominee !== undefined) member.nominee = updateData.nominee.trim();
    if (updateData.notes !== undefined) member.notes = updateData.notes.trim();

    // साप्ताहिक रक्कम बदलल्यास उर्वरित प्रलंबित आठवड्यांचे अपडेट
    if (updateData.weeklyAmount && Number(updateData.weeklyAmount) !== member.weeklyAmount) {
      member.weeklyAmount = Number(updateData.weeklyAmount);
    }

    this.saveState();
    return member;
  }

  // सदस्य खाते सेटल/रद्द करणे (Remove / Settle Member)
  removeMember(id, refundAmount = null, note = '') {
    const index = this.state.members.findIndex(m => m.id === id);
    if (index === -1) return null;

    const [member] = this.state.members.splice(index, 1);
    member.status = 'settled';
    member.settledDate = new Date().toISOString().split('T')[0];
    member.settlementNote = note;
    member.refundAmount = refundAmount;

    this.state.settledMembers.push(member);

    // सेटलमेंट रिफंड व्यवहार नोंदवणे
    if (refundAmount && Number(refundAmount) > 0) {
      this.state.transactions.unshift({
        id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        memberId: member.id,
        memberName: member.name,
        cycleNumber: member.currentCycle || 1,
        weekNumber: 0,
        depositAmount: -Number(refundAmount),
        fineAmount: 0,
        totalAmount: -Number(refundAmount),
        date: new Date().toISOString(),
        paymentMode: 'Refund',
        receiptNo: `SETTLE-${member.id}`,
        note: `सदस्य खाते सेटलमेंट परतावा: ${note}`
      });
    }

    this.saveState();
    return member;
  }

  // सदस्याचा सर्व भरणा डेटा साफ करणे (Clear / Reset Member Payments Only)
  resetMemberPayments(id) {
    const member = this.getMember(id);
    if (!member) return null;

    const currentWeek = this.state.meta.currentWeek || 1;
    member.weeks = Array.from({ length: 50 }, (_, i) => ({
      weekNumber: i + 1,
      status: (i + 1) < currentWeek ? 'overdue' : 'pending',
      amountPaid: 0,
      finePaid: 0,
      paidDate: null,
      paymentMode: '',
      receiptNo: null,
      notes: ''
    }));

    member.currentCycle = 1;
    member.status = 'active';
    delete member.payoutStatus;
    delete member.payoutDetails;
    member.pastCycles = [];

    // या सदस्याचे सर्व व्यवहार काढून टाकणे
    this.state.transactions = (this.state.transactions || []).filter(t => t.memberId !== id);

    this.saveState();
    return member;
  }

  // सदस्य व त्यांचे सर्व रेकॉर्ड्स कायमचे डिलीट करणे (Delete Member Completely from Website & Database)
  deleteMemberPermanently(id) {
    if (!id) return false;
    const cleanId = String(id).trim().toUpperCase();
    const memIndex = this.state.members.findIndex(m => m.id.toUpperCase() === cleanId);
    let removedMember = null;

    if (memIndex !== -1) {
      [removedMember] = this.state.members.splice(memIndex, 1);
    }

    const settledIndex = this.state.settledMembers.findIndex(s => s.id.toUpperCase() === cleanId);
    if (settledIndex !== -1) {
      if (!removedMember) [removedMember] = this.state.settledMembers.splice(settledIndex, 1);
      else this.state.settledMembers.splice(settledIndex, 1);
    }

    // व्यवहार खातावहीमधून सर्व नोंदी काढून टाकणे
    this.state.transactions = (this.state.transactions || []).filter(t => (t.memberId || '').toUpperCase() !== cleanId);

    this.saveState();
    return removedMember || true;
  }

  // सर्व सदस्यांचे केवळ पेमेंट व व्यवहार साफ करणे (Clear Payments for all members)
  clearAllPaymentsOnly() {
    const currentWeek = this.state.meta.currentWeek || 1;
    (this.state.members || []).forEach(member => {
      member.weeks = Array.from({ length: 50 }, (_, i) => ({
        weekNumber: i + 1,
        status: (i + 1) < currentWeek ? 'overdue' : 'pending',
        amountPaid: 0,
        finePaid: 0,
        paidDate: null,
        paymentMode: '',
        receiptNo: null,
        notes: ''
      }));
      member.currentCycle = 1;
      member.status = 'active';
      delete member.payoutStatus;
      delete member.payoutDetails;
      member.pastCycles = [];
    });

    this.state.transactions = [];
    this.state.settledMembers = [];
    this.saveState();
    return true;
  }

  // ==========================================================================
  // 💰 पेमेंट व हप्ता खातावही (Payment & Transaction Operations)
  // ==========================================================================

  // साप्ताहिक हप्ता जमा करणे (Record Payment - Multi-week rollover supported)
  // साप्ताहिक हप्ता जमा करणे (Record Payment - records full deposit amount to the chosen week)
  recordPayment(memberId, weekNumber, depositAmount = null, paymentMode = 'Cash', note = '', fineAmount = 0, upiId = '') {
    const member = this.getMember(memberId);
    if (!member) return null;

    const targetWeekNum = Number(weekNumber);
    const startWeekIndex = member.weeks.findIndex(w => w.weekNumber === targetWeekNum);
    if (startWeekIndex === -1) return null;

    const weeklyAmount = Number(member.weeklyAmount) || 1000;
    const currentPaid = Number(member.weeks[startWeekIndex].amountPaid) || 0;
    let inputDeposit = depositAmount !== null ? Math.max(0, Number(depositAmount)) : weeklyAmount;
    
    // If the week already had a partial payment and input is an incremental payment:
    let finalDeposit = inputDeposit;
    if (currentPaid > 0 && currentPaid < weeklyAmount && inputDeposit < weeklyAmount && (currentPaid + inputDeposit <= weeklyAmount)) {
      finalDeposit = currentPaid + inputDeposit;
    }

    const actualFine = Number(fineAmount) || 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const cleanUpiId = (paymentMode || '').toLowerCase().includes('upi') ? (upiId || '').trim() : '';

    const primaryReceiptNo = `REC-${member.id}-W${targetWeekNum}-${Date.now().toString().slice(-4)}`;

    const weekStatus = finalDeposit >= weeklyAmount ? 'paid' : (finalDeposit > 0 ? 'partial' : 'pending');

    member.weeks[startWeekIndex] = {
      weekNumber: targetWeekNum,
      status: weekStatus,
      amountPaid: finalDeposit,
      finePaid: actualFine,
      paidDate: todayStr,
      paymentMode: paymentMode,
      upiId: cleanUpiId,
      receiptNo: primaryReceiptNo,
      notes: note
    };

    const isExtra = finalDeposit > weeklyAmount;
    const primaryTxn = {
      id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      memberId: member.id,
      memberName: member.name,
      cycleNumber: member.currentCycle || 1,
      weekNumber: targetWeekNum,
      depositAmount: inputDeposit,
      fineAmount: actualFine,
      totalAmount: inputDeposit + actualFine,
      date: new Date().toISOString(),
      paymentMode: paymentMode,
      upiId: cleanUpiId,
      receiptNo: primaryReceiptNo,
      note: note || (isExtra ? `साप्ताहिक हप्ता (एकूण भरणा: ₹${finalDeposit.toLocaleString('en-IN')} • +₹${(finalDeposit - weeklyAmount).toLocaleString('en-IN')} अतिरिक्त)` : 'साप्ताहिक हप्ता')
    };
    this.state.transactions.unshift(primaryTxn);

    // ५० आठवडे पूर्ण झाले का तपासणे
    const wasCompletedBefore = member.status === 'completed';
    const stats = this.calculateMemberStats(member);
    const isJustCompleted = stats.isFullyPaid && !wasCompletedBefore;
    if (stats.isFullyPaid) {
      member.status = 'completed';
    }

    this.saveState();
    return {
      member,
      week: member.weeks[startWeekIndex],
      paidWeeks: [member.weeks[startWeekIndex]],
      weeksPaidCount: 1,
      transaction: primaryTxn,
      transactions: [primaryTxn],
      stats,
      isJustCompleted,
      isFullyPaid: stats.isFullyPaid
    };
  }

  // उर्वरित सर्व आठवड्यांचे एकरकमी पेमेंट (Bulk Pay All Remaining Weeks - records full lump sum on this week only)
  recordBulkPayment(memberId, paymentMode = 'Cash', upiId = '', note = '', targetWeekNum = null) {
    const member = this.getMember(memberId);
    if (!member) return null;

    const unpaidWeeks = member.weeks.filter(w => w.status !== 'paid' && w.status !== 'skipped');
    if (unpaidWeeks.length === 0) return null;

    const currentStats = this.calculateMemberStats(member);
    const targetWeek = targetWeekNum ? Math.max(1, Math.min(50, Number(targetWeekNum))) : (this.state.meta.currentWeek || 1);
    let targetWeekIndex = member.weeks.findIndex(w => w.weekNumber === targetWeek);
    if (targetWeekIndex === -1) targetWeekIndex = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const cleanUpiId = (paymentMode || '').toLowerCase().includes('upi') ? (upiId || '').trim() : '';
    
    // उर्वरित बाकी मूळ बचत रक्कम गणना
    const totalBulkDeposit = currentStats.remainingAmount > 0 
      ? currentStats.remainingAmount 
      : unpaidWeeks.reduce((sum, wk) => sum + Math.max(0, member.weeklyAmount - (Number(wk.amountPaid) || 0)), 0);

    const primaryReceiptNo = `REC-${member.id}-W${targetWeek}-BULK-${Date.now().toString().slice(-4)}`;
    const unpaidCount = unpaidWeeks.length;

    // १. ज्या आठवड्यात पेमेंट भरले आहे (चालू/निवडलेला आठवडा) त्यावर संपूर्ण एकरकमी ठेव नोंदवणे
    const currentPaidOnTarget = Number(member.weeks[targetWeekIndex].amountPaid || 0);
    const finalPaidOnTarget = currentPaidOnTarget + totalBulkDeposit;

    member.weeks[targetWeekIndex] = {
      weekNumber: targetWeek,
      status: 'paid',
      amountPaid: finalPaidOnTarget,
      finePaid: 0,
      paidDate: todayStr,
      paymentMode: paymentMode,
      upiId: cleanUpiId,
      receiptNo: primaryReceiptNo,
      notes: note ? `एकरकमी भरणा: ${note}` : `उर्वरित सर्व ${unpaidCount} आठवड्यांचा एकरकमी भरणा (एकूण ठेव: ₹${totalBulkDeposit.toLocaleString('en-IN')})`
    };

    // २. उर्वरित इतर सर्व आठवडे 'paid / cleared' म्हणून मार्क करणे (मात्र स्वतंत्र डुप्लिकेट रक्कम न दाखवता ० ठेवणे)
    unpaidWeeks.forEach(wk => {
      if (wk.weekNumber !== targetWeek) {
        const weekIndex = member.weeks.findIndex(w => w.weekNumber === wk.weekNumber);
        if (weekIndex !== -1) {
          member.weeks[weekIndex] = {
            weekNumber: wk.weekNumber,
            status: 'paid',
            amountPaid: 0,
            finePaid: 0,
            paidDate: todayStr,
            paymentMode: paymentMode,
            upiId: cleanUpiId,
            receiptNo: primaryReceiptNo,
            notes: `आठवडा ${targetWeek} च्या एकरकमी भरण्यातून क्लिअर`
          };
        }
      }
    });

    // ३. खातावहीत केवळ १ अधिकृत मुख्य व्यवहार नोंदवणे (सर्व आठवड्यांचे स्वतंत्र व्यवहार न बनवता)
    const singleBulkTxn = {
      id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      memberId: member.id,
      memberName: member.name,
      cycleNumber: member.currentCycle || 1,
      weekNumber: targetWeek,
      depositAmount: totalBulkDeposit,
      fineAmount: 0,
      totalAmount: totalBulkDeposit,
      date: new Date().toISOString(),
      paymentMode: paymentMode,
      upiId: cleanUpiId,
      receiptNo: primaryReceiptNo,
      note: note || `उर्वरित सर्व ${unpaidCount} आठवडे एकरकमी भरणा (आठवडा ${targetWeek} मध्ये एकूण जमा: ₹${totalBulkDeposit.toLocaleString('en-IN')})`
    };
    this.state.transactions.unshift(singleBulkTxn);

    member.status = 'completed';
    const stats = this.calculateMemberStats(member);
    this.saveState();

    return {
      member,
      targetWeek,
      paidWeeks: [member.weeks[targetWeekIndex]],
      totalLumpSumDeposit: totalBulkDeposit,
      totalDeposit: totalBulkDeposit,
      unpaidWeeksCount: unpaidCount,
      weeksCount: unpaidCount,
      transaction: singleBulkTxn,
      transactions: [singleBulkTxn],
      stats,
      isFullyPaid: true
    };
  }

  // पेमेंट रद्द करणे (Undo Payment)
  removePayment(memberId, weekNumber) {
    const member = this.getMember(memberId);
    if (!member) return false;

    const weekIndex = member.weeks.findIndex(w => w.weekNumber === Number(weekNumber));
    if (weekIndex === -1) return false;

    const currentWeek = this.state.meta.currentWeek || 1;
    member.weeks[weekIndex] = {
      weekNumber: Number(weekNumber),
      status: Number(weekNumber) < currentWeek ? 'overdue' : 'pending',
      amountPaid: 0,
      finePaid: 0,
      paidDate: null,
      paymentMode: '',
      receiptNo: null,
      notes: ''
    };

    // जर या आठवड्यातून इतर आठवडे क्लिअर झाले असतील तर तेही पूर्ववत करणे
    member.weeks.forEach((w, idx) => {
      if (w.notes && w.notes.includes(`आठवडा ${weekNumber} च्या एकरकमी भरण्यातून क्लिअर`)) {
        member.weeks[idx] = {
          weekNumber: w.weekNumber,
          status: w.weekNumber < currentWeek ? 'overdue' : 'pending',
          amountPaid: 0,
          finePaid: 0,
          paidDate: null,
          paymentMode: '',
          receiptNo: null,
          notes: ''
        };
      }
    });

    if (member.status === 'completed') {
      member.status = 'active';
    }

    // व्यवहार खातावहीमधून काढून टाकणे
    this.state.transactions = this.state.transactions.filter(
      t => !(t.memberId === memberId && t.weekNumber === Number(weekNumber))
    );

    this.saveState();
    return true;
  }

  // ==========================================================================
  // 🏆 ५०-आठवडे मॅच्युरिटी परतावा व नवीन सायकल रीस्टार्ट (Payout & Multi-Cycle)
  // ==========================================================================

  // ५०-आठवडे परतावा वाटप नोंदवणे (Complete Maturity Payout)
  completePayout(memberId, payoutAmount = null, payoutMode = 'Bank Transfer', reference = '', notes = '') {
    // जर जुन्या सिग्नेचरनुसार पॅरामीटर्स आले असतील (memberId, payoutMode, upiId, notes) तर हाताळणे
    if (typeof payoutAmount === 'string') {
      notes = reference || '';
      reference = payoutMode || '';
      payoutMode = payoutAmount;
      payoutAmount = null;
    }

    const member = this.getMember(memberId);
    if (!member) return null;

    const stats = this.calculateMemberStats(member);
    if (!stats.isFullyPaid) return null;

    const finalPayoutAmount = (typeof payoutAmount === 'number' && payoutAmount > 0) ? payoutAmount : stats.maturityTotalPayout;
    const todayStr = new Date().toISOString().split('T')[0];
    const cycleNum = member.currentCycle || 1;
    const voucherNo = `PAYOUT-${member.id}-C${cycleNum}-${Date.now().toString().slice(-4)}`;

    member.payoutStatus = 'completed';
    member.payoutDetails = {
      voucherNo: voucherNo,
      receiptNo: voucherNo,
      payoutDate: todayStr,
      date: todayStr,
      payoutMode: payoutMode || 'Cash',
      paymentMode: payoutMode || 'Cash',
      upiId: reference || '',
      reference: reference || '',
      savingsAmount: stats.totalDeposited,
      interestAmount: stats.interestAmount,
      interestBonus: stats.interestAmount,
      interestPercent: stats.maturityInterestPercent,
      totalPayoutAmount: finalPayoutAmount,
      amount: finalPayoutAmount,
      notes: notes || '५०-आठवडे मॅच्युरिटी परतावा (+८% व्याज)'
    };

    // परतावा वाटप व्यवहार खातावहीत नोंदवणे
    this.state.transactions.unshift({
      id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      memberId: member.id,
      memberName: member.name,
      cycleNumber: member.currentCycle || 1,
      weekNumber: 50,
      depositAmount: 0,
      payoutAmount: finalPayoutAmount,
      totalAmount: finalPayoutAmount,
      date: new Date().toISOString(),
      paymentMode: payoutMode || 'Cash',
      upiId: reference || '',
      receiptNo: voucherNo,
      note: `५०-आठवडे मॅच्युरिटी परतावा वाटप (+${stats.maturityInterestPercent}% व्याज = ₹${finalPayoutAmount.toLocaleString('en-IN')})`
    });

    this.saveState();
    return { member, payoutDetails: member.payoutDetails, stats };
  }

  // परतावा वाटप रद्द करणे (Undo Payout)
  undoPayout(memberId) {
    const member = this.getMember(memberId);
    if (!member) return false;

    member.payoutStatus = 'pending';
    member.payoutDetails = null;

    this.state.transactions = this.state.transactions.filter(
      t => !(t.memberId === memberId && (
        (t.receiptNo || '').startsWith('VOUCHER-') || 
        (t.receiptNo || '').startsWith('PAYOUT-') ||
        (t.payoutAmount && t.payoutAmount > 0)
      ))
    );

    this.saveState();
    return true;
  }

  // नवीन ५०-आठवड्यांचा प्लॅन सुरू करणे (Restart Plan & Archive Completed Cycle)
  restartPlan(memberId, newWeeklyAmount = null, startWeek = 1, initialDeposit = 0, paymentMode = 'Cash', upiId = '') {
    const member = this.getMember(memberId);
    if (!member) return null;

    const currentStats = this.calculateMemberStats(member);
    if (!member.pastCycles) member.pastCycles = [];

    const cycleNumber = member.currentCycle || 1;
    const archivedCycle = {
      cycleNumber: cycleNumber,
      completedDate: new Date().toISOString().split('T')[0],
      weeklyAmount: member.weeklyAmount,
      weeks: JSON.parse(JSON.stringify(member.weeks)),
      stats: JSON.parse(JSON.stringify(currentStats)),
      payoutDetails: member.payoutDetails ? JSON.parse(JSON.stringify(member.payoutDetails)) : null
    };
    member.pastCycles.push(archivedCycle);

    // नवीन सायकलसाठी सदस्याची पुनर्रचना
    const updatedWeeklyAmount = Number(newWeeklyAmount) || member.weeklyAmount;
    member.currentCycle = cycleNumber + 1;
    member.weeklyAmount = updatedWeeklyAmount;
    member.status = 'active';
    member.payoutStatus = 'pending';
    member.payoutDetails = null;
    member.startWeek = Number(startWeek) || 1;

    // नवीन ५० रिकामे आठवडे तयार करणे
    member.weeks = [];
    for (let w = 1; w <= 50; w++) {
      member.weeks.push({
        weekNumber: w,
        status: w < member.startWeek ? 'skipped' : 'pending',
        amountPaid: 0,
        finePaid: 0,
        paidDate: null,
        paymentMode: '',
        receiptNo: null,
        notes: ''
      });
    }

    // पहिल्या हप्त्याचा भरणा (संपूर्ण रक्कम निवडलेल्या आठवड्यात जमा करणे)
    if (Number(initialDeposit) > 0) {
      const initAmt = Number(initialDeposit);
      const currentWk = member.startWeek;
      const todayStr = new Date().toISOString().split('T')[0];
      const isUpi = (paymentMode || '').toLowerCase().includes('upi');
      const cleanUpi = isUpi ? (upiId || '').trim() : '';
      const receiptNo = `REC-${member.id}-C${member.currentCycle}-W${currentWk}-${Date.now().toString().slice(-4)}`;
      const initStatus = initAmt >= updatedWeeklyAmount ? 'paid' : (initAmt > 0 ? 'partial' : 'pending');

      member.weeks[currentWk - 1] = {
        weekNumber: currentWk,
        status: initStatus,
        amountPaid: initAmt,
        finePaid: 0,
        paidDate: todayStr,
        paymentMode: paymentMode,
        upiId: cleanUpi,
        receiptNo: receiptNo,
        notes: initAmt > updatedWeeklyAmount ? `सायकल ${member.currentCycle} प्रारंभिक हप्ता (अतिरिक्त भरणा: ₹${initAmt - updatedWeeklyAmount})` : `सायकल ${member.currentCycle} प्रारंभिक हप्ता`
      };

      this.state.transactions.unshift({
        id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        memberId: member.id,
        memberName: member.name,
        cycleNumber: member.currentCycle,
        weekNumber: currentWk,
        depositAmount: initAmt,
        fineAmount: 0,
        totalAmount: initAmt,
        date: new Date().toISOString(),
        paymentMode: paymentMode,
        upiId: cleanUpi,
        receiptNo: receiptNo,
        note: `नवीन सायकल ${member.currentCycle} प्रारंभिक हप्ता भरणा`
      });
    }

    this.saveState();
    return { member, newCycle: member.currentCycle, archivedCycle };
  }

  // ==========================================================================
  // 📊 आकडेवारी व गणना इंजिन (Stats & Calculation Engine)
  // ==========================================================================

  // सदस्यनिहाय आकडेवारी गणना
  calculateMemberStats(member) {
    const weeklyAmount = Number(member.weeklyAmount) || 0;
    const totalTarget = weeklyAmount * 50;
    let totalDeposited = 0;
    let totalFinePaid = 0;
    let paidWeeksCount = 0;
    let nextDueWeek = null;

    const defaultFine = Number(this.state.meta.defaultFineAmount) || 0;
    const maturityInterestPercent = Number(this.state.meta.maturityInterestPercent !== undefined ? this.state.meta.maturityInterestPercent : 8);
    const currentWeek = this.state.meta.currentWeek || 1;

    member.weeks.forEach(w => {
      const amt = Number(w.amountPaid) || 0;
      if (amt > 0) {
        totalDeposited += amt;
        totalFinePaid += (Number(w.finePaid) || 0);
      }
      if (w.status === 'paid' && amt > 0) {
        paidWeeksCount++;
      }
    });

    // पूर्ण झालेले आठवडे (Effective Paid Weeks = Maximum of distinctly paid weeks or covered by total deposited)
    const effectiveByDeposit = Math.min(50, Math.floor(totalDeposited / (weeklyAmount || 1)));
    const effectivePaidWeeks = Math.min(50, Math.max(paidWeeksCount, effectiveByDeposit));
    const isFullyPaid = totalDeposited >= totalTarget || effectivePaidWeeks >= 50;
    const remainingAmount = Math.max(0, totalTarget - totalDeposited);
    const progressPercent = Math.min(100, Math.round((Math.max(totalDeposited, effectivePaidWeeks * weeklyAmount) / (totalTarget || 1)) * 100));
    const nextDueAmount = weeklyAmount;
    const remainingWeeksCount = Math.max(0, 50 - effectivePaidWeeks);

    // Calculate overdue weeks based on cumulative expected deposit vs actual total deposited
    const expectedSoFar = Math.min(50, currentWeek) * weeklyAmount;
    const depositDeficit = Math.max(0, expectedSoFar - Math.max(totalDeposited, effectivePaidWeeks * weeklyAmount));
    const overdueWeeksCount = Math.ceil(depositDeficit / (weeklyAmount || 1));

    // Determine next due week: the next week following the covered weeks
    if (isFullyPaid) {
      nextDueWeek = 50;
    } else {
      nextDueWeek = Math.min(50, effectivePaidWeeks + 1);
    }

    // ८% मॅच्युरिटी व्याज बोनस गणना
    const interestAmount = isFullyPaid ? Math.round(totalDeposited * (maturityInterestPercent / 100)) : 0;
    const maturityTotalPayout = totalDeposited + interestAmount;
    const projectedInterest = Math.round(totalTarget * (maturityInterestPercent / 100));
    const projectedMaturityTotal = totalTarget + projectedInterest;

    // दंड गणना
    const isNextWeekOverdue = overdueWeeksCount > 0;
    const suggestedFine = isNextWeekOverdue ? defaultFine : 0;
    const accruedPendingFine = overdueWeeksCount * defaultFine;

    const isPayoutCompleted = member.payoutStatus === 'completed';
    const canRestartPlan = isFullyPaid;

    return {
      weeklyAmount,
      totalTarget,
      totalDeposited,
      totalFinePaid,
      paidWeeksCount: effectivePaidWeeks,
      effectivePaidWeeks,
      remainingWeeksCount,
      nextDueWeek: nextDueWeek || 50,
      nextDueAmount,
      remainingAmount,
      progressPercent,
      interestAmount,
      maturityTotalPayout,
      projectedInterest,
      projectedMaturityTotal,
      maturityInterestPercent,
      overdueWeeksCount,
      suggestedFine,
      accruedPendingFine,
      isFullyPaid,
      isPayoutCompleted,
      canRestartPlan
    };
  }

  // मुख्य डॅशबोर्ड आकडेवारी मिळवणे
  getDashboardStats() {
    const activeMembers = this.state.members.filter(m => m.status === 'active' || m.status === 'completed');
    const currentWeek = this.state.meta.currentWeek || 1;

    let totalFundTarget = 0;
    let totalAllTimeCollected = 0;
    let totalFinesCollected = 0;
    let weekExpectedAmount = 0;
    let weekCollectedAmount = 0;
    let weekExtraAmount = 0;
    let weekPaidCount = 0;
    let completedMembersCount = 0;

    activeMembers.forEach(member => {
      const stats = this.calculateMemberStats(member);
      totalFundTarget += stats.totalTarget;
      totalAllTimeCollected += stats.totalDeposited;
      totalFinesCollected += stats.totalFinePaid;

      if (stats.isFullyPaid) {
        completedMembersCount++;
      }

      // चालू आठवड्याची स्थिती (थेट भरणा किंवा आगाऊ/मागील क्लिअरन्स तपासणे)
      const currentWeekData = member.weeks.find(w => w.weekNumber === currentWeek);
      if (currentWeekData && currentWeekData.status !== 'skipped') {
        weekExpectedAmount += member.weeklyAmount;
        const directPaid = Number(currentWeekData.amountPaid) || 0;
        const isDirectPaid = (currentWeekData.status === 'paid') || (directPaid >= member.weeklyAmount);
        const isAdvanceCovered = !isDirectPaid && (currentWeek <= stats.effectivePaidWeeks);

        if (directPaid > 0) {
          weekCollectedAmount += directPaid;
          if (directPaid > member.weeklyAmount) {
            weekExtraAmount += (directPaid - member.weeklyAmount);
          }
          if (isDirectPaid || directPaid >= member.weeklyAmount) {
            weekPaidCount++;
          }
        } else if (isAdvanceCovered) {
          weekCollectedAmount += member.weeklyAmount;
          weekPaidCount++;
        }
      }
    });

    const baseCollected = Math.min(weekExpectedAmount, weekCollectedAmount);
    const weekPendingAmount = Math.max(0, weekExpectedAmount - baseCollected);
    const overallProgressPercent = Math.min(100, Math.round((totalAllTimeCollected / (totalFundTarget || 1)) * 100));
    const weekProgressPercent = Math.min(100, Math.round((weekCollectedAmount / (weekExpectedAmount || 1)) * 100));

    return {
      currentWeek,
      totalMembers: activeMembers.length,
      totalSettledMembers: this.state.settledMembers.length,
      totalFundTarget,
      totalAllTimeCollected,
      totalFinesCollected,
      weekExpectedAmount,
      weekCollectedAmount,
      weekExtraAmount,
      weekPendingAmount,
      weekPaidCount,
      weekPendingCount: activeMembers.length - weekPaidCount,
      completedMembersCount,
      overallProgressPercent,
      weekProgressPercent
    };
  }

  // चालू आठवडा सेट करणे (Set Current Week)
  setCurrentWeek(w) {
    const weekNum = Math.max(1, Math.min(50, Number(w)));
    this.state.meta.currentWeek = weekNum;

    // थकीत आठवड्यांचे स्टेटस अपडेट
    this.state.members.forEach(m => {
      m.weeks.forEach(wk => {
        if (wk.status !== 'paid' && wk.status !== 'skipped') {
          wk.status = wk.weekNumber < weekNum ? 'overdue' : 'pending';
        }
      });
    });

    this.saveState();
  }

  // ==========================================================================
  // 📥📤 बॅकअप व क्लाउड हेल्पर मेथड्स (Export, Import & Cloud Direct)
  // ==========================================================================

  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.meta && Array.isArray(data.members)) {
        this.state = data;
        this.ensureIntegrity();
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import format:', e);
    }
    return false;
  }

  async fetchFromCloud() {
    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.fetchStateAndApply === 'function') {
      return await window.firebaseSyncManager.fetchStateAndApply();
    }
    return false;
  }

  async pushToCloud() {
    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.saveCurrentStateToCloud === 'function') {
      await window.firebaseSyncManager.saveCurrentStateToCloud(true);
      return true;
    }
    return false;
  }

  async pingCloud() {
    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.pingDatabase === 'function') {
      return await window.firebaseSyncManager.pingDatabase();
    }
    return null;
  }

  getCloudStats() {
    if (window.firebaseSyncManager && typeof window.firebaseSyncManager.getDatabaseStats === 'function') {
      return window.firebaseSyncManager.getDatabaseStats();
    }
    return null;
  }
}

// ग्लोबल स्टोअर इन्स्टन्स तयार करणे
window.bishiStore = new BishiStore();
