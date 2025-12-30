// Global state
let currentUser = null;
let currentFaculty = null;
let currentChatUser = null;
let isPrivateChat = false;
let messageCheckInterval = null;

// Constants
const FACULTIES = [
  'Mexanika-riyaziyyat fakültəsi',
  'Tətbiqi riyaziyyat və kibernetika fakültəsi',
  'Fizika fakültəsi',
  'Kimya fakültəsi',
  'Biologiya fakültəsi',
  'Ekologiya və torpaqşünaslıq fakültəsi',
  'Coğrafiya fakültəsi',
  'Geologiya fakültəsi',
  'Filologiya fakültəsi',
  'Tarix fakültəsi',
  'Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi',
  'Hüquq fakültəsi',
  'Jurnalistika fakültəsi',
  'İnformasiya və sənəd menecmenti fakültəsi',
  'Şərqşünaslıq fakültəsi',
  'Sosial elmlər və psixologiya fakültəsi'
];

const API_BASE = window.location.origin + '/api';

// Helper Functions
function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  
  setTimeout(() => successDiv.remove(), 3000);
}

// ============= LOGIN PAGE =============
function showLoginPage() {
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="fas fa-graduation-cap"></i>
          <h1>BSU Chat</h1>
          <p>Daxil ol</p>
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label>email@bsu.edu.az və ya +994XXXXXXXXX</label>
            <input type="text" id="loginIdentifier" required placeholder="Email və ya telefon">
          </div>
          
          <div class="form-group">
            <label>Şifrə</label>
            <input type="password" id="loginPassword" required placeholder="Şifrənizi daxil edin">
          </div>
          
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Daxil ol
          </button>
          
          <button type="button" class="btn btn-secondary" onclick="showRegisterPage()">
            Hesabın yoxdur? Qeydiyyatdan keç
          </button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const identifier = document.getElementById('loginIdentifier').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      identifier,
      password
    });
    
    if (response.data.success) {
      currentUser = response.data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showDashboard();
    }
  } catch (error) {
    showError(error.response?.data?.error || 'Giriş zamanı xəta baş verdi');
  }
}

// ============= REGISTER PAGE =============
function showRegisterPage() {
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="fas fa-graduation-cap"></i>
          <h1>BSU Chat</h1>
          <p>Qeydiyyatdan keç</p>
        </div>
        
        <form id="registerForm">
          <div class="form-group">
            <label>Ad Soyad</label>
            <input type="text" id="regFullName" required placeholder="Ad Soyad">
          </div>
          
          <div class="form-group">
            <label>Email (sonluğu bsu.edu.az olmalıdır)</label>
            <input type="email" id="regEmail" required placeholder="adiniz@bsu.edu.az">
          </div>
          
          <div class="form-group">
            <label>Telefon (+994XXXXXXXXX)</label>
            <div style="display: flex; align-items: center;">
              <span style="padding: 12px; background: #e2e8f0; border-radius: 10px 0 0 10px; border: 2px solid #e2e8f0;">+994</span>
              <input type="text" id="regPhone" required placeholder="XXXXXXXXX" maxlength="9" 
                     style="border-radius: 0 10px 10px 0; border-left: none;">
            </div>
          </div>
          
          <div class="form-group">
            <label>Şifrə</label>
            <input type="password" id="regPassword" required placeholder="Şifrə daxil edin">
          </div>
          
          <div class="form-group">
            <label>Fakültə</label>
            <select id="regFaculty" required>
              <option value="">Fakültəni seçin</option>
              ${FACULTIES.map(f => `<option value="${f}">${f}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label>Kurs</label>
            <select id="regCourse" required>
              <option value="">Kursu seçin</option>
              <option value="1">1-ci kurs</option>
              <option value="2">2-ci kurs</option>
              <option value="3">3-cü kurs</option>
              <option value="4">4-cü kurs</option>
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary">
            Növbəti: Verification
          </button>
          
          <button type="button" class="btn btn-secondary" onclick="showLoginPage()">
            Hesabın var? Daxil ol
          </button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('registerForm').addEventListener('submit', handleRegisterStep1);
}

async function handleRegisterStep1(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('regFullName').value;
  const email = document.getElementById('regEmail').value;
  const phone = '+994' + document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  const faculty = document.getElementById('regFaculty').value;
  const course = parseInt(document.getElementById('regCourse').value);
  
  // Email validation
  if (!email.endsWith('bsu.edu.az')) {
    showError('Email bsu.edu.az ilə bitməlidir');
    return;
  }
  
  // Phone validation
  if (!/^\+994\d{9}$/.test(phone)) {
    showError('Telefon nömrəsi düzgün formatda deyil');
    return;
  }
  
  // Save to temporary storage
  sessionStorage.setItem('regData', JSON.stringify({
    fullName, email, phone, password, faculty, course
  }));
  
  // Get verification questions
  try {
    const response = await axios.post(`${API_BASE}/auth/get-questions`);
    showVerificationPage(response.data.questions);
  } catch (error) {
    showError('Xəta baş verdi');
  }
}

function showVerificationPage(questions) {
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="fas fa-check-circle"></i>
          <h1>Verification</h1>
          <p>Minimum 2 sualı düzgün cavablandırmalısınız</p>
        </div>
        
        <form id="verificationForm">
          ${questions.map((q, idx) => `
            <div class="question-card">
              <p>${idx + 1}. ${q.question}</p>
              <div class="question-options">
                <div class="question-option" data-question="${idx}" data-answer="1">1</div>
                <div class="question-option" data-question="${idx}" data-answer="2">2</div>
                <div class="question-option" data-question="${idx}" data-answer="3">3</div>
                <div class="question-option" data-question="${idx}" data-answer="əsas">əsas</div>
              </div>
              <input type="hidden" id="answer${idx}" data-question="${q.question}">
            </div>
          `).join('')}
          
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-user-plus"></i> Qeydiyyatı tamamla
          </button>
          
          <button type="button" class="btn btn-secondary" onclick="showRegisterPage()">
            Geri qayıt
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Add click handlers for options
  document.querySelectorAll('.question-option').forEach(option => {
    option.addEventListener('click', function() {
      const questionIdx = this.dataset.question;
      const answer = this.dataset.answer;
      
      // Remove selected from siblings
      this.parentElement.querySelectorAll('.question-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Add selected to this
      this.classList.add('selected');
      
      // Set hidden input value
      document.getElementById(`answer${questionIdx}`).value = answer;
    });
  });
  
  document.getElementById('verificationForm').addEventListener('submit', handleVerification);
}

async function handleVerification(e) {
  e.preventDefault();
  
  const regData = JSON.parse(sessionStorage.getItem('regData'));
  
  // Collect answers
  const answers = [];
  document.querySelectorAll('input[type="hidden"][data-question]').forEach(input => {
    if (input.value) {
      answers.push({
        question: input.dataset.question,
        answer: input.value
      });
    }
  });
  
  if (answers.length < 3) {
    showError('Bütün sualları cavablandırmalısınız');
    return;
  }
  
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      ...regData,
      full_name: regData.fullName,
      answers
    });
    
    if (response.data.success) {
      showSuccess('Qeydiyyat uğurla tamamlandı!');
      sessionStorage.removeItem('regData');
      setTimeout(() => showLoginPage(), 2000);
    }
  } catch (error) {
    showError(error.response?.data?.error || 'Qeydiyyat zamanı xəta baş verdi');
  }
}

// ============= DASHBOARD =============
function showDashboard() {
  document.getElementById('app').innerHTML = `
    <div class="dashboard">
      <div class="dashboard-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1><i class="fas fa-graduation-cap"></i> BSU Chat</h1>
            <div class="user-info">
              ${currentUser.full_name} · ${currentUser.faculty} · ${currentUser.course}-ci kurs
            </div>
          </div>
          <button class="logout-btn" onclick="handleLogout()">
            <i class="fas fa-sign-out-alt"></i> Çıxış
          </button>
        </div>
      </div>
      
      <div class="faculty-grid" id="facultyGrid"></div>
    </div>
  `;
  
  renderFaculties();
  
  // Auto-refresh dashboard every 30 seconds
  setInterval(() => {
    if (!currentFaculty && !isPrivateChat) {
      // Only refresh if we're on dashboard
    }
  }, 30000);
}

function renderFaculties() {
  const grid = document.getElementById('facultyGrid');
  
  grid.innerHTML = FACULTIES.map(faculty => `
    <div class="faculty-card" onclick="openFacultyChat('${faculty}')">
      <i class="fas fa-users"></i>
      <h3>${faculty}</h3>
      <p>Chat otağına daxil ol</p>
    </div>
  `).join('');
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  clearInterval(messageCheckInterval);
  showLoginPage();
}

// ============= FACULTY CHAT =============
async function openFacultyChat(faculty) {
  currentFaculty = faculty;
  isPrivateChat = false;
  
  document.getElementById('app').innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-header-left">
          <button class="back-btn" onclick="backToDashboard()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="chat-title">${faculty}</div>
        </div>
        <div class="chat-actions">
          <button class="action-btn" onclick="showFacultyUsers()">
            <i class="fas fa-user-friends"></i>
          </button>
        </div>
      </div>
      
      <div class="daily-topic" id="dailyTopic" style="display: none;">
        <strong>Günün mövzusu:</strong> <span id="topicText"></span>
      </div>
      
      <div class="messages-container" id="messagesContainer"></div>
      
      <div class="message-input-container">
        <textarea 
          class="message-input" 
          id="messageInput" 
          placeholder="Mesaj yazın..."
          rows="1"
        ></textarea>
        <button class="send-btn" id="sendBtn" onclick="sendMessage()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;
  
  // Load daily topic
  loadDailyTopic();
  
  // Load messages
  loadFacultyMessages();
  
  // Auto-refresh messages every 2 seconds
  messageCheckInterval = setInterval(loadFacultyMessages, 2000);
  
  // Handle Enter key
  document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function loadDailyTopic() {
  try {
    const response = await axios.get(`${API_BASE}/daily-topic`);
    if (response.data.topic) {
      document.getElementById('dailyTopic').style.display = 'block';
      document.getElementById('topicText').textContent = response.data.topic;
    }
  } catch (error) {
    // Ignore error
  }
}

async function loadFacultyMessages() {
  try {
    const response = await axios.get(`${API_BASE}/faculty/${encodeURIComponent(currentFaculty)}/messages`);
    renderMessages(response.data.messages);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  const scrollAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
  
  container.innerHTML = messages.map(msg => {
    const isOwn = msg.user_id === currentUser.id;
    const initials = getInitials(msg.full_name);
    
    return `
      <div class="message ${isOwn ? 'own' : ''}">
        <div class="message-avatar">
          ${msg.profile_image ? 
            `<img src="${msg.profile_image}" alt="${msg.full_name}">` : 
            initials
          }
        </div>
        <div class="message-content">
          ${!isOwn ? `<div class="message-sender">${msg.full_name}</div>` : ''}
          <div class="message-bubble">${escapeHtml(msg.message)}</div>
          <div class="message-time">${formatTime(msg.created_at)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Auto-scroll only if was at bottom
  if (scrollAtBottom || messages.length > 0) {
    container.scrollTop = container.scrollHeight;
  }
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  
  try {
    if (isPrivateChat) {
      await axios.post(`${API_BASE}/private/send`, {
        senderId: currentUser.id,
        receiverId: currentChatUser.id,
        message
      });
      await loadPrivateMessages();
    } else {
      await axios.post(`${API_BASE}/faculty/${encodeURIComponent(currentFaculty)}/send`, {
        userId: currentUser.id,
        message
      });
      await loadFacultyMessages();
    }
    
    input.value = '';
    input.style.height = 'auto';
  } catch (error) {
    showError(error.response?.data?.error || 'Mesaj göndərilmədi');
  } finally {
    sendBtn.disabled = false;
  }
}

async function showFacultyUsers() {
  try {
    const response = await axios.get(`${API_BASE}/faculty/${encodeURIComponent(currentFaculty)}/users`);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${currentFaculty} - İstifadəçilər</h2>
          <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <div class="users-list">
          ${response.data.users.filter(u => u.id !== currentUser.id).map(user => {
            const initials = getInitials(user.full_name);
            return `
              <div class="user-item" onclick="openPrivateChat(${user.id}, '${user.full_name}', '${user.profile_image || ''}')">
                <div class="user-avatar">
                  ${user.profile_image ? 
                    `<img src="${user.profile_image}" alt="${user.full_name}">` : 
                    initials
                  }
                </div>
                <div>
                  <div style="font-weight: 600;">${user.full_name}</div>
                  <div style="font-size: 12px; color: #718096;">Şəxsi mesaj</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
  } catch (error) {
    showError('İstifadəçilər yüklənmədi');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============= PRIVATE CHAT =============
async function openPrivateChat(userId, userName, userImage) {
  // Close modal if open
  document.querySelectorAll('.modal').forEach(m => m.remove());
  
  currentChatUser = { id: userId, name: userName, image: userImage };
  isPrivateChat = true;
  
  clearInterval(messageCheckInterval);
  
  document.getElementById('app').innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-header-left">
          <button class="back-btn" onclick="backToFaculty()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="chat-title">${userName}</div>
        </div>
        <div class="chat-actions">
          <button class="action-btn" onclick="blockUser()" title="Blokla">
            <i class="fas fa-ban"></i>
          </button>
          <button class="action-btn" onclick="reportUser()" title="Şikayət et">
            <i class="fas fa-flag"></i>
          </button>
        </div>
      </div>
      
      <div class="messages-container" id="messagesContainer"></div>
      
      <div class="message-input-container">
        <textarea 
          class="message-input" 
          id="messageInput" 
          placeholder="Mesaj yazın..."
          rows="1"
        ></textarea>
        <button class="send-btn" id="sendBtn" onclick="sendMessage()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;
  
  loadPrivateMessages();
  messageCheckInterval = setInterval(loadPrivateMessages, 2000);
  
  document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function loadPrivateMessages() {
  try {
    const response = await axios.get(
      `${API_BASE}/private/${currentUser.id}/${currentChatUser.id}/messages`
    );
    
    if (response.data.blocked) {
      showError('Bu istifadəçi ilə əlaqə mümkün deyil');
      backToFaculty();
      return;
    }
    
    renderMessages(response.data.messages);
  } catch (error) {
    console.error('Error loading private messages:', error);
  }
}

async function blockUser() {
  if (confirm(`${currentChatUser.name} istifadəçisini bloklamaq istədiyinizdən əminsiniz?`)) {
    try {
      await axios.post(`${API_BASE}/block`, {
        blockerId: currentUser.id,
        blockedId: currentChatUser.id
      });
      
      showSuccess('İstifadəçi bloklandı');
      backToFaculty();
    } catch (error) {
      showError('Bloklama zamanı xəta baş verdi');
    }
  }
}

async function reportUser() {
  const reason = prompt(`${currentChatUser.name} istifadəçisinə şikayət səbəbini yazın (və ya boş buraxın):`);
  
  if (reason !== null) {
    try {
      await axios.post(`${API_BASE}/report`, {
        reporterId: currentUser.id,
        reportedId: currentChatUser.id,
        reason: reason || 'Şikayət edilib'
      });
      
      showSuccess('Şikayət göndərildi');
      
      // Also block the user
      await axios.post(`${API_BASE}/block`, {
        blockerId: currentUser.id,
        blockedId: currentChatUser.id
      });
      
      backToFaculty();
    } catch (error) {
      showError('Şikayət göndərilmədi');
    }
  }
}

function backToFaculty() {
  clearInterval(messageCheckInterval);
  isPrivateChat = false;
  currentChatUser = null;
  openFacultyChat(currentFaculty);
}

function backToDashboard() {
  clearInterval(messageCheckInterval);
  currentFaculty = null;
  isPrivateChat = false;
  currentChatUser = null;
  showDashboard();
}

// ============= ADMIN LOGIN =============
function showAdminLoginPage() {
  document.getElementById('app').innerHTML = `
    <div class="admin-container auth-container">
      <div class="admin-card">
        <div class="admin-logo">
          <i class="fas fa-shield-alt"></i>
          <h1>Admin Paneli</h1>
        </div>
        
        <form id="adminLoginForm">
          <div class="form-group">
            <label>İstifadəçi adı</label>
            <input type="text" id="adminUsername" required>
          </div>
          
          <div class="form-group">
            <label>Şifrə</label>
            <input type="password" id="adminPassword" required>
          </div>
          
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Daxil ol
          </button>
          
          <button type="button" class="btn btn-secondary" onclick="showLoginPage()">
            İstifadəçi girişi
          </button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
}

async function handleAdminLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  
  try {
    const response = await axios.post(`${API_BASE}/admin/login`, {
      username,
      password
    });
    
    if (response.data.success) {
      sessionStorage.setItem('admin', JSON.stringify(response.data.admin));
      showAdminDashboard(response.data.admin);
    }
  } catch (error) {
    showError('Admin məlumatları yanlışdır');
  }
}

// ============= ADMIN DASHBOARD =============
function showAdminDashboard(admin) {
  document.getElementById('app').innerHTML = `
    <div class="admin-dashboard">
      <div class="admin-header">
        <div>
          <h1><i class="fas fa-shield-alt"></i> Admin Paneli</h1>
          <p style="font-size: 14px; opacity: 0.9; margin-top: 5px;">
            ${admin.username} ${admin.is_super_admin ? '(Super Admin)' : '(Admin)'}
          </p>
        </div>
        <button class="logout-btn" onclick="adminLogout()">
          <i class="fas fa-sign-out-alt"></i> Çıxış
        </button>
      </div>
      
      <div class="admin-content">
        <div class="admin-grid">
          <div class="admin-card-box" onclick="showDangerousAccounts()" style="border-left: 5px solid #fc466b;">
            <i class="fas fa-exclamation-triangle" style="color: #fc466b;"></i>
            <h3>Təhlükəli Hesablar</h3>
            <p>16+ şikayət olan hesablar</p>
          </div>
          
          <div class="admin-card-box" onclick="showBannedWords()" style="border-left: 5px solid #3f5efb;">
            <i class="fas fa-filter" style="color: #3f5efb;"></i>
            <h3>Filtr Sistemi</h3>
            <p>Qadağan olunmuş sözlər</p>
          </div>
          
          <div class="admin-card-box" onclick="showRulesEditor()" style="border-left: 5px solid #11998e;">
            <i class="fas fa-gavel" style="color: #11998e;"></i>
            <h3>Qaydalar</h3>
            <p>Sayt qaydalarını düzənlə</p>
          </div>
          
          <div class="admin-card-box" onclick="showTopicEditor()" style="border-left: 5px solid #f093fb;">
            <i class="fas fa-newspaper" style="color: #f093fb;"></i>
            <h3>Günün Mövzusu</h3>
            <p>Günlük mövzu yenilə</p>
          </div>
          
          ${admin.is_super_admin ? `
            <div class="admin-card-box" onclick="showSubAdmins()" style="border-left: 5px solid #fa709a;">
              <i class="fas fa-users-cog" style="color: #fa709a;"></i>
              <h3>Alt Adminlər</h3>
              <p>Admin hesablarını idarə et</p>
            </div>
          ` : ''}
        </div>
        
        <div id="adminWorkArea"></div>
      </div>
    </div>
  `;
}

function adminLogout() {
  sessionStorage.removeItem('admin');
  showAdminLoginPage();
}

// ============= ADMIN FUNCTIONS =============
async function showDangerousAccounts() {
  try {
    const response = await axios.get(`${API_BASE}/admin/dangerous-accounts`);
    
    document.getElementById('adminWorkArea').innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 20px; color: #2d3748;">
          <i class="fas fa-exclamation-triangle" style="color: #fc466b;"></i>
          Təhlükəli Hesablar
        </h2>
        
        ${response.data.accounts.length === 0 ? 
          '<p style="color: #718096;">Təhlükəli hesab yoxdur</p>' :
          `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left;">İstifadəçi</th>
                  <th style="padding: 12px; text-align: left;">Email</th>
                  <th style="padding: 12px; text-align: left;">Fakültə</th>
                  <th style="padding: 12px; text-align: center;">Şikayət sayı</th>
                  <th style="padding: 12px; text-align: center;">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                ${response.data.accounts.map(acc => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${acc.full_name}</td>
                    <td style="padding: 12px;">${acc.email}</td>
                    <td style="padding: 12px;">${acc.faculty}</td>
                    <td style="padding: 12px; text-align: center;">
                      <span style="background: #fc466b; color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                        ${acc.report_count}
                      </span>
                    </td>
                    <td style="padding: 12px; text-align: center;">
                      <button onclick="banUser(${acc.id}, '${acc.full_name}')" 
                              style="background: #fc466b; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-ban"></i> Ban Et
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
        }
      </div>
    `;
  } catch (error) {
    showError('Məlumatlar yüklənmədi');
  }
}

async function banUser(userId, userName) {
  if (confirm(`${userName} istifadəçisini ban etmək istədiyinizdən əminsiniz?`)) {
    try {
      await axios.post(`${API_BASE}/admin/ban-user`, { userId });
      showSuccess('İstifadəçi ban edildi');
      showDangerousAccounts();
    } catch (error) {
      showError('Ban zamanı xəta baş verdi');
    }
  }
}

async function showBannedWords() {
  try {
    const response = await axios.get(`${API_BASE}/admin/banned-words`);
    
    document.getElementById('adminWorkArea').innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 20px; color: #2d3748;">
          <i class="fas fa-filter" style="color: #3f5efb;"></i>
          Qadağan Olunmuş Sözlər
        </h2>
        
        <div style="margin-bottom: 20px;">
          <input type="text" id="newBannedWord" placeholder="Yeni söz əlavə et..." 
                 style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; width: 300px; margin-right: 10px;">
          <button onclick="addBannedWord()" class="btn btn-primary" style="width: auto; padding: 12px 24px;">
            <i class="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${response.data.words.map(w => `
            <div style="background: #f7fafc; padding: 8px 16px; border-radius: 20px; border: 2px solid #3f5efb;">
              ${w.word}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    showError('Məlumatlar yüklənmədi');
  }
}

async function addBannedWord() {
  const word = document.getElementById('newBannedWord').value.trim();
  
  if (!word) {
    showError('Söz boş ola bilməz');
    return;
  }
  
  try {
    await axios.post(`${API_BASE}/admin/add-banned-word`, { word });
    showSuccess('Söz əlavə edildi');
    showBannedWords();
  } catch (error) {
    showError('Xəta baş verdi');
  }
}

async function showRulesEditor() {
  try {
    const response = await axios.get(`${API_BASE}/rules`);
    
    document.getElementById('adminWorkArea').innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 20px; color: #2d3748;">
          <i class="fas fa-gavel" style="color: #11998e;"></i>
          Sayt Qaydaları
        </h2>
        
        <textarea id="rulesContent" rows="10" 
                  style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; resize: vertical;"
                  placeholder="Sayt qaydalarını buraya yazın...">${response.data.rules}</textarea>
        
        <button onclick="saveRules()" class="btn btn-primary" style="margin-top: 15px; width: auto; padding: 12px 24px;">
          <i class="fas fa-save"></i> Yadda Saxla
        </button>
      </div>
    `;
  } catch (error) {
    showError('Məlumatlar yüklənmədi');
  }
}

async function saveRules() {
  const content = document.getElementById('rulesContent').value.trim();
  
  try {
    await axios.post(`${API_BASE}/admin/update-rules`, { content });
    showSuccess('Qaydalar yeniləndi');
  } catch (error) {
    showError('Xəta baş verdi');
  }
}

async function showTopicEditor() {
  try {
    const response = await axios.get(`${API_BASE}/daily-topic`);
    
    document.getElementById('adminWorkArea').innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 20px; color: #2d3748;">
          <i class="fas fa-newspaper" style="color: #f093fb;"></i>
          Günün Mövzusu
        </h2>
        
        ${response.data.topic ? `
          <div style="background: #f7fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #f093fb;">
            <strong>Cari mövzu:</strong> ${response.data.topic}
          </div>
        ` : ''}
        
        <input type="text" id="newTopic" placeholder="Yeni mövzu daxil edin..." 
               style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; margin-bottom: 15px;">
        
        <button onclick="saveTopic()" class="btn btn-primary" style="width: auto; padding: 12px 24px;">
          <i class="fas fa-save"></i> Yenilə
        </button>
      </div>
    `;
  } catch (error) {
    showError('Məlumatlar yüklənmədi');
  }
}

async function saveTopic() {
  const topic = document.getElementById('newTopic').value.trim();
  
  if (!topic) {
    showError('Mövzu boş ola bilməz');
    return;
  }
  
  try {
    await axios.post(`${API_BASE}/admin/update-topic`, { topic });
    showSuccess('Mövzu yeniləndi');
    showTopicEditor();
  } catch (error) {
    showError('Xəta baş verdi');
  }
}

async function showSubAdmins() {
  try {
    const response = await axios.get(`${API_BASE}/admin/sub-admins`);
    
    document.getElementById('adminWorkArea').innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 20px; color: #2d3748;">
          <i class="fas fa-users-cog" style="color: #fa709a;"></i>
          Alt Admin Hesabları
        </h2>
        
        <div style="margin-bottom: 30px; background: #f7fafc; padding: 20px; border-radius: 10px;">
          <h3 style="margin-bottom: 15px;">Yeni Admin Yarat</h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="newAdminUsername" placeholder="İstifadəçi adı" 
                   style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; flex: 1; min-width: 200px;">
            <input type="password" id="newAdminPassword" placeholder="Şifrə" 
                   style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; flex: 1; min-width: 200px;">
            <button onclick="createSubAdmin()" class="btn btn-primary" style="width: auto; padding: 12px 24px;">
              <i class="fas fa-plus"></i> Yarat
            </button>
          </div>
        </div>
        
        ${response.data.admins.length === 0 ? 
          '<p style="color: #718096;">Alt admin yoxdur</p>' :
          `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left;">İstifadəçi adı</th>
                  <th style="padding: 12px; text-align: left;">Yaradılma tarixi</th>
                  <th style="padding: 12px; text-align: center;">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                ${response.data.admins.map(admin => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${admin.username}</td>
                    <td style="padding: 12px;">${new Date(admin.created_at).toLocaleDateString('az')}</td>
                    <td style="padding: 12px; text-align: center;">
                      <button onclick="deleteSubAdmin(${admin.id}, '${admin.username}')" 
                              style="background: #fc466b; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-trash"></i> Sil
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
        }
      </div>
    `;
  } catch (error) {
    showError('Məlumatlar yüklənmədi');
  }
}

async function createSubAdmin() {
  const username = document.getElementById('newAdminUsername').value.trim();
  const password = document.getElementById('newAdminPassword').value.trim();
  
  if (!username || !password) {
    showError('İstifadəçi adı və şifrə doldurulmalıdır');
    return;
  }
  
  try {
    await axios.post(`${API_BASE}/admin/create-sub-admin`, { username, password });
    showSuccess('Alt admin yaradıldı');
    showSubAdmins();
  } catch (error) {
    showError('Xəta baş verdi');
  }
}

async function deleteSubAdmin(adminId, username) {
  if (confirm(`${username} admin hesabını silmək istədiyinizdən əminsiniz?`)) {
    try {
      await axios.post(`${API_BASE}/admin/delete-sub-admin`, { adminId });
      showSuccess('Admin silindi');
      showSubAdmins();
    } catch (error) {
      showError('Xəta baş verdi');
    }
  }
}

// ============= APP INITIALIZATION =============
window.onload = function() {
  // Check URL for admin
  if (window.location.hash === '#admin') {
    const admin = JSON.parse(sessionStorage.getItem('admin') || 'null');
    if (admin) {
      showAdminDashboard(admin);
    } else {
      showAdminLoginPage();
    }
  } else {
    // Regular user flow
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      showDashboard();
    } else {
      showLoginPage();
    }
  }
}

// Make functions available globally
window.showLoginPage = showLoginPage;
window.showRegisterPage = showRegisterPage;
window.handleLogout = handleLogout;
window.openFacultyChat = openFacultyChat;
window.sendMessage = sendMessage;
window.backToDashboard = backToDashboard;
window.backToFaculty = backToFaculty;
window.showFacultyUsers = showFacultyUsers;
window.openPrivateChat = openPrivateChat;
window.blockUser = blockUser;
window.reportUser = reportUser;
window.showAdminLoginPage = showAdminLoginPage;
window.adminLogout = adminLogout;
window.showDangerousAccounts = showDangerousAccounts;
window.banUser = banUser;
window.showBannedWords = showBannedWords;
window.addBannedWord = addBannedWord;
window.showRulesEditor = showRulesEditor;
window.saveRules = saveRules;
window.showTopicEditor = showTopicEditor;
window.saveTopic = saveTopic;
window.showSubAdmins = showSubAdmins;
window.createSubAdmin = createSubAdmin;
window.deleteSubAdmin = deleteSubAdmin;
