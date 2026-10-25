/**
 * Coding Wallah - Comprehensive Auth UI Controller & Protected Route Guards (auth-ui.js)
 * Implements: Login, Registration, Forgot Password (OTP), Google OAuth,
 * Role-Based Access Control (RBAC), Session Persistence, and Toast Alerts.
 */

(function (window) {
  'use strict';

  let pendingAction = null;
  let forgotPasswordStep = 1;
  let forgotPasswordEmail = '';
  let generatedOtp = '582914';

  // --- Toast Notification Utility ---
  function showToast(message, type = 'success') {
    let container = document.getElementById('cw-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cw-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-brand-600';
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';

    toast.className = `${bg} text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 transform transition-all duration-300 translate-y-3 opacity-0 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-sm"></i><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Create & Inject Auth Modal HTML into DOM if not present ---
  function injectAuthModal() {
    if (document.getElementById('cwGlobalAuthModal')) return;

    const modalHtml = `
      <div id="cwGlobalAuthModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] hidden flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow">
                <i class="fa-solid fa-code"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white tracking-wide">CODING WALLAH <span class="text-amber-400">SKILLS</span> ID</h3>
                <p class="text-[10px] text-slate-400">Single Sign-On Authentication</p>
              </div>
            </div>
            <button onclick="window.CodingWallahAuthUI.closeModal()" class="text-slate-400 hover:text-white p-1">
              <i class="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          <!-- Pending Action Notice -->
          <div id="authNoticeBanner" class="hidden px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <i class="fa-solid fa-lock text-amber-400"></i>
            <span id="authNoticeText">Please sign in to continue</span>
          </div>

          <!-- Error Alert Banner -->
          <div id="authErrorAlert" class="hidden mx-6 mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-red-400"></i>
            <span id="authErrorText">Invalid credentials</span>
          </div>

          <!-- Success Alert Banner -->
          <div id="authSuccessAlert" class="hidden mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-400"></i>
            <span id="authSuccessText">Success</span>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6">
            
            <!-- VIEW 1: SIGN IN (LOGIN) -->
            <div id="authViewLogin" class="space-y-4">
              <!-- Tab switchers -->
              <div class="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
                <button class="py-1.5 rounded-lg bg-brand-600 text-white shadow">Sign In</button>
                <button onclick="window.CodingWallahAuthUI.switchView('register')" class="py-1.5 rounded-lg text-slate-400 hover:text-white">Register</button>
              </div>

              <!-- Quick Demo Fill Pills for Testing -->
              <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                <div class="text-slate-400 font-medium">Quick Demo Credential Autofill:</div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="window.CodingWallahAuthUI.fillDemo('student')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-400 font-mono rounded text-[10px] border border-slate-700 transition">
                    👤 Student (Aman)
                  </button>
                  <button type="button" onclick="window.CodingWallahAuthUI.fillDemo('admin')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono rounded text-[10px] border border-slate-700 transition">
                    🛡️ Instructor / Admin
                  </button>
                </div>
              </div>

              <!-- Login Form -->
              <form onsubmit="window.CodingWallahAuthUI.handleLogin(event)" class="space-y-3.5 text-xs">
                <div>
                  <label class="block font-medium text-slate-300 mb-1">Email / Student ID</label>
                  <div class="relative">
                    <i class="fa-solid fa-envelope absolute left-3 top-3 text-slate-500 text-xs"></i>
                    <input type="email" id="loginEmail" placeholder="student@codingwallah.in" required class="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-medium text-slate-300">Password</label>
                    <button type="button" onclick="window.CodingWallahAuthUI.switchView('forgot')" class="text-brand-400 hover:underline text-[11px]">
                      Forgot Password?
                    </button>
                  </div>
                  <div class="relative">
                    <i class="fa-solid fa-lock absolute left-3 top-3 text-slate-500 text-xs"></i>
                    <input type="password" id="loginPassword" placeholder="••••••••••••" required class="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
                    <button type="button" onclick="window.CodingWallahAuthUI.togglePasswordVisibility('loginPassword')" class="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                      <i class="fa-solid fa-eye text-xs"></i>
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="rememberMeCheckbox" checked class="rounded bg-slate-950 text-brand-600 focus:ring-0">
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                <button type="submit" id="loginSubmitBtn" class="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <i class="fa-solid fa-arrow-right text-[11px]"></i>
                </button>
              </form>

              <!-- Social Login Divider -->
              <div class="relative flex items-center justify-center pt-1">
                <div class="border-t border-slate-800 w-full"></div>
                <span class="bg-[#111827] px-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono absolute">OR CONTINUE WITH</span>
              </div>

              <!-- Google OAuth Button -->
              <button type="button" onclick="window.CodingWallahAuthUI.openGoogleOAuthModal()" class="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2.5">
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <!-- VIEW 2: REGISTER (SIGN UP) -->
            <div id="authViewRegister" class="hidden space-y-4">
              <!-- Tab switchers -->
              <div class="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
                <button onclick="window.CodingWallahAuthUI.switchView('login')" class="py-1.5 rounded-lg text-slate-400 hover:text-white">Sign In</button>
                <button class="py-1.5 rounded-lg bg-brand-600 text-white shadow">Register</button>
              </div>

              <!-- Register Form -->
              <form onsubmit="window.CodingWallahAuthUI.handleRegister(event)" class="space-y-3 text-xs">
                <div>
                  <label class="block font-medium text-slate-300 mb-1">Full Name</label>
                  <input type="text" id="regName" placeholder="e.g. Priya Sharma" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>

                <div>
                  <label class="block font-medium text-slate-300 mb-1">Email Address</label>
                  <input type="email" id="regEmail" placeholder="priya.sharma@gmail.com" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>

                <div>
                  <label class="block font-medium text-slate-300 mb-1">Portal Role</label>
                  <select id="regRole" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500">
                    <option value="Student">Student (Placement Candidate)</option>
                    <option value="Instructor">Instructor / Mentor</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-medium text-slate-300 mb-1">Password</label>
                    <input type="password" id="regPassword" placeholder="Min 6 chars" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                  </div>
                  <div>
                    <label class="block font-medium text-slate-300 mb-1">Confirm Password</label>
                    <input type="password" id="regConfirmPassword" placeholder="Re-enter password" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                  </div>
                </div>

                <div>
                  <label class="block font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                  <input type="tel" id="regPhone" placeholder="+91 98765 43210" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>

                <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition">
                  Create Student Account
                </button>
              </form>
            </div>

            <!-- VIEW 3: FORGOT PASSWORD (TEST 10) -->
            <div id="authViewForgot" class="hidden space-y-4 text-xs">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-key text-amber-400"></i>
                  <span class="font-bold text-white">Reset Account Password</span>
                </div>
                <button type="button" onclick="window.CodingWallahAuthUI.switchView('login')" class="text-slate-400 hover:text-white">
                  Back to Login
                </button>
              </div>

              <!-- Step 1: Request Email -->
              <div id="forgotStep1" class="space-y-3">
                <p class="text-slate-300">Enter your registered email address. We will send a secure verification code (OTP).</p>
                <div>
                  <label class="block text-slate-400 mb-1">Registered Email</label>
                  <input type="email" id="forgotEmailInput" value="aman.gupta@codingwallah.in" required class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>
                <button type="button" onclick="window.CodingWallahAuthUI.handleForgotStep1()" class="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition">
                  Send Verification OTP
                </button>
              </div>

              <!-- Step 2 & 3: Enter OTP & New Password -->
              <div id="forgotStep2" class="hidden space-y-3">
                <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">OTP Sent to: <strong class="text-white" id="forgotTargetEmail"></strong></span>
                    <button type="button" onclick="window.CodingWallahAuthUI.autofillOtp()" class="text-amber-400 hover:underline font-mono text-[10px]">Autofill (582914)</button>
                  </div>
                  <span class="text-[10px] text-slate-500 block">Valid for 10 minutes</span>
                </div>

                <div>
                  <label class="block text-slate-400 mb-1">6-Digit Verification Code (OTP)</label>
                  <input type="text" id="forgotOtpInput" maxlength="6" placeholder="582914" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center tracking-widest focus:outline-none focus:border-brand-500">
                </div>

                <div>
                  <label class="block text-slate-400 mb-1">New Password</label>
                  <input type="password" id="forgotNewPassword" placeholder="Minimum 6 characters" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>

                <div>
                  <label class="block text-slate-400 mb-1">Confirm New Password</label>
                  <input type="password" id="forgotConfirmNewPassword" placeholder="Re-enter new password" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500">
                </div>

                <button type="button" onclick="window.CodingWallahAuthUI.handleForgotStep2()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">
                  Update Password & Sign In
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- GOOGLE OAUTH INTERACTIVE MODAL (TEST 11) -->
      <div id="cwGoogleOAuthModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] hidden flex items-center justify-center p-4">
        <div class="bg-white text-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl space-y-4 p-6 animate-in fade-in zoom-in duration-150">
          
          <div class="text-center space-y-2">
            <svg class="w-8 h-8 mx-auto" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <h4 class="text-base font-bold text-slate-800">Sign in with Google</h4>
            <p class="text-xs text-slate-500">to continue to <strong>Coding Wallah Skills</strong></p>
          </div>

          <!-- Account selector -->
          <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <!-- Account 1 -->
            <div onclick="window.CodingWallahAuthUI.selectGoogleAccount('Aman Gupta', 'aman.gupta@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=AmanGoogle')" class="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                AG
              </div>
              <div class="text-left flex-1 truncate">
                <div class="font-bold text-slate-800">Aman Gupta</div>
                <div class="text-slate-500 text-[11px] truncate">aman.gupta@gmail.com</div>
              </div>
            </div>

            <!-- Account 2 -->
            <div onclick="window.CodingWallahAuthUI.selectGoogleAccount('Prof. Sanchit Verma', 'sanchit.verma@google.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=SanchitGoogle')" class="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition">
              <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                SV
              </div>
              <div class="text-left flex-1 truncate">
                <div class="font-bold text-slate-800">Prof. Sanchit Verma</div>
                <div class="text-slate-500 text-[11px] truncate">sanchit.verma@google.com</div>
              </div>
            </div>
          </div>

          <p class="text-[10px] text-slate-400 text-center leading-tight">
            Coding Wallah Skills will securely receive your name, email address, and profile picture.
          </p>

          <div class="flex justify-end pt-2">
            <button onclick="window.CodingWallahAuthUI.closeGoogleModal()" class="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper);
  }

  // --- Auth UI Controller Object ---
  const AuthUI = {
    init() {
      injectAuthModal();
      this.bindUserHeader();

      // Subscribe to central auth changes
      window.CodingWallahAuth.subscribe((user) => {
        this.updateHeaderUi(user);
        this.updateRoleSpecificFeatures(user);
      });
    },

    bindUserHeader() {
      // Find user action container in header
      const userBtn = document.getElementById('userStatusText');
      if (userBtn && userBtn.parentElement) {
        userBtn.parentElement.onclick = () => this.openProfileMenu();
      }
    },

    updateHeaderUi(user) {
      const userStatusEl = document.getElementById('userStatusText');
      if (!userStatusEl) return;

      if (user) {
        const roleLabel = user.role === 'Instructor' ? 'Instructor / Admin' : 'Student';
        userStatusEl.innerHTML = `
          <span>${user.name}</span>
          <span class="px-1.5 py-0.2 text-[9px] rounded font-bold ${user.role === 'Instructor' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}">
            ${user.role.toUpperCase()}
          </span>
        `;
      } else {
        userStatusEl.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket mr-1"></i> Sign In / Register`;
      }
    },

    updateRoleSpecificFeatures(user) {
      // Instructor / Admin Control Bar in main container
      let adminBanner = document.getElementById('adminControlCenterBanner');
      if (user && user.role === 'Instructor') {
        if (!adminBanner) {
          adminBanner = document.createElement('div');
          adminBanner.id = 'adminControlCenterBanner';
          adminBanner.className = 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg';
          adminBanner.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-white flex items-center gap-2">
                  <span>Instructor & Admin Command Console Active</span>
                  <span class="px-2 py-0.2 text-[9px] bg-amber-500 text-slate-950 rounded-full font-bold">AUTHORIZED</span>
                </h4>
                <p class="text-[11px] text-slate-400">Manage live classrooms, create mock test questions, and view telemetry.</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <button onclick="alert('🛠️ Admin Batch Manager: Opening lecture schedule & live room stream controls.')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition">
                + Create Lecture
              </button>
              <button onclick="alert('📊 Telemetry: 1,420 students active in Super 60 DSA Batch.')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition">
                Student Telemetry
              </button>
            </div>
          `;
          const mainEl = document.querySelector('main');
          if (mainEl) mainEl.prepend(adminBanner);
        } else {
          adminBanner.classList.remove('hidden');
        }
      } else if (adminBanner) {
        adminBanner.classList.add('hidden');
      }
    },

    openModal(noticeMessage = null, onLoginCallback = null) {
      injectAuthModal();
      const modal = document.getElementById('cwGlobalAuthModal');
      modal.classList.remove('hidden');
      this.clearAlerts();

      if (noticeMessage) {
        document.getElementById('authNoticeText').textContent = noticeMessage;
        document.getElementById('authNoticeBanner').classList.remove('hidden');
      } else {
        document.getElementById('authNoticeBanner').classList.add('hidden');
      }

      pendingAction = onLoginCallback;
      this.switchView('login');
    },

    closeModal() {
      const modal = document.getElementById('cwGlobalAuthModal');
      if (modal) modal.classList.add('hidden');
      this.clearAlerts();
    },

    clearAlerts() {
      const err = document.getElementById('authErrorAlert');
      const succ = document.getElementById('authSuccessAlert');
      if (err) err.classList.add('hidden');
      if (succ) succ.classList.add('hidden');
    },

    showError(msg) {
      const err = document.getElementById('authErrorAlert');
      const text = document.getElementById('authErrorText');
      if (err && text) {
        text.textContent = msg;
        err.classList.remove('hidden');
      }
    },

    showSuccess(msg) {
      const succ = document.getElementById('authSuccessAlert');
      const text = document.getElementById('authSuccessText');
      if (succ && text) {
        text.textContent = msg;
        succ.classList.remove('hidden');
      }
    },

    switchView(viewName) {
      this.clearAlerts();
      const vLogin = document.getElementById('authViewLogin');
      const vReg = document.getElementById('authViewRegister');
      const vForgot = document.getElementById('authViewForgot');

      vLogin.classList.add('hidden');
      vReg.classList.add('hidden');
      vForgot.classList.add('hidden');

      if (viewName === 'login') vLogin.classList.remove('hidden');
      else if (viewName === 'register') vReg.classList.remove('hidden');
      else if (viewName === 'forgot') {
        vForgot.classList.remove('hidden');
        document.getElementById('forgotStep1').classList.remove('hidden');
        document.getElementById('forgotStep2').classList.add('hidden');
      }
    },

    fillDemo(role) {
      if (role === 'student') {
        document.getElementById('loginEmail').value = 'aman.gupta@codingwallah.in';
        document.getElementById('loginPassword').value = 'password123';
      } else {
        document.getElementById('loginEmail').value = 'admin@codingwallah.in';
        document.getElementById('loginPassword').value = 'admin123';
      }
      this.clearAlerts();
    },

    togglePasswordVisibility(inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.type = el.type === 'password' ? 'text' : 'password';
      }
    },

    handleLogin(e) {
      e.preventDefault();
      this.clearAlerts();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;

      const res = window.CodingWallahAuth.login(email, pass);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}! Signed in as ${res.user.role}.`, 'success');
        this.closeModal();

        if (pendingAction && typeof pendingAction === 'function') {
          const action = pendingAction;
          pendingAction = null;
          action();
        }
      } else {
        this.showError(res.error);
      }
    },

    handleRegister(e) {
      e.preventDefault();
      this.clearAlerts();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const role = document.getElementById('regRole').value;
      const pass = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;
      const phone = document.getElementById('regPhone').value;

      if (pass !== confirmPass) {
        this.showError('Passwords do not match. Please verify.');
        return;
      }

      const res = window.CodingWallahAuth.register({ name, email, password: pass, role, phone });
      if (res.success) {
        showToast(`Account successfully created! Welcome, ${res.user.name}.`, 'success');
        this.closeModal();

        if (pendingAction && typeof pendingAction === 'function') {
          const action = pendingAction;
          pendingAction = null;
          action();
        }
      } else {
        this.showError(res.error);
      }
    },

    // --- FORGOT PASSWORD FLOW (TEST 10) ---
    handleForgotStep1() {
      const email = document.getElementById('forgotEmailInput').value.trim();
      if (!email) {
        this.showError('Please enter a valid email address.');
        return;
      }

      forgotPasswordEmail = email;
      document.getElementById('forgotTargetEmail').textContent = email;
      document.getElementById('forgotStep1').classList.add('hidden');
      document.getElementById('forgotStep2').classList.remove('hidden');
      this.showSuccess(`Verification OTP (582914) sent to ${email}`);
    },

    autofillOtp() {
      document.getElementById('forgotOtpInput').value = generatedOtp;
      document.getElementById('forgotNewPassword').value = 'newpass2026';
      document.getElementById('forgotConfirmNewPassword').value = 'newpass2026';
    },

    handleForgotStep2() {
      const otp = document.getElementById('forgotOtpInput').value.trim();
      const newPass = document.getElementById('forgotNewPassword').value;
      const confirmPass = document.getElementById('forgotConfirmNewPassword').value;

      if (otp !== generatedOtp) {
        this.showError('Invalid OTP code. Please enter the 6-digit code or click Autofill.');
        return;
      }

      if (!newPass || newPass.length < 6) {
        this.showError('Password must be at least 6 characters.');
        return;
      }

      if (newPass !== confirmPass) {
        this.showError('Passwords do not match.');
        return;
      }

      const res = window.CodingWallahAuth.resetPassword(forgotPasswordEmail, newPass);
      if (res.success) {
        showToast('Password reset successful! Please log in with your new credentials.', 'success');
        this.switchView('login');
        document.getElementById('loginEmail').value = forgotPasswordEmail;
        document.getElementById('loginPassword').value = newPass;
      } else {
        this.showError(res.error);
      }
    },

    // --- GOOGLE OAUTH FLOW (TEST 11) ---
    openGoogleOAuthModal() {
      document.getElementById('cwGoogleOAuthModal').classList.remove('hidden');
    },

    closeGoogleModal() {
      document.getElementById('cwGoogleOAuthModal').classList.add('hidden');
    },

    selectGoogleAccount(name, email, picture) {
      this.closeGoogleModal();
      const res = window.CodingWallahAuth.loginWithGoogle({ name, email, picture });
      if (res.success) {
        showToast(`Google authentication successful! Signed in as ${name}.`, 'success');
        this.closeModal();

        if (pendingAction && typeof pendingAction === 'function') {
          const action = pendingAction;
          pendingAction = null;
          action();
        }
      }
    },

    // --- USER PROFILE & ACCOUNT MENU DROPDOWN ---
    openProfileMenu() {
      const user = window.CodingWallahAuth.currentUser;
      if (!user) {
        this.openModal();
        return;
      }

      let menu = document.getElementById('cwProfileDropdownMenu');
      if (menu) {
        menu.remove();
        return;
      }

      menu = document.createElement('div');
      menu.id = 'cwProfileDropdownMenu';
      menu.className = 'fixed top-16 right-4 sm:right-8 z-50 w-80 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in duration-150';
      menu.innerHTML = `
        <!-- User Info Header -->
        <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div class="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white text-sm shadow">
            ${user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div class="flex-1 truncate">
            <h4 class="text-xs font-bold text-white truncate">${user.name}</h4>
            <p class="text-[11px] text-slate-400 font-mono truncate">${user.email}</p>
            <span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-1 ${user.role === 'Instructor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
              ${user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <!-- Telemetry Stats -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Streak</span>
            <span class="font-bold text-amber-400 font-mono flex items-center gap-1">
              <i class="fa-solid fa-fire text-amber-500"></i> ${user.streakDays || 14} Days
            </span>
          </div>
          <div class="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Wallah XP</span>
            <span class="font-bold text-emerald-400 font-mono">${user.xp || 480} XP</span>
          </div>
        </div>

        <!-- Role Switcher Shortcut for Test Evaluation -->
        <div class="space-y-1.5 pt-1 text-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Account Switch:</span>
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="window.CodingWallahAuthUI.fastSwitch('student')" class="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[11px] transition">
              Student Mode
            </button>
            <button onclick="window.CodingWallahAuthUI.fastSwitch('admin')" class="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-lg text-[11px] transition">
              Instructor Mode
            </button>
          </div>
        </div>

        <!-- Action Links -->
        <div class="border-t border-slate-800 pt-3 space-y-1 text-xs">
          <a href="test-portal.html" class="block p-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition flex items-center justify-between">
            <span><i class="fa-solid fa-chart-pie text-brand-400 mr-2"></i> My Test Analytics</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
          </a>
          <button onclick="window.CodingWallahAuthUI.handleLogout()" class="w-full text-left p-2 rounded-lg hover:bg-red-950/40 text-red-400 font-semibold transition flex items-center gap-2">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out of All Devices</span>
          </button>
        </div>
      `;

      document.body.appendChild(menu);

      // Close on clicking outside
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && !e.target.closest('#userStatusText')) {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    },

    fastSwitch(role) {
      const menu = document.getElementById('cwProfileDropdownMenu');
      if (menu) menu.remove();

      if (role === 'student') {
        window.CodingWallahAuth.login('aman.gupta@codingwallah.in', 'password123');
        showToast('Switched to Student Account (Aman Gupta)', 'success');
      } else {
        window.CodingWallahAuth.login('admin@codingwallah.in', 'admin123');
        showToast('Switched to Instructor & Admin Account (Prof. Sanchit Verma)', 'success');
      }
    },

    handleLogout() {
      const menu = document.getElementById('cwProfileDropdownMenu');
      if (menu) menu.remove();

      window.CodingWallahAuth.logout();
      showToast('You have been logged out safely.', 'info');
    },

    // --- PROTECTED ACTION / ROUTE GUARD ---
    requireAuth(actionFn, requiredRole = null, description = 'access this feature') {
      const user = window.CodingWallahAuth.currentUser;
      if (!user) {
        this.openModal(`Please sign in to ${description}`, actionFn);
        return false;
      }

      if (requiredRole && requiredRole === 'Instructor' && user.role !== 'Instructor' && user.role !== 'Admin') {
        showToast('Access Denied: Instructor / Admin privileges required.', 'error');
        return false;
      }

      if (actionFn && typeof actionFn === 'function') {
        actionFn();
      }
      return true;
    }
  };

  window.CodingWallahAuthUI = AuthUI;

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthUI.init());
  } else {
    AuthUI.init();
  }

})(window);
