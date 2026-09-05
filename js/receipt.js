/**
 * ==========================================================================
 * सुखकर्ता बीशी - डिजिटल पावती व WhatsApp संदेश जनरेटर (पावत्या व व्हाउचर)
 * ==========================================================================
 */

class ReceiptManager {
  constructor() {
    this.modal = document.getElementById('receiptModal');
  }

  generateReceiptHTML(member, weekData, bishiMeta) {
    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = bishiMeta.currency || '₹';
    const depositAmt = Number(weekData.amountPaid) || 0;
    const fineAmt = Number(weekData.finePaid) || 0;
    const totalCollected = depositAmt + fineAmt;

    const formattedDate = weekData.paidDate ? new Date(weekData.paidDate).toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : new Date().toLocaleDateString('hi-IN');

    const isExtraDeposit = depositAmt > member.weeklyAmount;
    const regularAmt = member.weeklyAmount;
    const extraDepositAmt = isExtraDeposit ? (depositAmt - regularAmt) : 0;

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">साप्ताहिक बचत फंड व खातावही पावती</div>
          <div class="receipt-badge">हप्ता जमा पावती • आठवडा ${weekData.weekNumber} / ५०</div>
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
            <div class="meta-item-val">${member.name}</div>
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
          <div class="receipt-amount-lbl">आठवडा ${weekData.weekNumber} साठी मिळालेली एकूण रक्कम</div>
          <div class="receipt-amount-val">${currency}${totalCollected.toLocaleString('en-IN')}</div>
          ${isExtraDeposit ? `<div style="font-size: 0.8rem; color: #d97706; font-weight: 700; margin-top: 0.2rem;">⭐ नियमित हप्ता: ${currency}${regularAmt.toLocaleString('en-IN')} + अतिरिक्त भरणा: +${currency}${extraDepositAmt.toLocaleString('en-IN')}</div>` : ''}
          ${fineAmt > 0 ? `<div style="font-size: 0.8rem; opacity: 0.9; margin-top: 0.2rem;">(हप्ता: ${currency}${depositAmt.toLocaleString('en-IN')} + लेट फी दंड: ${currency}${fineAmt.toLocaleString('en-IN')})</div>` : ''}
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>नियमित साप्ताहिक बचत हप्ता</td>
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
            <td>एकूण जमा झालेले आठवडे</td>
            <td>${stats.paidWeeksCount} / ५० आठवडे</td>
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
              <td>५०-आठवड्यांचे एकूण उद्दिष्ट</td>
              <td>${currency}${stats.totalTarget.toLocaleString('en-IN')} <span style="font-size: 0.75rem; color: #059669;">(+${stats.maturityInterestPercent}% = ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')})</span></td>
            </tr>
            <tr>
              <td>पुढील आठवडा (${Math.min(50, weekData.weekNumber + 1)}) देय हप्ता</td>
              <td style="color: #d97706;">${currency}${stats.nextDueAmount.toLocaleString('en-IN')}</td>
            </tr>
          `}
        </table>

        <div class="receipt-footer-note">
          ${stats.isFullyPaid 
            ? `🎉 सर्व ५० आठवडे पूर्ण केल्याबद्दल हार्दिक अभिनंदन! आपला ${stats.maturityInterestPercent}% व्याजासह एकूण परतावा ${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')} आहे.` 
            : `🙏 हप्ता जमा केल्याबद्दल धन्यवाद! ५० आठवडे पूर्ण झाल्यावर आपणास ८% व्याज बोनससह ${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')} परतावा मिळेल.`}
        </div>
      </div>
    `;
  }

  generateWhatsAppText(member, weekData, bishiMeta) {
    const stats = window.bishiStore.calculateMemberStats(member);
    const currency = bishiMeta.currency || '₹';
    const nextWeek = Math.min(50, weekData.weekNumber + 1);
    const depositAmt = Number(weekData.amountPaid) || 0;
    const fineAmt = Number(weekData.finePaid) || 0;
    const totalCollected = depositAmt + fineAmt;
    const isExtraDeposit = depositAmt > member.weeklyAmount;
    const regularAmt = member.weeklyAmount;
    const extraDepositAmt = isExtraDeposit ? (depositAmt - regularAmt) : 0;

    let message = 
`*🔔 पेमेंट पावती - ${bishiMeta.bishiName.toUpperCase()}*
─────────────────────
प्रिय *${member.name}* (आयडी: ${member.id}),

आम्हाला आपला साप्ताहिक बीशी हप्ता यशस्वीरीत्या प्राप्त झाला आहे:

💰 *साप्ताहिक हप्ता:* ${currency}${regularAmt.toLocaleString('en-IN')}`;

    if (isExtraDeposit) {
      message += `\n⭐ *अतिरिक्त भरणा (Extra):* +${currency}${extraDepositAmt.toLocaleString('en-IN')}`;
    }

    if (fineAmt > 0) {
      message += `\n⚠️ *लेट फी दंड:* ${currency}${fineAmt.toLocaleString('en-IN')}`;
    }

    message += `
💵 *या आठवड्याची एकूण रक्कम:* ${currency}${totalCollected.toLocaleString('en-IN')}
📅 *आठवडा क्र.:* आठवडा ${weekData.weekNumber} / ५०
💳 *पेमेंट पद्धत:* ${weekData.paymentMode || 'रोख'}${weekData.upiId ? ` (UPI ID: ${weekData.upiId})` : ''}
🧾 *पावती क्र.:* ${weekData.receiptNo || 'N/A'}
─────────────────────
*📊 आपल्या बचतीचा ताळेबंद:*
• जमा आठवडे: *${stats.paidWeeksCount} / ५०*
• आतापर्यंत एकूण जमा बचत: *${currency}${stats.totalDeposited.toLocaleString('en-IN')}*`;

    if (stats.isFullyPaid) {
      message += `
• *+${stats.maturityInterestPercent}% मॅच्युरिटी बोनस:* +${currency}${stats.interestAmount.toLocaleString('en-IN')}
• 🏆 *एकूण मॅच्युरिटी परतावा:* *${currency}${stats.maturityTotalPayout.toLocaleString('en-IN')}*`;
    } else {
      message += `
• ५०-आठवड्यांचे एकूण उद्दिष्ट: *${currency}${stats.totalTarget.toLocaleString('en-IN')}* (+${stats.maturityInterestPercent}% बोनस = *${currency}${stats.projectedMaturityTotal.toLocaleString('en-IN')}*)
• शिल्लक बाकी रक्कम: *${currency}${stats.remainingAmount.toLocaleString('en-IN')}*
• पुढील देय हप्ता (आठवडा ${nextWeek}): *${currency}${stats.nextDueAmount.toLocaleString('en-IN')}*`;
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

    document.getElementById('receiptModal').classList.add('active');
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
प्रिय *${member.name}* (आयडी: ${member.id}),

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
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">🏆 ✨ 📜</div>
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
            <div class="meta-item-val">${member.name} (${member.id})</div>
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
          <div class="receipt-amount-val" style="color: #fff;">${currency}${payout.amount.toLocaleString('en-IN')}</div>
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
          🙏 <strong>${member.name}</strong> यांनी <strong>${bishiMeta.bishiName}</strong> सोबत ५० आठवड्यांचे बचत चक्र यशस्वीपणे पूर्ण केल्याबद्दल मनःपूर्वक अभिनंदन!
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

    const voucherModal = document.getElementById('payoutVoucherModal');
    if (voucherModal) {
      voucherModal.classList.add('active');
    }
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
