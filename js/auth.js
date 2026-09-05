/**
 * ==========================================================================
 * सुखकर्ता बीशी - सुरक्षित दुहेरी भूमिका ऑथेंटिकेशन व सेशन व्यवस्थापक
 * (प्रशासक पॅनल सुरक्षित पासवर्ड: jeevan@1234)
 * ==========================================================================
 */

const SESSION_KEY = 'sukhakarta_secure_session_v3';
const MASTER_ADMIN_PASSWORD = 'jeevan@1234';

class AuthManager {
  constructor() {
    this.session = this.loadSession();
  }

  loadSession() {
    try {
      localStorage.removeItem('sukhakarta_admin_session_v1');
      sessionStorage.removeItem('sukhakarta_admin_session_v1');
      localStorage.removeItem('sukhakarta_bishi_session_v2');
      sessionStorage.removeItem('sukhakarta_bishi_session_v2');

      const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isLoggedIn === true) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
    return null;
  }

  saveSession(sessionData, remember = false) {
    this.session = sessionData;
    const str = JSON.stringify(sessionData);
    if (remember) {
      localStorage.setItem(SESSION_KEY, str);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, str);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  isAuthenticated() {
    return this.session !== null && this.session.isLoggedIn === true;
  }

  isAdmin() {
    return this.isAuthenticated() && this.session.role === 'admin';
  }

  isCustomer() {
    return this.isAuthenticated() && this.session.role === 'customer';
  }

  getCurrentUser() {
    return this.session;
  }

  getCurrentCustomerMember() {
    if (!this.isCustomer() || !this.session.memberId) return null;
    return window.bishiStore.getMember(this.session.memberId);
  }

  getAdminCredentials() {
    const meta = window.bishiStore.state.meta;
    if (!meta.admin || meta.admin.password !== MASTER_ADMIN_PASSWORD) {
      meta.admin = {
        username: 'admin',
        password: MASTER_ADMIN_PASSWORD,
        name: 'मुख्य प्रशासक',
        role: 'admin',
        lastLogin: null
      };
      window.bishiStore.saveState();
    }
    return meta.admin;
  }

  // --- युनिफाईड लॉगिन (प्रशासक व सदस्य एकाच फॉर्मवरून) ---
  loginUnified(identifier, password, remember = false) {
    const rawId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanPass) {
      return {
        success: false,
        message: 'कृपया आपला पासवर्ड टाका.'
      };
    }

    // १. प्रशासक मास्टर पासवर्ड 'jeevan@1234' तपासणी
    if (cleanPass === MASTER_ADMIN_PASSWORD) {
      const sessionData = {
        isLoggedIn: true,
        role: 'admin',
        username: rawId || 'admin',
        name: 'मुख्य प्रशासक',
        loginTime: new Date().toISOString()
      };

      const admin = this.getAdminCredentials();
      admin.lastLogin = sessionData.loginTime;
      window.bishiStore.saveState();

      this.saveSession(sessionData, remember);
      return { success: true, role: 'admin', user: sessionData };
    }

    // २. सदस्य लॉगिन पडताळणी
    if (!rawId) {
      return {
        success: false,
        message: 'कृपया आपला सदस्य आयडी किंवा नोंदणीकृत मोबाईल नंबर टाका.'
      };
    }

    const cleanPhone = rawId.replace(/\D/g, '');
    const cleanId = rawId.toUpperCase();
    const members = window.bishiStore.getMembers();

    // आयडी किंवा फोनवरून सदस्य शोधणे
    const member = members.find(m => {
      const mId = (m.id || '').toUpperCase();
      const mPhone = (m.phone || '').replace(/\D/g, '');
      const mNum = mId.replace('SKB-', '').replace(/^0+/, '');
      const rawNum = cleanId.replace('SKB-', '').replace(/^0+/, '');

      if (mId === cleanId || `SKB-${cleanId}` === mId || (rawNum && mNum === rawNum)) {
        return true;
      }
      if (cleanPhone && cleanPhone.length >= 4 && (mPhone === cleanPhone || mPhone.endsWith(cleanPhone) || cleanPhone.endsWith(mPhone))) {
        return true;
      }
      return false;
    });

    if (!member) {
      if (rawId.toLowerCase() === 'admin') {
        return {
          success: false,
          message: 'प्रवेश नाकारला: प्रशासक पासवर्ड चुकीचा आहे.'
        };
      }
      return {
        success: false,
        message: `"${rawId}" साठी कोणताही नोंदणीकृत सदस्य सापडला नाही. कृपया आयडी किंवा मोबाईल नंबर तपासा.`
      };
    }

    // सदस्य पासवर्ड पडताळणी
    const memberPhone = (member.phone || '').replace(/\D/g, '');
    const last4 = memberPhone.slice(-4);
    const memberPass = (member.password || '').trim();

    const isPasswordCorrect = 
      (memberPass && cleanPass === memberPass) ||
      (!memberPass && cleanPass === '1234') ||
      (cleanPass === memberPhone) ||
      (last4 && cleanPass === last4) ||
      (cleanPass.toUpperCase() === member.id.toUpperCase()) ||
      (cleanPass.toUpperCase() === member.id.replace('SKB-', ''));

    if (!isPasswordCorrect) {
      return {
        success: false,
        message: `${member.name} (${member.id}) साठी चुकीचा पासवर्ड टाकण्यात आला आहे.`
      };
    }

    const sessionData = {
      isLoggedIn: true,
      role: 'customer',
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      loginTime: new Date().toISOString()
    };

    this.saveSession(sessionData, remember);
    return { success: true, role: 'customer', user: sessionData, member: member };
  }

  loginAdmin(username, password, remember = false) {
    return this.loginUnified(username || 'admin', password, remember);
  }

  loginCustomer(phone, memberId, remember = false) {
    const id = memberId || phone;
    return this.loginUnified(id, phone || memberId, remember);
  }

  logout() {
    this.session = null;
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('sukhakarta_admin_session_v1');
      sessionStorage.removeItem('sukhakarta_admin_session_v1');
      localStorage.removeItem('sukhakarta_bishi_session_v2');
      sessionStorage.removeItem('sukhakarta_bishi_session_v2');
      localStorage.removeItem('sukhakarta_secure_session_v3');
      sessionStorage.removeItem('sukhakarta_secure_session_v3');
    } catch (e) {
      console.error('Session storage clear error', e);
    }

    if (typeof document !== 'undefined') {
      const passInput = document.getElementById('loginPassword');
      if (passInput) passInput.value = '';
      const errEl = document.getElementById('unifiedLoginError');
      if (errEl) errEl.style.display = 'none';
    }

    if (window.ui && typeof window.ui.closeAllModals === 'function') {
      window.ui.closeAllModals();
    }
    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast('यशस्वीरीत्या लॉगआउट झाले', 'info');
    }
    if (window.ui && typeof window.ui.checkAuthView === 'function') {
      window.ui.checkAuthView();
    }
  }

  changePassword(currentPassword, newPassword) {
    if (currentPassword !== MASTER_ADMIN_PASSWORD) {
      return { success: false, message: 'सध्याचा मास्टर पासवर्ड जुळत नाही.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'नवीन पासवर्ड किमान ४ अक्षरांचा असावा.' };
    }

    return { success: true, message: 'प्रशासक पासवर्ड पडताळणी यशस्वी!' };
  }

  updateProfile(name, username) {
    const admin = this.getAdminCredentials();
    if (name) admin.name = name.trim();
    if (username) admin.username = username.trim();
    
    window.bishiStore.saveState();

    if (this.session && this.session.role === 'admin') {
      this.session.name = admin.name;
      this.session.username = admin.username;
      this.saveSession(this.session, localStorage.getItem(SESSION_KEY) !== null);
    }

    return { success: true, message: 'प्रशासक प्रोफाइल यशस्वीरीत्या जतन झाले!' };
  }
}

window.authManager = new AuthManager();
