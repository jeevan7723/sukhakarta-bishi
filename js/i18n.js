/**
 * ==========================================================================
 * सुखकर्ता बीशी - Internationalization (i18n) Engine
 * Supports seamless bilingual switching: मराठी (Marathi) ⟷ English
 * ==========================================================================
 */

(function(root) {
  'use strict';

  const STORAGE_KEY = 'sukhakarta_lang';

  // Comprehensive translation dictionary
  const TRANSLATIONS = {
    // Brand & General
    app_title: { mr: 'सुखकर्ता बीशी', en: 'Sukhakarta Bishi' },
    app_subtitle: { mr: '५०-आठवडे बचत फंड', en: '50-Week Savings Fund' },
    app_portal_tagline: { mr: '५०-आठवडे बचत फंड व पासबुक पोर्टल', en: '50-Week Savings Fund & Passbook Portal' },
    brand_badge: { mr: '✨ अधिकृत ५०-आठवडे बचत व फंड व्यवस्थापन', en: '✨ Official 50-Week Savings & Fund Management' },
    brand_pill_1: { mr: '🏛️ पारदर्शक ५०-आठवडे फंड पूल', en: '🏛️ Transparent 50-Week Fund Pool' },
    brand_pill_2: { mr: '💳 ३% नियमावली कर्ज खातावही', en: '💳 3% Rule Loan Ledger' },
    brand_pill_3: { mr: '🧾 झटपट WhatsApp पावत्या', en: '🧾 Instant WhatsApp Receipts' },
    brand_pill_4: { mr: '☁️ २४x७ सुरक्षित क्लाउड बॅकअप', en: '☁️ 24x7 Secure Cloud Backup' },

    // Sidebar & Navigation
    nav_add_member: { mr: 'नवीन सदस्य जोडा', en: 'Add New Member' },
    nav_main_menu: { mr: 'मुख्य मेनू', en: 'Main Menu' },
    nav_dashboard: { mr: 'मुख्य डॅशबोर्ड', en: 'Main Dashboard' },
    nav_members: { mr: 'सर्व सदस्य डेटा', en: 'All Members Data' },
    nav_loans: { mr: 'कर्ज व्यवस्थापन', en: 'Loan Management' },
    nav_txns: { mr: 'सर्व खातावही', en: 'Transaction Log' },
    nav_reports: { mr: 'लेजर कार्ड अहवाल', en: 'Ledger Card Report' },
    nav_mgmt_tools: { mr: 'व्यवस्थापन व साधने', en: 'Management & Tools' },
    nav_rules_fines: { mr: 'नियम व दंड दर', en: 'Rules & Fines' },
    nav_backup_export: { mr: 'बॅकअप / एक्सपोर्ट', en: 'Backup & Export' },
    nav_clear_data: { mr: 'डेटा साफ करा', en: 'Clear Data' },
    nav_my_account: { mr: 'माझे खाते', en: 'My Account' },
    nav_my_passbook: { mr: 'माझे ५०-आठवडे पासबुक', en: 'My 50-Week Passbook' },
    nav_download_ledger: { mr: 'माझी खातावही डाउनलोड', en: 'Download My Ledger' },
    nav_my_reports: { mr: 'माझे लेजर कार्ड अहवाल', en: 'My Ledger Card Report' },
    nav_system_sync: { mr: 'प्रणाली व सिंक', en: 'System & Sync' },
    nav_firebase_sync: { mr: 'वेबसाइट ➔ Firebase सिंक', en: 'Website ➔ Firebase Sync' },
    nav_theme_toggle: { mr: 'थीम बदला (Dark/Light)', en: 'Toggle Theme (Dark/Light)' },
    nav_splash_replay: { mr: 'प्रवेश ॲनिमेशन पहा', en: 'Watch Splash Animation' },
    nav_logout: { mr: 'लॉगआउट', en: 'Logout' },
    nav_admin_title: { mr: 'मुख्य प्रशासक', en: 'Main Admin' },
    nav_admin_role: { mr: 'प्रशासक नियंत्रण पॅनल', en: 'Admin Control Panel' },
    lang_toggle_label: { mr: 'भाषा: मराठी', en: 'Language: English' },
    lang_label: { mr: 'भाषा', en: 'Language' },

    // Dashboard Statistics Cards
    stat_active_members: { mr: 'सक्रिय सदस्य', en: 'Active Members' },
    stat_settled_members: { mr: 'सेटल झालेले', en: 'Settled' },
    stat_members_section_link: { mr: 'सदस्य विभाग ➔', en: 'Members Section ➔' },
    stat_fund_target_pool: { mr: 'एकूण फंड लक्ष्य पूल', en: 'Total Fund Target Pool' },
    stat_50_weeks_target: { mr: '५० आठवड्यांचे एकूण लक्ष्य', en: '50-Week Total Target' },
    stat_fund_target_tag: { mr: 'फंड उद्दिष्ट', en: 'Fund Target' },
    stat_total_collected: { mr: 'आतापर्यंत जमा एकूण बचत', en: 'Total Savings Collected' },
    stat_of_total_target: { mr: 'एकूण लक्ष्याच्या', en: 'of total target' },
    stat_total_deposit_tag: { mr: 'एकूण जमा', en: 'Total Collected' },
    stat_current_week_col: { mr: 'चालू आठवडा कलेक्शन', en: 'Current Week Collection' },
    stat_collected_of: { mr: 'पैकी', en: 'of' },
    stat_collected_word: { mr: 'जमा', en: 'collected' },
    stat_balance_word: { mr: 'बाकी', en: 'pending' },
    stat_active_loans: { mr: 'सक्रिय बाकी कर्ज', en: 'Active Loan Balance' },
    stat_active_loans_count: { mr: 'सक्रिय कर्जे', en: 'active loans' },
    stat_loans_page_link: { mr: 'कर्ज पेज ➔', en: 'Loans Page ➔' },
    stat_interest_collected: { mr: 'जमा ३% कर्ज व्याज', en: '3% Loan Interest Collected' },
    stat_repaid_loans_count: { mr: 'कर्जे परतफेड', en: 'loans repaid' },

    // Member Section Card
    member_section_title: { mr: 'सदस्य विभाग (सर्व सदस्य तपशील)', en: 'Member Section (All Member Details)' },
    member_section_desc: { mr: 'सर्व सदस्यांची संपूर्ण वैयक्तिक माहिती, ५०-आठवडे ठेव खातावही, फोन, वारसदार, कर्ज स्थिती आणि पासबुक तपशील एकाच ठिकाणी.', en: 'Complete personal details, 50-week savings ledger, contact, nominee, loan status, and passbook records in one unified place.' },
    btn_view_all_members: { mr: 'सर्व सदस्य तपशील पहा ➔', en: 'View All Members ➔' },
    btn_open_in_new_page: { mr: 'नवीन पेजवर उघडा ↗', en: 'Open in New Page ↗' },
    btn_new_member: { mr: 'नवीन सदस्य', en: 'New Member' },

    // Weekly Cycle Navigator
    weekly_cycle_title: { mr: 'साप्ताहिक कलेक्शन सायकल', en: 'Weekly Collection Cycle' },
    btn_prev_week: { mr: '◀ मागील', en: '◀ Previous' },
    btn_next_week: { mr: 'पुढील ▶', en: 'Next ▶' },
    select_week_dropdown: { mr: 'आठवडा निवडा', en: 'Select Week' },

    // Summary Banner
    banner_selected_week: { mr: 'निवडलेला आठवडा', en: 'Selected Week' },
    banner_expected_target: { mr: 'अपेक्षित हप्ता लक्ष्य', en: 'Expected Installment Target' },
    banner_collected_amt: { mr: 'आतापर्यंत जमा रक्कम', en: 'Total Amount Collected' },
    banner_pending_amt: { mr: 'या आठवड्याची बाकी', en: 'Remaining Balance This Week' },
    banner_collection_rate: { mr: 'कलेक्शन टक्केवारी', en: 'Collection Rate' },

    // Filter Buttons
    filter_all: { mr: 'सर्व', en: 'All' },
    filter_weekly: { mr: '📅 साप्ताहिक', en: '📅 Weekly' },
    filter_monthly: { mr: '🗓️ मासिक', en: '🗓️ Monthly' },
    filter_paid: { mr: 'जमा (Paid)', en: 'Paid' },
    filter_pending: { mr: 'प्रलंबित (Pending)', en: 'Pending' },
    filter_overdue: { mr: 'थकबाकी (Overdue)', en: 'Overdue' },
    filter_completed: { mr: 'पूर्ण (Completed)', en: 'Completed' },
    search_placeholder: { mr: 'नाव, मोबाईल किंवा आयडीने शोधा...', en: 'Search by name, mobile, or ID...' },

    // Table Headers
    th_member_details: { mr: 'सदस्य तपशील', en: 'Member Details' },
    th_installment: { mr: 'नियमित हप्ता', en: 'Installment' },
    th_current_status: { mr: 'चालू हप्ता स्थिती', en: 'Current Installment Status' },
    th_total_deposit: { mr: 'एकूण जमा बचत', en: 'Total Deposit' },
    th_remaining_due: { mr: 'शिल्लक बाकी', en: 'Remaining Due' },
    th_progress: { mr: '५०-आठवडे प्रगती', en: '50-Week Progress' },
    th_actions: { mr: 'कृती / पावती', en: 'Actions / Receipt' },

    // Common Actions & Badges
    btn_collect: { mr: '💰 जमा करा', en: '💰 Collect' },
    btn_collect_balance: { mr: '💰 बाकी जमा', en: '💰 Collect Balance' },
    btn_receipt: { mr: '🧾 पावती', en: '🧾 Receipt' },
    btn_voucher: { mr: '🎉 व्हाउचर', en: '🎉 Voucher' },
    btn_passbook: { mr: '📖 पासबुक', en: '📖 Passbook' },
    btn_profile: { mr: '👤 प्रोफाईल', en: '👤 Profile' },
    btn_options: { mr: '⚙️ पर्याय ▾', en: '⚙️ Options ▾' },
    status_paid: { mr: 'जमा', en: 'Paid' },
    status_pending: { mr: 'प्रलंबित', en: 'Pending' },
    status_overdue: { mr: 'थकबाकी', en: 'Overdue' },
    status_cleared: { mr: '✓ क्लिअर', en: '✓ Cleared' },
    status_completed: { mr: 'पूर्ण 🏆', en: 'Completed 🏆' },
    status_partial: { mr: '⚠️ अपूर्ण जमा', en: '⚠️ Partial' },
    status_current_paid_ahead: { mr: '✓ चालू हप्ता पूर्ण (अ‍ॅडव्हान्स जमा)', en: '✓ Current Installment Paid (Advance)' },
    lbl_week: { mr: 'आठवडा', en: 'Week' },
    lbl_month: { mr: 'महिना', en: 'Month' },
    lbl_per_week: { mr: 'प्रति आठवडा', en: 'per week' },
    lbl_per_month: { mr: 'दर महिना', en: 'per month' },
    lbl_extra: { mr: 'जादा', en: 'extra' },
    lbl_fine: { mr: 'दंड', en: 'fine' },

    // Action Select Options
    opt_receipt: { mr: '🧾 पावती पहा (Receipt)', en: '🧾 View Receipt' },
    opt_collect_due: { mr: '💰 हप्ता जमा करा', en: '💰 Collect Installment' },
    opt_undo_pay: { mr: '✕ भरणा रद्द करा (Undo)', en: '✕ Undo Payment' },
    opt_pay_interest: { mr: '💰 ३% कर्ज व्याज जमा करा', en: '💰 Collect 3% Loan Interest' },
    opt_wa_interest: { mr: '💬 व्याज WhatsApp स्मरणपत्र', en: '💬 WhatsApp Interest Reminder' },
    opt_view_voucher: { mr: '📜 मॅच्युरिटी व्हाउचर पहा', en: '📜 View Maturity Voucher' },
    opt_payout: { mr: '💰 मॅच्युरिटी परतावा वाटप करा', en: '💰 Payout Maturity Settlement' },
    opt_restart: { mr: '🔄 नवीन ५०-आठवडे प्लॅन सुरू करा', en: '🔄 Start New 50-Week Cycle' },
    opt_loan_voucher: { mr: '📄 कर्ज वाटप व्हाउचर पहा', en: '📄 View Loan Disbursement Voucher' },
    opt_give_loan: { mr: '💳 सदस्यास कर्ज द्या', en: '💳 Disburse Loan to Member' },
    opt_ledger_card: { mr: '📋 लेजर कार्ड रजिस्टर (Print Ledger Card)', en: '📋 Member Ledger Card Register' },
    opt_view_passbook: { mr: '📖 पासबुक पहा', en: '📖 View Passbook' },
    opt_edit_member: { mr: '✏️ सदस्य तपशील एडिट करा', en: '✏️ Edit Member Details' },
    opt_wipe_member: { mr: '🧹 भरणा डेटा पुसा (Wipe)', en: '🧹 Wipe Payment Data' },
    opt_settle_member: { mr: '🗑️ सदस्य डिलीट / सेटल करा', en: '🗑️ Settle / Delete Member' },

    // Login Screen
    login_title: { mr: 'सुखकर्ता बीशी', en: 'Sukhakarta Bishi' },
    login_sub: { mr: '५०-आठवडे बचत फंड व पासबुक पोर्टल', en: '50-Week Savings Fund & Passbook Portal' },
    login_identifier_label: { mr: 'सदस्य आयडी / मोबाईल नंबर / युझरनेम', en: 'Member ID / Mobile Number / Username' },
    login_identifier_placeholder: { mr: 'उदा. admin, SKB-001, किंवा 9822014521', en: 'e.g. admin, SKB-001, or 9822014521' },
    login_pass_label: { mr: 'पासवर्ड / पिन (PIN)', en: 'Password / PIN' },
    login_pass_placeholder: { mr: 'पासवर्ड टाका', en: 'Enter password' },
    login_show_pass: { mr: 'पहा', en: 'Show' },
    login_hide_pass: { mr: 'लपवा', en: 'Hide' },
    login_remember: { mr: 'माझे लॉगिन जतन ठेवा', en: 'Remember my login' },
    login_access_label: { mr: 'प्रशासक व सदस्य प्रवेश', en: 'Admin & Member Access' },
    login_submit_btn: { mr: 'लॉगिन करा', en: 'Log In' },
    login_instructions: { mr: '🔒 प्रशासक: अधिकृत ॲडमिन पासवर्ड • सदस्य: आयडी / फोन + पासवर्ड', en: '🔒 Admin: Authorized Admin Password • Member: ID / Phone + Password' },
    login_replay_splash: { mr: '✨ प्रवेश ॲनिमेशन पुन्हा पहा (Replay)', en: '✨ Replay Splash Animation' },

    // Loans Page
    loans_title: { mr: 'सदस्य कर्ज व्यवस्थापन व ३% व्याज खातावही', en: 'Member Loan Management & 3% Interest Ledger' },
    loans_desc: { mr: 'सदस्यांना कर्ज वाटप, ४ आठवड्यांची सवलत (Grace Period), दर ४ आठवड्यांनी ३% मासिक व्याज संकलन व मुद्दल परतफेड.', en: 'Loan disbursement, 4-week grace period, 3% monthly interest calculation every 4 weeks, and principal repayment tracking.' },
    btn_disburse_loan: { mr: '➕ नवीन कर्ज द्या', en: '➕ Disburse New Loan' },
    loans_stat_active: { mr: 'सक्रिय बाकी कर्ज मुद्दल', en: 'Active Outstanding Principal' },
    loans_stat_total_disbursed: { mr: 'एकूण वाटप केलेले कर्ज', en: 'Total Disbursed Loans' },
    loans_stat_total_interest: { mr: 'एकूण जमा ३% व्याज', en: 'Total 3% Interest Collected' },
    loans_stat_repaid: { mr: 'पूर्ण परतफेड कर्जे', en: 'Fully Repaid Loans' },
    loans_th_member: { mr: 'कर्जदार सदस्य', en: 'Borrower Member' },
    loans_th_principal: { mr: 'कर्ज मुद्दल', en: 'Loan Principal' },
    loans_th_interest: { mr: 'मासिक व्याज (३%)', en: 'Monthly Interest (3%)' },
    loans_th_balance: { mr: 'बाकी मुद्दल', en: 'Remaining Principal' },
    loans_th_status: { mr: 'कर्ज स्थिती', en: 'Loan Status' },
    loans_th_actions: { mr: 'कृती', en: 'Actions' },

    // Modals Common
    btn_close: { mr: 'बंद करा', en: 'Close' },
    btn_cancel: { mr: 'रद्द करा', en: 'Cancel' },
    btn_save: { mr: 'जतन करा', en: 'Save' },
    btn_submit: { mr: 'सबमिट करा', en: 'Submit' },
    btn_confirm: { mr: 'नक्की करा', en: 'Confirm' },
    btn_print: { mr: '🖨️ प्रिंट करा', en: '🖨️ Print' },
    btn_download: { mr: '📥 डाउनलोड', en: '📥 Download' },
    btn_share_whatsapp: { mr: '💬 WhatsApp वर पाठवा', en: '💬 Share on WhatsApp' },
    btn_export_excel: { mr: '📊 Excel डाउनलोड', en: '📊 Export Excel' },
    btn_export_csv: { mr: '📄 CSV डाउनलोड', en: '📄 Export CSV' },
    btn_backup_json: { mr: '💾 JSON बॅकअप', en: '💾 Backup JSON' }
  };

  // Phrases for automatic bidirectional DOM scanning
  const EXACT_PHRASE_PAIRS = [
    ['मुख्य डॅशबोर्ड', 'Main Dashboard'],
    ['सर्व सदस्य डेटा', 'All Members Data'],
    ['कर्ज व्यवस्थापन', 'Loan Management'],
    ['सर्व खातावही', 'Transaction Log'],
    ['लेजर कार्ड अहवाल', 'Ledger Card Report'],
    ['नियम व दंड दर', 'Rules & Fines'],
    ['बॅकअप / एक्सपोर्ट', 'Backup & Export'],
    ['डेटा साफ करा', 'Clear Data'],
    ['नवीन सदस्य जोडा', 'Add New Member'],
    ['मुख्य मेनू', 'Main Menu'],
    ['व्यवस्थापन व साधने', 'Management & Tools'],
    ['माझे खाते', 'My Account'],
    ['माझे ५०-आठवडे पासबुक', 'My 50-Week Passbook'],
    ['माझी खातावही डाउनलोड', 'Download My Ledger'],
    ['माझे लेजर कार्ड अहवाल', 'My Ledger Card Report'],
    ['प्रणाली व सिंक', 'System & Sync'],
    ['थीम बदला (Dark/Light)', 'Toggle Theme (Dark/Light)'],
    ['प्रवेश ॲनिमेशन पहा', 'Watch Splash Animation'],
    ['लॉगआउट करा', 'Log Out'],
    ['लॉगआउट', 'Logout'],
    ['सक्रिय सदस्य', 'Active Members'],
    ['एकूण फंड लक्ष्य पूल', 'Total Fund Target Pool'],
    ['आतापर्यंत जमा एकूण बचत', 'Total Savings Collected'],
    ['चालू आठवडा कलेक्शन', 'Current Week Collection'],
    ['सक्रिय बाकी कर्ज', 'Active Loan Balance'],
    ['जमा ३% कर्ज व्याज', '3% Loan Interest Collected'],
    ['साप्ताहिक कलेक्शन सायकल', 'Weekly Collection Cycle'],
    ['निवडलेला आठवडा', 'Selected Week'],
    ['अपेक्षित हप्ता लक्ष्य', 'Expected Installment Target'],
    ['आतापर्यंत जमा रक्कम', 'Total Amount Collected'],
    ['या आठवड्याची बाकी', 'Remaining Balance This Week'],
    ['कलेक्शन टक्केवारी', 'Collection Rate'],
    ['सदस्य तपशील', 'Member Details'],
    ['नियमित हप्ता', 'Installment Amount'],
    ['चालू हप्ता स्थिती', 'Current Installment Status'],
    ['एकूण जमा बचत', 'Total Deposit'],
    ['शिल्लक बाकी', 'Remaining Due'],
    ['५०-आठवडे प्रगती', '50-Week Progress'],
    ['कृती / पर्याय', 'Actions / Options'],
    ['लॉगिन करा', 'Log In'],
    ['सदस्य आयडी / मोबाईल नंबर / युझरनेम', 'Member ID / Mobile Number / Username'],
    ['पासवर्ड / पिन (PIN)', 'Password / PIN'],
    ['माझे लॉगिन जतन ठेवा', 'Remember my login'],
    ['प्रशासक व सदस्य प्रवेश', 'Admin & Member Access'],
    ['५०-आठवडे बचत फंड', '50-Week Savings Fund'],
    ['५०-आठवडे बचत फंड व पासबुक पोर्टल', '50-Week Savings Fund & Passbook Portal'],
    ['नवीन कर्ज द्या', 'Disburse New Loan'],
    ['सदस्य कर्ज व्यवस्थापन व ३% व्याज खातावही', 'Member Loan Management & 3% Interest Ledger']
  ];

  class I18nManager {
    constructor() {
      this.currentLang = this.loadSavedLanguage();
    }

    loadSavedLanguage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved === 'en' || saved === 'mr') {
            return saved;
          }
        }
      } catch (e) {
        console.warn('[i18n] Error reading localStorage:', e);
      }
      return 'mr'; // Default Marathi
    }

    getLanguage() {
      return this.currentLang || 'mr';
    }

    isEnglish() {
      return this.currentLang === 'en';
    }

    isMarathi() {
      return this.currentLang === 'mr';
    }

    setLanguage(lang, silent = false) {
      if (lang !== 'mr' && lang !== 'en') {
        lang = 'mr';
      }
      this.currentLang = lang;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, lang);
        }
      } catch (e) {
        console.warn('[i18n] Error saving language to localStorage:', e);
      }

      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
      }

      this.updateLanguageUI();
      this.translateDOM();

      // Trigger UI re-rendering for all active components
      if (typeof window !== 'undefined' && window.ui && typeof window.ui.renderAll === 'function') {
        try {
          window.ui.renderAll();
        } catch (e) {
          console.error('[i18n] Error calling ui.renderAll():', e);
        }
      }

      if (!silent && typeof window !== 'undefined' && window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast(
          lang === 'en' ? '🌐 Language switched to English' : '🌐 भाषा बदलली: मराठी',
          'success'
        );
      }

      // Dispatch global custom event
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        } catch (e) {}
      }
    }

    toggleLanguage() {
      const next = this.currentLang === 'mr' ? 'en' : 'mr';
      this.setLanguage(next);
      return next;
    }

    t(key, fallback = '') {
      const entry = TRANSLATIONS[key];
      if (entry && entry[this.currentLang]) {
        return entry[this.currentLang];
      }
      return fallback || (entry ? (entry.mr || entry.en) : key);
    }

    updateLanguageUI() {
      if (typeof document === 'undefined') return;

      // Update pills in sidebar, login screen, or elsewhere
      document.querySelectorAll('.lang-pill-btn').forEach(btn => {
        const btnLang = btn.dataset.lang || btn.getAttribute('data-lang');
        if (btnLang === this.currentLang) {
          btn.classList.add('active');
          btn.style.background = 'var(--emerald-500)';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 1px 4px rgba(5, 150, 105, 0.35)';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'transparent';
          btn.style.color = 'var(--text-secondary)';
          btn.style.boxShadow = 'none';
        }
      });

      // Update Mobile Top Bar Button Label
      const mobileLangLabel = document.getElementById('mobileLangLabel');
      if (mobileLangLabel) {
        mobileLangLabel.textContent = this.currentLang === 'mr' ? 'EN' : 'मराठी';
      }

      // Update Sidebar Nav Item Text
      const sidebarLangNavText = document.getElementById('sidebarLangNavText');
      if (sidebarLangNavText) {
        sidebarLangNavText.textContent = this.currentLang === 'mr' ? 'भाषा: मराठी (Switch to EN)' : 'Language: English (मराठी करा)';
      }
    }

    translateDOM() {
      if (typeof document === 'undefined') return;

      const isEn = this.currentLang === 'en';

      // 1. Process elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && TRANSLATIONS[key]) {
          const val = TRANSLATIONS[key][this.currentLang];
          if (val) el.textContent = val;
        }
      });

      // 2. Process data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && TRANSLATIONS[key]) {
          const val = TRANSLATIONS[key][this.currentLang];
          if (val) el.setAttribute('placeholder', val);
        }
      });

      // 3. Process data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key && TRANSLATIONS[key]) {
          const val = TRANSLATIONS[key][this.currentLang];
          if (val) el.setAttribute('title', val);
        }
      });

      // 4. Bidirectional Phrase Replacement for static labels in the DOM
      EXACT_PHRASE_PAIRS.forEach(([mrPhrase, enPhrase]) => {
        const fromPhrase = isEn ? mrPhrase : enPhrase;
        const toPhrase = isEn ? enPhrase : mrPhrase;

        // Fast text content check for leaf text nodes or headings/spans/buttons
        const selectors = 'h1, h2, h3, h4, span, label, button, a, div.stat-label, div.sidebar-group-title, span.sidebar-nav-text';
        document.querySelectorAll(selectors).forEach(el => {
          // If element has only one text child or exact text match
          if (el.children.length === 0 && el.textContent.trim() === fromPhrase) {
            el.textContent = toPhrase;
          }
        });
      });
    }

    init() {
      this.updateLanguageUI();
      if (this.currentLang !== 'mr') {
        this.translateDOM();
      }
    }
  }

  // Export as singleton
  const instance = new I18nManager();
  root.i18n = instance;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
  }
})(typeof window !== 'undefined' ? window : global);
