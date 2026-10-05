const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const appPath = path.join(__dirname, '..', 'app.html');

let html = fs.readFileSync(indexPath, 'utf8');

// Customize for dedicated mobile app
html = html.replace(
  '<title>सुखकर्ता बीशी - ५०-आठवडे फंड व्यवस्थापन व सदस्य पोर्टल</title>',
  '<title>सुखकर्ता बीशी - मोबाईल ॲप्लिकेशन (Mobile Application)</title>'
);

// Add mobile app flag in head
html = html.replace(
  '<!-- PWA Manifest & App Icons -->',
  '<!-- Mobile Application Specific Settings -->\n  <meta name="is-mobile-app-entry" content="true">\n  <!-- PWA Manifest & App Icons -->'
);

// Add body class for bottom nav support
html = html.replace('<body>', '<body class="has-bottom-nav">');

// Add Mobile Bottom Navigation Bar before the toast container
const bottomNavHtml = `
  <!-- ==========================================================================
       मोबाईल ॲप तळ बार (Mobile App Bottom Navigation Tab Bar)
       ========================================================================== -->
  <nav class="mobile-app-bottom-bar no-print" id="mobileAppBottomBar">
    <button type="button" class="bottom-nav-item active" id="bnavDashboard" onclick="if(window.setActiveBottomNav)window.setActiveBottomNav('bnavDashboard'); window.ui.navigateToDashboard();">
      <span class="bnav-icon">📊</span>
      <span class="bnav-label">डॅशबोर्ड</span>
    </button>
    <button type="button" class="bottom-nav-item" id="bnavMembers" onclick="if(window.setActiveBottomNav)window.setActiveBottomNav('bnavMembers'); window.ui.navigateToMembersPage();">
      <span class="bnav-icon">👥</span>
      <span class="bnav-label">सदस्य</span>
    </button>
    <button type="button" class="bottom-nav-item" id="bnavLoans" onclick="if(window.setActiveBottomNav)window.setActiveBottomNav('bnavLoans'); window.ui.navigateToLoansPage();">
      <span class="bnav-icon">💳</span>
      <span class="bnav-label">कर्ज</span>
    </button>
    <button type="button" class="bottom-nav-item" id="bnavReports" onclick="if(window.setActiveBottomNav)window.setActiveBottomNav('bnavReports'); window.ui.navigateToReportsPage();">
      <span class="bnav-icon">📜</span>
      <span class="bnav-label">अहवाल</span>
    </button>
    <button type="button" class="bottom-nav-item" id="bnavMenu" onclick="window.ui.toggleMobileDrawer()">
      <span class="bnav-icon">☰</span>
      <span class="bnav-label">मेनू</span>
    </button>
  </nav>
`;

if (!html.includes('id="mobileAppBottomBar"')) {
  html = html.replace('<!-- टोस्ट नोटिफिकेशन्स कंटेनर -->', bottomNavHtml + '\n  <!-- टोस्ट नोटिफिकेशन्स कंटेनर -->');
}

fs.writeFileSync(appPath, html, 'utf8');
console.log('✅ app.html successfully generated for dedicated Mobile Application Link!');
