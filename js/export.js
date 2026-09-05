/**
 * ==========================================================================
 * सुखकर्ता बीशी - CSV एक्सपोर्ट व डेटा बॅकअप/रिस्टोर व्यवस्थापक
 * (UTF-8 BOM सपोर्टसह Excel व Google Sheets सुसंगत)
 * ==========================================================================
 */

class ExportManager {
  /**
   * फाईल डाउनलोड करणे (Excel Devanagari/Marathi सपोर्टसाठी UTF-8 BOM सह)
   */
  downloadFile(content, fileName, contentType = 'text/csv;charset=utf-8;') {
    const a = document.createElement('a');
    const isCsv = contentType.includes('csv') || fileName.toLowerCase().endsWith('.csv');
    // Excel मध्ये मराठी / देवनागरी अक्षरे व्यवस्थित दिसण्यासाठी UTF-8 BOM (\uFEFF) जोडणे
    const blobContent = isCsv ? ('\uFEFF' + content) : content;
    const file = new Blob([blobContent], { type: isCsv ? 'text/csv;charset=utf-8;' : contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  /**
   * CSV सेल सुरक्षित करणे (Special chars व Quotes escaping)
   */
  escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * तारीख Excel-फ्रेंडली स्वरूपात (DD-MM-YYYY) फॉरमॅट करणे
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return String(dateStr).split('T')[0] || '-';
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return String(dateStr).split('T')[0] || '-';
    }
  }

  // --- चालू आठवड्याचे कलेक्शन पत्रक (Weekly Collection Sheet) ---
  exportWeeklyCSV(weekNumber) {
    const store = window.bishiStore;
    const members = store.getMembers().filter(m => m.status === 'active');
    const currency = store.state.meta.currency || '₹';
    const todayFormatted = this.formatDate(new Date().toISOString());

    let csv = [];
    csv.push([this.escapeCSV(`${store.state.meta.bishiName || 'सुखकर्ता बीशी'} - आठवडा ${weekNumber} कलेक्शन पत्रक`)]);
    csv.push([this.escapeCSV(`डाउनलोड तारीख: ${todayFormatted}`)]);
    csv.push('');

    csv.push([
      this.escapeCSV('सदस्य आयडी'),
      this.escapeCSV('सदस्याचे नाव'),
      this.escapeCSV('मोबाईल नंबर'),
      this.escapeCSV(`साप्ताहिक हप्ता (${currency})`),
      this.escapeCSV(`आठवडा ${weekNumber} स्थिती`),
      this.escapeCSV(`या आठवड्यात जमा (${currency})`),
      this.escapeCSV(`दंड भरणा (${currency})`),
      this.escapeCSV(`एकूण भरणा (${currency})`),
      this.escapeCSV('पेमेंट पद्धत'),
      this.escapeCSV('UPI आयडी / संदर्भ'),
      this.escapeCSV('पेमेंट तारीख'),
      this.escapeCSV('पावती क्र.'),
      this.escapeCSV(`एकूण जमा बचत (${currency})`),
      this.escapeCSV(`शिल्लक बाकी (${currency})`)
    ].join(','));

    members.forEach(m => {
      const stats = store.calculateMemberStats(m);
      const wkData = m.weeks.find(w => w.weekNumber === Number(weekNumber)) || {};
      const paidAmt = Number(wkData.amountPaid || 0);
      const fineAmt = Number(wkData.finePaid || 0);
      const isPaid = (wkData.status === 'paid' && paidAmt > 0) || paidAmt >= stats.weeklyAmount;
      const isCleared = !isPaid && (Number(weekNumber) <= stats.effectivePaidWeeks);
      const statusStr = isPaid ? 'जमा (Paid)' : (isCleared ? 'क्लिअर (Advance Clear)' : (wkData.status === 'partial' ? 'अपूर्ण (Partial)' : 'प्रलंबित (Pending)'));
      const dateStr = this.formatDate(wkData.paidDate);

      csv.push([
        this.escapeCSV(m.id),
        this.escapeCSV(m.name),
        this.escapeCSV(m.phone),
        stats.weeklyAmount,
        this.escapeCSV(statusStr),
        paidAmt,
        fineAmt,
        paidAmt + fineAmt,
        this.escapeCSV(wkData.paymentMode || (isPaid ? 'Cash' : '-')),
        this.escapeCSV(wkData.upiId || '-'),
        this.escapeCSV(dateStr),
        this.escapeCSV(wkData.receiptNo || (isPaid ? `REC-${m.id}-W${weekNumber}` : '-')),
        stats.totalDeposited,
        stats.remainingAmount
      ].join(','));
    });

    const csvString = csv.join('\r\n');
    this.downloadFile(csvString, `सुखकर्ता_बीशी_आठवडा_${weekNumber}_कलेक्शन.csv`, 'text/csv;charset=utf-8;');
    window.ui?.showToast(`आठवडा ${weekNumber} चे कलेक्शन पत्रक डाउनलोड झाले!`, 'success');
  }

  // --- ५०-आठवड्यांचे मास्टर खातावही (Master 50-Week Ledger) ---
  exportMasterLedgerCSV() {
    const store = window.bishiStore;
    const members = store.getMembers();
    const currency = store.state.meta.currency || '₹';
    const statsHeaderInterest = store.state.meta.maturityInterestPercent || 8;
    const todayFormatted = this.formatDate(new Date().toISOString());

    let csv = [];
    csv.push([this.escapeCSV(`${store.state.meta.bishiName || 'सुखकर्ता बीशी'} - ५०-आठवडे मास्टर खातावही`)]);
    csv.push([this.escapeCSV(`डाउनलोड तारीख: ${todayFormatted}`)]);
    csv.push('');

    csv.push([
      this.escapeCSV('सदस्य आयडी'),
      this.escapeCSV('सदस्याचे नाव'),
      this.escapeCSV('मोबाईल नंबर'),
      this.escapeCSV('वारसदार'),
      this.escapeCSV(`साप्ताहिक हप्ता (${currency})`),
      this.escapeCSV(`५०-आठवडे लक्ष्य (${currency})`),
      this.escapeCSV('जमा आठवडे'),
      this.escapeCSV('बाकी आठवडे'),
      this.escapeCSV(`एकूण जमा बचत (${currency})`),
      this.escapeCSV(`+${statsHeaderInterest}% मॅच्युरिटी बोनस (${currency})`),
      this.escapeCSV(`एकूण मॅच्युरिटी परतावा (${currency})`),
      this.escapeCSV(`शिल्लक बाकी (${currency})`),
      this.escapeCSV('खाते स्थिती'),
      this.escapeCSV('टीप')
    ].join(','));

    members.forEach(m => {
      const stats = store.calculateMemberStats(m);
      csv.push([
        this.escapeCSV(m.id),
        this.escapeCSV(m.name),
        this.escapeCSV(m.phone),
        this.escapeCSV(m.nominee || '-'),
        stats.weeklyAmount,
        stats.totalTarget,
        stats.paidWeeksCount,
        stats.remainingWeeksCount,
        stats.totalDeposited,
        stats.interestAmount,
        stats.maturityTotalPayout,
        stats.remainingAmount,
        this.escapeCSV(m.status === 'active' ? 'सक्रिय (Active)' : m.status),
        this.escapeCSV(m.notes || '-')
      ].join(','));
    });

    const csvString = csv.join('\r\n');
    this.downloadFile(csvString, `सुखकर्ता_बीशी_५०_आठवडे_मास्टर_खातावही.csv`, 'text/csv;charset=utf-8;');
    window.ui?.showToast('५०-आठवड्यांचे मास्टर खातावही डाउनलोड झाले!', 'success');
  }

  // --- सदस्याचे वैयक्तिक ५०-आठवडे पासबुक स्टेटमेंट (Member 50-Week Passbook Statement) ---
  downloadMemberLedgerCSV(memberId) {
    const store = window.bishiStore;
    const member = store.getMember(memberId);
    if (!member) {
      window.ui?.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const stats = store.calculateMemberStats(member);
    const currency = store.state.meta.currency || '₹';
    const currentCycleNum = member.currentCycle || 1;
    const todayFormatted = this.formatDate(new Date().toISOString());

    let csv = [];

    // Header info block
    csv.push([this.escapeCSV(`${store.state.meta.bishiName || 'सुखकर्ता बीशी'} - संपूर्ण बचत इतिहास व पासबुक स्टेटमेंट`)]);
    csv.push([
      this.escapeCSV(`सदस्य नाव: ${member.name}`),
      this.escapeCSV(`सदस्य आयडी: ${member.id}`),
      this.escapeCSV(`मोबाईल: ${member.phone}`),
      this.escapeCSV(`वारसदार: ${member.nominee || 'N/A'}`),
      this.escapeCSV(`साप्ताहिक हप्ता: ${currency}${stats.weeklyAmount}`),
      this.escapeCSV(`५०-आठवडे लक्ष्य: ${currency}${stats.totalTarget}`),
      this.escapeCSV(`मॅच्युरिटी परतावा (+${stats.maturityInterestPercent}%): ${currency}${stats.maturityTotalPayout}`),
      this.escapeCSV(`तारीख: ${todayFormatted}`)
    ].join(','));
    csv.push('');

    // सायकल्स टेबल तयार करणारा घटक
    const renderWeeksSection = (cycleLabel, weeksList, cycleWeeklyAmt, effectivePaidWks, cycleNum) => {
      csv.push([this.escapeCSV(`=== ${cycleLabel} ===`)]);
      csv.push([
        this.escapeCSV('आठवडा क्र.'),
        this.escapeCSV('पावती क्रमांक'),
        this.escapeCSV('सायकल'),
        this.escapeCSV(`हप्ता जमा (${currency})`),
        this.escapeCSV(`दंड भरणा (${currency})`),
        this.escapeCSV(`एकूण भरणा (${currency})`),
        this.escapeCSV('पेमेंट पद्धत'),
        this.escapeCSV('UPI / संदर्भ क्र.'),
        this.escapeCSV('पेमेंट तारीख'),
        this.escapeCSV('स्थिती')
      ].join(','));

      weeksList.forEach(w => {
        const paidAmt = Number(w.amountPaid || 0);
        const fineAmt = Number(w.finePaid || 0);
        const isPaid = (w.status === 'paid' && paidAmt > 0) || paidAmt >= cycleWeeklyAmt;
        const isCleared = !isPaid && (w.weekNumber <= effectivePaidWks);
        const statusStr = isPaid ? 'जमा (Paid)' : (isCleared ? 'क्लिअर (Advance Clear)' : (w.status === 'partial' ? 'अपूर्ण (Partial)' : 'प्रलंबित (Pending)'));
        const dateStr = this.formatDate(w.paidDate);
        const defaultReceipt = isPaid ? `REC-${member.id}-C${cycleNum}-W${w.weekNumber}` : '-';

        csv.push([
          this.escapeCSV(`आठवडा ${w.weekNumber} / ५०`),
          this.escapeCSV(w.receiptNo || defaultReceipt),
          this.escapeCSV(`सायकल ${cycleNum}`),
          paidAmt,
          fineAmt,
          paidAmt + fineAmt,
          this.escapeCSV(w.paymentMode || (isPaid ? 'Cash' : '-')),
          this.escapeCSV(w.upiId || '-'),
          this.escapeCSV(dateStr),
          this.escapeCSV(statusStr)
        ].join(','));
      });
      csv.push('');
    };

    // मागील पूर्ण सायकल्स (Archived Past Cycles)
    if (member.pastCycles && member.pastCycles.length > 0) {
      member.pastCycles.forEach(pastCycle => {
        const pStats = pastCycle.stats || store.calculateMemberStats(pastCycle);
        renderWeeksSection(
          `जतन सायकल ${pastCycle.cycleNumber} (पूर्ण तारीख: ${this.formatDate(pastCycle.completedDate)})`,
          pastCycle.weeks || [],
          pastCycle.weeklyAmount || stats.weeklyAmount,
          pStats.effectivePaidWeeks || 50,
          pastCycle.cycleNumber
        );
      });
    }

    // चालू सक्रिय सायकल (Current Active Cycle)
    renderWeeksSection(
      `चालू सक्रिय सायकल ${currentCycleNum} (हप्ता: ${currency}${stats.weeklyAmount}/आठवडा)`,
      member.weeks || [],
      stats.weeklyAmount,
      stats.effectivePaidWeeks,
      currentCycleNum
    );

    // आर्थिक ताळेबंद सारांश (Financial Summary)
    csv.push([this.escapeCSV(`--- सक्रिय सायकल ${currentCycleNum} आर्थिक ताळेबंद सारांश ---`)]);
    csv.push([this.escapeCSV('तपशील'), this.escapeCSV(`रक्कम (${currency})`)].join(','));
    csv.push([this.escapeCSV('५०-आठवड्यांचे एकूण उद्दिष्ट'), stats.totalTarget].join(','));
    csv.push([this.escapeCSV('एकूण भरलेले आठवडे'), this.escapeCSV(`${stats.paidWeeksCount} / ५० आठवडे`)].join(','));
    csv.push([this.escapeCSV('आतापर्यंत जमा मूळ बचत'), stats.totalDeposited].join(','));
    csv.push([this.escapeCSV('एकूण भरलेला लेट फी दंड'), stats.totalFinePaid].join(','));
    csv.push([this.escapeCSV(`+${stats.maturityInterestPercent}% मॅच्युरिटी व्याज बोनस`), stats.interestAmount].join(','));
    csv.push([this.escapeCSV('🏆 एकूण मॅच्युरिटी परतावा (वाटप देय)'), stats.maturityTotalPayout].join(','));
    csv.push([this.escapeCSV('उर्वरित शिल्लक बाकी हप्ता'), stats.remainingAmount].join(','));

    const csvString = csv.join('\r\n');
    const cleanFileName = `सुखकर्ता_बीशी_${member.id}_${member.name.replace(/\s+/g, '_')}_पासबुक_स्टेटमेंट.csv`;
    this.downloadFile(csvString, cleanFileName, 'text/csv;charset=utf-8;');
    window.ui?.showToast(`${member.name} यांचे पासबुक स्टेटमेंट डाउनलोड झाले!`, 'success');
  }

  // --- संपूर्ण डेटाबेस बॅकअप (JSON Backup) ---
  backupJSON() {
    const jsonStr = window.bishiStore.exportJSON();
    const fileName = `सुखकर्ता_बीशी_बॅकअप_${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonStr, fileName, 'application/json');
    window.ui?.showToast('संपूर्ण सिस्टम बॅकअप फाईल डाउनलोड झाली!', 'success');
  }

  // --- डेटाबेस रिस्टोर (JSON Restore) ---
  restoreJSON(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = window.bishiStore.importJSON(e.target.result);
      if (success) {
        window.ui?.showToast('डेटाबेस यशस्वीरीत्या पूर्ववत (Restore) झाला!', 'success');
        window.ui?.renderAll();
      } else {
        window.ui?.showToast('अवैध बॅकअप फाईल फॉरमॅट', 'error');
      }
    };
    reader.readAsText(file);
  }
}

window.exportManager = new ExportManager();
