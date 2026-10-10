/**
 * ==========================================================================
 * सुखकर्ता बीशी - डिजिटल पावती व WhatsApp संदेश जनरेटर (पावत्या व व्हाउचर)
 * ==========================================================================
 */

class ReceiptManager {
  constructor() {
    this.modal = document.getElementById('receiptModal');
  }

  openReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) {
      modal.style.zIndex = '2500';
      modal.classList.add('active');
    }
  }

  closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  openPayoutVoucherModal() {
    const modal = document.getElementById('payoutVoucherModal');
    if (modal) {
      modal.style.zIndex = '2500';
      modal.classList.add('active');
    }
  }

  closePayoutVoucherModal() {
    const modal = document.getElementById('payoutVoucherModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  toMarathiNumber(num) {
    if (num === null || num === undefined) return '';
    const digits = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
    return String(num).split('').map(d => digits[d] || d).join('');
  }

  getMemberDisplayName(member) {
    if (!member) return '';
    if (typeof window !== 'undefined' && window.bishiStore && typeof window.bishiStore.getMemberDisplayName === 'function') {
      return window.bishiStore.getMemberDisplayName(member);
    }
    const helper = (typeof window !== 'undefined' && window.marathiHelper) ? window.marathiHelper : (typeof marathiHelper !== 'undefined' ? marathiHelper : null);
    if (helper && typeof helper.getMemberDisplayName === 'function') {
      return helper.getMemberDisplayName(member);
    }
    if (member.nameMarathi && member.name && member.nameMarathi !== member.name) {
      return `${member.nameMarathi} (${member.name})`;
    }
    return member.nameMarathi || member.name || '';
  }

  getMemberMarathiName(member) {
    if (!member) return '';
    if (typeof window !== 'undefined' && window.bishiStore && typeof window.bishiStore.getMemberMarathiName === 'function') {
      return window.bishiStore.getMemberMarathiName(member);
    }
    const helper = (typeof window !== 'undefined' && window.marathiHelper) ? window.marathiHelper : (typeof marathiHelper !== 'undefined' ? marathiHelper : null);
    if (helper && typeof helper.getMemberMarathiName === 'function') {
      return helper.getMemberMarathiName(member);
    }
    if (member.nameMarathi && typeof member.nameMarathi === 'string' && member.nameMarathi.trim()) {
      return member.nameMarathi.trim();
    }
    if (helper && typeof helper.toMarathi === 'function') {
      return helper.toMarathi(member.name || '');
    }
    return member.nameMarathi || member.name || '';
  }

  generateReceiptHTML(member, weekData, bishiMeta) {
    const stats = window.bishiStore.calculateMemberStats(member);
    const isMonthly = stats.isMonthly;
    const periodUnit = stats.periodUnit;
    const periodUnitPlural = stats.periodUnitPlural;
    const totalPeriods = stats.totalPeriods;
    const installmentAmount = stats.installmentAmount;

    const currency = bishiMeta.currency || '₹';
    const depositAmt = Number(weekData.amountPaid) || 0;
    const fineAmt = Number(weekData.finePaid) || 0;
    const totalCollected = depositAmt + fineAmt;

    const formattedDate = weekData.paidDate ? new Date(weekData.paidDate).toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : new Date().toLocaleDateString('hi-IN');

    const isExtraDeposit = depositAmt > installmentAmount;
    const regularAmt = installmentAmount;
    const extraDepositAmt = isExtraDeposit ? (depositAmt - regularAmt) : 0;

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header">
          <img src="assets/logo-emblem.png" alt="सुखकर्ता बीशी" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-bottom: 0.35rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid #f59e0b; background: #fff; padding: 2px; display: inline-block;">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">${isMonthly ? 'मासिक' : 'साप्ताहिक'} बचत फंड व खातावही पावती</div>
          <div class="receipt-badge">${isMonthly ? 'मासिक' : 'साप्ताहिक'} हप्ता जमा पावती • ${periodUnit} ${weekData.weekNumber} / ${totalPeriods}</div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">पावती क्रमांक</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-size: 0.8rem;">${weekData.receiptNo || 'REC-' + member.id}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">तारीख</div>
            <div class="meta-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-item-lbl">सदस्याचे नाव</div>
            <div class="meta-item-val">${this.getMemberDisplayName(member)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">सदस्य आयडी</div>
            <div class="meta-item-val">${member.id}</div>
          </div>
          <div>
            <div class="meta-item-lbl">पेमेंट पद्धत</div>
            <div class="meta-item-val">
              ${weekData.paymentMode || 'Cash'}
              ${weekData.upiId ? `<div style="font-size: 0.72rem; color: #2563eb; font-weight: 700;">UPI: ${weekData.upiId}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर</div>
            <div class="meta-item-val">${member.phone}</div>
          </div>
        </div>

        <div class="receipt-amount-box">
          <div class="receipt-amount-lbl">${periodUnit} ${weekData.weekNumber} साठी मिळालेली एकूण रक्कम</div>
          <div class="receipt-amount-val">${currency}${totalCollected.toLocaleString('en-IN')}</div>
          ${isExtraDeposit ? `<div style="font-size: 0.8rem; color: #d97706; font-weight: 700; margin-top: 0.2rem;">⭐ नियमित हप्ता: ${currency}${regularAmt.toLocaleString('en-IN')} + अतिरिक्त भरणा: +${currency}${extraDepositAmt.toLocaleString('en-IN')}</div>` : ''}
          ${fineAmt > 0 ? `<div style="font-size: 0.8rem; opacity: 0.9; margin-top: 0.2rem;">(हप्ता: ${currency}${depositAmt.toLocaleString('en-IN')} + लेट फी दंड: ${currency}${fineAmt.toLocaleString('en-IN')})</div>` : ''}
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>नियमित ${isMonthly ? 'मासिक' : 'साप्ताहिक'} बचत हप्ता</td>
            <td>${currency}${regularAmt.toLocaleString('en-IN')}</td>
          </tr>
          ${isExtraDeposit ? `
            <tr style="color: #d97706; font-weight: 700; background: rgba(245, 158, 11, 0.08);">
              <td>⭐ अतिरिक्त ठेव/जादा भरणा (Extra Deposit)</td>
              <td>+ ${currency}${extraDepositAmt.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
          ${fineAmt > 0 ? `
            <tr style="color: #e11d48; font-weight: 600;">
              <td>लेट फी दंड भरणा</td>
              <td>+ ${currency}${fineAmt.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
          <tr>
            <td>एकूण जमा झालेले ${periodUnitPlural}</td>
            <td>${stats.paidWeeksCount} / ${totalPeriods} ${periodUnitPlural}</td>
          </tr>
          <tr>
            <td>आतापर्यंत एकूण जमा बचत</td>
            <td style="color: #059669; font-weight: 800;">${currency}${stats.totalDeposited.toLocaleString('en-IN')}</td>
          </tr>
          ${stats.isFullyPaid ? `
            <tr style="color: #059669; font-weight: 700; background: rgba(16, 185, 129, 0.08);">
              <td>+${stats.maturityInterestPercent}% मॅच्युरिटी व्याज बोनस</td>
              <td>+ ${currency}${stats.interestAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="color: #d97706; font-weight: 800; font-size: 1.05rem; background: rgba(245, 158, 11, 0.1);">
              <td>🏆 एकूण मॅच्युरिटी परतावा</td>
              <td>${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}</td>
            </tr>
          ` : `
            <tr>
              <td>${totalPeriods}-${periodUnitPlural}चे एकूण उद्दिष्ट</td>
              <td>${currency}${stats.totalTarget.toLocaleString('en-IN')} <span style="font-size: 0.75rem; color: #059669;">(+${stats.maturityInterestPercent}% = ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')})</span></td>
            </tr>
            <tr>
              <td>पुढील ${periodUnit} (${Math.min(totalPeriods, weekData.weekNumber + 1)}) देय हप्ता</td>
              <td style="color: #d97706;">${currency}${stats.nextDueAmount.toLocaleString('en-IN')}</td>
            </tr>
          `}
        </table>

        <div class="receipt-footer-note">
          ${stats.isFullyPaid 
            ? `🎉 सर्व ${totalPeriods} ${periodUnitPlural} पूर्ण केल्याबद्दल हार्दिक अभिनंदन! आपला ${stats.maturityInterestPercent}% व्याजासह एकूण परतावा ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')} आहे.` 
            : `🙏 हप्ता जमा केल्याबद्दल धन्यवाद! ${totalPeriods} ${periodUnitPlural} पूर्ण झाल्यावर आपणास ${stats.maturityInterestPercent}% व्याज बोनससह ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')} परतावा मिळेल.`}
        </div>
      </div>
    `;
  }

  generateWhatsAppText(member, weekData, bishiMeta) {
    const stats = window.bishiStore.calculateMemberStats(member);
    const isMonthly = stats.isMonthly;
    const periodUnit = stats.periodUnit;
    const periodUnitPlural = stats.periodUnitPlural;
    const totalPeriods = stats.totalPeriods;
    const installmentAmount = stats.installmentAmount;

    const currency = bishiMeta.currency || '₹';
    const nextWeek = Math.min(totalPeriods, weekData.weekNumber + 1);
    const depositAmt = Number(weekData.amountPaid) || 0;
    const fineAmt = Number(weekData.finePaid) || 0;
    const totalCollected = depositAmt + fineAmt;
    const isExtraDeposit = depositAmt > installmentAmount;
    const regularAmt = installmentAmount;
    const extraDepositAmt = isExtraDeposit ? (depositAmt - regularAmt) : 0;

    let message = 
`*🔔 पेमेंट पावती - ${bishiMeta.bishiName.toUpperCase()}*
─────────────────────
प्रिय *${this.getMemberDisplayName(member)}* (आयडी: ${member.id}),

आम्हाला आपला ${isMonthly ? 'मासिक' : 'साप्ताहिक'} बीशी हप्ता यशस्वीरीत्या प्राप्त झाला आहे:

💰 *${isMonthly ? 'मासिक हप्ता' : 'साप्ताहिक हप्ता'}:* ${currency}${regularAmt.toLocaleString('en-IN')}`;

    if (isExtraDeposit) {
      message += `\n⭐ *अतिरिक्त भरणा (Extra):* +${currency}${extraDepositAmt.toLocaleString('en-IN')}`;
    }

    if (fineAmt > 0) {
      message += `\n⚠️ *लेट फी दंड:* ${currency}${fineAmt.toLocaleString('en-IN')}`;
    }

    message += `
💵 *या ${periodUnit}ची एकूण रक्कम:* ${currency}${totalCollected.toLocaleString('en-IN')}
📅 *${periodUnit} क्र.:* ${periodUnit} ${weekData.weekNumber} / ${totalPeriods}
💳 *पेमेंट पद्धत:* ${weekData.paymentMode || 'रोख'}${weekData.upiId ? ` (UPI ID: ${weekData.upiId})` : ''}
🧾 *पावती क्र.:* ${weekData.receiptNo || 'N/A'}
─────────────────────
*📊 आपल्या बचतीचा ताळेबंद:*
• जमा ${periodUnitPlural}: *${stats.paidWeeksCount} / ${totalPeriods}*
• आतापर्यंत एकूण जमा बचत: *${currency}${stats.totalDeposited.toLocaleString('en-IN')}*`;

    if (stats.isFullyPaid) {
      message += `
• *+${stats.maturityInterestPercent}% मॅच्युरिटी बोनस:* +${currency}${stats.interestAmount.toLocaleString('en-IN')}
• 🏆 *एकूण मॅच्युरिटी परतावा:* *${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}*`;
    } else {
      message += `
• ${totalPeriods}-${periodUnitPlural}चे एकूण उद्दिष्ट: *${currency}${stats.totalTarget.toLocaleString('en-IN')}* (+${stats.maturityInterestPercent}% बोनस = *${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')}*)
• शिल्लक बाकी रक्कम: *${currency}${stats.remainingAmount.toLocaleString('en-IN')}*
• पुढील देय हप्ता (${periodUnit} ${nextWeek}): *${currency}${stats.nextDueAmount.toLocaleString('en-IN')}*`;
    }

    message += `
─────────────────────
_सुखकर्ता बीशी सोबत नियमित बचत केल्याबद्दल धन्यवाद!_`;

    return message;
  }

  showReceiptModal(memberId, weekNumber, cycleNumber = null) {
    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    let weekData = null;
    let cycleStats = null;
    const cycleNum = cycleNumber ? Number(cycleNumber) : (member.currentCycle || 1);

    if (cycleNumber && Number(cycleNumber) < (member.currentCycle || 1)) {
      const pastCycle = (member.pastCycles || []).find(c => c.cycleNumber === Number(cycleNumber));
      if (pastCycle && pastCycle.weeks) {
        weekData = pastCycle.weeks.find(w => w.weekNumber === Number(weekNumber));
        cycleStats = pastCycle.stats || window.bishiStore.calculateMemberStats(pastCycle);
      }
    } else {
      weekData = member.weeks.find(w => w.weekNumber === Number(weekNumber));
      cycleStats = window.bishiStore.calculateMemberStats(member);
    }

    if (!weekData) return;

    // जर हा आठवडा आगाऊ/जादा भरण्याद्वारे आधीच क्लिअर झाला असेल तर पावतीसाठी माहिती पूर्तता करणे
    if (Number(weekData.amountPaid || 0) === 0 && Number(weekNumber) <= cycleStats.effectivePaidWeeks) {
      weekData = {
        ...weekData,
        amountPaid: member.weeklyAmount,
        status: 'paid',
        paymentMode: weekData.paymentMode || 'अ‍ॅडव्हान्स / आगाऊ भरणा',
        receiptNo: weekData.receiptNo || `REC-${member.id}-W${weekNumber}-ADV`,
        notes: weekData.notes || 'मागील जादा/आगाऊ हप्त्यातून समायोजित'
      };
    }

    const bishiMeta = window.bishiStore.state.meta;
    const modalBody = document.getElementById('receiptModalBody');
    const waText = this.generateWhatsAppText(member, weekData, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      ${this.generateReceiptHTML(member, weekData, bishiMeta)}

      <div class="whatsapp-preview-box">
        <div class="whatsapp-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          थेट WhatsApp संदेश प्रिव्ह्यू
        </div>
        <div class="whatsapp-text-content">${waText}</div>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            WhatsApp वर पाठवा
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            मजकूर कॉपी करा
          </button>
        </div>
      </div>
    `;

    this.openReceiptModal();
  }

  // सदस्यास थेट WhatsApp संदेश पाठवणे (Send Direct WhatsApp Message to Member after Deposit)
  sendWhatsAppMessage(memberId, weekNumber, cycleNumber = null) {
    const member = window.bishiStore.getMember(memberId);
    if (!member) return;

    let weekData = null;
    if (cycleNumber && Number(cycleNumber) < (member.currentCycle || 1)) {
      const pastCycle = (member.pastCycles || []).find(c => c.cycleNumber === Number(cycleNumber));
      if (pastCycle && pastCycle.weeks) {
        weekData = pastCycle.weeks.find(w => w.weekNumber === Number(weekNumber));
      }
    } else {
      weekData = member.weeks.find(w => w.weekNumber === Number(weekNumber));
    }
    if (!weekData) return;

    const bishiMeta = window.bishiStore.state.meta;
    const waText = this.generateWhatsAppText(member, weekData, bishiMeta);
    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}` 
      : `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  }

  showPayoutVoucherModal(memberId, cycleNumber = null) {
    const member = window.bishiStore.getMember(memberId);
    if (!member) {
      if (window.ui && window.ui.showToast) {
        window.ui.showToast('सदस्य तपशील सापडला नाही', 'error');
      }
      return;
    }

    let stats = null;
    let rawPayout = null;
    const cycleNum = cycleNumber ? Number(cycleNumber) : (member.currentCycle || 1);

    if (cycleNumber && Number(cycleNumber) < (member.currentCycle || 1)) {
      const pastCycle = (member.pastCycles || []).find(c => c.cycleNumber === Number(cycleNumber));
      if (pastCycle) {
        stats = pastCycle.stats || window.bishiStore.calculateMemberStats(pastCycle);
        rawPayout = pastCycle.payoutDetails;
      }
    }

    if (!stats) {
      stats = window.bishiStore.calculateMemberStats(member);
    }

    rawPayout = rawPayout || member.payoutDetails;

    const payoutAmount = Number(rawPayout?.amount || rawPayout?.totalPayoutAmount || stats.maturityTotalPayout || 0);
    const savingsAmount = Number(rawPayout?.savingsAmount || stats.totalDeposited || 0);
    const interestBonus = Number(rawPayout?.interestBonus || rawPayout?.interestAmount || stats.interestAmount || 0);
    const interestPercent = Number(rawPayout?.interestPercent || stats.maturityInterestPercent || 8);
    const payoutDate = rawPayout?.date || rawPayout?.payoutDate || new Date().toISOString().split('T')[0];
    const paymentMode = rawPayout?.paymentMode || rawPayout?.payoutMode || 'रोख (Cash)';
    const reference = rawPayout?.reference || rawPayout?.upiId || 'N/A';
    const receiptNo = rawPayout?.receiptNo || rawPayout?.voucherNo || `PAYOUT-${member.id}-C${cycleNum}`;

    const payout = {
      amount: payoutAmount,
      savingsAmount: savingsAmount,
      interestBonus: interestBonus,
      interestPercent: interestPercent,
      date: payoutDate,
      paymentMode: paymentMode,
      reference: reference,
      receiptNo: receiptNo
    };

    const bishiMeta = window.bishiStore?.state?.meta || { bishiName: 'सुखकर्ता बीशी', currency: '₹' };
    const currency = bishiMeta.currency || '₹';
    const modalBody = document.getElementById('payoutVoucherModalBody');
    if (!modalBody) return;

    let formattedDate = 'आज';
    try {
      const d = new Date(payout.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (e) {
      formattedDate = String(payout.date || 'आज');
    }

    const waText = 
`*🏆 अधिकृत ५०-आठवडे मॅच्युरिटी परतावा वाटप - ${bishiMeta.bishiName.toUpperCase()}*
─────────────────────
प्रिय *${this.getMemberDisplayName(member)}* (आयडी: ${member.id}),

हार्दिक अभिनंदन! आपले ५० आठवड्यांचे बचत चक्र यशस्वीरीत्या पूर्ण झाले असून आपला पूर्ण परतावा वाटप करण्यात आला आहे:

💰 *५०-आठवडे जमा मूळ बचत:* ${currency}${payout.savingsAmount.toLocaleString('en-IN')}
💎 *+${payout.interestPercent}% मॅच्युरिटी बोनस:* +${currency}${payout.interestBonus.toLocaleString('en-IN')}
🏆 *एकूण वाटप झालेली मॅच्युरिटी रक्कम:* *${currency}${payout.amount.toLocaleString('en-IN')}*
─────────────────────
💳 *वाटप पद्धत:* ${payout.paymentMode}
🔢 *संदर्भ क्र. / UTR / चेक:* ${payout.reference || 'N/A'}
📅 *वाटप तारीख:* ${formattedDate}
🧾 *व्हाउचर क्रमांक:* ${payout.receiptNo}
─────────────────────
_सुखकर्ता बीशी सोबत यशस्वीरीत्या ५० आठवडे पूर्ण केल्याबद्दल धन्यवाद!_`;

    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      <div class="receipt-wrapper" style="border: 2px solid var(--gold-400); box-shadow: 0 0 25px rgba(245, 158, 11, 0.2);">
        <div class="receipt-header" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15)); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <img src="assets/logo-emblem.png" alt="सुखकर्ता बीशी" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-bottom: 0.35rem; box-shadow: 0 2px 10px rgba(0,0,0,0.15); border: 2px solid #f59e0b; background: #fff; padding: 2px; display: inline-block;">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">अधिकृत ५०-आठवडे मॅच्युरिटी वाटप व्हाउचर</div>
          <div class="receipt-badge" style="background: var(--emerald-600); color: #fff;">✅ परतावा वाटप पूर्ण</div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">व्हाउचर क्रमांक</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-400);">${payout.receiptNo}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">वाटप तारीख</div>
            <div class="meta-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-item-lbl">लाभार्थी सदस्य</div>
            <div class="meta-item-val">${this.getMemberDisplayName(member)} (${member.id})</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर</div>
            <div class="meta-item-val">${member.phone}</div>
          </div>
          <div>
            <div class="meta-item-lbl">वाटप पद्धत</div>
            <div class="meta-item-val">${payout.paymentMode}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">संदर्भ क्र. / चेक क्र.</div>
            <div class="meta-item-val">${payout.reference || 'N/A'}</div>
          </div>
        </div>

        <div class="receipt-amount-box" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2)); border: 1px solid var(--gold-400);">
          <div class="receipt-amount-lbl" style="color: var(--gold-400);">सदस्याला वाटप केलेली एकूण मॅच्युरिटी रक्कम</div>
          <div class="receipt-amount-val" style="color: var(--text-primary);">${currency}${payout.amount.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.82rem; color: var(--emerald-400); margin-top: 0.35rem; font-weight: 700;">
            (५० आठवडे बचत: ${currency}${payout.savingsAmount.toLocaleString('en-IN')} + ${payout.interestPercent}% व्याज: +${currency}${payout.interestBonus.toLocaleString('en-IN')})
          </div>
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>एकूण भरलेले आठवडे</td>
            <td>५० / ५० आठवडे (१००% पूर्ण)</td>
          </tr>
          <tr>
            <td>जमा केलेली मूळ बचत</td>
            <td>${currency}${payout.savingsAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="color: #059669; font-weight: 700; background: rgba(16, 185, 129, 0.08);">
            <td>+${payout.interestPercent}% मॅच्युरिटी व्याज बोनस</td>
            <td>+ ${currency}${payout.interestBonus.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="color: #d97706; font-weight: 800; font-size: 1.05rem; background: rgba(245, 158, 11, 0.12);">
            <td>🏆 एकूण मॅच्युरिटी परतावा</td>
            <td>${currency}${payout.amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>खाते स्थिती</td>
            <td style="color: #059669; font-weight: 700;">✅ पूर्ण व वाटप संपन्न</td>
          </tr>
        </table>

        <div class="receipt-footer-note" style="border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 1rem;">
          🙏 <strong>${this.getMemberDisplayName(member)}</strong> यांनी <strong>${bishiMeta.bishiName}</strong> सोबत ५० आठवड्यांचे बचत चक्र यशस्वीपणे पूर्ण केल्याबद्दल मनःपूर्वक अभिनंदन!
        </div>
      </div>

      <div class="whatsapp-preview-box" style="margin-top: 1.25rem;">
        <div class="whatsapp-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          व्हाट्सअ‍ॅप मॅच्युरिटी संदेश
        </div>
        <div class="whatsapp-text-content">${waText}</div>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            WhatsApp वर व्हाउचर पाठवा
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
            मजकूर कॉपी करा
          </button>
        </div>
      </div>
    `;

    // Show restart plan button if admin is viewing
    const btnVoucherRestart = document.getElementById('btnVoucherRestartPlan');
    if (btnVoucherRestart) {
      if (window.authManager && window.authManager.isAdmin() && stats.canRestartPlan) {
        btnVoucherRestart.style.display = 'inline-block';
        btnVoucherRestart.textContent = '🔄 नवीन सायकल सुरू करा';
        btnVoucherRestart.onclick = () => {
          document.getElementById('payoutVoucherModal')?.classList.remove('active');
          if (window.ui && window.ui.openRestartPlanModal) {
            window.ui.openRestartPlanModal(member.id);
          }
        };
      } else {
        btnVoucherRestart.style.display = 'none';
      }
    }

    this.openPayoutVoucherModal();
  }

  // --- कर्ज परतफेड व वाटप पावती HTML जनरेटर ---
  generateLoanReceiptHTML(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const isPaid = loan.status === 'paid';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = details.originalPrincipal;
    const remainingPrincipal = details.remainingPrincipal;
    const isPartiallyPaid = details.isPartiallyPaid;
    const interestPaid = isPaid ? (Number(loan.interestPaid) || 0) : details.interestAmount;
    const totalAmount = isPaid ? (Number(loan.repaidAmount) || (principal + interestPaid)) : details.totalPayable;

    const receiptNo = isPaid ? (loan.receiptNo || `LOAN-REC-${loan.id}`) : (loan.repayments && loan.repayments.length > 0 ? loan.repayments[loan.repayments.length - 1].receiptNo : `DISB-${loan.id}`);
    const dateStr = isPaid ? (loan.paidDate || new Date().toISOString().split('T')[0]) : (loan.lastRepaymentDate || loan.issueDate || new Date().toISOString().split('T')[0]);
    let formattedDate = dateStr;
    try {
      formattedDate = new Date(dateStr).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      formattedDate = dateStr;
    }

    let badgeTitle = '💳 कर्ज वाटप व्हाउचर (Loan Disbursement Voucher)';
    if (isPaid) {
      badgeTitle = '✅ कर्ज पूर्ण परतफेड पावती (Loan Repayment Receipt)';
    } else if (isPartiallyPaid) {
      badgeTitle = '🟠 अंशतः कर्ज परतफेड पावती (Partial Loan Repayment - Pending)';
    }

    const loanRateNum = Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta?.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3));
    const loanRateMr = this.toMarathiNumber(loanRateNum);

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header" style="${isPaid ? 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15));' : (isPartiallyPaid ? 'background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(59, 130, 246, 0.15));' : 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(245, 158, 11, 0.15));')}">
          <img src="assets/logo-emblem.png" alt="सुखकर्ता बीशी" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-bottom: 0.35rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid #f59e0b; background: #fff; padding: 2px; display: inline-block;">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">सदस्य कर्ज खातावही व अधिकृत पावती</div>
          <div class="receipt-badge" style="${isPaid ? 'background: rgba(16, 185, 129, 0.2); color: #059669; border-color: rgba(16, 185, 129, 0.4);' : (isPartiallyPaid ? 'background: rgba(245, 158, 11, 0.2); color: #d97706; border-color: rgba(245, 158, 11, 0.4);' : 'background: rgba(59, 130, 246, 0.2); color: #2563eb; border-color: rgba(59, 130, 246, 0.4);')}">
            ${badgeTitle}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">पावती क्रमांक</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: #2563eb;">${receiptNo}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">तारीख</div>
            <div class="meta-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-item-lbl">सदस्याचे नाव</div>
            <div class="meta-item-val" style="font-weight: 700;">${this.getMemberDisplayName(member)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">सदस्य आयडी / कर्ज आयडी</div>
            <div class="meta-item-val">${member.id} • <span style="font-family: var(--font-mono); color: #d97706;">${loan.id}</span></div>
          </div>
          <div>
            <div class="meta-item-lbl">पेमेंट पद्धत</div>
            <div class="meta-item-val">
              ${(isPaid ? loan.paymentMode : loan.disbursementMode) || 'Cash'}
              ${(isPaid ? loan.upiId : loan.disbursementUpiId) ? `<div style="font-size: 0.72rem; color: #2563eb; font-weight: 700;">UPI/Ref: ${(isPaid ? loan.upiId : loan.disbursementUpiId)}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर</div>
            <div class="meta-item-val">${member.phone}</div>
          </div>
        </div>

        <div class="receipt-amount-box" style="${isPaid ? 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.15)); border: 1.5px solid #10b981;' : (isPartiallyPaid ? 'background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(59, 130, 246, 0.15)); border: 1.5px solid #f59e0b;' : 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(245, 158, 11, 0.15)); border: 1.5px solid #3b82f6;')}">
          <div class="receipt-amount-lbl">${isPaid ? 'जमा झालेली एकूण परतफेड रक्कम' : (isPartiallyPaid ? 'आतापर्यंत जमा परतफेड रक्कम' : 'वाटप केलेली एकूण मूळ कर्ज रक्कम')}</div>
          <div class="receipt-amount-val" style="color: ${isPaid ? '#059669' : (isPartiallyPaid ? '#d97706' : '#2563eb')};">${currency}${(isPaid ? totalAmount : (isPartiallyPaid ? details.principalRepaid : principal)).toLocaleString('en-IN')}</div>
          ${isPaid ? `
            <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
              (मूळ कर्ज: ${currency}${principal.toLocaleString('en-IN')}${interestPaid > 0 ? ` + ${loanRateMr}% व्याज: +${currency}${interestPaid.toLocaleString('en-IN')}` : ' + ०% व्याज'})
            </div>
          ` : (isPartiallyPaid ? `
            <div style="font-size: 0.85rem; color: #b45309; font-weight: 700; margin-top: 0.25rem;">
              ⚠️ उर्वरित बाकी कर्ज मुद्दल: ${currency}${remainingPrincipal.toLocaleString('en-IN')} (कर्ज बाकी - Pending)
            </div>
          ` : `
            <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
              (नियम: पहिल्या ४ आठवड्यांपर्यंत ०% व्याज • ४ आठवड्यांनंतर ${loanRateMr}% व्याज)
            </div>
          `)}
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>सुरुवातीची मूळ कर्ज रक्कम (Original Principal)</td>
            <td style="font-weight: 700;">${currency}${principal.toLocaleString('en-IN')}</td>
          </tr>
          ${details.principalRepaid > 0 ? `
            <tr style="color: #059669; font-weight: 600;">
              <td>परतफेड केलेली मुद्दल (Repaid Principal)</td>
              <td>${currency}${details.principalRepaid.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="color: #d97706; font-weight: 700; background: rgba(245, 158, 11, 0.08);">
              <td>उर्वरित बाकी कर्ज मुद्दल (Remaining Principal)</td>
              <td>${currency}${remainingPrincipal.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
          <tr>
            <td>कर्ज वाटप आठवडा व तारीख</td>
            <td>आठवडा ${loan.issueWeek || 1} • ${loan.issueDate || '-'}</td>
          </tr>
          <tr>
            <td>कालावधी / आठवडे</td>
            <td>${details.elapsedWeeks} आठवडे ${details.isGracePeriodActive ? `(सवलत कालावधीत: ${details.remainingGraceWeeks} आठवडे बाकी)` : `(४ आठवड्यांनंतर ${loanRateMr}% व्याज लागू)`}</td>
          </tr>
          <tr style="color: ${interestPaid > 0 ? '#d97706' : '#64748b'}; font-weight: 600; background: ${interestPaid > 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};">
            <td>${loanRateMr}% व्याज रक्कम (४ आठवड्यांनंतर)</td>
            <td>${interestPaid > 0 ? `+ ${currency}${interestPaid.toLocaleString('en-IN')}` : '₹० (०%)'}</td>
          </tr>
          <tr style="color: ${isPaid ? '#059669' : '#2563eb'}; font-weight: 800; font-size: 1.05rem; background: ${isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'};">
            <td>${isPaid ? 'एकूण जमा परतफेड रक्कम' : 'चालू एकूण देय रक्कम'}</td>
            <td>${currency}${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>कर्ज खाते स्थिती</td>
            <td style="font-weight: 700; color: ${isPaid ? '#059669' : '#dc2626'};">
              ${isPaid 
                ? '✅ पूर्ण भरले (Paid & Closed)' 
                : (isPartiallyPaid 
                    ? `🟠 अंशतः भरले (${currency}${remainingPrincipal.toLocaleString('en-IN')} बाकी - Pending)` 
                    : '🔴 कर्ज बाकी (Pending)')}
            </td>
          </tr>
          ${loan.notes || loan.settlementNotes || loan.lastRepaymentNotes ? `
            <tr>
              <td>टीप / संदर्भ</td>
              <td style="font-size: 0.8rem; color: #64748b;">${loan.settlementNotes || loan.lastRepaymentNotes || loan.notes}</td>
            </tr>
          ` : ''}
        </table>

        <div class="receipt-footer-note" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.85rem; font-size: 0.75rem; color: #64748b;">
          📌 सुखकर्ता बीशी कर्ज नियमावली: पहिल्या ४ आठवड्यांत ०% व्याज, ४ आठवड्यांनंतर ${loanRateMr}% व्याज आकारले जाते. अधिकृत डिजिटल स्वाक्षरीसह जारी.
        </div>
      </div>
    `;
  }

  // --- कर्ज WhatsApp संदेश जनरेटर ---
  generateLoanWhatsAppText(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const isPaid = loan.status === 'paid';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = details.originalPrincipal;
    const remainingPrincipal = details.remainingPrincipal;
    const isPartiallyPaid = details.isPartiallyPaid;
    const interestPaid = isPaid ? (Number(loan.interestPaid) || 0) : details.interestAmount;
    const totalAmount = isPaid ? (Number(loan.repaidAmount) || (principal + interestPaid)) : details.totalPayable;
    const loanRateNum = Number(details?.interestRate !== undefined ? details.interestRate : (loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta?.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3)));
    const loanRateMr = this.toMarathiNumber(loanRateNum);

    let message = `✨ *${bishiMeta.bishiName} - अधिकृत कर्ज पावती* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${this.getMemberDisplayName(member)}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *तारीख:* ${isPaid ? (loan.paidDate || '-') : (loan.lastRepaymentDate || loan.issueDate || '-')}\n`;
    message += `─────────────────────\n`;

    if (isPaid) {
      message += `✅ *कर्ज परतफेड यशस्वीपणे पूर्ण झाली आहे (Paid)!*\n\n`;
      message += `💵 *मूळ कर्ज मुद्दल:* ${currency}${principal.toLocaleString('en-IN')}\n`;
      message += `📈 *${loanRateMr}% व्याज दर:* ${interestPaid > 0 ? `+${currency}${interestPaid.toLocaleString('en-IN')}` : '₹० (४ आठवड्यांच्या सवलतीत)'}\n`;
      message += `💰 *एकूण भरलेली रक्कम:* *${currency}${totalAmount.toLocaleString('en-IN')}*\n`;
      message += `💳 *पेमेंट पद्धत:* ${loan.paymentMode || 'Cash'}${loan.upiId ? ` (UPI: ${loan.upiId})` : ''}\n`;
      message += `🧾 *पावती क्र.:* ${loan.receiptNo || 'N/A'}\n`;
      message += `📊 *कर्ज स्थिती:* ✅ पूर्ण परतफेड संपन्न (Paid)\n`;
    } else if (isPartiallyPaid) {
      message += `🟠 *कर्ज अंशतः परतफेड जमा झाली आहे (Partial Payment Received)*\n\n`;
      message += `💵 *सुरुवातीची मूळ मुद्दल:* ${currency}${principal.toLocaleString('en-IN')}\n`;
      message += `💰 *आतापर्यंत भरलेली मुद्दल:* ${currency}${details.principalRepaid.toLocaleString('en-IN')}\n`;
      message += `⚠️ *उर्वरित बाकी कर्ज मुद्दल:* *${currency}${remainingPrincipal.toLocaleString('en-IN')}*\n`;
      message += `📈 *चालू ${loanRateMr}% व्याज:* ${details.interestAmount > 0 ? `+${currency}${details.interestAmount.toLocaleString('en-IN')}` : '₹० (सवलतीत)'}\n`;
      message += `💳 *पेमेंट पद्धत:* ${loan.paymentMode || 'Cash'}${loan.upiId ? ` (UPI: ${loan.upiId})` : ''}\n`;
      message += `🧾 *पावती क्र.:* ${loan.receiptNo || 'N/A'}\n`;
      message += `📊 *कर्ज स्थिती:* 🔴 कर्ज बाकी (Pending - ₹${remainingPrincipal.toLocaleString('en-IN')} बाकी)\n`;
    } else {
      message += `💳 *सदस्यास नवीन कर्ज वाटप करण्यात आले आहे.*\n\n`;
      message += `💵 *कर्ज रक्कम:* *${currency}${principal.toLocaleString('en-IN')}*\n`;
      message += `📅 *वाटप आठवडा:* आठवडा ${loan.issueWeek || 1} (${loan.issueDate || '-'})\n`;
      message += `⏳ *व्याज नियम:* पहिल्या ४ आठवड्यांत ०% व्याज • ४ आठवड्यांनंतर ${loanRateMr}% व्याज\n`;
      message += `💳 *वितरण पद्धत:* ${loan.disbursementMode || 'Cash'}${loan.disbursementUpiId ? ` (UPI: ${loan.disbursementUpiId})` : ''}\n`;
      message += `🧾 *व्हाउचर क्र.:* DISB-${loan.id}\n`;
      message += `📊 *कर्ज स्थिती:* 🔴 कर्ज बाकी (Pending)\n`;
    }

    message += `─────────────────────\n`;
    message += `_सुखकर्ता बीशी - विश्वासू व पारदर्शक फंड व्यवस्थापन_`;

    return message;
  }

  // --- कर्ज पावती मोडल दाखवणे ---
  showLoanReceiptModal(loanId) {
    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) {
      if (window.ui && window.ui.showToast) window.ui.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const member = window.bishiStore.getMember(loan.memberId);
    if (!member) {
      if (window.ui && window.ui.showToast) window.ui.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const bishiMeta = window.bishiStore.state.meta;
    const modalBody = document.getElementById('receiptModalBody');
    if (!modalBody) return;

    const waText = this.generateLoanWhatsAppText(loan, member, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      ${this.generateLoanReceiptHTML(loan, member, bishiMeta)}

      <div class="whatsapp-preview-box">
        <div class="whatsapp-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp कर्ज पावती संदेश
        </div>
        <div class="whatsapp-text-content">${waText}</div>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            WhatsApp वर पावती पाठवा
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            मजकूर कॉपी करा
          </button>
        </div>
      </div>
    `;

    this.openReceiptModal();
  }

  // --- कर्ज वाटप व्हाउचर HTML जनरेटर (Loan Assign / Disbursement Voucher HTML) ---
  generateLoanAssignVoucherHTML(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const principal = Number(loan.originalPrincipal || loan.principalAmount) || 0;
    const receiptNo = `DISB-${loan.id}`;
    const dateStr = loan.issueDate || new Date().toISOString().split('T')[0];
    let formattedDate = dateStr;
    try {
      formattedDate = new Date(dateStr).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      formattedDate = dateStr;
    }

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(16, 185, 129, 0.16));">
          <img src="assets/logo-emblem.png" alt="सुखकर्ता बीशी" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-bottom: 0.35rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid #f59e0b; background: #fff; padding: 2px; display: inline-block;">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">अधिकृत कर्ज वाटप व्हाउचर (Official Loan Assignment Voucher)</div>
          <div class="receipt-badge" style="background: rgba(59, 130, 246, 0.2); color: #2563eb; border-color: rgba(59, 130, 246, 0.45);">
            📄 कर्ज वाटप व्हाउचर (Loan Assign Voucher)
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">व्हाउचर क्रमांक (Voucher No)</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: #2563eb;">${receiptNo}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">वाटप तारीख (Date)</div>
            <div class="meta-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-item-lbl">सदस्याचे नाव (Member Name)</div>
            <div class="meta-item-val" style="font-weight: 700;">${this.getMemberDisplayName(member)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">सदस्य आयडी / कर्ज आयडी</div>
            <div class="meta-item-val">${member.id} • <span style="font-family: var(--font-mono); color: #d97706; font-weight: 700;">${loan.id}</span></div>
          </div>
          <div>
            <div class="meta-item-lbl">वितरण पद्धत (Mode)</div>
            <div class="meta-item-val">
              ${loan.disbursementMode || loan.paymentMode || 'Cash'}
              ${(loan.disbursementUpiId || loan.upiId) ? `<div style="font-size: 0.72rem; color: #2563eb; font-weight: 700;">UPI/Ref: ${loan.disbursementUpiId || loan.upiId}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर (Phone)</div>
            <div class="meta-item-val">${member.phone || '-'}</div>
          </div>
        </div>

        <div class="receipt-amount-box" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15)); border: 1.5px solid #3b82f6;">
          <div class="receipt-amount-lbl">मंजूर व वाटप केलेली मूळ कर्ज रक्कम (Assigned Loan Amount)</div>
          <div class="receipt-amount-val" style="color: #2563eb;">${currency}${principal.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
            (नियम: पहिल्या ४ आठवड्यांपर्यंत ०% व्याज • ४ आठवड्यांनंतर दर चक्रास ${this.toMarathiNumber(Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3)))}% व्याज)
          </div>
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>मंजूर कर्ज मुद्दल (Sanctioned Principal)</td>
            <td style="font-weight: 800; color: #2563eb;">${currency}${principal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>कर्ज वाटप आठवडा (Disbursed Week)</td>
            <td>आठवडा ${loan.issueWeek || 1} • ${loan.issueDate || '-'}</td>
          </tr>
          <tr>
            <td>सवलत कालावधी (Interest-free Grace Period)</td>
            <td>४ आठवडे (०% व्याज सवलत)</td>
          </tr>
          <tr>
            <td>पुढील देय व्याज नियम (Interest Terms)</td>
            <td>४ आठवड्यांनंतर दर चक्रास ${this.toMarathiNumber(Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3)))}% व्याज आकारले जाईल (+${currency}${Math.round(principal * ((Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3))) / 100))})</td>
          </tr>
          <tr>
            <td>कर्ज वाटप स्थिती (Status)</td>
            <td style="font-weight: 700; color: #059669;">
              ✅ कर्ज वाटप संपन्न (Assigned & Disbursed)
            </td>
          </tr>
          ${loan.notes ? `
            <tr>
              <td>वाटप टीप / संदर्भ</td>
              <td style="font-size: 0.8rem; color: #64748b;">${loan.notes}</td>
            </tr>
          ` : ''}
        </table>

        <div class="receipt-footer-note" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.85rem; font-size: 0.75rem; color: #64748b;">
          📌 सुखकर्ता बीशी कर्ज नियमावली: पहिल्या ४ आठवड्यांत ०% व्याज, ४ आठवड्यांनंतर दर चक्रास ${this.toMarathiNumber(Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3)))}% व्याज आकारले जाते. अधिकृत डिजिटल स्वाक्षरीसह जारी.
        </div>
      </div>
    `;
  }

  // --- कर्ज वाटप WhatsApp संदेश जनरेटर ---
  generateLoanAssignWhatsAppText(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const principal = Number(loan.originalPrincipal || loan.principalAmount) || 0;
    const loanRate = Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3));
    const interestPerCycle = Math.round(principal * (loanRate / 100));
    const mrRate = this.toMarathiNumber(loanRate);

    let message = `✨ *${bishiMeta.bishiName} - अधिकृत कर्ज वाटप व्हाउचर (Loan Assign Voucher)* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${this.getMemberDisplayName(member)}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *वाटप तारीख:* ${loan.issueDate || '-'}\n`;
    message += `─────────────────────\n`;
    message += `💵 *मंजूर व वाटप केलेली कर्ज रक्कम:* *${currency}${principal.toLocaleString('en-IN')}*\n`;
    message += `💳 *वितरण पद्धत:* ${loan.disbursementMode || loan.paymentMode || 'Cash'}${loan.disbursementUpiId ? ` (UPI: ${loan.disbursementUpiId})` : ''}\n`;
    message += `📅 *वाटप आठवडा:* आठवडा ${loan.issueWeek || 1}\n`;
    message += `🧾 *व्हाउचर क्र.:* DISB-${loan.id}\n`;
    message += `📊 *स्थिती:* ✅ अधिकृत कर्ज वाटप संपन्न (Disbursed)\n`;
    message += `─────────────────────\n`;
    message += `📌 *व्याज नियमावली (Rules):*\n`;
    message += `• पहिल्या ४ आठवड्यांपर्यंत: ०% व्याज (सवलत कालावधी)\n`;
    message += `• ४ आठवड्यांनंतर: दर चक्रास ${mrRate}% व्याज (+${currency}${interestPerCycle.toLocaleString('en-IN')}) लागू होईल\n`;
    message += `─────────────────────\n`;
    message += `_सुखकर्ता बीशी - विश्वासू व पारदर्शक फंड व्यवस्थापन_`;

    return message;
  }

  // --- कर्ज वाटप व्हाउचर मोडल दाखवणे ---
  showLoanAssignVoucherModal(loanId) {
    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) {
      if (window.ui && window.ui.showToast) window.ui.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const member = window.bishiStore.getMember(loan.memberId);
    if (!member) {
      if (window.ui && window.ui.showToast) window.ui.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const bishiMeta = window.bishiStore.state.meta;
    const modalBody = document.getElementById('receiptModalBody');
    if (!modalBody) return;

    const waText = this.generateLoanAssignWhatsAppText(loan, member, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      ${this.generateLoanAssignVoucherHTML(loan, member, bishiMeta)}

      <div class="whatsapp-preview-box">
        <div class="whatsapp-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp कर्ज वाटप व्हाउचर संदेश
        </div>
        <div class="whatsapp-text-content">${waText}</div>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            WhatsApp वर व्हाउचर पाठवा
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            मजकूर कॉपी करा
          </button>
        </div>
      </div>
    `;

    this.openReceiptModal();
  }

  // --- ४-आठवडे कर्ज व्याज पावती HTML जनरेटर (Periodic 4-Week Loan Interest Receipt HTML) ---
  generateLoanInterestReceiptHTML(loan, payment, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const principal = Number(loan.principalAmount) || 0;
    const interestAmt = Number(payment.amount) || 0;
    const cycleNum = payment.cycleNumber || 1;
    const nextDueWeek = Number(payment.paidWeek || 1) + (loan.gracePeriodWeeks || 4);

    const formattedDate = payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : new Date().toLocaleDateString('hi-IN');

    const loanRateNum = Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta?.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3));
    const loanRateMr = this.toMarathiNumber(loanRateNum);

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header">
          <img src="assets/logo-emblem.png" alt="सुखकर्ता बीशी" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-bottom: 0.35rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid #f59e0b; background: #fff; padding: 2px; display: inline-block;">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">अधिकृत ४-आठवडे कर्ज व्याज संकलन पावती</div>
          <div class="receipt-badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; border-color: rgba(245, 158, 11, 0.35);">
            💰 ४-आठवडे ${loanRateMr}% व्याज भरणा • चक्र ${cycleNum}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">पावती क्रमांक</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">${payment.receiptNo || payment.id}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">तारीख</div>
            <div class="meta-item-val">${formattedDate}</div>
          </div>
          <div>
            <div class="meta-item-lbl">सदस्याचे नाव</div>
            <div class="meta-item-val" style="font-weight: 700;">${this.getMemberDisplayName(member)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">सदस्य आयडी / कर्ज आयडी</div>
            <div class="meta-item-val">${member.id} • <span style="font-family: var(--font-mono); color: #d97706; font-weight: 700;">${loan.id}</span></div>
          </div>
          <div>
            <div class="meta-item-lbl">पेमेंट पद्धत</div>
            <div class="meta-item-val">
              ${payment.paymentMode || 'Cash'}
              ${payment.upiId ? `<div style="font-size: 0.72rem; color: #2563eb; font-weight: 700;">UPI/Ref: ${payment.upiId}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर</div>
            <div class="meta-item-val">${member.phone}</div>
          </div>
        </div>

        <div class="receipt-amount-box" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15)); border: 1.5px solid #f59e0b;">
          <div class="receipt-amount-lbl">जमा झालेले ४-आठवड्यांचे ${loanRateMr}% कर्ज व्याज</div>
          <div class="receipt-amount-val" style="color: #d97706;">${currency}${interestAmt.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
            (मूळ कर्ज मुद्दल: ${currency}${principal.toLocaleString('en-IN')} • चक्र ${cycleNum} भरणा)
          </div>
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>मूळ सक्रिय कर्ज मुद्दल (Principal)</td>
            <td style="font-weight: 700; color: #2563eb;">${currency}${principal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>कर्ज वाटप आठवडा व तारीख</td>
            <td>आठवडा ${loan.issueWeek || 1} • ${loan.issueDate || '-'}</td>
          </tr>
          <tr>
            <td>व्याज भरणा आठवडा व चक्र</td>
            <td>आठवडा ${payment.paidWeek || '-'} • <strong>चक्र ${cycleNum} (४ आठवडे)</strong></td>
          </tr>
          <tr style="color: #d97706; font-weight: 700; background: rgba(245, 158, 11, 0.08);">
            <td>या चक्राचे ${loanRateMr}% जमा व्याज</td>
            <td>+ ${currency}${interestAmt.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>आतापर्यंत जमा एकूण कर्ज व्याज</td>
            <td style="color: #059669; font-weight: 700;">${currency}${(Number(loan.totalInterestPaid) || interestAmt).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="color: #2563eb; background: rgba(59, 130, 246, 0.06);">
            <td>पुढील ४-आठवड्यांचे व्याज देय आठवडा</td>
            <td style="font-weight: 700;">आठवडा ${nextDueWeek}</td>
          </tr>
          <tr>
            <td>कर्ज मुद्दल खाते स्थिती</td>
            <td style="font-weight: 700; color: #d97706;">
              🟡 सक्रिय चालू कर्ज (Active Principal: ${currency}${principal.toLocaleString('en-IN')})
            </td>
          </tr>
          ${payment.notes ? `
            <tr>
              <td>टीप / संदर्भ</td>
              <td style="font-size: 0.8rem; color: #64748b;">${payment.notes}</td>
            </tr>
          ` : ''}
        </table>

        <div class="receipt-footer-note" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.85rem; font-size: 0.75rem; color: #64748b;">
          📌 सुखकर्ता बीशी कर्ज नियमावली: दर ४ आठवड्यांनी ${loanRateMr}% व्याज संकलित केले जाते. मूळ कर्ज मुद्दल स्वतंत्रपणे सक्रिय राहील. अधिकृत डिजिटल स्वाक्षरीसह जारी.
        </div>
      </div>
    `;
  }

  // --- ४-आठवडे कर्ज व्याज WhatsApp संदेश जनरेटर ---
  generateLoanInterestWhatsAppText(loan, payment, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const principal = Number(loan.principalAmount) || 0;
    const interestAmt = Number(payment.amount) || 0;
    const cycleNum = payment.cycleNumber || 1;
    const nextDueWeek = Number(payment.paidWeek || 1) + (loan.gracePeriodWeeks || 4);

    const loanRate = Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3));
    const mrRate = this.toMarathiNumber(loanRate);
    let message = `✨ *${bishiMeta.bishiName} - ४-आठवडे कर्ज व्याज पावती* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${this.getMemberDisplayName(member)}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *व्याज भरणा तारीख:* ${payment.paidDate || '-'}\n`;
    message += `─────────────────────\n`;
    message += `💰 *४ आठवड्यांचे ${mrRate}% व्याज यशस्वीपणे जमा झाले!*\n\n`;
    message += `💵 *जमा व्याज रक्कम:* *${currency}${interestAmt.toLocaleString('en-IN')}*\n`;
    message += `🔄 *व्याज सायकल:* चक्र ${cycleNum} (आठवडा ${payment.paidWeek || '-'})\n`;
    message += `💳 *पेमेंट पद्धत:* ${payment.paymentMode || 'Cash'}${payment.upiId ? ` (UPI: ${payment.upiId})` : ''}\n`;
    message += `🧾 *पावती क्र.:* ${payment.receiptNo || payment.id}\n\n`;
    message += `📊 *कर्ज खात्याचा ताळेबंद:*\n`;
    message += `• मूळ सक्रिय कर्ज मुद्दल: *${currency}${principal.toLocaleString('en-IN')}*\n`;
    message += `• आतापर्यंत एकूण जमा व्याज: *${currency}${(Number(loan.totalInterestPaid) || interestAmt).toLocaleString('en-IN')}*\n`;
    message += `• पुढील ४-आठवड्यांचे व्याज देय: *आठवडा ${nextDueWeek}*\n`;
    message += `─────────────────────\n`;
    message += `_सुखकर्ता बीशी - विश्वासू व पारदर्शक फंड व्यवस्थापन_`;

    return message;
  }

  // --- ४-आठवडे कर्ज व्याज पावती मोडल दाखवणे ---
  showLoanInterestReceiptModal(loanId, paymentIndexOrId = null) {
    let loan = window.bishiStore.getLoan(loanId);
    if (!loan && paymentIndexOrId) {
      const allLoans = window.bishiStore.state.loans || [];
      for (const l of allLoans) {
        if (Array.isArray(l.interestPayments)) {
          const pMatch = l.interestPayments.find(p => p.id === paymentIndexOrId || p.receiptNo === paymentIndexOrId);
          if (pMatch) {
            loan = l;
            break;
          }
        }
      }
    }
    if (!loan) {
      if (window.ui && window.ui.showToast) window.ui.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const member = window.bishiStore.getMember(loan.memberId);
    if (!member) {
      if (window.ui && window.ui.showToast) window.ui.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    let payment = null;
    if (Array.isArray(loan.interestPayments) && loan.interestPayments.length > 0) {
      if (paymentIndexOrId !== null && paymentIndexOrId !== undefined) {
        if (typeof paymentIndexOrId === 'number') {
          payment = loan.interestPayments[paymentIndexOrId];
        } else {
          payment = loan.interestPayments.find(p => p.id === paymentIndexOrId || p.receiptNo === paymentIndexOrId);
        }
      }
      if (!payment) {
        payment = loan.interestPayments[loan.interestPayments.length - 1];
      }
    }

    if (!payment) {
      if (window.ui && window.ui.showToast) window.ui.showToast('व्याज पावती सापडली नाही', 'warning');
      return;
    }

    const bishiMeta = window.bishiStore.state.meta;
    const modalBody = document.getElementById('receiptModalBody');
    if (!modalBody) return;

    const waText = this.generateLoanInterestWhatsAppText(loan, payment, member, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      ${this.generateLoanInterestReceiptHTML(loan, payment, member, bishiMeta)}

      <div class="whatsapp-preview-box">
        <div class="whatsapp-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp व्याज पावती संदेश
        </div>
        <div class="whatsapp-text-content">${waText}</div>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            WhatsApp वर व्याज पावती पाठवा
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            मजकूर कॉपी करा
          </button>
        </div>
      </div>
    `;

    this.openReceiptModal();
  }

  // --- ४-आठवडे कर्ज व्याज थकबाकी / स्मरणपत्र WhatsApp संदेश जनरेटर ---
  generateLoanInterestPendingWhatsAppText(loan, member, bishiMeta) {
    const currency = bishiMeta?.currency || '₹';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = Number(loan.principalAmount) || 0;
    const loanRate = Number(details?.interestRate !== undefined ? details.interestRate : (loan.interestRatePercent !== undefined ? loan.interestRatePercent : (bishiMeta?.loanInterestRatePercent !== undefined ? bishiMeta.loanInterestRatePercent : 3)));
    const interestAmt = details.interestAmount > 0 ? details.interestAmount : Math.round(principal * (loanRate / 100));
    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;
    const mrRate = this.toMarathiNumber(loanRate);

    let message = `✨ *${bishiMeta?.bishiName || 'सुखकर्ता बीशी'} - कर्ज व्याज भरणा स्मरणपत्र* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${this.getMemberDisplayName(member)}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *दिनांक:* ${new Date().toLocaleDateString('hi-IN', {day: '2-digit', month: 'short', year: 'numeric'})}\n`;
    message += `─────────────────────\n`;
    message += `🔔 *आदरणीय सदस्य, आपल्या कर्जाचे ४-आठवड्यांचे ${mrRate}% व्याज देय झाले आहे.*\n\n`;
    message += `💵 *मूळ सक्रिय कर्ज मुद्दल:* ${currency}${principal.toLocaleString('en-IN')}\n`;
    message += `📈 *व्याज दर:* ${mrRate}% (दर ४ आठवड्यांनी देय)\n`;
    message += `⏳ *कालावधी:* ${details.elapsedWeeks} आठवडे पूर्ण (चक्र ${details.currentCycleNumber})\n`;
    message += `💰 *या चक्राची देय व्याज रक्कम:* *${currency}${interestAmt.toLocaleString('en-IN')}*\n`;
    message += `📅 *देय आठवडा:* आठवडा ${details.nextInterestDueWeek || currentWeek}\n\n`;
    message += `📌 *कृपया हे ${mrRate}% व्याज प्रशासकांकडे वेळेवर जमा करून अधिकृत पावती प्राप्त करावी.*\n`;
    message += `─────────────────────\n`;
    message += `_सुखकर्ता बीशी - विश्वासू व पारदर्शक फंड व्यवस्थापन_`;

    return message;
  }

  // --- कर्ज व्याज भरणा स्मरणपत्र WhatsApp वर पाठवणे ---
  sendLoanInterestPendingReminder(loanId, openDirectly = true) {
    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) {
      if (window.ui && window.ui.showToast) window.ui.showToast('कर्ज तपशील सापडला नाही', 'error');
      return;
    }

    const member = window.bishiStore.getMember(loan.memberId);
    if (!member) {
      if (window.ui && window.ui.showToast) window.ui.showToast('सदस्य तपशील सापडला नाही', 'error');
      return;
    }

    const bishiMeta = window.bishiStore.state.meta;
    const waText = this.generateLoanInterestPendingWhatsAppText(loan, member, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    if (openDirectly) {
      let winOpened = false;
      try {
        const newWin = window.open(waUrl, '_blank');
        if (newWin && !newWin.closed && typeof newWin.closed !== 'undefined') {
          winOpened = true;
          if (window.ui && window.ui.showToast) {
            window.ui.showToast(`सदस्य ${this.getMemberDisplayName(member)} यांना WhatsApp कर्ज व्याज संदेश पाठवला जात आहे...`, 'success');
          }
        }
      } catch (err) {
        winOpened = false;
      }

      // जर ब्राउझरने पॉप-अप ब्लॉक केले असेल, तर लगेच स्मरणपत्र मोडल दाखवा
      if (!winOpened) {
        this.showLoanInterestReminderModal(loanId);
      }
    } else {
      this.showLoanInterestReminderModal(loanId);
    }
  }

  // --- कर्ज व्याज स्मरणपत्र प्रिव्ह्यू मोडल दाखवणे ---
  showLoanInterestReminderModal(loanId) {
    const loan = window.bishiStore.getLoan(loanId);
    if (!loan) return;
    const member = window.bishiStore.getMember(loan.memberId);
    if (!member) return;
    const bishiMeta = window.bishiStore.state.meta;
    const details = window.bishiStore.calculateLoanDetails(loan);
    const currency = bishiMeta?.currency || '₹';
    const interestAmt = details.interestAmount > 0 ? details.interestAmount : Math.round(loan.principalAmount * (details.interestRate / 100));

    const modalBody = document.getElementById('receiptModalBody');
    if (!modalBody) return;

    const waText = this.generateLoanInterestPendingWhatsAppText(loan, member, bishiMeta);
    const waUrl = `https://wa.me/${member.phone ? '91' + member.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      <div class="receipt-wrapper">
        <div class="receipt-header" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">४-आठवडे कर्ज व्याज भरणा स्मरणपत्र</div>
          <div class="receipt-badge" style="background: rgba(245, 158, 11, 0.2); color: #d97706; border-color: rgba(245, 158, 11, 0.4);">
            🔔 व्याज थकबाकी स्मरणपत्र (चक्र ${details.currentCycleNumber})
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <div class="meta-item-lbl">सदस्याचे नाव</div>
            <div class="meta-item-val" style="font-weight: 700;">${this.getMemberDisplayName(member)}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">मोबाईल नंबर</div>
            <div class="meta-item-val">📞 ${member.phone}</div>
          </div>
          <div>
            <div class="meta-item-lbl">कर्ज आयडी</div>
            <div class="meta-item-val" style="font-family: var(--font-mono); font-weight: 700; color: #d97706;">${loan.id}</div>
          </div>
          <div style="text-align: right;">
            <div class="meta-item-lbl">कालावधी</div>
            <div class="meta-item-val">${details.elapsedWeeks} आठवडे एकूण</div>
          </div>
        </div>

        <div class="receipt-amount-box" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1)); border: 1.5px solid #f59e0b;">
          <div class="receipt-amount-lbl">या चक्राची देय ${this.toMarathiNumber(details.interestRate)}% व्याज रक्कम</div>
          <div class="receipt-amount-val" style="color: #d97706;">${currency}${interestAmt.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
            (मूळ सक्रिय कर्ज मुद्दल: ${currency}${Number(loan.principalAmount).toLocaleString('en-IN')})
          </div>
        </div>

        <div class="whatsapp-preview-box">
          <div class="whatsapp-preview-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            थेट WhatsApp स्मरणपत्र संदेश प्रिव्ह्यू
          </div>
          <div class="whatsapp-text-content">${waText}</div>
          <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; flex-wrap: wrap;">
            <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              WhatsApp वर स्मरणपत्र पाठवा
            </a>
            <button class="btn btn-secondary btn-sm" onclick="window.receiptManager.copyWhatsAppMessage('${encodeURIComponent(waText)}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              मजकूर कॉपी करा
            </button>
            <button class="btn btn-gold btn-sm" onclick="document.getElementById('receiptModal').classList.remove('active'); window.ui.openPayLoanInterestModal('${loan.id}');" style="font-weight: 700;">
              💰 आताच व्याज जमा करा
            </button>
          </div>
        </div>
      </div>
    `;

    this.openReceiptModal();
  }

  // --- सदस्य खातावही कार्ड रजिस्टर (Member Ledger Card Register HTML Generator) ---
  generateMemberLedgerReportHTML(member, cycleNumber = null, showAllWeeks = false) {
    if (!member) return '<div class="alert alert-error">सदस्य सापडला नाही</div>';

    const bishiMeta = window.bishiStore?.state?.meta || { bishiName: 'Sushant Bishi', currency: '₹' };
    const currency = bishiMeta.currency || '₹';
    const activeCycleNum = member.currentCycle || 1;
    const viewingCycle = cycleNumber ? Number(cycleNumber) : activeCycleNum;
    const isPastCycle = viewingCycle < activeCycleNum;

    let weeksList = member.weeks || [];
    let stats = null;

    if (isPastCycle && member.pastCycles && member.pastCycles.length > 0) {
      const pastCycle = member.pastCycles.find(c => c.cycleNumber === viewingCycle);
      if (pastCycle) {
        weeksList = pastCycle.weeks || [];
        stats = pastCycle.stats || (window.bishiStore ? window.bishiStore.calculateMemberStats(pastCycle) : null);
      }
    }

    if (!stats) {
      stats = window.bishiStore ? window.bishiStore.calculateMemberStats(member) : {
        weeklyAmount: member.weeklyAmount || 2000,
        totalTarget: (member.weeklyAmount || 2000) * 50,
        totalDeposited: 0,
        totalFinePaid: 0,
        effectivePaidWeeks: 0,
        remainingAmount: 0,
        interestAmount: 0,
        maturityInterestPercent: 10
      };
    }
    const isEn = typeof window !== 'undefined' && window.i18n && typeof window.i18n.isEnglish === 'function' && window.i18n.isEnglish();
    const isMonthly = stats.isMonthly || member.frequency === 'monthly';
    const periodUnit = isMonthly ? (isEn ? 'Month' : 'महिना') : (isEn ? 'Week' : 'आठवडा');
    const periodUnitPlural = isMonthly ? (isEn ? 'Months' : 'महिने') : (isEn ? 'Weeks' : 'आठवडे');
    const totalPeriods = isMonthly ? 12 : 50;
    const weeklyAmount = Number(member.monthlyAmount) || Number(member.weeklyAmount) || Number(stats.installmentAmount) || 2000;
    const accountNo = member.accountNo || (member.id ? member.id.replace(/\D/g, '') || member.id : '1');
    const rawMemberName = this.getMemberMarathiName(member) || member.nameMarathi || member.name || 'सर्वेश नलावडे';
    const memberName = rawMemberName.replace(/\s*\([a-zA-Z\s.-]+\)/g, '').trim();
    const englishMatch = (member.name || '').match(/\(([a-zA-Z\s.-]+)\)/);
    const englishMemberName = englishMatch ? englishMatch[1].trim() : ((member.name && /[a-zA-Z]/.test(member.name)) ? member.name.replace(/\s*\([^)]*\)/g, '').trim() : '');
    const displayName = isEn ? (englishMemberName || memberName) : memberName;
    const rawAddress = member.address || member.notes || 'सांगली';
    const address = (rawAddress === 'N/A' || rawAddress.toLowerCase() === 'n/a') ? 'सांगली' : rawAddress.replace(/\s*\([a-zA-Z\s.-]+\)/g, '').trim();
    const displayAddress = isEn ? (address === 'सांगली' ? 'Sangli' : address) : address;
    const phone = member.phone || '0000000000';
    const interestPercent = Number(bishiMeta.maturityInterestPercent !== undefined ? bishiMeta.maturityInterestPercent : 10);

    let nomineeDisplay = isEn ? 'Nominee: Not Applicable' : 'वारस: लागू नाही';
    if (member.nominee && member.nominee.trim() && member.nominee.trim().toUpperCase() !== 'N/A') {
      const cleanNom = member.nominee.replace(/\s*\([a-zA-Z\s.-]+\)/g, '').trim();
      nomineeDisplay = cleanNom ? (isEn ? `Nominee: ${cleanNom}` : `वारस: ${cleanNom}`) : (isEn ? 'Nominee: Not Applicable' : 'वारस: लागू नाही');
    }

    // Member loans for this cycle/period
    const allLoans = window.bishiStore?.getMemberLoans ? window.bishiStore.getMemberLoans(member.id) : ((window.bishiStore?.state?.loans || []).filter(l => l.memberId === member.id));

    // Calculate loan totals for this member
    let totalLoanDisbursed = 0;
    let totalLoanPrincipalRepaid = 0;
    let totalLoanInterestDeposited = 0;
    allLoans.forEach(l => {
      totalLoanDisbursed += Number(l.originalPrincipal || l.principalAmount) || 0;
      totalLoanPrincipalRepaid += Number(l.principalRepaid || l.repaidAmount) || 0;
      totalLoanInterestDeposited += Number(l.totalInterestPaid || l.interestPaid) || 0;
    });
    const remainingLoanPrincipal = Math.max(0, totalLoanDisbursed - totalLoanPrincipalRepaid);
    const activeOrFirstLoan = allLoans.find(l => l.status === 'active') || allLoans[0];
    const memberLoanRate = activeOrFirstLoan?.interestRatePercent || activeOrFirstLoan?.details?.interestRate || 3;
    const memberLoanRateMr = this.toMarathiNumber(memberLoanRate);

    // Filter weeks to show:
    // If showAllWeeks is true: show all 50 weeks
    // If showAllWeeks is false: show weeks where Bishi deposit was given, OR loan was disbursed, OR loan principal/interest was paid
    let weeksToShow;
    if (showAllWeeks) {
      weeksToShow = weeksList;
    } else {
      const activeWeeks = weeksList.filter(w => {
        const dep = Number(w.amountPaid) || 0;
        const fine = Number(w.finePaid) || 0;
        const hasLoanDisbursed = allLoans.some(l => Number(l.issueWeek) === w.weekNumber);
        const hasRepayment = allLoans.some(l => 
          (Array.isArray(l.repayments) && l.repayments.some(r => Number(r.paidWeek) === w.weekNumber)) ||
          (Array.isArray(l.interestPayments) && l.interestPayments.some(p => Number(p.paidWeek) === w.weekNumber))
        );
        return dep > 0 || fine > 0 || hasLoanDisbursed || hasRepayment;
      });
      weeksToShow = activeWeeks.length > 0 ? activeWeeks : [weeksList[0] || { weekNumber: 1, amountPaid: 0, status: 'pending' }];
    }

    // Month names
    const marathiMonthsRow = [
      'जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून',
      'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'
    ];
    const englishMonthsRow = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Date formatting helper
    const formatRegDate = (dVal) => {
      if (dVal) {
        try {
          const d = new Date(dVal);
          if (!isNaN(d.getTime())) {
            const day = d.getDate();
            const month = isEn ? englishMonthsRow[d.getMonth()] : marathiMonthsRow[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
          }
        } catch (_) {}
      }
      return '-';
    };

    let runningDeposit = 0;
    let runningPenalty = 0;
    let runningLoanGiven = 0;
    let runningLoanRepayPrincipal = 0;
    let runningLoanRepayInterest = 0;
    let runningExpected = 0;

    let rowsHTML = '';
    weeksToShow.forEach((w, idx) => {
      const depositAmt = Number(w.amountPaid) || 0;
      const fineAmt = Number(w.finePaid) || 0;
      runningDeposit += depositAmt;
      runningPenalty += fineAmt;

      // Check loan disbursed on this week
      const loanIssued = allLoans.find(l => Number(l.issueWeek) === w.weekNumber);
      const loanGivenAmt = loanIssued ? (Number(loanIssued.originalPrincipal || loanIssued.principalAmount) || 0) : 0;
      runningLoanGiven += loanGivenAmt;

      // Check repayments on this week
      let repaidPrincipal = 0;
      let repaidInterest = 0;
      let loanTransDate = null;

      allLoans.forEach(l => {
        if (Array.isArray(l.repayments)) {
          l.repayments.forEach(r => {
            if (Number(r.paidWeek) === w.weekNumber) {
              repaidPrincipal += (Number(r.principalPaid || r.principalRepaid || r.amount) || 0);
              repaidInterest += (Number(r.interestPaid) || 0);
              if (r.paidDate || r.date) loanTransDate = r.paidDate || r.date;
            }
          });
        }
        if (Array.isArray(l.interestPayments)) {
          l.interestPayments.forEach(p => {
            if (Number(p.paidWeek) === w.weekNumber) {
              repaidInterest += (Number(p.amount || p.interestAmount) || 0);
              if (p.paidDate || p.date) loanTransDate = p.paidDate || p.date;
            }
          });
        }
      });
      runningLoanRepayPrincipal += repaidPrincipal;
      runningLoanRepayInterest += repaidInterest;

      // Determine date: Bishi paidDate > Loan issueDate > Repayment/Interest paidDate
      let dateStr = formatRegDate(w.paidDate);
      if (dateStr === '-') {
        if (loanIssued && loanIssued.issueDate) {
          dateStr = formatRegDate(loanIssued.issueDate);
        } else if (loanTransDate) {
          dateStr = formatRegDate(loanTransDate);
        }
      }

      // Check if this week is an interest pay date or has loan interest/repayment
      let isInterestPayWeek = false;
      let interestAmtForWeek = repaidInterest;

      // Check scheduled interest pay dates for active loans (every gracePeriodWeeks)
      if (allLoans.length > 0) {
        allLoans.forEach(loan => {
          const isLoanPaid = loan.status === 'paid';
          const loanPaidWeek = (loan.paidWeek !== undefined && loan.paidWeek !== null && loan.paidWeek !== '') 
            ? Number(loan.paidWeek) 
            : (Array.isArray(loan.repayments) && loan.repayments.length > 0 ? Math.max(...loan.repayments.map(r => Number(r.paidWeek) || 0)) : (isLoanPaid ? (Number(loan.issueWeek) || 1) : null));

          // If loan is already paid and current week is after the paid week, loan is closed
          if (isLoanPaid && loanPaidWeek !== null && w.weekNumber > loanPaidWeek) {
            return;
          }

          const origP = Number(loan.originalPrincipal || loan.principalAmount) || 0;
          let repPUpToThisWeek = 0;
          if (Array.isArray(loan.repayments)) {
            loan.repayments.forEach(r => {
              if (Number(r.paidWeek) <= w.weekNumber) {
                repPUpToThisWeek += (Number(r.principalPaid || r.principalRepaid || r.amount) || 0);
              }
            });
          } else {
            repPUpToThisWeek = Number(loan.principalRepaid || 0);
          }

          const remPAtWeek = Math.max(0, origP - repPUpToThisWeek);
          if (remPAtWeek <= 0) {
            return;
          }

          const issueWk = Number(loan.issueWeek) || 1;
          const cycleWeeks = Number(loan.gracePeriodWeeks !== undefined ? loan.gracePeriodWeeks : 4);
          const rate = Number(loan.interestRatePercent !== undefined ? loan.interestRatePercent : 3);
          const diffWeeks = w.weekNumber - issueWk;

          if (diffWeeks > 0 && diffWeeks % cycleWeeks === 0) {
            isInterestPayWeek = true;
            if (interestAmtForWeek === 0) {
              interestAmtForWeek = Math.round(remPAtWeek * (rate / 100));
            }
          }
        });
      }

      if (repaidInterest > 0) {
        isInterestPayWeek = true;
      }

      let rowExpected = weeklyAmount;
      if (isInterestPayWeek && interestAmtForWeek > 0) {
        rowExpected += interestAmtForWeek;
      }
      if (repaidPrincipal > 0) {
        rowExpected += repaidPrincipal;
      }
      runningExpected += rowExpected;

      const totalPaidForRow = depositAmt + repaidPrincipal + repaidInterest;
      const rowBalanceDue = Math.max(0, rowExpected - totalPaidForRow);
      const hasPayment = depositAmt > 0 || repaidInterest > 0 || repaidPrincipal > 0;

      const targetWeekNumber = Number(w.weekNumber || (idx + 1));
      const currentWeek = Number(window.bishiStore?.state?.meta?.currentWeek || 1);
      const isDirectPaid = (depositAmt >= weeklyAmount);
      const isCleared = !isDirectPaid && (targetWeekNumber <= (stats.effectivePaidWeeks || 0)) && (interestAmtForWeek <= repaidInterest);
      const isOverdue = !isDirectPaid && !isCleared && w.status !== 'skipped' && (w.status === 'overdue' || (targetWeekNumber < currentWeek));
      const effectiveRowBalanceDue = isCleared ? 0 : rowBalanceDue;

      rowsHTML += `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #111;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 700; color: #111; white-space: nowrap;">${dateStr}</td>
          <td style="text-align: right; font-weight: 700; color: #047857;">
            ${depositAmt > 0 ? currency + depositAmt.toLocaleString('en-IN') : '<span style="color: #991b1b;">-</span>'}
          </td>
          <td style="text-align: right; font-weight: 700; color: #047857;">
            ${runningDeposit > 0 ? currency + runningDeposit.toLocaleString('en-IN') : '<span style="color: #991b1b;">-</span>'}
          </td>
          <td style="text-align: center; font-weight: 700; color: #991b1b;">
            ${fineAmt > 0 ? currency + fineAmt.toLocaleString('en-IN') : '-'}
          </td>
          <td style="text-align: center; font-weight: 700; color: #065f46;">
            ${loanGivenAmt > 0 ? currency + loanGivenAmt.toLocaleString('en-IN') : '-'}
          </td>
          <td style="text-align: center; font-weight: 700; color: #047857;">
            ${repaidPrincipal > 0 ? currency + repaidPrincipal.toLocaleString('en-IN') : '-'}
          </td>
          <td style="text-align: center; font-weight: 700; color: #047857;">
            ${repaidInterest > 0 ? currency + repaidInterest.toLocaleString('en-IN') : '-'}
          </td>
          <td style="text-align: center; font-weight: 700; color: #991b1b;">-</td>
          <td style="text-align: right; font-weight: 700; color: ${hasPayment ? (effectiveRowBalanceDue > 0 ? '#b91c1c' : '#047857') : (isOverdue ? '#b91c1c' : '#991b1b')};">
            ${hasPayment ? (currency + effectiveRowBalanceDue.toLocaleString('en-IN')) : (isOverdue ? (currency + effectiveRowBalanceDue.toLocaleString('en-IN')) : '-')}
          </td>
        </tr>
      `;
    });

    const totalExpectedForRows = runningExpected;
    const totalReceived = runningDeposit + runningLoanRepayPrincipal + runningLoanRepayInterest;
    const finalBalanceDue = Math.max(0, totalExpectedForRows - totalReceived);

    const isPayoutTime = !!((stats && (stats.isFullyPaid || stats.isPayoutCompleted)) || 
                          member.payoutStatus === 'completed' || 
                          member.status === 'completed' || 
                          isPastCycle);

    const baseDeposited = runningDeposit > 0 ? runningDeposit : (weeksToShow.length * weeklyAmount);
    const annualInterestPercent = interestPercent;
    const interestAmount = isPayoutTime ? Math.round(baseDeposited * (annualInterestPercent / 100)) : 0;
    const totalWithInterest = baseDeposited + interestAmount;
    const projectedPayoutInterest = Math.round(baseDeposited * (annualInterestPercent / 100));

    const today = new Date();
    const todayStr = isEn
      ? `${today.getDate()} ${englishMonthsRow[today.getMonth()]} ${today.getFullYear()}`
      : `${today.getDate()} ${marathiMonthsRow[today.getMonth()]} ${today.getFullYear()}`;

    return `
      <div class="member-ledger-card-register" id="printableMemberLedgerArea">
        <!-- Top Title & Office Header -->
        <div class="ledger-top-header">
          <div>
            <div class="ledger-brand-title">${isEn ? (bishiMeta.bishiNameEn || (bishiMeta.bishiName === 'सुखकर्ता बीशी' ? 'Sukhakarta Bishi' : bishiMeta.bishiName) || 'Sukhakarta Bishi') : (bishiMeta.bishiName || 'सुखकर्ता बीशी')}</div>
            <div class="ledger-doc-title">${isEn ? 'Member Ledger Card Register' : 'सदस्य खातावही कार्ड रजिस्टर'}</div>
          </div>
          <div class="ledger-top-meta">
            <div style="font-weight: 700; color: #111;">${isEn ? `Office: ${bishiMeta.officeNameEn || (bishiMeta.officeName === 'मुख्य कार्यालय' ? 'Head Office' : bishiMeta.officeName) || 'Head Office'} | Date: ${todayStr}` : `कार्यालय: ${bishiMeta.officeName || 'मुख्य कार्यालय'} | तारीख: ${todayStr}`}</div>
            <div class="ledger-page-num">${isEn ? 'Page: 1 / 1' : 'पृष्ठ: १ / १'}</div>
          </div>
        </div>
        <div class="ledger-header-divider"></div>

        <!-- Member Info Card Table (Terracotta Saddle Brown Headers, Cream Values) -->
        <div class="ledger-info-table-wrap">
          <table class="ledger-info-table">
            <tr>
              <td class="info-lbl">${isEn ? 'Account No.:' : 'खाते क्र.:'}</td>
              <td class="info-val info-acc">${accountNo}</td>
              <td class="info-lbl">${isEn ? 'Member Name:' : 'सभासदाचे नाव:'}</td>
              <td class="info-val info-name">${displayName}</td>
            </tr>
            <tr>
              <td class="info-lbl">${isMonthly ? (isEn ? 'Monthly Installment:' : 'मासिक हप्ता:') : (isEn ? 'Weekly Installment:' : 'साप्ताहिक हप्ता:')}</td>
              <td class="info-val info-inst">
                <span class="info-green">${currency}${weeklyAmount.toLocaleString('en-IN')} (${isMonthly ? (isEn ? 'per month' : 'दर महिना') : (isEn ? 'per week' : 'दर आठवडा')})</span>
              </td>
              <td class="info-lbl">${isEn ? 'Address & Mobile:' : 'पत्ता व मोबाईल:'}</td>
              <td class="info-val info-addr">${displayAddress} (${phone})</td>
            </tr>
            <tr>
              <td class="info-lbl">${isEn ? 'Total Bishi Payout:' : 'एकूण बीशी परतावा:'}</td>
              <td class="info-val info-bishi">
                <span class="info-green">${currency}${totalWithInterest.toLocaleString('en-IN')}</span>
                <span class="info-base-int">${isPayoutTime 
                  ? (isEn 
                      ? `(Principal: ${currency}${baseDeposited.toLocaleString('en-IN')} + ${annualInterestPercent}% Annual Interest: +${currency}${interestAmount.toLocaleString('en-IN')})` 
                      : `(मूळ बचत: ${currency}${baseDeposited.toLocaleString('en-IN')} + ${annualInterestPercent}% वार्षिक व्याज: +${currency}${interestAmount.toLocaleString('en-IN')})`)
                  : (isEn 
                      ? `(Current Savings: ${currency}${baseDeposited.toLocaleString('en-IN')} • ${annualInterestPercent}% Annual Interest applicable at payout)` 
                      : `(चालू मूळ बचत: ${currency}${baseDeposited.toLocaleString('en-IN')} • ${annualInterestPercent}% वार्षिक व्याज परताव्याच्या वेळी लागू)`)}</span>
              </td>
              <td class="info-lbl">${isEn ? 'Dividend & Interest Rate:' : 'लाभांश व व्याज दर:'}</td>
              <td class="info-val info-dividend">
                <span class="info-blue">${annualInterestPercent}% ${isEn ? '(Annual Return)' : '(वार्षिक परतावा)'}</span>
              </td>
            </tr>
            ${totalLoanDisbursed > 0 ? `
              <tr>
                <td class="info-lbl" style="background: linear-gradient(135deg, #064e3b, #047857); color: #ffffff;">${isEn ? 'Loan Details:' : 'कर्ज तपशील:'}</td>
                <td class="info-val" style="background: #f8fafc; font-weight: 700; color: #0f172a;">
                  ${isEn ? `Total Disbursed: <strong>${currency}${totalLoanDisbursed.toLocaleString('en-IN')}</strong> • Remaining Principal: <strong style="color: ${remainingLoanPrincipal > 0 ? '#dc2626' : '#059669'};">${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}</strong>` : `एकूण वाटप: <strong>${currency}${totalLoanDisbursed.toLocaleString('en-IN')}</strong> • बाकी मुद्दल: <strong style="color: ${remainingLoanPrincipal > 0 ? '#dc2626' : '#059669'};">${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}</strong>`}
                </td>
                <td class="info-lbl" style="background: linear-gradient(135deg, #064e3b, #047857); color: #ffffff;">${isEn ? 'Loan Interest Deposited:' : 'कर्ज व्याज जमा:'}</td>
                <td class="info-val" style="background: #f0fdf4; font-weight: 700; color: #047857;">
                  ${isEn ? `Total Interest: <span style="background: #d1fae5; color: #047857; padding: 0.15rem 0.55rem; border-radius: 4px; border: 1px solid #10b981; font-weight: 800;">+${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')} (${memberLoanRate}% Rate)</span>` : `एकूण जमा व्याज: <span style="background: #d1fae5; color: #047857; padding: 0.15rem 0.55rem; border-radius: 4px; border: 1px solid #10b981; font-weight: 800;">+${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')} (${memberLoanRateMr}% दर)</span>`}
                </td>
              </tr>
            ` : ''}
          </table>
        </div>

        <div class="ledger-mobile-scroll-hint no-print">${isEn ? '👉 Scroll left / right to view complete ledger 👈' : '👉 संपूर्ण खातावही पाहण्यासाठी डावीकडे / उजवीकडे स्क्रोल करा 👈'}</div>

        <!-- Main Ledger Data Table -->
        <div class="ledger-table-wrap">
          <table class="ledger-data-table">
            <thead>
              <tr>
                <th style="width: 42px;">${isEn ? 'Sr.' : 'अ.क्र.'}</th>
                <th style="width: 95px;">${isEn ? 'Date' : 'तारीख'}</th>
                <th style="width: 95px;" class="th-green">${isEn ? 'Installment Deposit' : 'जमा हप्ता'}<br><span class="th-green-sub">(${currency})</span></th>
                <th style="width: 105px;" class="th-green">${isEn ? 'Total Deposit' : 'एकूण जमा'}<br><span class="th-green-sub">(${currency})</span></th>
                <th style="width: 65px;" class="th-red">${isEn ? 'Fine' : 'दंड'}<br><span style="font-size: 0.72rem; font-weight: 600;">(${currency})</span></th>
                <th style="width: 85px;" class="th-brown">${isEn ? 'Loan Disbursed' : 'कर्ज वाटप'}<br><span style="font-size: 0.72rem; font-weight: 600; color: #065f46;">(${currency})</span></th>
                <th style="width: 110px;" class="th-brown">${isEn ? 'Loan Principal Repaid' : 'कर्ज परतफेड मुद्दल'}<br><span class="th-green-sub">(${currency})</span></th>
                <th style="width: 110px;" class="th-brown">${isEn ? 'Loan Interest Deposited' : 'कर्ज व्याज जमा'}<br><span class="th-green-sub">(${currency})</span></th>
                <th style="width: 60px;" class="th-red">${isEn ? 'Fine' : 'दंड'}<br><span style="font-size: 0.72rem; font-weight: 600;">(${currency})</span></th>
                <th style="width: 90px;">${isEn ? 'Remaining Balance' : 'शिल्लक बाकी'}<br><span style="font-size: 0.72rem; font-weight: 600; opacity: 0.9;">(${currency})</span></th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td style="text-align: center; font-weight: 800; color: #ffffff;">-</td>
                <td style="text-align: center; font-weight: 800; color: #ffffff; letter-spacing: 0.05em;">${isEn ? 'Total' : 'एकूण'}</td>
                <td style="text-align: right; font-weight: 800; color: #a7f3d0;">${currency}${runningDeposit.toLocaleString('en-IN')}</td>
                <td style="text-align: right; font-weight: 800; color: #a7f3d0;">${currency}${runningDeposit.toLocaleString('en-IN')}</td>
                <td style="text-align: center; font-weight: 800; color: #fecaca;">${runningPenalty > 0 ? currency + runningPenalty.toLocaleString('en-IN') : '-'}</td>
                <td style="text-align: center; font-weight: 800; color: #fecaca;">${runningLoanGiven > 0 ? currency + runningLoanGiven.toLocaleString('en-IN') : '-'}</td>
                <td style="text-align: center; font-weight: 800; color: #a7f3d0;">${runningLoanRepayPrincipal > 0 ? currency + runningLoanRepayPrincipal.toLocaleString('en-IN') : '-'}</td>
                <td style="text-align: center; font-weight: 800; color: #a7f3d0;">${runningLoanRepayInterest > 0 ? currency + runningLoanRepayInterest.toLocaleString('en-IN') : '-'}</td>
                <td style="text-align: center; font-weight: 800; color: #fecaca;">-</td>
                <td style="text-align: right; font-weight: 800; color: #fecaca;">${currency}${finalBalanceDue.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Bottom Summary & Signature Section -->
        <div class="ledger-bottom-section">
          <!-- Notes box -->
          <div class="ledger-notes-card">
            <div class="notes-line notes-takani">${isEn ? `1) ${nomineeDisplay}` : `१) टाकणी: ${nomineeDisplay}`}</div>
            <div class="notes-line notes-dividend">${isEn ? `2) Dividend / Payout Interest (${annualInterestPercent}% Annual): ${isPayoutTime ? currency + interestAmount.toLocaleString('en-IN') : 'Applicable at payout (approx. +' + currency + projectedPayoutInterest.toLocaleString('en-IN') + ')'}` : `२) लाभांश / परतावा व्याज (${annualInterestPercent}% वार्षिक): ${isPayoutTime ? currency + interestAmount.toLocaleString('en-IN') : 'परताव्याच्या वेळी लागू (अंदाजे +' + currency + projectedPayoutInterest.toLocaleString('en-IN') + ')'}`}</div>
            <div class="notes-line notes-acc">${isEn ? `3) Account No.: ${accountNo}` : `३) खाते क्र.: ${accountNo}`}</div>
            <div class="notes-line notes-payout">${isEn ? `4) Total Final Payout: ${currency}${totalWithInterest.toLocaleString('en-IN')} ${!isPayoutTime ? '(Current Savings • Payable with ' + annualInterestPercent + '% annual interest upon completing ' + totalPeriods + ' ' + periodUnitPlural + ')' : ''}` : `४) एकूण अंतिम परतावा: ${currency}${totalWithInterest.toLocaleString('en-IN')} ${!isPayoutTime ? '(चालू बचत • ' + totalPeriods + ' ' + periodUnitPlural + ' पूर्ण झाल्यावर ' + annualInterestPercent + '% वार्षिक व्याजासह वाटप)' : ''}`}</div>
            ${totalLoanDisbursed > 0 ? `
              <div class="notes-line" style="color: #065f46; font-weight: 700; border-top: 1px dashed #a7f3d0; padding-top: 3px; margin-top: 2px;">
                ${isEn ? `5) Loan & Interest Ledger: Total Loan ${currency}${totalLoanDisbursed.toLocaleString('en-IN')} (Remaining Principal: ${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}) • Total ${memberLoanRate}% Interest: +${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')}` : `५) कर्ज व व्याज ताळेबंद: एकूण कर्ज ${currency}${totalLoanDisbursed.toLocaleString('en-IN')} (बाकी मुद्दल: ${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}) • एकूण जमा ${memberLoanRateMr}% व्याज: +${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')}`}
              </div>
            ` : ''}
          </div>

          <!-- Signature Section -->
          <div class="ledger-ack-section">
            <div class="ledger-sign-line">
              ${isEn ? 'Secretary / President' : 'सचिव / अध्यक्ष'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- सदस्य खातावही WhatsApp मजकूर ---
  generateMemberLedgerWhatsAppText(member, cycleNumber = null) {
    const isEn = typeof window !== 'undefined' && window.i18n && typeof window.i18n.isEnglish === 'function' && window.i18n.isEnglish();
    const stats = window.bishiStore ? window.bishiStore.calculateMemberStats(member) : {};
    const isMonthly = stats.isMonthly || member.frequency === 'monthly';
    const periodUnit = isMonthly ? (isEn ? 'Month' : 'महिना') : (isEn ? 'Week' : 'आठवडा');
    const periodUnitPlural = isMonthly ? (isEn ? 'Months' : 'महिने') : (isEn ? 'Weeks' : 'आठवडे');
    const totalPeriods = isMonthly ? 12 : 50;
    const bishiMeta = window.bishiStore?.state?.meta || { bishiName: 'सुखकर्ता बीशी' };
    const bishiTitle = isEn ? (bishiMeta.bishiNameEn || (bishiMeta.bishiName === 'सुखकर्ता बीशी' ? 'Sukhakarta Bishi' : bishiMeta.bishiName) || 'Sukhakarta Bishi') : (bishiMeta.bishiName || 'सुखकर्ता बीशी');
    const currency = bishiMeta.currency || '₹';
    const weeklyAmount = Number(member.monthlyAmount) || Number(member.weeklyAmount) || Number(stats.installmentAmount) || 2000;
    const interestPercent = Number(bishiMeta.maturityInterestPercent !== undefined ? bishiMeta.maturityInterestPercent : 10);
    const isPayoutTime = !!((stats && (stats.isFullyPaid || stats.isPayoutCompleted)) || 
                          member.payoutStatus === 'completed' || 
                          member.status === 'completed');
    const baseDeposited = stats.totalDeposited || 0;
    const annualInterestPercent = interestPercent;
    const interestAmt = isPayoutTime ? Math.round(baseDeposited * (annualInterestPercent / 100)) : 0;
    const totalWithInterest = baseDeposited + interestAmt;
    const projectedInterest = Math.round(baseDeposited * (annualInterestPercent / 100));

    const allLoans = window.bishiStore?.getMemberLoans ? window.bishiStore.getMemberLoans(member.id) : ((window.bishiStore?.state?.loans || []).filter(l => l.memberId === member.id));
    let totalLoanDisbursed = 0;
    let totalLoanPrincipalRepaid = 0;
    let totalLoanInterestDeposited = 0;
    allLoans.forEach(l => {
      totalLoanDisbursed += Number(l.originalPrincipal || l.principalAmount) || 0;
      totalLoanPrincipalRepaid += Number(l.principalRepaid || l.repaidAmount) || 0;
      totalLoanInterestDeposited += Number(l.totalInterestPaid || l.interestPaid) || 0;
    });
    const remainingLoanPrincipal = Math.max(0, totalLoanDisbursed - totalLoanPrincipalRepaid);
    const activeOrFirstLoan = allLoans.find(l => l.status === 'active') || allLoans[0];
    const memberLoanRate = activeOrFirstLoan?.interestRatePercent || activeOrFirstLoan?.details?.interestRate || 3;
    const memberLoanRateMr = this.toMarathiNumber(memberLoanRate);

    const rawMName = this.getMemberMarathiName(member) || member.nameMarathi || member.name || '';
    const mName = rawMName.replace(/\s*\([a-zA-Z\s.-]+\)/g, '').trim();
    const englishMatch = (member.name || '').match(/\(([a-zA-Z\s.-]+)\)/);
    const englishName = englishMatch ? englishMatch[1].trim() : ((member.name && /[a-zA-Z]/.test(member.name)) ? member.name.replace(/\s*\([^)]*\)/g, '').trim() : '');
    const displayName = isEn ? (englishName || mName) : mName;

    if (isEn) {
      let msg = `*📋 ${bishiTitle} - Member Ledger Card Register*\n`;
      msg += `─────────────────────\n`;
      msg += `👤 *Member:* ${displayName}\n`;
      msg += `🔢 *Account No.:* ${member.accountNo || member.id}\n`;
      msg += `📞 *Mobile:* ${member.phone || '-'}\n`;
      msg += `💰 *${isMonthly ? 'Monthly Installment' : 'Weekly Installment'}:* ${currency}${weeklyAmount.toLocaleString('en-IN')} (${isMonthly ? 'per month' : 'per week'})\n`;
      msg += `─────────────────────\n`;
      msg += `📊 *Ledger Balance:*\n`;
      msg += `• Paid ${periodUnitPlural}: *${stats.paidWeeksCount || 0} / ${totalPeriods} ${periodUnitPlural}*\n`;
      msg += `• Total Principal Savings: *${currency}${baseDeposited.toLocaleString('en-IN')}*\n`;
      msg += `• Dividend / Return Interest (+${annualInterestPercent}% Annual): *${isPayoutTime ? '+' + currency + interestAmt.toLocaleString('en-IN') : 'Applicable at payout (+ ' + currency + projectedInterest.toLocaleString('en-IN') + ' approx.)'}*\n`;
      msg += `🏆 *Total Final Payout:* *${currency}${totalWithInterest.toLocaleString('en-IN')}*${!isPayoutTime ? ' (Current Savings)' : ''}\n`;
      msg += `• Remaining Balance: *${currency}${(stats.remainingAmount || 0).toLocaleString('en-IN')}*\n`;
      if (totalLoanDisbursed > 0) {
        msg += `─────────────────────\n`;
        msg += `💳 *Loan & Interest Ledger:*\n`;
        msg += `• Total Loan Disbursed: *${currency}${totalLoanDisbursed.toLocaleString('en-IN')}*\n`;
        msg += `• Principal Repaid: *${currency}${totalLoanPrincipalRepaid.toLocaleString('en-IN')}*\n`;
        msg += `• Outstanding Principal: *${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}*\n`;
        msg += `• Total ${memberLoanRate}% Interest Paid: *+${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')}*\n`;
      }
      msg += `─────────────────────\n`;
      msg += `_Issued with Authorized Digital Verification - ${bishiTitle}_`;
      return msg;
    }

    let msg = `*📋 ${bishiMeta.bishiName} - सदस्य खातावही कार्ड रजिस्टर*\n`;
    msg += `─────────────────────\n`;
    msg += `👤 *खातेदार:* ${mName}\n`;
    msg += `🔢 *खाते क्र.:* ${member.accountNo || member.id}\n`;
    msg += `📞 *मोबाईल:* ${member.phone || '-'}\n`;
    msg += `💰 *${isMonthly ? 'मासिक हप्ता' : 'साप्ताहिक हप्ता'}:* ${currency}${weeklyAmount.toLocaleString('en-IN')} (${isMonthly ? 'दर महिना' : 'दर आठवडा'})\n`;
    msg += `─────────────────────\n`;
    msg += `📊 *खातावही ताळेबंद:*\n`;
    msg += `• जमा ${periodUnitPlural}: *${stats.paidWeeksCount || 0} / ${totalPeriods} ${periodUnitPlural}*\n`;
    msg += `• एकूण मूळ जमा बचत: *${currency}${baseDeposited.toLocaleString('en-IN')}*\n`;
    msg += `• लाभांश / परतावा व्याज (+${annualInterestPercent}% वार्षिक): *${isPayoutTime ? '+' + currency + interestAmt.toLocaleString('en-IN') : 'परताव्याच्या वेळी लागू (+ ' + currency + projectedInterest.toLocaleString('en-IN') + ' अंदाजे)'}*\n`;
    msg += `🏆 *एकूण अंतिम परतावा:* *${currency}${totalWithInterest.toLocaleString('en-IN')}*${!isPayoutTime ? ' (चालू बचत)' : ''}\n`;
    msg += `• शिल्लक बाकी: *${currency}${(stats.remainingAmount || 0).toLocaleString('en-IN')}*\n`;
    if (totalLoanDisbursed > 0) {
      msg += `─────────────────────\n`;
      msg += `💳 *कर्ज व व्याज ताळेबंद:*\n`;
      msg += `• एकूण कर्ज वाटप: *${currency}${totalLoanDisbursed.toLocaleString('en-IN')}*\n`;
      msg += `• परतफेड मुद्दल: *${currency}${totalLoanPrincipalRepaid.toLocaleString('en-IN')}*\n`;
      msg += `• बाकी कर्ज मुद्दल: *${currency}${remainingLoanPrincipal.toLocaleString('en-IN')}*\n`;
      msg += `• एकूण जमा ${memberLoanRateMr}% व्याज: *+${currency}${totalLoanInterestDeposited.toLocaleString('en-IN')}*\n`;
    }
    msg += `─────────────────────\n`;
    msg += `_अधिकृत डिजिटल स्वाक्षरीसह जारी - ${bishiMeta.bishiName}_`;
    return msg;
  }

  // --- सदस्य खातावही कार्ड रजिस्टर मोडल दाखवणे ---
  showMemberLedgerCard(memberId, cycleNumber = null, showAllWeeks = false) {
    const isEn = typeof window !== 'undefined' && window.i18n && typeof window.i18n.isEnglish === 'function' && window.i18n.isEnglish();
    const member = window.bishiStore?.getMember(memberId);
    if (!member) {
      if (window.ui?.showToast) window.ui.showToast(isEn ? 'Member not found' : 'सदस्य सापडला नाही', 'error');
      return;
    }

    const modal = document.getElementById('memberLedgerModal');
    const modalBody = document.getElementById('memberLedgerModalBody');
    if (!modal || !modalBody) return;

    this.currentLedgerMemberId = memberId;
    this.currentLedgerCycleNumber = cycleNumber;
    this.currentLedgerShowAllWeeks = showAllWeeks;

    const reportHTML = this.generateMemberLedgerReportHTML(member, cycleNumber, showAllWeeks);
    const activeCycleNum = member.currentCycle || 1;
    const curCycle = cycleNumber ? Number(cycleNumber) : activeCycleNum;
    const isMonthly = member.frequency === 'monthly';

    // Update modal title and buttons if present
    const modalTitleText = document.getElementById('memberLedgerModalTitleText');
    if (modalTitleText) {
      modalTitleText.textContent = isEn ? 'Official Member Ledger Card Register' : 'अधिकृत सदस्य खातावही कार्ड रजिस्टर';
    }
    const printBtn = document.getElementById('memberLedgerPrintBtn');
    if (printBtn) {
      printBtn.innerHTML = isEn ? '🖨️ Print Ledger Card' : '🖨️ लेजर कार्ड प्रिंट करा';
    }
    const pdfBtn = document.getElementById('memberLedgerPdfBtn');
    if (pdfBtn) {
      pdfBtn.innerHTML = isEn ? '📥 Save PDF' : '📥 PDF सेव्ह करा';
    }
    const doneBtn = document.getElementById('memberLedgerDoneBtn');
    if (doneBtn) {
      doneBtn.textContent = isEn ? 'Done' : 'पूर्ण';
    }

    // Member dropdown selector to switch members directly in report view
    const isCustomerRole = window.authManager && typeof window.authManager.isCustomer === 'function' && window.authManager.isCustomer();
    const allMembers = window.bishiStore?.getAllMembers ? window.bishiStore.getAllMembers() : [];
    let memberSelectorHTML = '';
    if (allMembers && allMembers.length > 1 && !isCustomerRole) {
      memberSelectorHTML = `
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="font-size: 0.78rem; font-weight: 700; color: #047857;">${isEn ? '👤 Member:' : '👤 सदस्य:'}</span>
          <select class="form-control" style="padding: 0.25rem 0.6rem; font-size: 0.78rem; width: auto; font-weight: 700; border-color: rgba(4, 120, 87, 0.4); background: #fff;" onchange="window.receiptManager.showMemberLedgerCard(this.value, null, ${showAllWeeks})">
            ${allMembers.map(m => {
              const acc = m.accountNo || (m.id ? m.id.replace(/\D/g, '') || m.id : '');
              const sel = m.id === member.id ? 'selected' : '';
              const mMarathi = (this.getMemberMarathiName(m) || m.nameMarathi || m.name || '').replace(/\s*\([a-zA-Z\s.-]+\)/g, '').trim();
              const engMatch = (m.name || '').match(/\(([a-zA-Z\s.-]+)\)/);
              const mEnglish = engMatch ? engMatch[1].trim() : ((m.name && /[a-zA-Z]/.test(m.name)) ? m.name.replace(/\s*\([^)]*\)/g, '').trim() : '');
              const mName = isEn ? (mEnglish || mMarathi) : mMarathi;
              return `<option value="${m.id}" ${sel}>#${acc} - ${mName}</option>`;
            }).join('')}
          </select>
        </div>
      `;
    }

    // Build interactive top bar for modal (toggle view, cycles, whatsapp)
    let cycleSelectorHTML = '';
    if (member.pastCycles && member.pastCycles.length > 0) {
      cycleSelectorHTML = `
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="font-size: 0.78rem; font-weight: 700; color: #4b5563;">${isEn ? 'Cycle:' : 'सायकल:'}</span>
          <select class="form-control" style="padding: 0.2rem 0.6rem; font-size: 0.78rem; width: auto;" onchange="window.receiptManager.showMemberLedgerCard('${member.id}', this.value, ${showAllWeeks})">
            <option value="${activeCycleNum}" ${curCycle === activeCycleNum ? 'selected' : ''}>${isEn ? `Current Cycle ${activeCycleNum}` : `चालू सायकल ${activeCycleNum}`}</option>
            ${member.pastCycles.map(pc => `<option value="${pc.cycleNumber}" ${curCycle === pc.cycleNumber ? 'selected' : ''}>${isEn ? `Saved Cycle ${pc.cycleNumber}` : `जतन सायकल ${pc.cycleNumber}`}</option>`).join('')}
          </select>
        </div>
      `;
    }

    const waText = this.generateMemberLedgerWhatsAppText(member, curCycle);
    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone ? '91' + cleanPhone : ''}?text=${encodeURIComponent(waText)}`;

    modalBody.innerHTML = `
      <div class="ledger-toolbar no-print" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; background: #ffffff; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          ${memberSelectorHTML}
          ${cycleSelectorHTML}
          <div class="btn-group" style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-sm ${!showAllWeeks ? 'btn-primary' : 'btn-secondary'}" onclick="window.receiptManager.showMemberLedgerCard('${member.id}', ${curCycle}, false)" style="font-size: 0.75rem; font-weight: 700;">
              ${isEn ? '✓ Active Weeks' : '✓ भरलेले / चालू आठवडे'}
            </button>
            <button type="button" class="btn btn-sm ${showAllWeeks ? 'btn-primary' : 'btn-secondary'}" onclick="window.receiptManager.showMemberLedgerCard('${member.id}', ${curCycle}, true)" style="font-size: 0.75rem; font-weight: 700;">
              ${isEn ? (isMonthly ? 'All 12 Months' : 'All 50 Weeks') : (isMonthly ? 'सर्व १२ महिने' : 'सर्व ५० आठवडे')}
            </button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <!-- थेट लेजर कार्ड भाषा टॉगल (Direct Language Toggle in Modal) -->
          <div class="lang-toggle-pills" style="display: inline-flex; border: 1px solid #d1d5db; border-radius: 20px; padding: 2px; background: #f3f4f6;">
            <button type="button" class="lang-pill-btn ${!isEn ? 'active' : ''}" style="padding: 0.2rem 0.55rem; font-size: 0.74rem; font-weight: 700; border-radius: 16px; border: none; cursor: pointer; ${!isEn ? 'background: #047857; color: #fff;' : 'background: transparent; color: #4b5563;'}" onclick="window.i18n.setLanguage('mr')">मराठी</button>
            <button type="button" class="lang-pill-btn ${isEn ? 'active' : ''}" style="padding: 0.2rem 0.55rem; font-size: 0.74rem; font-weight: 700; border-radius: 16px; border: none; cursor: pointer; ${isEn ? 'background: #047857; color: #fff;' : 'background: transparent; color: #4b5563;'}" onclick="window.i18n.setLanguage('en')">EN</button>
          </div>

          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #25d366; color: #000; font-weight: 700; font-size: 0.75rem; text-decoration: none;">
            ${isEn ? '💬 Share WhatsApp' : '💬 WhatsApp वर पाठवा'}
          </a>
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.receiptManager.printMemberLedgerCard()" style="font-size: 0.75rem; font-weight: 700; color: #047857; border-color: #047857;">
            ${isEn ? '🖨️ Print Ledger' : '🖨️ लेजर प्रिंट करा'}
          </button>
        </div>
      </div>

      ${reportHTML}
    `;

    modal.classList.add('active');
  }

  printMemberLedgerCard() {
    window.print();
  }

  copyWhatsAppMessage(encodedText) {
    const text = decodeURIComponent(encodedText);
    navigator.clipboard.writeText(text).then(() => {
      window.ui.showToast('WhatsApp संदेश क्लिपबोर्डवर कॉपी झाला!', 'success');
    }).catch(() => {
      window.ui.showToast('कॉपी करता आले नाही', 'warning');
    });
  }

  printReceipt() {
    window.print();
  }
}

window.receiptManager = new ReceiptManager();

