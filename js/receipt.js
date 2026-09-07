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

  // --- कर्ज परतफेड व वाटप पावती HTML जनरेटर ---
  generateLoanReceiptHTML(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const isPaid = loan.status === 'paid';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = details.principal;
    const interestPaid = isPaid ? (Number(loan.interestPaid) || 0) : details.interestAmount;
    const totalAmount = isPaid ? (Number(loan.repaidAmount) || (principal + interestPaid)) : details.totalPayable;

    const receiptNo = isPaid ? (loan.receiptNo || `LOAN-REC-${loan.id}`) : `DISB-${loan.id}`;
    const dateStr = isPaid ? (loan.paidDate || new Date().toISOString().split('T')[0]) : (loan.issueDate || new Date().toISOString().split('T')[0]);
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
        <div class="receipt-header" style="${isPaid ? 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15));' : 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(245, 158, 11, 0.15));'}">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">सदस्य कर्ज खातावही व अधिकृत पावती</div>
          <div class="receipt-badge" style="${isPaid ? 'background: rgba(16, 185, 129, 0.2); color: #059669; border-color: rgba(16, 185, 129, 0.4);' : 'background: rgba(59, 130, 246, 0.2); color: #2563eb; border-color: rgba(59, 130, 246, 0.4);'}">
            ${isPaid ? '✅ कर्ज परतफेड पावती (Loan Repayment Receipt)' : '💳 कर्ज वाटप व्हाउचर (Loan Disbursement Voucher)'}
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
            <div class="meta-item-val" style="font-weight: 700;">${member.name}</div>
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

        <div class="receipt-amount-box" style="${isPaid ? 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.15)); border: 1.5px solid #10b981;' : 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(245, 158, 11, 0.15)); border: 1.5px solid #3b82f6;'}">
          <div class="receipt-amount-lbl">${isPaid ? 'जमा झालेली एकूण परतफेड रक्कम' : 'वाटप केलेली एकूण मूळ कर्ज रक्कम'}</div>
          <div class="receipt-amount-val" style="color: ${isPaid ? '#059669' : '#2563eb'};">${currency}${totalAmount.toLocaleString('en-IN')}</div>
          ${isPaid ? `
            <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
              (मूळ कर्ज: ${currency}${principal.toLocaleString('en-IN')}${interestPaid > 0 ? ` + ३% व्याज: +${currency}${interestPaid.toLocaleString('en-IN')}` : ' + ०% व्याज'})
            </div>
          ` : `
            <div style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
              (नियम: पहिल्या ४ आठवड्यांपर्यंत ०% व्याज • ४ आठवड्यांनंतर ३% व्याज)
            </div>
          `}
        </div>

        <table class="receipt-ledger-table">
          <tr>
            <td>मूळ कर्ज रक्कम (Principal)</td>
            <td style="font-weight: 700;">${currency}${principal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>कर्ज वाटप आठवडा व तारीख</td>
            <td>आठवडा ${loan.issueWeek || 1} • ${loan.issueDate || '-'}</td>
          </tr>
          <tr>
            <td>कालावधी / आठवडे</td>
            <td>${details.elapsedWeeks} आठवडे ${details.isGracePeriodActive ? `(सवलत कालावधीत: ${details.remainingGraceWeeks} आठवडे बाकी)` : '(४ आठवड्यांनंतर ३% व्याज लागू)'}</td>
          </tr>
          <tr style="color: ${interestPaid > 0 ? '#d97706' : '#64748b'}; font-weight: 600; background: ${interestPaid > 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};">
            <td>३% व्याज रक्कम (४ आठवड्यांनंतर)</td>
            <td>${interestPaid > 0 ? `+ ${currency}${interestPaid.toLocaleString('en-IN')}` : '₹० (०%)'}</td>
          </tr>
          <tr style="color: ${isPaid ? '#059669' : '#2563eb'}; font-weight: 800; font-size: 1.05rem; background: ${isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'};">
            <td>${isPaid ? 'एकूण जमा परतफेड रक्कम' : 'एकूण देय परतफेड रक्कम'}</td>
            <td>${currency}${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>कर्ज खाते स्थिती</td>
            <td style="font-weight: 700; color: ${isPaid ? '#059669' : '#d97706'};">
              ${isPaid ? '✅ पूर्ण भरले (Paid & Closed)' : '🟡 सक्रिय बाकी (Active Loan)'}
            </td>
          </tr>
          ${loan.notes || loan.settlementNotes ? `
            <tr>
              <td>टीप / संदर्भ</td>
              <td style="font-size: 0.8rem; color: #64748b;">${loan.settlementNotes || loan.notes}</td>
            </tr>
          ` : ''}
        </table>

        <div class="receipt-footer-note" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.85rem; font-size: 0.75rem; color: #64748b;">
          📌 सुखकर्ता बीशी कर्ज नियमावली: पहिल्या ४ आठवड्यांत ०% व्याज, ४ आठवड्यांनंतर ३% व्याज आकारले जाते. अधिकृत डिजिटल स्वाक्षरीसह जारी.
        </div>
      </div>
    `;
  }

  // --- कर्ज WhatsApp संदेश जनरेटर ---
  generateLoanWhatsAppText(loan, member, bishiMeta) {
    const currency = bishiMeta.currency || '₹';
    const isPaid = loan.status === 'paid';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = details.principal;
    const interestPaid = isPaid ? (Number(loan.interestPaid) || 0) : details.interestAmount;
    const totalAmount = isPaid ? (Number(loan.repaidAmount) || (principal + interestPaid)) : details.totalPayable;

    let message = `✨ *${bishiMeta.bishiName} - अधिकृत कर्ज पावती* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${member.name}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *तारीख:* ${isPaid ? (loan.paidDate || '-') : (loan.issueDate || '-')}\n`;
    message += `─────────────────────\n`;

    if (isPaid) {
      message += `✅ *कर्ज परतफेड यशस्वीपणे जमा झाली आहे!*\n\n`;
      message += `💵 *मूळ कर्ज रक्कम:* ${currency}${principal.toLocaleString('en-IN')}\n`;
      message += `📈 *३% व्याज दर:* ${interestPaid > 0 ? `+${currency}${interestPaid.toLocaleString('en-IN')}` : '₹० (४ आठवड्यांच्या सवलतीत)'}\n`;
      message += `💰 *एकूण भरलेली रक्कम:* *${currency}${totalAmount.toLocaleString('en-IN')}*\n`;
      message += `💳 *पेमेंट पद्धत:* ${loan.paymentMode || 'Cash'}${loan.upiId ? ` (UPI: ${loan.upiId})` : ''}\n`;
      message += `🧾 *पावती क्र.:* ${loan.receiptNo || 'N/A'}\n`;
      message += `📊 *कर्ज स्थिती:* पूर्ण परतफेड संपन्न ✅\n`;
    } else {
      message += `💳 *सदस्यास नवीन कर्ज वाटप करण्यात आले आहे.*\n\n`;
      message += `💵 *कर्ज रक्कम:* *${currency}${principal.toLocaleString('en-IN')}*\n`;
      message += `📅 *वाटप आठवडा:* आठवडा ${loan.issueWeek || 1} (${loan.issueDate || '-'})\n`;
      message += `⏳ *व्याज नियम:* पहिल्या ४ आठवड्यांत ०% व्याज • ४ आठवड्यांनंतर ३% व्याज\n`;
      message += `💳 *वितरण पद्धत:* ${loan.disbursementMode || 'Cash'}${loan.disbursementUpiId ? ` (UPI: ${loan.disbursementUpiId})` : ''}\n`;
      message += `🧾 *व्हाउचर क्र.:* DISB-${loan.id}\n`;
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

    document.getElementById('receiptModal').classList.add('active');
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

    return `
      <div class="receipt-wrapper" id="printableReceiptArea">
        <div class="receipt-header">
          <div class="receipt-org-title">✨ ${bishiMeta.bishiName}</div>
          <div class="receipt-sub">अधिकृत ४-आठवडे कर्ज व्याज संकलन पावती</div>
          <div class="receipt-badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; border-color: rgba(245, 158, 11, 0.35);">
            💰 ४-आठवडे ३% व्याज भरणा • चक्र ${cycleNum}
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
            <div class="meta-item-val" style="font-weight: 700;">${member.name}</div>
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
          <div class="receipt-amount-lbl">जमा झालेले ४-आठवड्यांचे ३% कर्ज व्याज</div>
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
            <td>या चक्राचे ३% जमा व्याज</td>
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
          📌 सुखकर्ता बीशी कर्ज नियमावली: दर ४ आठवड्यांनी ३% व्याज संकलित केले जाते. मूळ कर्ज मुद्दल स्वतंत्रपणे सक्रिय राहील. अधिकृत डिजिटल स्वाक्षरीसह जारी.
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

    let message = `✨ *${bishiMeta.bishiName} - ४-आठवडे कर्ज व्याज पावती* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${member.name}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *व्याज भरणा तारीख:* ${payment.paidDate || '-'}\n`;
    message += `─────────────────────\n`;
    message += `💰 *४ आठवड्यांचे ३% व्याज यशस्वीपणे जमा झाले!*\n\n`;
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

    document.getElementById('receiptModal')?.classList.add('active');
  }

  // --- ४-आठवडे कर्ज व्याज थकबाकी / स्मरणपत्र WhatsApp संदेश जनरेटर ---
  generateLoanInterestPendingWhatsAppText(loan, member, bishiMeta) {
    const currency = bishiMeta?.currency || '₹';
    const details = window.bishiStore.calculateLoanDetails(loan);
    const principal = Number(loan.principalAmount) || 0;
    const interestAmt = details.interestAmount > 0 ? details.interestAmount : Math.round(principal * 0.03);
    const currentWeek = window.bishiStore.state.meta.currentWeek || 1;

    let message = `✨ *${bishiMeta?.bishiName || 'सुखकर्ता बीशी'} - कर्ज व्याज भरणा स्मरणपत्र* ✨\n`;
    message += `─────────────────────\n`;
    message += `👤 *सदस्याचे नाव:* ${member.name}\n`;
    message += `🆔 *सदस्य आयडी:* ${member.id} | *कर्ज क्र.:* ${loan.id}\n`;
    message += `📅 *दिनांक:* ${new Date().toLocaleDateString('hi-IN', {day: '2-digit', month: 'short', year: 'numeric'})}\n`;
    message += `─────────────────────\n`;
    message += `🔔 *आदरणीय सदस्य, आपल्या कर्जाचे ४-आठवड्यांचे ३% व्याज देय झाले आहे.*\n\n`;
    message += `💵 *मूळ सक्रिय कर्ज मुद्दल:* ${currency}${principal.toLocaleString('en-IN')}\n`;
    message += `📈 *व्याज दर:* ३% (दर ४ आठवड्यांनी देय)\n`;
    message += `⏳ *कालावधी:* ${details.elapsedWeeks} आठवडे पूर्ण (चक्र ${details.currentCycleNumber})\n`;
    message += `💰 *या चक्राची देय व्याज रक्कम:* *${currency}${interestAmt.toLocaleString('en-IN')}*\n`;
    message += `📅 *देय आठवडा:* आठवडा ${details.nextInterestDueWeek || currentWeek}\n\n`;
    message += `📌 *कृपया हे ३% व्याज प्रशासकांकडे वेळेवर जमा करून अधिकृत पावती प्राप्त करावी.*\n`;
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
      window.open(waUrl, '_blank');
      if (window.ui && window.ui.showToast) {
        window.ui.showToast(`सदस्य ${member.name} यांना WhatsApp कर्ज व्याज संदेश पाठवला जात आहे...`, 'success');
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
    const interestAmt = details.interestAmount > 0 ? details.interestAmount : Math.round(loan.principalAmount * 0.03);

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
            <div class="meta-item-val" style="font-weight: 700;">${member.name}</div>
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
          <div class="receipt-amount-lbl">या चक्राची देय ३% व्याज रक्कम</div>
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

    document.getElementById('receiptModal').classList.add('active');
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

