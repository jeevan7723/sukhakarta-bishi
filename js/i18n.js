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
    // Hub Section (Quick Hub & Section Access)
    hub_main_title: { mr: '<span>🚀</span> मुख्य नियंत्रण व थेट व्यवस्थापन हब', en: '<span>🚀</span> Quick Control & Direct Management Hub' },
    hub_main_sub: { mr: 'सर्व सदस्यांची माहिती, ५०-आठवडे कलेक्शन सायकल, कर्ज वाटप आणि अहवाल व्यवस्थापनासाठी थेट पर्याय.', en: 'Direct options for all members data, 50-week collection cycle, loan disbursement, and report management.' },
    hub_btn_add_member: { mr: '<span>➕</span> नवीन सदस्य नोंदणी', en: '<span>➕</span> New Member Registration' },
    hub_btn_give_loan: { mr: '<span>💳</span> नवीन कर्ज वाटप', en: '<span>💳</span> Issue New Loan' },
    hub_card1_badge: { mr: '५०-आठवडे सायकल', en: '50-Week Cycle' },
    hub_card1_title: { mr: 'सर्व सदस्य डेटा व कलेक्शन सायकल', en: 'All Members Data & Collection Cycle' },
    hub_card1_desc: { mr: 'साप्ताहिक व मासिक कलेक्शन सायकल, हप्ता भरणा, ५०-आठवडे प्रगती आणि सर्व सदस्यांची खातावही.', en: 'Weekly & monthly collection cycle, installment deposits, 50-week progress, and full members ledger.' },
    hub_card1_tag: { mr: 'थेट सदस्य पेज', en: 'Direct Members Page' },
    hub_card1_action: { mr: 'सर्व सदस्य डेटा पहा ➔', en: 'View All Members Data ➔' },
    hub_card2_badge: { mr: '३% मासिक व्याज', en: '3% Monthly Interest' },
    hub_card2_title: { mr: 'कर्ज खातावही व ३% व्याज', en: 'Loan Ledger & 3% Interest' },
    hub_card2_desc: { mr: 'सर्व वाटप कर्जे, ४-आठवड्यांचे ०% सवलत चक्र, ३% व्याज आकारणी व परतफेड पावत्या.', en: 'All disbursed loans, 4-week 0% grace period, 3% interest calculation, and repayment receipts.' },
    hub_card2_tag: { mr: 'थेट कर्ज खातावही', en: 'Direct Loan Ledger' },
    hub_card2_action: { mr: 'कर्ज व्यवस्थापन उघडा ➔', en: 'Open Loan Management ➔' },
    hub_card3_badge: { mr: 'प्रिंट व PDF', en: 'Print & PDF' },
    hub_card3_title: { mr: 'लेजर कार्ड अहवाल रजिस्टर', en: 'Ledger Card Report Register' },
    hub_card3_desc: { mr: 'प्रत्येक सदस्याचे अधिकृत लेजर कार्ड अहवाल, आठवडेनिहाय ठेवी व प्रिंट/डाऊनलोड पावत्या.', en: 'Official ledger card reports for each member, weekly deposits, and print/download receipts.' },
    hub_card3_tag: { mr: 'थेट अहवाल रजिस्टर', en: 'Direct Report Register' },
    hub_card3_action: { mr: 'अहवाल रजिस्टर उघडा ➔', en: 'Open Report Register ➔' },
    hub_card4_badge: { mr: 'थेट व्यवहार', en: 'Direct Transactions' },
    hub_card4_title: { mr: 'सर्व व्यवहार खातावही व लॉग', en: 'All Transactions Ledger & Log' },
    hub_card4_desc: { mr: 'ठेवी, कर्ज परतफेड आणि लेट फी दंडांची संपूर्ण ऑडिट नोंदवही व इतिहास.', en: 'Complete audit log & history of deposits, loan repayments, and late fee fines.' },
    hub_card4_tag: { mr: 'संपूर्ण ऑडिट', en: 'Complete Audit' },
    hub_card4_action: { mr: 'सर्व खातावही उघडा ➔', en: 'Open All Transactions ➔' },
    pwa_banner_title: { mr: 'सुखकर्ता बीशी मोबाईल ॲप', en: 'Sukhakarta Bishi Mobile App' },
    pwa_banner_desc: { mr: 'अ‍ॅपप्रमाणे जलद व ऑफलाइन वापरण्यासाठी इन्स्टॉल करा', en: 'Install for fast access & offline support' },
    pwa_banner_btn: { mr: '📲 इन्स्टॉल', en: '📲 Install' },

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
    btn_backup_json: { mr: '💾 JSON बॅकअप', en: '💾 Backup JSON' },

    // Reports & Member Ledger Card
    reports_hero_title: { mr: 'बीशी अहवाल व अधिकृत सदस्य खातावही कार्ड रजिस्टर', en: 'Bishi Reports & Official Member Ledger Card Register' },
    reports_hero_desc: { mr: 'शासकीय व अधिकृत लेजर कार्ड रजिस्टर अहवाल — हप्ते, मुद्दल, व्याज व अंतिम परतावा गणना', en: 'Official member ledger card register report — installments, principal, interest, and final payout calculation' },
    reports_badge: { mr: '📋 अधिकृत खातावही कार्ड रजिस्टर', en: '📋 Official Ledger Card Register' },
    modal_ledger_title: { mr: 'अधिकृत सदस्य खातावही कार्ड रजिस्टर', en: 'Official Member Ledger Card Register' },
    btn_print_report: { mr: 'अहवाल प्रिंट करा', en: 'Print Report' },
    btn_print_ledger_card: { mr: 'लेजर कार्ड प्रिंट करा', en: 'Print Ledger Card' },
    btn_save_pdf: { mr: 'PDF सेव्ह करा', en: 'Save PDF' },
    reports_select_member: { mr: '👤 सदस्य निवडा:', en: '👤 Select Member:' },
    reports_cycle_lbl: { mr: '🔄 सायकल:', en: '🔄 Cycle:' },
    reports_weeks_view_lbl: { mr: '👁️ आठवडे दृश्य:', en: '👁️ Weeks View:' },
    reports_filter_active: { mr: '✓ भरलेले / चालू आठवडे', en: '✓ Active Weeks' },
    reports_filter_all: { mr: 'सर्व ५० आठवडे', en: 'All 50 Weeks' },
    reports_filter_all_months: { mr: 'सर्व १२ महिने', en: 'All 12 Months' },
    btn_done: { mr: 'पूर्ण', en: 'Done' },

    // Customer Portal & History
    cust_portal_badge: { mr: 'अधिकृत सदस्य बचत व खातावही पोर्टल', en: 'Official Member Savings & Ledger Portal' },
    cust_portal_subtitle: { mr: 'सदस्य बचत पासबुक व खातावही पोर्टल', en: 'Member Savings Passbook & Ledger Portal' },
    cust_hero_passbook: { mr: 'सदस्य खातावही (पासबुक पहा)', en: 'Member Passbook (View Ledger)' },
    cust_hero_ledger: { mr: 'लेजर कार्ड रिपोर्ट', en: 'Ledger Card Report' },
    cust_hero_download: { mr: 'स्टेटमेंट डाउनलोड करा', en: 'Download Statement' },
    cust_hero_voucher: { mr: 'मॅच्युरिटी व्हाउचर पहा', en: 'View Maturity Voucher' },
    cust_history_title: { mr: 'माझे सर्व व्यवहार व पेमेंट इतिहास', en: 'My Transactions & Payment History' },
    cust_history_sub: { mr: 'आपल्या ५०-आठवडे बीशीचे जमा हप्ते आणि डिजिटल पावत्यांचा संपूर्ण तपशील.', en: 'Complete record of your 50-week Bishi installments and digital receipts.' },
    cust_btn_print_ledger: { mr: 'माझे लेजर कार्ड पहा / प्रिंट करा', en: 'View / Print My Ledger Card' },
    cust_btn_download_ledger: { mr: 'माझे स्टेटमेंट डाउनलोड करा', en: 'Download My Statement' },

    // Loan Modals (Give Loan, Repay Loan, Pay Interest)
    modal_give_loan_title: { mr: '<span>➕</span> सदस्यास नवीन कर्ज द्या (प्रशासक)', en: '<span>➕</span> Issue New Loan to Member (Admin)' },
    modal_give_loan_member_label: { mr: 'सदस्य निवडा *', en: 'Select Member *' },
    modal_give_loan_member_default: { mr: '-- सदस्य निवडा --', en: '-- Select Member --' },
    modal_give_loan_amount_label: { mr: 'कर्ज रक्कम (₹) *', en: 'Loan Amount (₹) *' },
    modal_give_loan_rules_title: { mr: 'कर्ज व व्याज नियमावली:', en: 'Loan & Interest Rules:' },
    modal_give_loan_rule_grace: { mr: '• <strong>पहिल्या ४ आठवड्यांत (Grace Period):</strong> <span style="color: var(--emerald-400); font-weight: 700;">०% व्याज</span> (फक्त मूळ रक्कम परतफेड).', en: '• <strong>First 4 Weeks (Grace Period):</strong> <span style="color: var(--emerald-400); font-weight: 700;">0% Interest</span> (Principal repayment only).' },
    modal_give_loan_rule_interest: { mr: '• <strong>४ आठवड्यांनंतर:</strong> <span style="color: var(--gold-400); font-weight: 700;">३% व्याज</span> लागू होईल (उदा. ₹१०,००० वर +₹३०० व्याज).', en: '• <strong>After 4 Weeks:</strong> <span style="color: var(--gold-400); font-weight: 700;">3% Interest</span> applies (e.g. +₹300 interest on ₹10,000).' },
    modal_give_loan_issue_week_label: { mr: 'वाटप आठवडा', en: 'Disbursement Week' },
    modal_give_loan_issue_date_label: { mr: 'वाटप तारीख', en: 'Disbursed Date' },
    modal_give_loan_mode_label: { mr: 'वितरण पद्धत (Disbursement Mode) *', en: 'Disbursement Mode *' },
    modal_give_loan_opt_cash: { mr: '💵 रोख (Cash Handover)', en: '💵 Cash Handover' },
    modal_give_loan_opt_upi: { mr: '📱 UPI (Google Pay, PhonePe, Paytm)', en: '📱 UPI (Google Pay, PhonePe, Paytm)' },
    modal_give_loan_opt_bank: { mr: '🏦 बँक ट्रान्सफर (NEFT/IMPS)', en: '🏦 Bank Transfer (NEFT/IMPS)' },
    modal_give_loan_opt_cheque: { mr: '📜 चेक', en: '📜 Cheque' },
    modal_give_loan_upi_label: { mr: 'UPI आयडी / बँक ट्रान्झॅक्शन संदर्भ क्र.', en: 'UPI ID / Bank Transaction Ref No.' },
    modal_give_loan_upi_ph: { mr: 'उदा. member@okaxis किंवा UTR क्र.', en: 'e.g. member@okaxis or UTR No.' },
    modal_give_loan_notes_label: { mr: 'टीप / कारणांचा तपशील (ऐच्छिक)', en: 'Notes / Purpose Details (Optional)' },
    modal_give_loan_notes_ph: { mr: 'उदा. वैयक्तिक/घरगुती गरज', en: 'e.g. Personal / Household need' },
    modal_give_loan_btn_confirm: { mr: '💳 कर्ज वाटप निश्चित करा', en: '💳 Confirm Loan Disbursement' },

    modal_mark_loan_paid_title: { mr: '<span>💰</span> कर्ज परतफेड / हप्ता जमा नोंदवा (प्रशासक)', en: '<span>💰</span> Record Loan Repayment / Installment (Admin)' },
    modal_mark_loan_paid_total_header: { mr: 'चालू एकूण देय रक्कम (पूर्ण परतफेड):', en: 'Current Total Due (Full Repayment):' },
    modal_mark_loan_paid_rem_principal_lbl: { mr: 'सध्याचे बाकी कर्ज मुद्दल:', en: 'Current Outstanding Principal:' },
    modal_mark_loan_paid_orig_principal_lbl: { mr: 'सुरुवातीची मूळ मुद्दल:', en: 'Original Disbursed Principal:' },
    modal_mark_loan_paid_duration_lbl: { mr: 'कालावधी:', en: 'Duration:' },
    modal_mark_loan_paid_interest_lbl: { mr: '३% व्याज (४ आठवड्यांनंतर):', en: '3% Interest (After 4 Weeks):' },
    modal_mark_loan_paid_presets_header: { mr: '⚡ जलद निवड करा (Quick Repayment Presets):', en: '⚡ Quick Repayment Presets:' },
    modal_mark_loan_paid_amt_lbl: { mr: 'जमा करावयाची रक्कम (₹) *', en: 'Repayment Amount (₹) *' },
    modal_mark_loan_paid_int_lbl: { mr: 'व्याज रक्कम (₹) *', en: 'Interest Amount (₹) *' },
    modal_mark_loan_paid_rem_preview_lbl: { mr: 'या भरण्यानंतर उर्वरित बाकी कर्ज:', en: 'Remaining Principal After Payment:' },
    modal_mark_loan_paid_week_lbl: { mr: 'परतफेड आठवडा', en: 'Repayment Week' },
    modal_mark_loan_paid_date_lbl: { mr: 'परतफेड तारीख', en: 'Repayment Date' },
    modal_mark_loan_paid_mode_lbl: { mr: 'पेमेंट पद्धत *', en: 'Payment Mode *' },
    modal_mark_loan_paid_notes_lbl: { mr: 'परतफेड टीप (ऐच्छिक)', en: 'Repayment Notes (Optional)' },
    modal_mark_loan_paid_notes_ph: { mr: 'उदा. अर्धे कर्ज परतफेड / पूर्ण परतफेड', en: 'e.g. Half / Full loan repayment' },
    modal_mark_loan_paid_btn_confirm: { mr: '💰 कर्ज परतफेड जमा निश्चित करा', en: '💰 Confirm Loan Repayment' },

    modal_pay_loan_interest_title: { mr: '<span>💰</span> ४-आठवडे कर्ज व्याज जमा नोंदवा (प्रशासक)', en: '<span>💰</span> Record 4-Week Loan Interest (Admin)' },
    modal_pay_loan_interest_total_header: { mr: 'जमा करावयाची ४-आठवड्यांची ३% व्याज रक्कम:', en: '4-Week 3% Interest Amount Due:' },
    modal_pay_loan_interest_principal_lbl: { mr: 'मूळ सक्रिय कर्ज मुद्दल:', en: 'Active Principal Loan:' },
    modal_pay_loan_interest_last_paid_lbl: { mr: 'मागील व्याज भरणा / वाटप:', en: 'Last Interest Payment / Issue:' },
    modal_pay_loan_interest_duration_lbl: { mr: 'कालावधी / स्थिती:', en: 'Duration / Status:' },
    modal_pay_loan_interest_total_paid_lbl: { mr: 'आतापर्यंत जमा एकूण व्याज:', en: 'Total Interest Paid So Far:' },
    modal_pay_loan_interest_amt_lbl: { mr: 'जमा व्याज रक्कम (₹) *', en: 'Interest Amount to Deposit (₹) *' },
    modal_pay_loan_interest_week_lbl: { mr: 'व्याज भरणा आठवडा *', en: 'Interest Payment Week *' },
    modal_pay_loan_interest_date_lbl: { mr: 'भरणा तारीख *', en: 'Payment Date *' },
    modal_pay_loan_interest_mode_lbl: { mr: 'पेमेंट पद्धत *', en: 'Payment Mode *' },
    modal_pay_loan_interest_notes_lbl: { mr: 'टीप / शेरा (ऐच्छिक)', en: 'Notes / Remarks (Optional)' },
    modal_pay_loan_interest_notes_ph: { mr: 'उदा. ४ आठवड्यांचे ३% व्याज रोख मिळाले', en: 'e.g. 4-week 3% interest received in cash' },
    modal_pay_loan_interest_btn_reminder: { mr: '💬 WhatsApp स्मरणपत्र पाठवा', en: '💬 Send WhatsApp Reminder' },
    modal_pay_loan_interest_btn_confirm: { mr: '💰 व्याज जमा निश्चित करा', en: '💰 Confirm Interest Payment' },

    admin_loan_interest_label: { mr: '💳 कर्ज व्याज दर (दर ४ आठवड्यांनी %) *', en: '💳 Loan Interest Rate (Every 4 Wks %) *' },
    admin_loan_interest_regular_badge: { mr: 'नियमित: ३%', en: 'Standard: 3%' },
    modal_give_loan_interest_label: { mr: '📈 कर्ज व्याज दर (दर ४ आठवड्यांनी %) *', en: '📈 Loan Interest Rate (Every 4 Wks %) *' },
    modal_give_loan_default_badge: { mr: 'नियमित दर: ३%', en: 'Standard Rate: 3%' },
    modal_edit_loan_interest_title: { mr: 'कर्ज व्याज दर बदला (Admin)', en: 'Edit Loan Interest Rate (Admin)' },
    modal_edit_loan_interest_rate_label: { mr: 'नवीन व्याज दर (दर ४ आठवड्यांनी %) *', en: 'New Interest Rate (Every 4 Wks %) *' },
    modal_edit_loan_interest_save_btn: { mr: '💾 व्याज दर जतन करा', en: '💾 Save Interest Rate' },

    // Members table & Admin Txn Modal keys
    th_member_details: { mr: 'सदस्य तपशील', en: 'Member Details' },
    th_installment_amount: { mr: 'हप्ता रक्कम', en: 'Installment Amount' },
    th_current_status: { mr: 'सद्य स्थिती', en: 'Current Status' },
    th_total_deposit: { mr: 'एकूण जमा बचत', en: 'Total Deposit' },
    th_next_due_target: { mr: 'पुढील हप्ता / लक्ष्य', en: 'Next Due / Target' },
    th_savings_progress: { mr: 'बचत प्रगती', en: 'Savings Progress' },
    th_actions_options: { mr: 'क्रिया / ऑप्शन्स', en: 'Actions / Options' },

    modal_admin_txn_title: { mr: '<span>📋</span> सर्व सदस्यांच्या ठेवी व कर्ज तपशील खातावही', en: "<span>📋</span> All Members' Deposit & Loan Ledger Register" },
    subtab_all_txns: { mr: '📋 सर्व व्यवहार (ठेवी + कर्ज)', en: '📋 All Transactions (Deposits + Loans)' },
    subtab_bishi_deposits: { mr: '💰 फक्त बीशी ठेवी', en: '💰 Bishi Deposits Only' },
    subtab_all_loans_txns: { mr: '💳 सर्व कर्ज व्यवहार (वाटप / व्याज / परतफेड)', en: '💳 All Loan Transactions (Disbursed / Interest / Repaid)' },
    subtab_member_loan_accounts: { mr: '📊 सर्व सदस्यांचे कर्ज तपशील व खाती', en: "📊 All Members' Loan Accounts & Details" },
    ph_admin_txn_search: { mr: 'सदस्याचे नाव, आयडी, कर्ज क्र. किंवा पावती नंबर शोधा...', en: 'Search by member name, ID, loan no., or receipt no...' },
    btn_give_new_loan: { mr: '➕ नवीन कर्ज', en: '➕ New Loan' },
    th_receipt_no: { mr: 'पावती क्र.', en: 'Receipt No.' },
    th_member_loan_status: { mr: 'सदस्य तपशील व कर्ज स्थिती', en: 'Member Details & Loan Status' },
    th_week_no: { mr: 'आठवडा क्र.', en: 'Week No.' },
    th_installment_loan_amt: { mr: 'हप्ता / कर्ज रक्कम', en: 'Installment / Loan Amount' },
    th_late_fee: { mr: 'लेट फी दंड', en: 'Late Fee Fine' },
    th_total_amount: { mr: 'एकूण रक्कम', en: 'Total Amount' },
    th_payment_mode: { mr: 'पेमेंट पद्धत', en: 'Payment Mode' },
    th_date_time: { mr: 'तारीख व वेळ', en: 'Date & Time' },
    th_receipt: { mr: 'पावती', en: 'Receipt' },
    th_loan_no: { mr: 'कर्ज क्र.', en: 'Loan No.' },
    th_sanctioned_principal: { mr: 'मंजूर कर्ज मुद्दल', en: 'Sanctioned Principal' },
    th_issue_week_date: { mr: 'वाटप आठवडा/तारीख', en: 'Issue Week / Date' },
    th_duration: { mr: 'कालावधी', en: 'Duration' },
    th_interest_status: { mr: '३% व्याज स्थिती', en: 'Interest Status' },
    th_repaid_principal: { mr: 'परत केलेली मुद्दल', en: 'Principal Repaid' },
    th_remaining_principal: { mr: 'उर्वरित बाकी मुद्दल', en: 'Remaining Principal' },
    th_status: { mr: 'स्थिती', en: 'Status' },
    th_actions: { mr: 'क्रिया', en: 'Action' },
    lbl_showing: { mr: 'दाखवत आहे:', en: 'Showing:' },
    lbl_records: { mr: 'नोंदी', en: 'records' },
    lbl_total_deposits: { mr: 'एकूण बचत:', en: 'Total Deposits:' },
    lbl_total_fines: { mr: 'एकूण दंड:', en: 'Total Fines:' },
    lbl_loans_disbursed: { mr: 'कर्ज वाटप:', en: 'Loans Disbursed:' },
    lbl_loan_interest: { mr: 'कर्ज व्याज:', en: 'Loan Interest:' },
    lbl_loans_repaid: { mr: 'कर्ज परतफेड:', en: 'Loans Repaid:' }
  };

  // Phrases for automatic bidirectional DOM scanning
  const EXACT_PHRASE_PAIRS = [
    // Admin Transactions Modal & Member Table headers
    ['सर्व सदस्यांच्या ठेवी व कर्ज तपशील खातावही', "All Members' Deposit & Loan Ledger Register"],
    ['📋 सर्व सदस्यांच्या ठेवी व कर्ज तपशील खातावही', "📋 All Members' Deposit & Loan Ledger Register"],
    ['सर्व व्यवहार (ठेवी + कर्ज)', 'All Transactions (Deposits + Loans)'],
    ['📋 सर्व व्यवहार (ठेवी + कर्ज)', '📋 All Transactions (Deposits + Loans)'],
    ['फक्त बीशी ठेवी', 'Bishi Deposits Only'],
    ['💰 फक्त बीशी ठेवी', '💰 Bishi Deposits Only'],
    ['सर्व कर्ज व्यवहार (वाटप / व्याज / परतफेड)', 'All Loan Transactions (Disbursed / Interest / Repaid)'],
    ['💳 सर्व कर्ज व्यवहार (वाटप / व्याज / परतफेड)', '💳 All Loan Transactions (Disbursed / Interest / Repaid)'],
    ['सर्व सदस्यांचे कर्ज तपशील व खाती', "All Members' Loan Accounts & Details"],
    ['📊 सर्व सदस्यांचे कर्ज तपशील व खाती', "📊 All Members' Loan Accounts & Details"],
    ['सदस्याचे नाव, आयडी, कर्ज क्र. किंवा पावती नंबर शोधा...', 'Search by member name, ID, loan no., or receipt no...'],
    ['सर्व कर्ज व्यवहार', 'All Loan Transactions'],
    ['💳 सर्व कर्ज व्यवहार', '💳 All Loan Transactions'],
    ['फक्त कर्ज वाटप', 'Loan Disbursements Only'],
    ['💳 फक्त कर्ज वाटप', '💳 Loan Disbursements Only'],
    ['फक्त कर्ज व्याज जमा', 'Loan Interest Deposits Only'],
    ['💰 फक्त कर्ज व्याज जमा', '💰 Loan Interest Deposits Only'],
    ['फक्त कर्ज परतफेड', 'Loan Repayments Only'],
    ['✅ फक्त कर्ज परतफेड', '✅ Loan Repayments Only'],
    ['फक्त रोख (Cash)', 'Cash Only'],
    ['💵 फक्त रोख (Cash)', '💵 Cash Only'],
    ['फक्त UPI', 'UPI Only'],
    ['📱 फक्त UPI', '📱 UPI Only'],
    ['दंड भरलेले व्यवहार', 'Fined Transactions'],
    ['⚠️ दंड भरलेले व्यवहार', '⚠️ Fined Transactions'],
    ['पुढील हप्ता / लक्ष्य', 'Next Due / Target'],
    ['बचत प्रगती', 'Savings Progress'],
    ['सदस्य तपशील व कर्ज स्थिती', 'Member Details & Loan Status'],
    ['हप्ता / कर्ज रक्कम', 'Installment / Loan Amount'],
    ['मंजूर कर्ज मुद्दल', 'Sanctioned Principal'],
    ['परत केलेली मुद्दल', 'Principal Repaid'],
    ['उर्वरित बाकी मुद्दल', 'Remaining Principal'],
    ['क्रिया / ऑप्शन्स', 'Actions / Options'],
    ['➕ नवीन कर्ज', '➕ New Loan'],
    ['+ नवीन कर्ज', '+ New Loan'],
    ['नवीन कर्ज', 'New Loan'],
    ['नवीन कर्जे', 'New Loans'],

    // Top Brand & Nav
    ['सुखकर्ता बीशी', 'Sukhakarta Bishi'],
    ['५०-आठवडे बचत फंड', '50-Week Savings Fund'],
    ['५०-आठवडे बचत फंड व पासबुक पोर्टल', '50-Week Savings Fund & Passbook Portal'],
    ['✨ अधिकृत ५०-आठवडे बचत व फंड व्यवस्थापन', '✨ Official 50-Week Savings & Fund Management'],
    ['🏛️ पारदर्शक ५०-आठवडे फंड पूल', '🏛️ Transparent 50-Week Fund Pool'],
    ['💳 ३% नियमावली कर्ज खातावही', '💳 3% Rule Loan Ledger'],
    ['🧾 झटपट WhatsApp पावत्या', '🧾 Instant WhatsApp Receipts'],
    ['☁️ २४x७ सुरक्षित क्लाउड बॅकअप', '☁️ 24x7 Secure Cloud Backup'],
    ['मुख्य मेनू', 'Main Menu'],
    ['नवीन सदस्य जोडा', 'Add New Member'],
    ['मुख्य बचत डॅशबोर्ड', 'Main Savings Dashboard'],
    ['मुख्य डॅशबोर्ड', 'Main Dashboard'],
    ['सर्व सदस्य डेटा', 'All Members Data'],
    ['कर्ज व्यवस्थापन', 'Loan Management'],
    ['सर्व खातावही', 'Transaction Log'],
    ['लेजर कार्ड अहवाल', 'Ledger Card Report'],
    ['व्यवस्थापन व साधने', 'Management & Tools'],
    ['नियम व दंड दर', 'Rules & Fines'],
    ['बॅकअप / एक्सपोर्ट', 'Backup & Export'],
    ['डेटा साफ करा', 'Clear Data'],
    ['माझे खाते', 'My Account'],
    ['माझे ५०-आठवडे पासबुक', 'My 50-Week Passbook'],
    ['माझी खातावही डाउनलोड', 'Download My Ledger'],
    ['माझे लेजर कार्ड अहवाल', 'My Ledger Card Report'],
    ['प्रणाली व सिंक', 'System & Sync'],
    ['वेबसाइट ➔ Firebase सिंक', 'Website ➔ Firebase Sync'],
    ['थीम बदला (Dark/Light)', 'Toggle Theme (Dark/Light)'],
    ['प्रवेश ॲनिमेशन पहा', 'Watch Splash Animation'],
    ['लॉगआउट करा', 'Log Out'],
    ['लॉगआउट', 'Logout'],
    ['मुख्य प्रशासक', 'Main Admin'],
    ['प्रशासक नियंत्रण पॅनल', 'Admin Control Panel'],
    ['डॅशबोर्ड', 'Dashboard'],
    ['सदस्य', 'Members'],
    ['कर्ज', 'Loans'],
    ['अहवाल', 'Reports'],
    ['सूचना', 'Notifications'],
    ['मेनू', 'Menu'],
    ['सूचना केंद्र', 'Notification Center'],

    // Hub Cards & Dashboard Sections
    ['मुख्य नियंत्रण व थेट व्यवस्थापन हब', 'Quick Control & Direct Management Hub'],
    ['सर्व सदस्यांची माहिती, ५०-आठवडे कलेक्शन सायकल, कर्ज वाटप आणि अहवाल व्यवस्थापनासाठी थेट पर्याय.', 'Direct options for all members data, 50-week collection cycle, loan disbursement, and report management.'],
    ['नवीन सदस्य नोंदणी', 'New Member Registration'],
    ['नवीन कर्ज वाटप', 'Issue New Loan'],
    ['सर्व सदस्य डेटा व कलेक्शन सायकल', 'All Members Data & Collection Cycle'],
    ['५०-आठवडे सायकल', '50-Week Cycle'],
    ['साप्ताहिक व मासिक कलेक्शन सायकल, हप्ता भरणा, ५०-आठवडे प्रगती आणि सर्व सदस्यांची खातावही.', 'Weekly & monthly collection cycle, installment deposits, 50-week progress, and full members ledger.'],
    ['थेट सदस्य पेज', 'Direct Members Page'],
    ['सर्व सदस्य डेटा पहा ➔', 'View All Members Data ➔'],
    ['३% मासिक व्याज', '3% Monthly Interest'],
    ['कर्ज खातावही व ३% व्याज', 'Loan Ledger & 3% Interest'],
    ['सर्व वाटप कर्जे, ४-आठवड्यांचे ०% सवलत चक्र, ३% व्याज आकारणी व परतफेड पावत्या.', 'All disbursed loans, 4-week 0% grace period, 3% interest calculation, and repayment receipts.'],
    ['थेट कर्ज खातावही', 'Direct Loan Ledger'],
    ['कर्ज व्यवस्थापन उघडा ➔', 'Open Loan Management ➔'],
    ['प्रिंट व PDF', 'Print & PDF'],
    ['लेजर कार्ड अहवाल रजिस्टर', 'Ledger Card Report Register'],
    ['प्रत्येक सदस्याचे अधिकृत लेजर कार्ड अहवाल, आठवडेनिहाय ठेवी व प्रिंट/डाऊनलोड पावत्या.', 'Official ledger card reports for each member, weekly deposits, and print/download receipts.'],
    ['थेट अहवाल रजिस्टर', 'Direct Report Register'],
    ['अहवाल रजिस्टर उघडा ➔', 'Open Report Register ➔'],
    ['थेट व्यवहार', 'Direct Transactions'],
    ['सर्व व्यवहार खातावही व लॉग', 'All Transactions Ledger & Log'],
    ['ठेवी, कर्ज परतफेड आणि लेट फी दंडांची संपूर्ण ऑडिट नोंदवही व इतिहास.', 'Complete audit log & history of deposits, loan repayments, and late fee fines.'],
    ['संपूर्ण ऑडिट', 'Complete Audit'],
    ['सर्व खातावही उघडा ➔', 'Open All Transactions ➔'],
    ['📲 इन्स्टॉल', '📲 Install'],
    ['ऑडिट व पावत्या', 'Audit & Receipts'],
    ['ठेवी, दंड, कर्ज वाटप, व्याज जमा व परतावा या सर्व आर्थिक व्यवहारांची संपूर्ण खातावही.', 'Complete ledger of all financial transactions: deposits, fines, loan disbursements, interest, and payouts.'],
    ['थेट व्यवहार खातावही', 'Direct Transaction Log'],
    ['सर्व व्यवहार पहा ➔', 'View All Transactions ➔'],

    // Dashboard Statistics
    ['सक्रिय सदस्य संख्या', 'Active Members Count'],
    ['सक्रिय सदस्य', 'Active Members'],
    ['सेटल झालेले', 'Settled'],
    ['एकूण फंड लक्ष्य पूल', 'Total Fund Target Pool'],
    ['५० आठवड्यांचे एकूण लक्ष्य', '50-Week Total Target'],
    ['फंड उद्दिष्ट', 'Fund Target'],
    ['आतापर्यंत जमा एकूण बचत', 'Total Savings Collected'],
    ['एकूण जमा', 'Total Collected'],
    ['चालू आठवडा कलेक्शन', 'Current Week Collection'],
    ['सक्रिय बाकी कर्ज मुद्दल', 'Active Outstanding Principal'],
    ['सक्रिय बाकी कर्ज', 'Active Loan Balance'],
    ['सक्रिय कर्जे', 'Active Loans'],
    ['कर्ज पेज ➔', 'Loans Page ➔'],
    ['जमा ३% कर्ज व्याज', '3% Loan Interest Collected'],
    ['४ आठवड्यांनंतर ३% व्याज', '3% Interest after 4 Weeks'],
    ['कर्जे परतफेड', 'Loans Repaid'],

    // All Members Page & Hero
    ['सदस्य विभाग (सर्व सदस्य तपशील)', 'Members Section (All Members Details)'],
    ['सर्व सदस्यांची संपूर्ण वैयक्तिक माहिती, ५०-आठवडे ठेव खातावही, फोन, वारसदार, कर्ज स्थिती आणि पासबुक तपशील एकाच ठिकाणी.', 'Complete personal details of all members, 50-week savings ledger, phone, nominee, loan status, and passbook records in one unified place.'],
    ['नवीन सदस्य जोडा', 'Add New Member'],
    ['नवीन पेजवर उघडा ↗', 'Open in New Page ↗'],
    ['एकूण सदस्य संख्या', 'Total Members Count'],
    ['सक्रिय बचतकर्ते', 'Active Savers'],
    ['५०-आठवडे बीशी', '50-Week Bishi'],
    ['एकूण साप्ताहिक हप्ता पूल', 'Total Weekly Installment Pool'],
    ['प्रति आठवडा गोळा होणारी रक्कम', 'Amount collected per week'],
    ['नियमित हप्ता', 'Regular Installment'],
    ['सदस्यांची एकूण ठेव बचत', 'Total Member Deposits Saved'],
    ['सर्व आठवड्यांची मिळून ठेव', 'Combined deposits of all weeks'],
    ['एकूण बचत', 'Total Savings'],
    ['मॅच्युरिटी परतावा उद्दिष्ट', 'Maturity Payout Target'],
    ['सदस्य पूर्ण (५० आठवडे)', 'Members Completed (50 Weeks)'],
    ['+८% बोनससह', 'With +8% Bonus'],
    ['५०-आठवड्यांचे चक्र पूर्ण झाले!', '50-Week Cycle Completed!'],
    ['सदस्याने सर्व ५० साप्ताहिक हप्ते पूर्ण केले आहेत. ८% मॅच्युरिटी व्याज बोनस जोडला गेला आहे!', 'Member has completed all 50 weekly installments. 8% maturity interest bonus applied!'],
    ['👀 पूर्ण झालेले सदस्य पहा', '👀 View Completed Members'],
    ['या कालावधीची बाकी', 'Pending for Period'],
    ['🔴 थकबाकी असलेले', '🔴 Overdue'],
    ['💳 कर्ज असलेले', '💳 With Loans'],
    ['जमा झालेले', 'Paid / Deposited'],
    ['५० आठवडे पूर्ण', '50 Weeks Completed'],
    ['📋 टेबल', '📋 Table'],
    ['🗂️ कार्ड्स', '🗂️ Cards'],
    ['तक्ता स्वरूपात पहा', 'View in Table Format'],
    ['कार्ड ग्रीड स्वरूपात पहा', 'View in Card Grid Format'],
    ['सदस्य प्रोफाईल व संपर्क', 'Member Profile & Contact'],
    ['साप्ताहिक हप्ता व लक्ष्य', 'Weekly Installment & Target'],
    ['एकूण ठेव व परतावा', 'Total Deposit & Payout'],
    ['सक्रिय कर्ज स्थिती', 'Active Loan Status'],
    ['५०-आठवडे प्रगती (पासबुक)', '50-Week Progress (Passbook)'],
    ['व्यवस्थापन क्रिया', 'Management Actions'],
    ['दर महिना हप्ता', 'Monthly Installment'],
    ['प्रति आठवडा हप्ता', 'Weekly Installment'],
    ['सक्रिय बाकी मुद्दल', 'Active Outstanding Principal'],
    ['सक्रिय बाकी', 'Active Balance'],
    ['कर्ज तपशील ↗', 'Loan Details ↗'],
    ['✓ कोणतेही कर्ज नाही', '✓ No Active Loan'],
    ['➕ कर्ज द्या', '➕ Disburse Loan'],
    ['📖 संपूर्ण पासबुक पहा', '📖 View Full Passbook'],
    ['👤 प्रोफाईल', '👤 Profile'],
    ['📋 लेजर कार्ड', '📋 Ledger Card'],
    ['✏️ एडिट', '✏️ Edit'],
    ['🗑️ सेटल', '🗑️ Settle'],
    ['सदस्य नाव, फोन, आयडी, वारसदार किंवा पत्ता शोधा...', 'Search member name, phone, ID, nominee, or address...'],
    ['सदस्याचे नाव, फोन नंबर किंवा आयडी शोधा...', 'Search member name, phone number, or ID...'],

    // Loans Page
    ['बीशी सदस्य कर्ज खातावही व ३% व्याज व्यवस्थापन', 'Bishi Member Loan Ledger & 3% Interest Management'],
    ['सर्व वाटप कर्जे, ४-आठवड्यांचे ०% सवलत चक्र, ३% मासिक/आवर्ती व्याज आकारणी, व्हॉट्सअ‍ॅप स्मरणपत्रे व परतफेड पावत्या', 'All disbursed loans, 4-week 0% grace period, 3% interest calculation, WhatsApp reminders, and repayment receipts.'],
    ['➕ नवीन कर्ज वाटप', '➕ Issue New Loan'],
    ['➕ नवीन कर्ज', '➕ New Loan'],
    ['एकूण वाटप कर्ज', 'Total Disbursed Loans'],
    ['कर्जे वाटप', 'Loans Disbursed'],
    ['एकूण मुद्दल', 'Total Principal'],
    ['४-आठवडे चक्र व्याज', '4-Week Cycle Interest'],
    ['पूर्ण परतफेड कर्जे', 'Fully Repaid Loans'],
    ['कर्जे पूर्ण', 'Loans Settled'],
    ['परतफेड', 'Repaid'],
    ['सर्व कर्जे (All Loans)', 'All Loans'],
    ['🔴 कर्ज बाकी (Pending Loans)', '🔴 Pending Loans'],
    ['✅ पूर्ण फेड कर्जे (Paid / Settled)', '✅ Settled Loans'],
    ['कर्ज क्र.', 'Loan No.'],
    ['सदस्य नाव व संपर्क', 'Member Name & Contact'],
    ['मूळ मुद्दल', 'Original Principal'],
    ['वाटप आठवडा/तारीख', 'Issue Week / Date'],
    ['कालावधी व सायकल', 'Duration & Cycle'],
    ['४-आठवडे ३% व्याज स्थिती', '4-Week 3% Interest Status'],
    ['एकूण देय रक्कम', 'Total Payable Amount'],
    ['कृती (Actions)', 'Actions'],
    ['↔️ संपूर्ण खातावही पाहण्यासाठी डावीकडे/उजवीकडे स्क्रोल करा (Swipe to view full ledger)', '↔️ Swipe left/right to view full ledger'],
    ['🔍 सदस्याचे नाव, आयडी, मोबाईल किंवा कर्ज क्र. शोधा...', '🔍 Search member name, ID, mobile, or loan no...'],
    ['कोणतीही कर्ज नोंद सापडली नाही', 'No loan records found'],
    ['नवीन कर्ज वाटप करण्यासाठी वरील', 'To issue a new loan, click'],
    ['बटणावर क्लिक करा.', 'button above.'],
    ['आठवडे एकूण', 'Weeks Total'],
    ['चालू सायकल:', 'Current Cycle:'],
    ['आठवडे', 'Weeks'],
    ['(पूर्ण जमा)', '(Fully Settled)'],
    ['(उर्वरित बाकी + व्याज)', '(Remaining Balance + Interest)'],
    ['(फक्त मुद्दल)', '(Principal Only)'],
    ['(+३% व्याज)', '(+3% Interest)'],
    ['✅ पूर्ण फेड', '✅ Fully Settled'],
    ['🔴 कर्ज बाकी (Pending)', '🔴 Pending Loan'],
    ['🟠 अंशतः भरले', '🟠 Partially Paid'],
    ['💰 ३% कर्ज व्याज देय', '💰 3% Loan Interest Due'],
    ['💰 ३% कर्ज व्याज देय:', '💰 3% Loan Interest Due:'],
    ['💬 मेसेज', '💬 Message'],
    ['✓ कर्ज व्याज जमा', '✓ Loan Interest Paid'],
    ['⏳ सवलतीत / नियमित', '⏳ Grace Period / Regular'],
    ['⏳ कर्ज सवलतीत', '⏳ Loan in Grace Period'],
    ['सवलत चालू', 'Grace Period Active'],
    ['⚡ कृती निवडा ▾', '⚡ Select Action ▾'],
    ['📄 कर्ज वाटप व्हाउचर (Loan Assign Voucher)', '📄 Loan Assign Voucher'],
    ['✅ कर्ज फेड नोंदवा (Pay Loan)', '✅ Record Loan Repayment'],
    ['🧾 कर्ज परतफेड पावती (Repayment Receipt)', '🧾 Loan Repayment Receipt'],
    ['💬 WhatsApp व्याज मेसेज', '💬 WhatsApp Interest Reminder'],
    ['🧾 व्याज पावती पहा (Interest Receipt)', '🧾 View Interest Receipt'],
    ['🧾 हप्ता पावती पहा (Partial Repayment Receipt)', '🧾 View Installment Receipt'],
    ['❌ कर्ज नोंद रद्द करा', '❌ Cancel Loan Record'],
    ['बाकी मुद्दल / मूळ कर्ज', 'Remaining / Original Principal'],
    ['एकूण देय रक्कम', 'Total Payable Amount'],
    ['वाटप आठवडा व तारीख', 'Disbursed Week & Date'],
    ['३% व्याज स्थिती', '3% Interest Status'],
    ['पूर्ण फेड तारीख:', 'Settled Date:'],

    // Loan Modals (Issue Loan, Repay Loan, Pay Interest)
    ['सदस्यास नवीन कर्ज द्या (प्रशासक)', 'Issue New Loan to Member (Admin)'],
    ['सदस्यास नवीन कर्ज द्या', 'Issue New Loan to Member'],
    ['या सदस्यास कर्ज द्या', 'Issue loan to this member'],
    ['नवीन कर्ज द्या', 'Issue New Loan'],
    ['सदस्य निवडा *', 'Select Member *'],
    ['-- सदस्य निवडा --', '-- Select Member --'],
    ['सदस्य निवडा', 'Select Member'],
    ['कर्ज रक्कम (₹) *', 'Loan Amount (₹) *'],
    ['कर्ज रक्कम (₹)', 'Loan Amount (₹)'],
    ['कर्ज रक्कम', 'Loan Amount'],
    ['कर्ज व व्याज नियमावली:', 'Loan & Interest Rules:'],
    ['कर्ज व व्याज नियमावली', 'Loan & Interest Rules'],
    ['पहिल्या ४ आठवड्यांत (Grace Period):', 'First 4 Weeks (Grace Period):'],
    ['पहिल्या ४ आठवड्यांत', 'First 4 Weeks'],
    ['०% व्याज (फक्त मूळ रक्कम परतफेड).', '0% Interest (Principal repayment only).'],
    ['०% व्याज (फक्त मूळ रक्कम परतफेड)', '0% Interest (Principal repayment only)'],
    ['०% व्याज (फक्त Principal Amount Repaid).', '0% Interest (Principal repayment only).'],
    ['०% व्याज (फक्त Principal Amount Repaid)', '0% Interest (Principal amount repayment only)'],
    ['४ आठवड्यांनंतर: ३% व्याज लागू होईल (उदा. ₹१०,००० वर +₹३०० व्याज).', 'After 4 Weeks: 3% Interest applies (e.g. +₹300 interest on ₹10,000).'],
    ['४ आठवड्यांनंतर: ३% व्याज लागू होईल', 'After 4 Weeks: 3% Interest applies'],
    ['३% व्याज लागू होईल', '3% Interest applies'],
    ['वाटप आठवडा', 'Disbursement Week'],
    ['वाटप आठवडा/तारीख', 'Issue Week / Date'],
    ['वाटप तारीख', 'Disbursed Date'],
    ['वितरण पद्धत (Disbursement Mode) *', 'Disbursement Mode *'],
    ['वितरण पद्धत (DISBURSEMENT MODE) *', 'Disbursement Mode *'],
    ['वितरण पद्धत', 'Disbursement Mode'],
    ['💵 रोख (Cash Handover)', '💵 Cash Handover'],
    ['💵 रोख (Cash)', '💵 Cash'],
    ['💵 रोख', '💵 Cash'],
    ['📱 UPI (Google Pay, PhonePe, Paytm)', '📱 UPI (Google Pay, PhonePe, Paytm)'],
    ['🏦 बँक ट्रान्सफर (NEFT/IMPS)', '🏦 Bank Transfer (NEFT/IMPS)'],
    ['🏦 बँक ट्रान्सफर', '🏦 Bank Transfer'],
    ['📜 चेक', '📜 Cheque'],
    ['UPI आयडी / बँक ट्रान्झॅक्शन संदर्भ क्र.', 'UPI ID / Bank Transaction Ref No.'],
    ['उदा. member@okaxis किंवा UTR क्र.', 'e.g. member@okaxis or UTR No.'],
    ['टीप / कारणांचा तपशील (ऐच्छिक)', 'Notes / Purpose Details (Optional)'],
    ['उदा. वैयक्तिक/घरगुती गरज', 'e.g. Personal / Household need'],
    ['कर्ज वाटप निश्चित करा', 'Confirm Loan Disbursement'],
    ['💳 कर्ज वाटप निश्चित करा', '💳 Confirm Loan Disbursement'],
    ['कर्ज परतफेड / हप्ता जमा नोंदवा (प्रशासक)', 'Record Loan Repayment / Installment (Admin)'],
    ['चालू एकूण देय रक्कम (पूर्ण परतफेड):', 'Current Total Due (Full Repayment):'],
    ['चालू एकूण देय रक्कम', 'Current Total Due'],
    ['सध्याचे बाकी कर्ज मुद्दल:', 'Current Outstanding Principal:'],
    ['सुरुवातीची मूळ मुद्दल:', 'Original Disbursed Principal:'],
    ['भरलेली मुद्दल:', 'Repaid Principal:'],
    ['कालावधी:', 'Duration:'],
    ['२ आठवडे (सवलत कालावधीत)', '2 Weeks (In Grace Period)'],
    ['३% व्याज (४ आठवड्यांनंतर):', '3% Interest (After 4 Weeks):'],
    ['३% व्याज (४ आठवड्यांनंतर)', '3% Interest (After 4 Weeks)'],
    ['₹0 (०% सवलत)', '₹0 (0% Grace Period)'],
    ['₹० (०% सवलत)', '₹0 (0% Grace Period)'],
    ['₹० (०% सवलतीत)', '₹0 (0% Grace Period)'],
    ['⚡ जलद निवड करा (Quick Repayment Presets):', '⚡ Quick Repayment Presets:'],
    ['⚡ जलद निवड करा', '⚡ Quick Selection'],
    ['🌓 ५०% अर्धे फेड (Half Pay)', '🌓 Pay Half (50%)'],
    ['💯 १००% पूर्ण फेड (Full Pay)', '💯 Pay Full (100%)'],
    ['जमा करावयाची रक्कम (₹) *', 'Repayment Amount (₹) *'],
    ['व्याज रक्कम (₹) *', 'Interest Amount (₹) *'],
    ['या भरण्यानंतर उर्वरित बाकी कर्ज:', 'Remaining Principal After Payment:'],
    ['परतफेड आठवडा', 'Repayment Week'],
    ['परतफेड तारीख', 'Repayment Date'],
    ['पेमेंट पद्धत *', 'Payment Mode *'],
    ['परतफेड टीप (ऐच्छिक)', 'Repayment Notes (Optional)'],
    ['उदा. अर्धे कर्ज परतफेड / पूर्ण परतफेड', 'e.g. Half / Full loan repayment'],
    ['कर्ज परतफेड जमा निश्चित करा', 'Confirm Loan Repayment'],
    ['💰 कर्ज परतफेड जमा निश्चित करा', '💰 Confirm Loan Repayment'],
    ['४-आठवडे कर्ज व्याज जमा नोंदवा (प्रशासक)', 'Record 4-Week Loan Interest (Admin)'],
    ['जमा करावयाची ४-आठवड्यांची ३% व्याज रक्कम:', '4-Week 3% Interest Amount Due:'],
    ['मूळ सक्रिय कर्ज मुद्दल:', 'Active Principal Loan:'],
    ['मागील व्याज भरणा / वाटप:', 'Last Interest Payment / Issue:'],
    ['कालावधी / स्थिती:', 'Duration / Status:'],
    ['आतापर्यंत जमा एकूण व्याज:', 'Total Interest Paid So Far:'],
    ['जमा व्याज रक्कम (₹) *', 'Interest Amount to Deposit (₹) *'],
    ['व्याज भरणा आठवडा *', 'Interest Payment Week *'],
    ['भरणा तारीख *', 'Payment Date *'],
    ['टीप / शेरा (ऐच्छिक)', 'Notes / Remarks (Optional)'],
    ['उदा. ४ आठवड्यांचे ३% व्याज रोख मिळाले', 'e.g. 4-week 3% interest received in cash'],
    ['WhatsApp स्मरणपत्र पाठवा', 'Send WhatsApp Reminder'],
    ['💬 WhatsApp स्मरणपत्र पाठवा', '💬 Send WhatsApp Reminder'],
    ['व्याज जमा निश्चित करा', 'Confirm Interest Payment'],
    ['💰 व्याज जमा निश्चित करा', '💰 Confirm Interest Payment'],

    // Week navigation & summary banner
    ['साप्ताहिक कलेक्शन सायकल', 'Weekly Collection Cycle'],
    ['चालू आठवडा', 'Current Week'],
    ['आठवडा', 'Week'],
    ['महिना', 'Month'],
    ['मागील आठवडा', 'Previous Week'],
    ['पुढील आठवडा', 'Next Week'],
    ['थेट आठवडा निवडा', 'Select Week Directly'],
    ['कलेक्शन टक्केवारी', 'Collection Rate'],
    ['या आठवड्याची बाकी', 'Remaining Balance This Week'],
    ['आतापर्यंत जमा रक्कम', 'Total Amount Collected'],
    ['अपेक्षित हप्ता लक्ष्य', 'Expected Installment Target'],
    ['निवडलेला आठवडा', 'Selected Week'],
    ['सदस्य तपशील', 'Member Details'],
    ['नियमित हप्ता', 'Installment Amount'],
    ['चालू हप्ता स्थिती', 'Current Installment Status'],
    ['एकूण जमा बचत', 'Total Deposit'],
    ['शिल्लक बाकी', 'Remaining Due'],
    ['५०-आठवडे प्रगती', '50-Week Progress'],
    ['कृती / पर्याय', 'Actions / Options'],
    ['कृती / पावती', 'Actions / Receipt'],

    // Filters & Actions
    ['सर्व सदस्य', 'All Members'],
    ['सर्व', 'All'],
    ['📅 साप्ताहिक', '📅 Weekly'],
    ['🗓️ मासिक', '🗓️ Monthly'],
    ['जमा (Paid)', 'Paid'],
    ['प्रलंबित (Pending)', 'Pending'],
    ['थकबाकी (Overdue)', 'Overdue'],
    ['पूर्ण (Completed)', 'Completed'],
    ['नाव, मोबाईल किंवा आयडीने शोधा...', 'Search by name, mobile, or ID...'],
    ['💰 जमा करा', '💰 Collect'],
    ['💰 बाकी जमा', '💰 Collect Due'],
    ['🧾 पावती', '🧾 Receipt'],
    ['🎉 व्हाउचर', '🎉 Voucher'],
    ['📖 पासबुक', '📖 Passbook'],
    ['👤 प्रोफाईल', '👤 Profile'],
    ['⚙️ पर्याय ▾', '⚙️ Options ▾'],
    ['जमा', 'Paid'],
    ['प्रलंबित', 'Pending'],
    ['थकबाकी', 'Overdue'],
    ['✓ क्लिअर', '✓ Cleared'],
    ['पूर्ण 🏆', 'Completed 🏆'],
    ['⚠️ अपूर्ण जमा', '⚠️ Partial'],
    ['प्रति आठवडा', 'per week'],
    ['दर महिना', 'per month'],
    ['जादा', 'extra'],
    ['दंड', 'fine'],
    ['देय', 'Due'],
    ['बाकी', 'Pending'],
    ['बंद करा', 'Close'],
    ['रद्द करा', 'Cancel'],
    ['जतन करा', 'Save'],
    ['सबमिट करा', 'Submit'],
    ['नक्की करा', 'Confirm'],
    ['🖨️ प्रिंट करा', '🖨️ Print'],
    ['📥 डाउनलोड', '📥 Download'],
    ['💬 WhatsApp वर पाठवा', '💬 Share on WhatsApp'],
    ['📊 Excel डाउनलोड', '📊 Export Excel'],
    ['📄 CSV डाउनलोड', '📄 Export CSV'],
    ['💾 JSON बॅकअप', '💾 Backup JSON'],

    // Reports & Ledger Card
    ['बीशी अहवाल व अधिकृत सदस्य खातावही कार्ड रजिस्टर', 'Bishi Reports & Official Member Ledger Card Register'],
    ['शासकीय व अधिकृत लेजर कार्ड रजिस्टर अहवाल — हप्ते, मुद्दल, व्याज व अंतिम परतावा गणना', 'Official member ledger card register report — installments, principal, interest, and final payout calculation'],
    ['अधिकृत खातावही कार्ड रजिस्टर', 'Official Ledger Card Register'],
    ['अधिकृत सदस्य खातावही कार्ड रजिस्टर', 'Official Member Ledger Card Register'],
    ['सदस्य खातावही कार्ड रजिस्टर', 'Member Ledger Card Register'],
    ['अहवाल प्रिंट करा', 'Print Report'],
    ['लेजर कार्ड प्रिंट करा', 'Print Ledger Card'],
    ['PDF सेव्ह करा', 'Save PDF'],
    ['सदस्य निवडा:', 'Select Member:'],
    ['आठवडे दृश्य:', 'Weeks View:'],
    ['✓ भरलेले / चालू आठवडे', '✓ Active Weeks'],
    ['सर्व ५० आठवडे', 'All 50 Weeks'],
    ['सर्व १२ महिने', 'All 12 Months'],
    ['पूर्ण', 'Done'],

    // Customer Portal
    ['माझे लेजर कार्ड पहा / प्रिंट करा', 'View / Print My Ledger Card'],
    ['📋 माझे लेजर कार्ड पहा / प्रिंट करा', '📋 View / Print My Ledger Card'],
    ['माझे लेजर कार्ड पहा', 'View My Ledger Card'],
    ['लेजर कार्ड रिपोर्ट', 'Ledger Card Report'],
    ['📋 लेजर कार्ड रिपोर्ट', '📋 Ledger Card Report'],
    ['सदस्य खातावही (पासबुक पहा)', 'Member Passbook (View Ledger)'],
    ['📖 सदस्य खातावही (पासबुक पहा)', '📖 Member Passbook (View Ledger)'],
    ['माझे स्टेटमेंट डाउनलोड करा', 'Download My Statement'],
    ['📥 माझे स्टेटमेंट डाउनलोड करा', '📥 Download My Statement'],
    ['माझे सर्व व्यवहार व पेमेंट इतिहास', 'My Transactions & Payment History'],
    ['📜 माझे सर्व व्यवहार व पेमेंट इतिहास', '📜 My Transactions & Payment History'],
    ['आपल्या ५०-आठवडे बीशीचे जमा हप्ते आणि डिजिटल पावत्यांचा संपूर्ण तपशील.', 'Complete details of your 50-week Bishi installments and digital receipts.'],
    ['अधिकृत सदस्य बचत व खातावही पोर्टल', 'Official Member Savings & Ledger Portal'],
    ['सदस्य बचत पासबुक व खातावही पोर्टल', 'Member Savings Passbook & Ledger Portal'],
    ['माझे ५०-आठवडे बचत पासबुक', 'My 50-Week Savings Passbook'],
    ['📖 माझे ५०-आठवडे बचत पासबुक', '📖 My 50-Week Savings Passbook'],
    ['माझे ५०-आठवडे पासबुक', 'My 50-Week Passbook'],
    ['माझे कर्ज व चालू हप्ता तपशील', 'My Loans & Current Due Details'],
    ['💳 माझे कर्ज व चालू हप्ता तपशील', '💳 My Loans & Current Due Details'],
    ['आपल्या नावावरील कर्ज, ३% व्याज स्थिती आणि या आठवड्यात भरावी लागणारी एकूण देय रक्कम.', 'Your active loan, 3% interest status, and total amount due this week.'],
    ['🔒 केवळ प्रशासक कर्ज वाटप व परतफेड नोंदवू शकतात', '🔒 Only admin can disburse & record loan repayments'],
    ['या आठवड्यात एकूण देय रक्कम (Total You Have to Pay):', 'Total Amount Due This Week:'],
    ['साप्ताहिक बीशी हप्ता:', 'Weekly Bishi Installment:'],
    ['सक्रिय कर्ज मुद्दल:', 'Active Loan Principal:'],
    ['३% व्याज (४ आठवडे पूर्ण):', '3% Interest (4 Weeks Complete):'],
    ['कर्ज व्यवहार इतिहास व पावत्या', 'Loan Transaction History & Receipts'],
    ['📜 कर्ज व्यवहार इतिहास व पावत्या', '📜 Loan Transaction History & Receipts'],
    ['५०-आठवड्यांचे बचत चक्र यशस्वीरीत्या पूर्ण झाले!', '50-Week Savings Cycle Completed Successfully!'],
    ['५०-आठवडे एकूण बचत:', '50-Week Total Savings:'],
    ['८% व्याज बोनस:', '8% Interest Bonus:'],
    ['१०% व्याज बोनस:', '10% Interest Bonus:'],
    ['एकूण मॅच्युरिटी परतावा:', 'Total Maturity Payout:'],
    ['५०-आठवडे बचत', '50-Week Savings'],
    ['८% व्याज बोनस', '8% Interest Bonus'],
    ['१०% व्याज बोनस', '10% Interest Bonus'],
    ['एकूण मॅच्युरिटी परतावा', 'Total Maturity Payout'],
    ['५०-आठवड्यांचे बचत लक्ष्य', '50-Week Savings Target'],
    ['५० आठवड्यांचे एकूण उद्दिष्ट', '50-Week Total Goal'],
    ['आतापर्यंत एकूण जमा बचत', 'Total Savings Deposited'],
    ['पुढील देय हप्ता', 'Next Due Installment'],
    ['लक्ष्यासाठी उर्वरित रक्कम', 'Remaining Due for Target'],
    ['पावती क्र.', 'Receipt No.'],
    ['व्यवहार / आठवडा', 'Transaction / Week'],
    ['जमा हप्ता', 'Installment Deposit'],
    ['लेट फी दंड', 'Late Fee Fine'],
    ['एकूण भरलेली रक्कम', 'Total Paid Amount'],
    ['पेमेंट पद्धत', 'Payment Mode'],
    ['तारीख', 'Date'],
    ['पावती', 'Receipt'],
    ['मूळ रक्कम', 'Principal Amount'],
    ['वाटप तारीख', 'Disbursed Date'],
    ['कालावधी', 'Duration'],
    ['३% व्याज स्थिती', '3% Interest Status'],
    ['एकूण परतफेड', 'Total Repaid'],
    ['स्थिती', 'Status'],
    ['हप्ता रक्कम', 'Installment Amount'],
    ['मासिक हप्ता', 'Monthly Installment'],
    ['साप्ताहिक हप्ता', 'Weekly Installment'],
    ['कालावधी प्रगती', 'Duration Progress'],
    ['मॅच्युरिटी परतावा (+८%)', 'Maturity Payout (+8%)'],
    ['मॅच्युरिटी परतावा', 'Maturity Payout'],
    ['लेजर कार्ड', 'Ledger Card'],
    ['भरणा पुसा', 'Wipe Data'],
    ['एडिट करा', 'Edit'],
    ['सदस्य पासबुक', 'Member Passbook'],
    ['अधिकृत डिजिटल पावती पाहण्यासाठी कोणत्याही जमा झालेल्या आठवड्यावर क्लिक करा.', 'Click on any deposited week to view the official digital receipt.'],
    ['🟢 जमा • 🟡 चालू हप्ता • 🔴 थकबाकी • ⚪ प्रलंबित', '🟢 Paid • 🟡 Current • 🔴 Overdue • ⚪ Pending'],
    ['मोबाईल ॲप इन्स्टॉल करा', 'Install Mobile App'],
    ['अ‍ॅप इन्स्टॉल', 'Install App'],
    ['सुखकर्ता बीशी मोबाईल ॲप', 'Sukhakarta Bishi Mobile App'],
    ['अ‍ॅपप्रमाणे जलद व ऑफलाइन वापरण्यासाठी इन्स्टॉल करा', 'Install for fast access & offline support'],
    ['इन्स्टॉल', 'Install'],

    // Login Screen
    ['लॉगिन करा', 'Log In'],
    ['सदस्य आयडी / मोबाईल नंबर / युझरनेम', 'Member ID / Mobile Number / Username'],
    ['पासवर्ड / पिन (PIN)', 'Password / PIN'],
    ['माझे लॉगिन जतन ठेवा', 'Remember my login'],
    ['प्रशासक व सदस्य प्रवेश', 'Admin & Member Access']
  ];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
  }

  function replacePhrase(text, from, to, isEn) {
    if (!text || !from || !to || !text.includes(from)) return text;
    // Multi-word phrase or phrase with special characters: exact replace
    if (from.includes(' ') || /[^\w\u0900-\u097F]/.test(from)) {
      return text.split(from).join(to);
    }
    // Single Devanagari word: only match if not surrounded by Devanagari characters
    if (isEn && /[\u0900-\u097F]/.test(from)) {
      const reg = new RegExp('(^|[^\\u0900-\\u097F])' + escapeRegex(from) + '([^\\u0900-\\u097F]|$)', 'gu');
      return text.replace(reg, (match, p1, p2) => p1 + to + p2);
    } else if (!isEn && /^[a-zA-Z0-9_]+$/.test(from)) {
      // Single English word: require word boundaries
      const reg = new RegExp('\\b' + escapeRegex(from) + '\\b', 'g');
      return text.replace(reg, to);
    }
    return text.split(from).join(to);
  }

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

      // Re-run DOM translation to catch any freshly rendered static strings
      this.translateDOM();

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
      if (typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('.lang-pill-btn').forEach(btn => {
          const btnLang = btn.dataset?.lang || btn.getAttribute?.('data-lang');
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
      }

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
      if (typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (key && TRANSLATIONS[key]) {
            const val = TRANSLATIONS[key][this.currentLang];
            if (val) {
              if (val.includes('<') && val.includes('>')) {
                el.innerHTML = val;
              } else {
                el.textContent = val;
              }
            }
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
      }

      // 4. Sort phrase pairs by length descending so longer phrases match first
      const sortedPairs = [...EXACT_PHRASE_PAIRS].sort((a, b) => {
        const fromA = isEn ? a[0] : a[1];
        const fromB = isEn ? b[0] : b[1];
        return (fromB ? fromB.length : 0) - (fromA ? fromA.length : 0);
      });

      // 5. Deep TreeWalker across all text nodes (replaces matching phrases everywhere in DOM)
      if (typeof document.createTreeWalker === 'function' && document.body) {
        try {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode(node) {
                if (!node || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          );

          const textNodes = [];
          while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
          }

          textNodes.forEach(node => {
            let text = node.nodeValue;
            let modified = false;

            for (let i = 0; i < sortedPairs.length; i++) {
              const [mrPhrase, enPhrase] = sortedPairs[i];
              const from = isEn ? mrPhrase : enPhrase;
              const to = isEn ? enPhrase : mrPhrase;

              if (from && to && text.includes(from)) {
                const nextText = replacePhrase(text, from, to, isEn);
                if (nextText !== text) {
                  text = nextText;
                  modified = true;
                }
              }
            }

            if (modified) {
              node.nodeValue = text;
            }
          });
        } catch (e) {
          console.warn('[i18n] TreeWalker error:', e);
        }
      }

      // 6. Fast Element-level fallback & attribute translation
      if (typeof document.querySelectorAll === 'function') {
        const selectors = 'th, td, p, h1, h2, h3, h4, span, label, button, a, option, div.stat-label, div.sidebar-group-title, span.sidebar-nav-text';
        try {
          document.querySelectorAll(selectors).forEach(el => {
            if (el.children.length === 0 && el.textContent) {
              const trimmed = el.textContent.trim();
              for (let i = 0; i < sortedPairs.length; i++) {
                const [mrPhrase, enPhrase] = sortedPairs[i];
                const from = isEn ? mrPhrase : enPhrase;
                const to = isEn ? enPhrase : mrPhrase;
                if (trimmed === from) {
                  el.textContent = to;
                  break;
                }
              }
            }
          });

          // Translate placeholders
          document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            let ph = el.getAttribute('placeholder') || '';
            let modified = false;
            for (let i = 0; i < sortedPairs.length; i++) {
              const [mrPhrase, enPhrase] = sortedPairs[i];
              const from = isEn ? mrPhrase : enPhrase;
              const to = isEn ? enPhrase : mrPhrase;
              if (from && to && ph.includes(from)) {
                const nextPh = replacePhrase(ph, from, to, isEn);
                if (nextPh !== ph) {
                  ph = nextPh;
                  modified = true;
                }
              }
            }
            if (modified) el.setAttribute('placeholder', ph);
          });

          // Translate titles
          document.querySelectorAll('[title]').forEach(el => {
            let t = el.getAttribute('title') || '';
            let modified = false;
            for (let i = 0; i < sortedPairs.length; i++) {
              const [mrPhrase, enPhrase] = sortedPairs[i];
              const from = isEn ? mrPhrase : enPhrase;
              const to = isEn ? enPhrase : mrPhrase;
              if (from && to && t.includes(from)) {
                const nextT = replacePhrase(t, from, to, isEn);
                if (nextT !== t) {
                  t = nextT;
                  modified = true;
                }
              }
            }
            if (modified) el.setAttribute('title', t);
          });
        } catch (_) {}
      }
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
