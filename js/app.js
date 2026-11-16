// Google Gemini Student Ambassador Portal Logic
// Role-Based Architecture: Ambassador vs. Student Participant

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const AppState = {
    session: JSON.parse(localStorage.getItem('GSA_SESSION') || 'null'),
    role: 'participant', // Set only after the entry gate is completed.
    profile: JSON.parse(localStorage.getItem('GSA_USER_PROFILE')) || { ...window.GSA_DATA.defaultProfile },
    tasks: JSON.parse(localStorage.getItem('GSA_USER_TASKS')) || JSON.parse(JSON.stringify(window.GSA_DATA.tasks)),
    currentTab: 'home',
    sidebarOpen: false,
    selectedPromptId: localStorage.getItem('GSA_SELECTED_PROMPT') || 'ember-run',
    selectedAmbassadorId: localStorage.getItem('GSA_SELECTED_AMBASSADOR') || '',
    ambassadorScores: JSON.parse(localStorage.getItem('GSA_AMBASSADOR_SCORES') || '{}'),

    // Participant verification state
    participant: JSON.parse(localStorage.getItem('GSA_PARTICIPANT')) || {
      name: '',
      college: '',
      email: '',
      preSurveyFilled: false,
      trialDone: false,
      feedbackFilled: false,
      certificateIssued: false,
      certificateRequested: false,
      certificateRequestId: ''
    },

    // Certificate requests queue (shared via localStorage)
    certRequests: JSON.parse(localStorage.getItem('GSA_CERT_REQUESTS') || '[]'),

    save() {
      localStorage.setItem('GSA_ROLE', this.role);
      if (this.session) {
        localStorage.setItem('GSA_SESSION', JSON.stringify(this.session));
      } else {
        localStorage.removeItem('GSA_SESSION');
      }
      localStorage.setItem('GSA_USER_PROFILE', JSON.stringify(this.profile));
      localStorage.setItem('GSA_USER_TASKS', JSON.stringify(this.tasks));
      localStorage.setItem('GSA_PARTICIPANT', JSON.stringify(this.participant));
      localStorage.setItem('GSA_SELECTED_PROMPT', this.selectedPromptId);
      localStorage.setItem('GSA_SELECTED_AMBASSADOR', this.selectedAmbassadorId);
      localStorage.setItem('GSA_AMBASSADOR_SCORES', JSON.stringify(this.ambassadorScores));
      localStorage.setItem('GSA_CERT_REQUESTS', JSON.stringify(this.certRequests));
      this.updateHeader();
    },

    reset() {
      if (confirm('Do you want to reset your ambassador data and tasks?')) {
        this.profile = { ...window.GSA_DATA.defaultProfile };
        this.tasks = JSON.parse(JSON.stringify(window.GSA_DATA.tasks));
        this.save();
        renderApp();
      }
    },

    calculateTaskScore(task) {
      const c = task.completion;
      if (!c || !c.completed) return 0;

      if (task.id === 'product-trials') {
        const count = Math.min(Math.max(Number(c.participantsCount) || 0, 0), task.maxUnits);
        return count >= task.minUnits ? count * task.pointsPerUnit : 0;
      }

      if (task.id === 'content-creation') {
        let score = task.fixedPoints;
        const views = Number(c.reelViews) || 0;
        if (views >= 10000) score += 300;
        else if (views >= 7000) score += 225;
        else if (views >= 4000) score += 150;
        else if (views >= 1000) score += 75;
        return score;
      }

      if (task.id === 'monthly-highlights') {
        return task.fixedPoints;
      }

      if (task.id === 'product-understanding') {
        const sessions = Math.min(Math.max(Number(c.sessionsCount) || 0, 0), task.maxUnits);
        return sessions >= task.minUnits ? sessions * task.pointsPerUnit : 0;
      }

      if (task.id === 'boost-google-initiatives') {
        return Math.min(Number(c.pointsClaimed) || 0, task.maxPoints);
      }

      return 0;
    },

    get totalScore() {
      const ambassadorId = this.session && this.session.role === 'ambassador' ? this.session.ambassadorId : '';
      if (ambassadorId && Number.isFinite(Number(this.ambassadorScores[ambassadorId]))) {
        return Number(this.ambassadorScores[ambassadorId]);
      }
      if (ambassadorId) return 0;
      return this.tasks.reduce((sum, task) => sum + this.calculateTaskScore(task), 0);
    },

    get currentTier() {
      const score = this.totalScore;
      const tiers = window.GSA_DATA.tiers;
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (score >= tiers[i].minPoints) {
          return tiers[i];
        }
      }
      return tiers[0];
    },

    updateHeader() {
      const scorePill = document.getElementById('header-score-pill');
      if (scorePill) {
        scorePill.textContent = window.GSA_REQUIRE_SCORE ? 'Set current score' : `Score: ${this.totalScore} pts`;
      }

      const ambActions = document.getElementById('header-ambassador-actions');
      const partActions = document.getElementById('header-participant-actions');
      const btnAmb = document.getElementById('btn-role-ambassador');
      const btnPart = document.getElementById('btn-role-participant');

      if (this.role === 'ambassador') {
        ambActions.classList.remove('hidden');
        partActions.classList.add('hidden');
        btnAmb.className = 'px-3.5 py-1.5 rounded-full transition-all bg-white text-[#346BF1] shadow-xs';
        btnPart.className = 'px-3.5 py-1.5 rounded-full transition-all text-gray-600 hover:text-gray-900';
      } else {
        ambActions.classList.add('hidden');
        partActions.classList.remove('hidden');
        btnAmb.className = 'px-3.5 py-1.5 rounded-full transition-all text-gray-600 hover:text-gray-900';
        btnPart.className = 'px-3.5 py-1.5 rounded-full transition-all bg-white text-[#346BF1] shadow-xs';
      }
    }
  };

  AppState.role = AppState.session ? AppState.session.role : 'participant';

  window.AppState = AppState;

  // The role is established at sign-in. It cannot be changed from the portal UI.
  window.setRole = function(newRole) {
    if (!AppState.session || newRole !== AppState.session.role) {
      return;
    }
    AppState.role = newRole;
    AppState.save();

    if (newRole === 'participant') {
      AppState.currentTab = 'participantHub';
    } else {
      AppState.currentTab = 'home';
    }

    renderApp();
  };

  function setAuthenticatedShell(isAuthenticated) {
    const header = document.getElementById('portal-header');
    const sidebar = document.getElementById('portal-sidebar');
    const chat = document.getElementById('gsa-chat-widget');
    const roleSwitcher = document.getElementById('role-switcher');
    if (header) header.classList.toggle('hidden', !isAuthenticated);
    if (sidebar) sidebar.classList.toggle('hidden', !isAuthenticated);
    if (chat) chat.classList.toggle('hidden', !isAuthenticated);
    if (roleSwitcher) roleSwitcher.classList.add('hidden');
  }

  window.selectLoginMode = function(mode) {
    window.GSA_LOGIN_MODE = mode;
    renderApp();
  };

  window.submitParticipantLogin = function(event) {
    event.preventDefault();
    const name = document.getElementById('login-participant-name').value.trim();
    const email = document.getElementById('login-participant-email').value.trim();
    const university = document.getElementById('login-participant-university').value.trim();
    if (name.length < 2 || university.length < 2 || !email) {
      const error = document.getElementById('login-error');
      if (error) error.textContent = 'Enter your full name, email, and university to continue.';
      return;
    }

    AppState.session = { role: 'participant', name, email, university };
    AppState.role = 'participant';
    AppState.participant = {
      name,
      college: university,
      email,
      preSurveyFilled: false,
      trialDone: false,
      feedbackFilled: false,
      certificateIssued: false,
      certificateRequested: false,
      certificateRequestId: ''
    };
    AppState.selectedAmbassadorId = '';
    AppState.currentTab = 'participantHub';
    AppState.save();
    renderApp();
  };

  window.submitAmbassadorLogin = function(event) {
    event.preventDefault();
    const ambassadorId = document.getElementById('login-ambassador-id').value;
    const password = document.getElementById('login-ambassador-password').value;
    const ambassador = (window.GSA_DATA.ambassadors || []).find(item => item.id === ambassadorId);
    const error = document.getElementById('login-error');
    if (!ambassador || ambassador.password !== password) {
      if (error) error.textContent = 'The ambassador credentials do not match. Please try again.';
      return;
    }

    AppState.session = { role: 'ambassador', ambassadorId, name: ambassador.name };
    AppState.role = 'ambassador';
    AppState.profile = { ...window.GSA_DATA.defaultProfile, ...ambassador };
    AppState.currentTab = 'home';
    window.GSA_REQUIRE_SCORE = true;
    AppState.save();
    renderApp();
  };

  window.submitAmbassadorScore = function(event) {
    event.preventDefault();
    const input = document.getElementById('ambassador-current-score');
    const score = Number(input.value);
    const error = document.getElementById('score-entry-error');
    if (!Number.isFinite(score) || score < 0) {
      if (error) error.textContent = 'Enter a valid score of 0 or more.';
      return;
    }
    AppState.ambassadorScores[AppState.session.ambassadorId] = Math.floor(score);
    AppState.save();
    window.GSA_REQUIRE_SCORE = false;
    renderApp();
  };

  window.logout = function() {
    AppState.session = null;
    AppState.role = 'participant';
    AppState.selectedAmbassadorId = '';
    AppState.sidebarOpen = false;
    AppState.save();
    renderApp();
  };

  window.selectParticipantAmbassador = function(ambassadorId) {
    const ambassador = (window.GSA_DATA.ambassadors || []).find(item => item.id === ambassadorId);
    if (!ambassador) return;

    AppState.selectedAmbassadorId = ambassadorId;
    AppState.save();
    renderApp();
    showToast(`You're joining ${ambassador.name}'s contest`);
  };

  window.changeParticipantAmbassador = function() {
    AppState.selectedAmbassadorId = '';
    AppState.save();
    renderApp();
  };

  window.handleLogoClick = function() {
    if (AppState.role === 'ambassador') {
      switchTab('home');
    } else {
      switchTab('participantHub');
    }
  };

  // Tab Switcher
  window.switchTab = function(tabName) {
    if (AppState.role === 'participant') {
      tabName = 'participantHub';
    }
    AppState.currentTab = tabName;
    if (window.innerWidth < 1024) {
      closeSidebar();
    }

    const main = document.getElementById('main-content');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    renderApp();
  };

  // Toast Notification
  window.showToast = function(message) {
    const toast = document.getElementById('gsa-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2800);
  };

  // 1-Click Copy Helper
  window.copyText = function(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${label} to clipboard!`);
    }).catch(() => {
      showToast(`Selected: ${text}`);
    });
  };

  // Master Prompt Selector
  window.selectMasterPrompt = function(promptId) {
    AppState.selectedPromptId = promptId;
    AppState.save();
    renderApp();
    const found = (window.GSA_DATA.masterPrompts || []).find(p => p.id === promptId);
    showToast(`Loaded: ${found ? found.title : promptId}`);
  };

  // Copy All Form Answers formatted
  window.copyAllFormAnswers = function() {
      const prompts = window.GSA_DATA.masterPrompts || [];
      const cur = prompts.find(p => p.id === AppState.selectedPromptId) || prompts[0];
      if (!cur) return;

      const payload = [
        `What is your Game Idea Concept ? (Your Build):\n${cur.yourBuild}`,
        `Your Nano Banana Prompt:\n${cur.nanoPrompt}`,
        `Key Follow-up Prompts:\n${cur.followUpPrompts.join('\n\n')}`,
        `The Idea (How did you use above mentioned tools? Feature Wishlist):\n${cur.theIdea}`,
        `The Friction (Challenge & Workaround):\n${cur.theFriction}`,
        `The Win (What came together beautifully):\n${cur.theWin}`
      ].join('\n\n---\n\n');

      navigator.clipboard.writeText(payload).then(() => {
        showToast('Copied all 6 form answers to clipboard!');
      }).catch(() => {
        showToast('Error copying answers');
      });
    };

  // Mobile Sidebar
  window.toggleSidebar = function() {
    AppState.sidebarOpen = !AppState.sidebarOpen;
    const sidebar = document.getElementById('portal-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (AppState.sidebarOpen) {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  };

  window.closeSidebar = function() {
    AppState.sidebarOpen = false;
    const sidebar = document.getElementById('portal-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  };

  // Render Sidebar
  function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const footer = document.getElementById('sidebar-footer');

    if (AppState.role === 'ambassador') {
      // Ambassador navigation
      const currentAmbId = AppState.session && AppState.session.ambassadorId ? AppState.session.ambassadorId : 'rishi';
      const pendingCount = (AppState.certRequests || []).filter(r => r.status === 'pending' && (r.ambassadorId === currentAmbId || (!r.ambassadorId && currentAmbId === 'rishi'))).length;
      const items = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'resources', label: 'Resources' },
        { id: 'requests', label: 'Certificate Requests' + (pendingCount > 0 ? ' (' + pendingCount + ')' : '') },
        { id: 'myscore', label: 'My Score' },
        { id: 'leaderboard', label: 'Leaderboard' }
      ];

      nav.innerHTML = items.map(item => {
        const active = AppState.currentTab === item.id;
        return `
          <button onclick="switchTab('${item.id}')" class="sidebar-item w-full text-left px-5 py-3 rounded-2xl text-sm transition-colors ${
            active ? 'font-bold bg-[#EEF4FE] text-[#346BF1]' : 'font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }">
            ${item.label}
          </button>
        `;
      }).join('');

      footer.innerHTML = `
        <button onclick="logout()" class="flex items-center space-x-2 w-full px-5 py-3 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors rounded-2xl hover:bg-gray-50">
          <i data-lucide="log-out" class="w-4 h-4 text-gray-400"></i>
          <span>Logout</span>
        </button>
      `;
    } else {
      // Participant navigation (Only sees Product Trial & Certificate)
      const items = [
        { id: 'participantHub', label: 'Product Trial & Certificate' }
      ];

      nav.innerHTML = items.map(item => {
        const active = AppState.currentTab === item.id;
        return `
          <button onclick="switchTab('${item.id}')" class="sidebar-item w-full text-left px-5 py-3 rounded-2xl text-sm transition-colors ${
            active ? 'font-bold bg-[#EEF4FE] text-[#346BF1]' : 'font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }">
            ${item.label}
          </button>
        `;
      }).join('');

      footer.innerHTML = `
        <button onclick="logout()" class="flex items-center space-x-2 w-full px-5 py-3 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors rounded-2xl hover:bg-gray-50">
          <i data-lucide="log-out" class="w-4 h-4 text-gray-400"></i>
          <span>Logout</span>
        </button>
      `;
    }
  }

  function renderLoginView() {
    const mode = window.GSA_LOGIN_MODE || 'participant';
    const ambassadors = window.GSA_DATA.ambassadors || [];
    const participantForm = `
      <form onsubmit="submitParticipantLogin(event)" class="space-y-4">
        <div>
          <label for="login-participant-name" class="block text-sm font-semibold text-gray-800 mb-1.5">Full name</label>
          <input id="login-participant-name" type="text" autocomplete="name" required placeholder="Enter your full name" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
        </div>
        <div>
          <label for="login-participant-email" class="block text-sm font-semibold text-gray-800 mb-1.5">Email address</label>
          <input id="login-participant-email" type="email" autocomplete="email" required placeholder="Enter your email" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
        </div>
        <div>
          <label for="login-participant-university" class="block text-sm font-semibold text-gray-800 mb-1.5">University or institute</label>
          <input id="login-participant-university" type="text" autocomplete="organization" required placeholder="Enter your university" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
        </div>
        <button type="submit" class="w-full px-5 py-3 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] active:translate-y-px text-white font-bold text-sm transition-colors">Continue as participant</button>
      </form>`;
    const ambassadorForm = `
      <form onsubmit="submitAmbassadorLogin(event)" class="space-y-4">
        <div>
          <label for="login-ambassador-id" class="block text-sm font-semibold text-gray-800 mb-1.5">Ambassador account</label>
          <select id="login-ambassador-id" class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
            ${ambassadors.map(ambassador => `<option value="${ambassador.id}">${ambassador.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="login-ambassador-password" class="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
          <input id="login-ambassador-password" type="password" autocomplete="current-password" required placeholder="Enter your password" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
        </div>
        <button type="submit" class="w-full px-5 py-3 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] active:translate-y-px text-white font-bold text-sm transition-colors">Sign in as ambassador</button>
      </form>`;

    return `
      <div class="min-h-full flex items-center justify-center py-8">
        <section class="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-xl shadow-blue-950/5 overflow-hidden">
          <div class="p-7 sm:p-8 bg-[#F8FAFF] border-b border-blue-100 text-center">
            <img src="assets/logo-04-header.png" alt="Google Gemini Student Ambassador" class="h-12 w-auto mx-auto object-contain">
            <h1 class="mt-5 text-2xl font-bold tracking-tight text-gray-900">Welcome to the GSA portal</h1>
            <p class="mt-2 text-sm text-gray-600">Start by identifying how you are joining today.</p>
          </div>
          <div class="p-6 sm:p-8">
            <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 mb-6">
              <button type="button" onclick="selectLoginMode('participant')" class="px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${mode === 'participant' ? 'bg-white text-[#346BF1] shadow-sm' : 'text-gray-500 hover:text-gray-900'}">Participant</button>
              <button type="button" onclick="selectLoginMode('ambassador')" class="px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${mode === 'ambassador' ? 'bg-white text-[#346BF1] shadow-sm' : 'text-gray-500 hover:text-gray-900'}">Ambassador</button>
            </div>
            <p id="login-error" role="alert" class="min-h-5 mb-3 text-xs font-medium text-red-600"></p>
            ${mode === 'participant' ? participantForm : ambassadorForm}
          </div>
        </section>
      </div>
    `;
  }

  function renderAmbassadorScoreSetup() {
    const ambassador = (window.GSA_DATA.ambassadors || []).find(item => item.id === AppState.session.ambassadorId);
    return `
      <div class="min-h-full flex items-center justify-center py-8">
        <section class="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-xl shadow-blue-950/5 overflow-hidden">
          <div class="p-7 sm:p-8 bg-[#F8FAFF] border-b border-blue-100">
            <p class="text-xs font-bold tracking-wide text-[#346BF1]">AMBASSADOR DASHBOARD</p>
            <h1 class="mt-2 text-2xl font-bold tracking-tight text-gray-900">Welcome, ${ambassador ? ambassador.name : 'Ambassador'}</h1>
            <p class="mt-2 text-sm text-gray-600">Before opening your dashboard, enter your current programme score.</p>
          </div>
          <form onsubmit="submitAmbassadorScore(event)" class="p-6 sm:p-8 space-y-4">
            <div>
              <label for="ambassador-current-score" class="block text-sm font-semibold text-gray-800 mb-1.5">Current score</label>
              <input id="ambassador-current-score" type="number" inputmode="numeric" min="0" step="1" required autofocus placeholder="e.g. 1200" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1] focus:ring-2 focus:ring-blue-100">
              <p class="mt-2 text-xs text-gray-500">You can update this score again the next time you sign in.</p>
            </div>
            <p id="score-entry-error" role="alert" class="min-h-5 text-xs font-medium text-red-600"></p>
            <button type="submit" class="w-full px-5 py-3 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] active:translate-y-px text-white font-bold text-sm transition-colors">Open dashboard</button>
          </form>
        </section>
      </div>
    `;
  }

  // Render Views
  function renderApp() {
    const main = document.getElementById('main-content');
    if (!AppState.session) {
      setAuthenticatedShell(false);
      main.innerHTML = renderLoginView();
      return;
    }

    setAuthenticatedShell(true);
    renderSidebar();
    AppState.updateHeader();

    if (AppState.role === 'ambassador' && window.GSA_REQUIRE_SCORE) {
      main.innerHTML = renderAmbassadorScoreSetup();
      return;
    }

    if (AppState.role === 'participant') {
      main.innerHTML = AppState.selectedAmbassadorId ? renderParticipantHub() : renderAmbassadorSelection();
    } else {
      switch (AppState.currentTab) {
        case 'home':
          main.innerHTML = renderHomeView();
          break;
        case 'about':
          main.innerHTML = renderAboutView();
          break;
        case 'resources':
          main.innerHTML = renderResourcesView();
          break;
        case 'requests':
          main.innerHTML = renderCertRequestsView();
          break;
        case 'myscore':
          main.innerHTML = renderScoreView();
          break;
        case 'leaderboard':
          main.innerHTML = renderLeaderboardView();
          break;
        default:
          main.innerHTML = renderHomeView();
      }
    }

    lucide.createIcons();
  }

  // Form Field Copy Helper
  window.copyFormField = function(fieldKey) {
    var prompts = window.GSA_DATA.masterPrompts || [];
    var cur = prompts.find(function(p) { return p.id === AppState.selectedPromptId; }) || prompts[0];
    if (!cur) return;
    var fieldMap = {
      yourBuild: cur.yourBuild,
      nanoPrompt: cur.nanoPrompt,
      followUpPrompts: cur.followUpPrompts.join('\n\n'),
      theIdea: cur.theIdea,
      theFriction: cur.theFriction,
      theWin: cur.theWin
    };
    var labels = {
      yourBuild: 'Your Build',
      nanoPrompt: 'Nano Banana Prompt',
      followUpPrompts: 'Follow-up Prompts',
      theIdea: 'The Idea',
      theFriction: 'The Friction',
      theWin: 'The Win'
    };
    var text = fieldMap[fieldKey] || '';
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied ' + (labels[fieldKey] || fieldKey) + ' to clipboard!');
    }).catch(function() {
      showToast('Error copying');
    });
  };

  // Form Assistant UI Builder (avoids backtick conflicts in template literals)
  function renderFormAssistant(cur) {
    var allPrompts = window.GSA_DATA.masterPrompts || [];
    if (!cur) return '';

    var chips = allPrompts.map(function(p) {
      var active = p.id === AppState.selectedPromptId;
      var cls = active
        ? 'bg-[#346BF1] text-white border-[#346BF1]'
        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#346BF1] hover:bg-blue-50/30';
      return '<button onclick="selectMasterPrompt(\'' + p.id + '\')" class="px-4 py-2 rounded-2xl border text-xs font-bold transition-colors ' + cls + '">' + p.title + '<span class="block text-[10px] font-normal opacity-70">' + p.tag + '</span></button>';
    }).join('');

    var fields = [
      { key: 'yourBuild', label: 'Your Build (Game Idea Concept)', icon: 'map-pin', preview: cur.yourBuild },
      { key: 'nanoPrompt', label: 'Your Nano Banana Prompt', icon: 'sparkles', preview: cur.nanoPrompt },
      { key: 'followUpPrompts', label: 'Key Follow-up Prompts (2-5)', icon: 'list', preview: cur.followUpPrompts.join(' | ') },
      { key: 'theIdea', label: 'The Idea (Feature Wishlist)', icon: 'lightbulb', preview: cur.theIdea },
      { key: 'theFriction', label: 'The Friction (Challenge & Workaround)', icon: 'zap', preview: cur.theFriction },
      { key: 'theWin', label: 'The Win (What came together)', icon: 'trophy', preview: cur.theWin }
    ];

    var fieldCards = fields.map(function(f, idx) {
      var shortPreview = f.preview.length > 180 ? f.preview.substring(0, 180) + '...' : f.preview;
      return '<div class="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">' +
        '<div class="flex items-center justify-between">' +
          '<div class="flex items-center gap-2">' +
            '<span class="w-6 h-6 rounded-full bg-[#346BF1] text-white font-bold text-[10px] flex items-center justify-center shrink-0">' + (idx + 1) + '</span>' +
            '<span class="font-bold text-sm text-gray-900">' + f.label + '</span>' +
          '</div>' +
          '<button onclick="copyFormField(\'' + f.key + '\')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">' +
            '<i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy' +
          '</button>' +
        '</div>' +
        '<p class="text-xs text-gray-600 leading-relaxed pl-8">' + shortPreview + '</p>' +
      '</div>';
    }).join('');

    return '<div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">' +
      '<div class="flex items-center justify-between pb-2 border-b border-gray-100">' +
        '<div>' +
          '<span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">Product Trial Form Assistant</span>' +
          '<h2 class="text-lg font-bold text-gray-900">Select Your Game Concept</h2>' +
          '<p class="text-xs text-gray-500">Pick a master prompt below. All 6 form fields will be generated for you to copy-paste into the Google Form.</p>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">' + chips + '</div>' +
      '<div class="pt-2 space-y-3">' +
        '<div class="flex items-center justify-between">' +
          '<h3 class="font-bold text-sm text-gray-900">Form Answers: ' + cur.title + '</h3>' +
          '<button onclick="copyAllFormAnswers()" class="px-4 py-2 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors">' +
            '<i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Copy All 6 Answers' +
          '</button>' +
        '</div>' +
        fieldCards +
      '</div>' +
    '</div>';
  }

  // 1. PARTICIPANT HUB (Product Trial Survey Links, Copy Details, Text Prompt & Certificate Generator)
  function renderAmbassadorSelection() {
    const ambassadors = window.GSA_DATA.ambassadors || [];
    return `
      <div class="max-w-4xl mx-auto pb-16">
        <div class="bg-gradient-to-r from-[#1A73E8] to-[#346BF1] rounded-3xl p-7 sm:p-10 text-white shadow-sm relative overflow-hidden mb-6">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div class="relative z-10">
            <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-blue-100">Student Participant</span>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mt-3">Which ambassador's contest are you in?</h1>
            <p class="text-blue-100 text-sm mt-2 max-w-2xl leading-relaxed">Choose your ambassador to continue. Their correct name, GID, and email will be shown in the forms area.</p>
          </div>
        </div>
        <div class="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${ambassadors.map(ambassador => `
              <button onclick="selectParticipantAmbassador('${ambassador.id}')" class="text-left p-5 rounded-2xl border border-gray-200 hover:border-[#346BF1] hover:bg-blue-50/40 transition-all group">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1]">Ambassador Contest</span>
                    <h2 class="mt-1 font-bold text-gray-900 text-lg group-hover:text-[#346BF1]">${ambassador.name}</h2>
                    <p class="mt-1 text-xs text-gray-500">GID: ${ambassador.gid}</p>
                  </div>
                  <i data-lucide="arrow-right" class="w-5 h-5 text-gray-400 group-hover:text-[#346BF1] group-hover:translate-x-0.5 transition-all"></i>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderParticipantHub() {
    const amb = (window.GSA_DATA.ambassadors || []).find(item => item.id === AppState.selectedAmbassadorId) || AppState.profile;
    const sess = window.GSA_DATA.participantSession;
    const part = AppState.participant;
    const cur = (window.GSA_DATA.masterPrompts || []).find(p => p.id === AppState.selectedPromptId) || (window.GSA_DATA.masterPrompts||[])[0];

    const canIssue = part.preSurveyFilled && part.feedbackFilled && part.name.trim().length > 1 && (part.email || '').includes('@');

    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-16">
        <!-- Participant Welcome Header -->
        <div class="bg-gradient-to-r from-[#1A73E8] to-[#346BF1] rounded-3xl p-8 text-white shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div class="relative z-10 space-y-2">
            <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-blue-100">
              Student Participant Hub
            </span>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">Product Trial Workshop & Certificate</h1>
            <p class="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Welcome to the Google Gemini campus trial. Copy your ambassador's credentials below to paste into the official Product Trial Google Forms. Once you complete the surveys, issue your official Certificate of Participation.
            </p>
          </div>
        </div>

        <!-- Section 1: Ambassador & Session Details (1-Click Copy for Google Forms) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-start justify-between gap-3 pb-2 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Ambassador Details for Your Form</h2>
              <p class="text-xs text-gray-500">Click the copy button next to each field to easily paste into the Google Form.</p>
            </div>
            <button onclick="changeParticipantAmbassador()" class="shrink-0 text-xs font-bold text-[#346BF1] hover:underline">Change</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div class="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Ambassador Name</span>
                <span class="font-bold text-gray-900 text-sm">${amb.name}</span>
              </div>
              <button onclick="copyText('${amb.name}', 'Ambassador Name')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
              </button>
            </div>

            <div class="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Ambassador Google ID (GID)</span>
                <span class="font-bold text-gray-900 text-sm font-mono">${amb.gid}</span>
              </div>
              <button onclick="copyText('${amb.gid}', 'Ambassador GID')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
              </button>
            </div>

            <div class="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Ambassador Email</span>
                <span class="font-bold text-gray-900 text-sm truncate max-w-[220px] block">${amb.email || ''}</span>
              </div>
              <button onclick="copyText('${amb.email || ''}', 'Ambassador Email')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2: Creative Text Prompt Card (For Testing in Gemini) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">Trial Creative Brief</span>
              <h2 class="text-lg font-bold text-gray-900">Text Prompt to Test in Google Gemini</h2>
            </div>
            <button onclick="copyText(window.GSA_DATA.participantSession.promptText, 'Prompt Text')" class="px-4 py-2 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors shrink-0">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Prompt
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-[#F8FAFF] border border-blue-100 font-mono text-xs text-gray-800 leading-relaxed">
            "${sess.promptText}"
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Copy this prompt and try it live in Google Gemini during your campus trial.</span>
            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="text-[#346BF1] font-bold hover:underline flex items-center gap-1">
              Open Gemini ↗
            </a>
          </div>
        </div>

        <!-- Section X: Master Prompt Selector & Form Assistant -->
        ${renderFormAssistant(cur)}

        <!-- Section 3: Product Trial Step-by-Step Forms -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-red-600 block">Required for Certificate</span>
            <h2 class="text-lg font-bold text-gray-900">Complete Product Trial Surveys</h2>
            <p class="text-xs text-gray-500">Note: Survey completion applies strictly to Product Trial (not Product Understanding).</p>
          </div>

          <!-- Step 1: Pre-Survey Form -->
          <div class="p-4 rounded-2xl border ${part.preSurveyFilled ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 bg-gray-50/50'} space-y-3 transition-colors">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-full bg-[#346BF1] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 class="font-bold text-sm text-gray-900">Step 1: Product Trial Pre-Survey Form</h4>
                  <p class="text-xs text-gray-500">Fill this form before starting the product trial.</p>
                </div>
              </div>
              <a href="${sess.productTrialPreSurvey}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-xl bg-white border border-[#346BF1] text-[#346BF1] hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5">
                <span>Open Pre-Survey Form</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            </div>

            <label class="flex items-center gap-2 pt-2 border-t border-gray-200/60 cursor-pointer text-xs font-semibold text-gray-800">
              <input type="checkbox" onchange="updateParticipantCheck('preSurveyFilled', this.checked)" ${part.preSurveyFilled ? 'checked' : ''} class="w-4 h-4 accent-[#346BF1]">
              <span>I have filled and submitted the Product Trial Pre-Survey Form</span>
            </label>
          </div>

          <!-- Step 2: Feedback Form -->
          <div class="p-4 rounded-2xl border ${part.feedbackFilled ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 bg-gray-50/50'} space-y-3 transition-colors">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-full bg-[#346BF1] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 class="font-bold text-sm text-gray-900">Step 2: Product Trial Participant Feedback Form</h4>
                  <p class="text-xs text-gray-500">Fill this form after testing Gemini with the prompt above.</p>
                </div>
              </div>
              <a href="${sess.productTrialFeedback}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-xl bg-white border border-[#346BF1] text-[#346BF1] hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5">
                <span>Open Feedback Form</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            </div>

            <label class="flex items-center gap-2 pt-2 border-t border-gray-200/60 cursor-pointer text-xs font-semibold text-gray-800">
              <input type="checkbox" onchange="updateParticipantCheck('feedbackFilled', this.checked)" ${part.feedbackFilled ? 'checked' : ''} class="w-4 h-4 accent-[#346BF1]">
              <span>I have filled and submitted the Product Trial Participant Feedback Form</span>
            </label>
          </div>
        </div>

        <!-- Section 3.5: Product Understanding & Study Notebook Links -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">1-on-1 Sessions</span>
              <h2 class="text-lg font-bold text-gray-900">Product Understanding (Study Notebooks)</h2>
              <p class="text-xs text-gray-500">Participating in a Study Notebook walkthrough session? Access your pre/post surveys and tutorials below:</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a href="${sess.productUnderstandingPreSurvey}" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-2xl border border-gray-200 hover:border-[#346BF1] hover:bg-blue-50/30 transition-all flex items-center justify-between group">
              <div>
                <span class="text-[11px] text-gray-400 block font-medium">Study Notebooks</span>
                <span class="font-bold text-sm text-gray-800 group-hover:text-[#346BF1]">Pre-Survey Form</span>
              </div>
              <i data-lucide="external-link" class="w-4 h-4 text-gray-400 group-hover:text-[#346BF1]"></i>
            </a>

            <a href="${sess.productUnderstandingPostSurvey}" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-2xl border border-gray-200 hover:border-[#346BF1] hover:bg-blue-50/30 transition-all flex items-center justify-between group">
              <div>
                <span class="text-[11px] text-gray-400 block font-medium">Study Notebooks</span>
                <span class="font-bold text-sm text-gray-800 group-hover:text-[#346BF1]">Post-Survey Form</span>
              </div>
              <i data-lucide="external-link" class="w-4 h-4 text-gray-400 group-hover:text-[#346BF1]"></i>
            </a>

            <a href="${sess.productUnderstandingTutorialDrive}" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/30 hover:border-[#346BF1] hover:bg-blue-50/50 transition-all flex items-center justify-between group sm:col-span-2">
              <div>
                <span class="text-[11px] text-[#346BF1] block font-bold uppercase tracking-wider">Video Guides</span>
                <span class="font-bold text-sm text-gray-900 group-hover:text-[#346BF1]">Study Notebook Tutorial Videos (Google Drive Folder)</span>
              </div>
              <i data-lucide="external-link" class="w-4 h-4 text-[#346BF1]"></i>
            </a>
          </div>
        </div>

        <!-- Section 4: Request Your Official Certificate -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">Verification & Approval</span>
              <h2 class="text-xl font-bold text-gray-900">Request Your Certificate of Participation</h2>
              <p class="text-xs text-gray-500 mt-1">Your certificate request will be sent to your ambassador for approval. Once approved, the certificate will be emailed to you.</p>
            </div>
            ${canIssue && !part.certificateRequested ? `
              <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> Ready to Request
              </span>
            ` : part.certificateRequested ? `
              <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold inline-flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${getCertRequestStatus(part.certificateRequestId)}
              </span>
            ` : `
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1">
                <i data-lucide="lock" class="w-3.5 h-3.5"></i> Surveys Required
              </span>
            `}
          </div>

          <!-- Participant Identity Form -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Your Full Name (As on Certificate):</label>
              <input type="text" id="part-name" value="${part.name}" placeholder="e.g. John Doe" oninput="updateParticipantField('name', this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Your Email:</label>
              <input type="email" id="part-email" value="${part.email || ''}" placeholder="e.g. you@gmail.com" oninput="updateParticipantField('email', this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Your College / Institute:</label>
              <input type="text" id="part-college" value="${part.college}" placeholder="e.g. National Institute of Technology" oninput="updateParticipantField('college', this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
            </div>
          </div>

          <!-- Certificate Action -->
          <div class="pt-2">
            ${part.certificateRequested ? `
              <div class="p-4 rounded-xl ${getCertRequestStatusRaw(part.certificateRequestId) === 'approved' ? 'bg-emerald-50 border border-emerald-200' : getCertRequestStatusRaw(part.certificateRequestId) === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'} space-y-3">
                <div class="flex items-center gap-2 text-sm font-bold ${getCertRequestStatusRaw(part.certificateRequestId) === 'approved' ? 'text-emerald-800' : getCertRequestStatusRaw(part.certificateRequestId) === 'rejected' ? 'text-red-800' : 'text-blue-800'}">
                  <i data-lucide="${getCertRequestStatusRaw(part.certificateRequestId) === 'approved' ? 'check-circle' : getCertRequestStatusRaw(part.certificateRequestId) === 'rejected' ? 'x-circle' : 'clock'}" class="w-4 h-4"></i>
                  ${getCertRequestStatusRaw(part.certificateRequestId) === 'approved' ? 'Certificate Approved! Check your email for the certificate.' : getCertRequestStatusRaw(part.certificateRequestId) === 'rejected' ? 'Request was not approved. Please contact your ambassador.' : 'Certificate request sent to ' + amb.name + '. Waiting for approval.'}
                </div>
                ${getCertRequestStatusRaw(part.certificateRequestId) === 'approved' ? `
                  <button onclick="generateAndShowCertificate()" class="px-6 py-2.5 rounded-full bg-[#346BF1] hover:bg-[#2851C6] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
                    <i data-lucide="download" class="w-4 h-4"></i> Download Certificate
                  </button>
                ` : getCertRequestStatusRaw(part.certificateRequestId) === 'rejected' ? `
                  <button onclick="resetCertRequest()" class="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors">
                    Try Again
                  </button>
                ` : ''}
              </div>
            ` : canIssue ? `
              <button onclick="requestCertificate()" class="w-full sm:w-auto px-8 py-3 rounded-full bg-[#346BF1] hover:bg-[#2851C6] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                <i data-lucide="send" class="w-4 h-4"></i> Request Certificate from Ambassador
              </button>
            ` : `
              <div class="p-3.5 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-4 h-4 text-gray-400 shrink-0"></i>
                <span>Please complete filling Step 1 (Pre-Survey) and Step 2 (Feedback Form) above, then enter your name and email to request your certificate.</span>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  window.updateParticipantCheck = function(field, val) {
    AppState.participant[field] = val;
    AppState.save();
    renderApp();
  };

  window.updateParticipantField = function(field, val) {
    AppState.participant[field] = val;
    AppState.save();
    const canIssue = AppState.participant.preSurveyFilled && AppState.participant.feedbackFilled && AppState.participant.name.trim().length > 1 && (AppState.participant.email || '').includes('@');
    const reqBtn = document.querySelector('#main-content button[onclick*="requestCertificate"]');
    if ((canIssue && !reqBtn) || (!canIssue && reqBtn)) {
      renderApp();
    }
  };

  function getCertRequestStatusRaw(requestId) {
    if (!requestId) return 'none';
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return 'none';
    return req.status; // 'pending' | 'approved' | 'rejected'
  }
  window.getCertRequestStatusRaw = getCertRequestStatusRaw;

  function getCertRequestStatus(requestId) {
    const raw = getCertRequestStatusRaw(requestId);
    if (raw === 'approved') return 'Approved & Verified';
    if (raw === 'rejected') return 'Declined';
    if (raw === 'pending') return 'Pending Ambassador Approval';
    return 'Not Requested';
  }
  window.getCertRequestStatus = getCertRequestStatus;

  window.requestCertificate = function() {
    const part = AppState.participant;
    const ambId = AppState.selectedAmbassadorId || (AppState.session && AppState.session.ambassadorId) || 'rishi';
    const amb = (window.GSA_DATA.ambassadors || []).find(a => a.id === ambId) || window.GSA_DATA.defaultProfile;

    if (!part.name || part.name.trim().length < 2) {
      showToast('Please enter your full name');
      return;
    }
    if (!part.email || !part.email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    if (!part.preSurveyFilled || !part.feedbackFilled) {
      showToast('Please complete both Product Trial surveys first');
      return;
    }

    const reqId = 'GSA-REQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const verificationId = 'GSA-PT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newReq = {
      id: reqId,
      participantName: part.name.trim(),
      participantEmail: part.email.trim(),
      participantCollege: part.college.trim() || 'Student',
      ambassadorId: ambId,
      ambassadorName: amb.name,
      promptId: AppState.selectedPromptId || 'ember-run',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      decidedAt: null,
      verificationId: verificationId
    };

    if (!Array.isArray(AppState.certRequests)) {
      AppState.certRequests = [];
    }
    AppState.certRequests.unshift(newReq);

    AppState.participant.certificateRequested = true;
    AppState.participant.certificateRequestId = reqId;
    AppState.save();
    renderApp();
    showToast(`Certificate request submitted to ${amb.name}!`);
  };

  window.resetCertRequest = function() {
    AppState.participant.certificateRequested = false;
    AppState.participant.certificateRequestId = '';
    AppState.save();
    renderApp();
    showToast('You can now submit a new certificate request.');
  };

  window.approveCertRequest = function(requestId) {
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;

    req.status = 'approved';
    req.decidedAt = new Date().toISOString();
    if (!req.verificationId) {
      req.verificationId = 'GSA-PT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (AppState.participant.certificateRequestId === requestId || AppState.participant.email === req.participantEmail) {
      AppState.participant.certificateIssued = true;
    }

    AppState.save();
    renderApp();
    openEmailDispatchModal(req);
  };

  window.rejectCertRequest = function(requestId) {
    if (!confirm('Are you sure you want to decline this certificate request?')) return;
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;

    req.status = 'rejected';
    req.decidedAt = new Date().toISOString();
    AppState.save();
    renderApp();
    showToast(`Request from ${req.participantName} was declined.`);
  };

  window.reopenCertRequest = function(requestId) {
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;

    req.status = 'pending';
    req.decidedAt = null;
    AppState.save();
    renderApp();
    showToast(`Request from ${req.participantName} reopened.`);
  };

  window.previewCertForRequest = function(requestId) {
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;
    generateAndShowCertificate(req);
  };

  window.openEmailDispatchModal = function(req) {
    const ambId = req.ambassadorId || (AppState.session && AppState.session.ambassadorId) || 'rishi';
    const amb = (window.GSA_DATA.ambassadors || []).find(a => a.id === ambId) || window.GSA_DATA.defaultProfile;
    const modal = document.getElementById('portal-modal');

    const subject = `Google Gemini Student Ambassador - Certificate of Participation Verified (${req.verificationId})`;
    const emailBody = `Dear ${req.participantName},

Congratulations! Your completion of the Google Gemini Campus Product Trial has been verified and approved.

Certificate Details:
• Recipient: ${req.participantName}
• College / University: ${req.participantCollege}
• Verification ID: ${req.verificationId}
• Host Ambassador: ${amb.name} (GID: ${amb.gid})
• Month Theme: Game On Night : Imagine The Impossible

You can now log in to the Google Gemini Student Ambassador Portal to download your official certificate.

Best regards,
${amb.name}
Google Student Ambassador
${amb.email || ''}`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(emailBody);
    const mailtoUrl = `mailto:${encodeURIComponent(req.participantEmail)}?subject=${encodedSubject}&body=${encodedBody}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(req.participantEmail)}&su=${encodedSubject}&body=${encodedBody}`;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[95vh] overflow-y-auto animate-modal">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <i data-lucide="check-circle" class="w-6 h-6"></i>
            </span>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Certificate Approved</span>
              <h3 class="text-lg font-bold text-gray-900">Send to ${req.participantName}'s Email</h3>
            </div>
          </div>
          <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
          <div class="flex items-center justify-between font-semibold text-emerald-900">
            <span>Recipient Email:</span>
            <span class="font-mono text-emerald-800">${req.participantEmail}</span>
          </div>
          <div class="flex items-center justify-between font-semibold text-emerald-900">
            <span>Verification ID:</span>
            <span class="font-mono text-emerald-800">${req.verificationId}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500">Email Draft Content:</label>
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto select-all leading-relaxed">
${emailBody}
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a href="${mailtoUrl}" class="px-4 py-2.5 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors">
              <i data-lucide="mail" class="w-4 h-4"></i> Open in Default Mail
            </a>
            <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-white border border-[#346BF1] text-[#346BF1] hover:bg-blue-50 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors">
              <i data-lucide="external-link" class="w-4 h-4"></i> Open in Gmail Web
            </a>
          </div>

          <div class="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <button onclick="copyEmailDraft('${req.id}')" class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Email Text
            </button>
            <button onclick="previewCertForRequest('${req.id}')" class="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i data-lucide="award" class="w-3.5 h-3.5"></i> View Certificate Artwork
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
  };

  window.openEmailDispatchModalById = function(requestId) {
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;
    openEmailDispatchModal(req);
  };

  window.copyEmailDraft = function(requestId) {
    const req = (AppState.certRequests || []).find(r => r.id === requestId);
    if (!req) return;
    const ambId = req.ambassadorId || (AppState.session && AppState.session.ambassadorId) || 'rishi';
    const amb = (window.GSA_DATA.ambassadors || []).find(a => a.id === ambId) || window.GSA_DATA.defaultProfile;

    const emailBody = `Dear ${req.participantName},

Congratulations! Your completion of the Google Gemini Campus Product Trial has been verified and approved.

Certificate Details:
• Recipient: ${req.participantName}
• College / University: ${req.participantCollege}
• Verification ID: ${req.verificationId}
• Host Ambassador: ${amb.name} (GID: ${amb.gid})
• Month Theme: Game On Night : Imagine The Impossible

You can now log in to the Google Gemini Student Ambassador Portal to download your official certificate.

Best regards,
${amb.name}
Google Student Ambassador
${amb.email || ''}`;

    navigator.clipboard.writeText(emailBody).then(() => {
      showToast('Copied email draft to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard');
    });
  };

  // Certificate Generator and Preview Modal
  window.generateAndShowCertificate = function(customData) {
    const reqData = customData || {};
    const part = {
      name: reqData.participantName || AppState.participant.name,
      college: reqData.participantCollege || AppState.participant.college,
      email: reqData.participantEmail || AppState.participant.email
    };
    const cur = (window.GSA_DATA.masterPrompts || []).find(p => p.id === (reqData.promptId || AppState.selectedPromptId)) || (window.GSA_DATA.masterPrompts||[])[0];
    const ambId = reqData.ambassadorId || AppState.selectedAmbassadorId || (AppState.session && AppState.session.ambassadorId) || 'rishi';
    const amb = (window.GSA_DATA.ambassadors || []).find(item => item.id === ambId) || AppState.profile;
    const sess = window.GSA_DATA.participantSession;
    const certDate = reqData.decidedAt ? new Date(reqData.decidedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = reqData.verificationId || ('GSA-PT-' + Math.random().toString(36).substring(2, 8).toUpperCase());

    const modal = document.getElementById('portal-modal');

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[95vh] overflow-y-auto animate-modal">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Verified Product Trial Completion</span>
            <h3 class="text-xl font-bold text-gray-900">Certificate of Participation - ${part.name}</h3>
          </div>
          <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Canvas Certificate Container -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white p-2">
          <canvas id="cert-canvas" width="1600" height="1000" class="w-full h-auto rounded-xl"></canvas>
        </div>

        <!-- Certificate Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div class="text-xs text-gray-500 font-mono">
            Verification ID: ${certId} • Issued on ${certDate}
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button id="download-certificate" onclick="downloadCertificateCanvas()" disabled class="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#346BF1] hover:bg-[#2851C6] disabled:cursor-wait disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <i data-lucide="download" class="w-4 h-4"></i> Download Certificate (PNG)
            </button>
            <button onclick="window.print()" class="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5">
              <i data-lucide="printer" class="w-4 h-4"></i> Print
            </button>
          </div>
        </div>
        <p id="certificate-render-status" class="text-center text-xs font-medium text-gray-500">Preparing certificate artwork...</p>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
    window.currentCertificateId = certId;
    window.currentCertificateName = part.name;

    // Render the supplied certificate artwork before enabling export.
    drawCertificate(part.name, certDate, amb.signature, amb.signatureCrop).then(() => {
      const downloadButton = document.getElementById('download-certificate');
      if (downloadButton) downloadButton.disabled = false;
      if (!customData || customData.participantEmail === AppState.participant.email) {
        AppState.participant.certificateIssued = true;
        AppState.save();
      }
    }).catch(() => {
      const status = document.getElementById('certificate-render-status');
      if (status) status.textContent = 'Certificate artwork could not be loaded. Please try again.';
    });
  };

  function loadCertificateImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  function fitCertificateText(ctx, text, maxWidth, initialSize) {
    let size = initialSize;
    do {
      ctx.font = `700 ${size}px "Google Sans Certificate", "Outfit", sans-serif`;
      if (ctx.measureText(text).width <= maxWidth || size <= 48) break;
      size -= 2;
    } while (size > 48);
  }

  function getSignatureCrop(image) {
    const source = document.createElement('canvas');
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0);

    const pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
    let left = source.width;
    let top = source.height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        const offset = (y * source.width + x) * 4;
        const alpha = pixels[offset + 3];
        const brightness = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
        // Transparent PNG margins and the white paper around JPEG scans are
        // both excluded. Only visible ink is used for placement.
        if (alpha > 32 && brightness < 175) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    }

    if (right < left || bottom < top) {
      return { x: 0, y: 0, width: source.width, height: source.height };
    }

    const padding = Math.round(Math.max(source.width, source.height) * 0.025);
    const x = Math.max(0, left - padding);
    const y = Math.max(0, top - padding);
    const width = Math.min(source.width - x, right - left + 1 + padding * 2);
    const height = Math.min(source.height - y, bottom - top + 1 + padding * 2);
    return { x, y, width, height };
  }

  function createInkSignature(image, crop) {
    const clean = document.createElement('canvas');
    clean.width = crop.width;
    clean.height = crop.height;
    const cleanContext = clean.getContext('2d', { willReadFrequently: true });
    cleanContext.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

    const imageData = cleanContext.getImageData(0, 0, clean.width, clean.height);
    const pixels = imageData.data;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const brightness = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
      // Convert pale paper and scanner noise to transparency while retaining
      // the dark handwritten ink from JPEG and PNG uploads alike.
      const inkAlpha = Math.max(0, Math.min(255, (190 - brightness) * 3));
      pixels[offset + 3] = Math.min(pixels[offset + 3], inkAlpha);
    }
    cleanContext.putImageData(imageData, 0, 0);
    return clean;
  }

  async function drawCertificate(studentName, dateStr, signaturePath, signatureCrop) {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const template = await loadCertificateImage(window.GSA_DATA.certificate.template);
    await document.fonts.ready;

    canvas.width = template.naturalWidth;
    canvas.height = template.naturalHeight;
    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(template, 0, 0, w, h);

    // The supplied certificate intentionally leaves this rule blank for the
    // participant's name. Measurements are proportional to the template so
    // the artwork remains print quality at its native 6142 x 4429 pixels.
    const name = (studentName || 'Student Participant').trim();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#202124';
    fitCertificateText(ctx, name, w * 0.62, Math.round(w * 0.026));
    ctx.fillText(name, w / 2, h * 0.493);

    // The date belongs above the supplied date rule in the lower-left field.
    ctx.font = `700 ${Math.round(w * 0.008)}px "Google Sans Certificate", "Outfit", sans-serif`;
    ctx.fillText(dateStr, w * 0.185, h * 0.835);

    if (signaturePath) {
      const signature = await loadCertificateImage(signaturePath);
      const crop = signatureCrop || getSignatureCrop(signature);
      const maxWidth = w * 0.165;
      const maxHeight = h * 0.09;
      const scale = Math.min(maxWidth / crop.width, maxHeight / crop.height);
      const signatureWidth = crop.width * scale;
      const signatureHeight = crop.height * scale;
      const signatureX = w * 0.814 - signatureWidth / 2;
      const signatureY = h * 0.84 - signatureHeight;
      const inkSignature = createInkSignature(signature, crop);
      ctx.drawImage(inkSignature, signatureX, signatureY, signatureWidth, signatureHeight);
    }

    const status = document.getElementById('certificate-render-status');
    if (status) status.textContent = 'Certificate is ready to download.';
  }

  window.downloadCertificateCanvas = function() {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const safeName = (window.currentCertificateName || AppState.participant.name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const certId = window.currentCertificateId || 'GSA-PT-CERTIFICATE';
    const link = document.createElement('a');
    link.download = `GSA_Certificate_${safeName}_${certId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Certificate downloaded successfully!');
  };

  window.closeModal = function() {
    const modal = document.getElementById('portal-modal');
    modal.classList.add('hidden');
  };

  // 2. AMBASSADOR HOME VIEW (Pixel-perfect match to screenshot)
  function renderHomeView() {
    const p = AppState.profile;
    const tier = AppState.currentTier;
    const tasks = AppState.tasks;

    const currentAmbId = AppState.session && AppState.session.ambassadorId ? AppState.session.ambassadorId : 'rishi';
    const pendingRequests = (AppState.certRequests || []).filter(r => r.status === 'pending' && (r.ambassadorId === currentAmbId || (!r.ambassadorId && currentAmbId === 'rishi')));

    const googleGradient = "font-bold bg-[linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853)] bg-clip-text text-transparent";

    return `
      <div class="space-y-6">
        <!-- Hero Card matching screenshot -->
        <div class="bg-[#346BF1] rounded-3xl p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden shadow-sm">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div class="absolute bottom-0 right-1/4 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 pointer-events-none"></div>

          <div class="flex items-center space-x-6 z-10 cursor-pointer group" onclick="openProfileModal()">
            <div>
              <h2 class="text-4xl font-bold mb-1 tracking-tight flex items-center gap-2">
                ${p.name}
                <i data-lucide="edit-2" class="w-4 h-4 opacity-0 group-hover:opacity-75 transition-opacity"></i>
              </h2>
              <div class="flex items-center space-x-4 text-blue-100 text-sm font-medium mb-3">
                <span>GID : ${p.gid}</span>
              </div>
              <div class="text-xl text-white font-medium">Your Tasks</div>
            </div>
          </div>

          <div class="mt-6 md:mt-0 z-10">
            <div class="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-6 py-4 flex flex-col items-center justify-center text-center w-36 shadow-xs">
              <div class="text-[11px] text-blue-100 font-semibold uppercase tracking-wider mb-2">
                ${tier.badgeLabel || 'STARTER BADGE'}
              </div>
              <div class="w-20 h-20 flex items-center justify-center relative">
                <img src="${tier.badge}" alt="${tier.name}" class="w-full h-full object-contain ${tier.isStarter ? 'grayscale opacity-80' : ''}">
              </div>
              <span class="bg-[#2D3748] text-white text-[10px] font-bold px-3 py-0.5 rounded-full mt-2 shadow-xs">
                ${tier.tierTag || 'Bronze'}
              </span>
              <span class="text-[10px] text-blue-100 mt-0.5">${tier.name}</span>
            </div>
          </div>
        </div>

        ${pendingRequests.length > 0 ? `
          <!-- Pending Certificate Requests Alert -->
          <div class="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <i data-lucide="clock" class="w-5 h-5"></i>
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-sm text-amber-900">${pendingRequests.length} Certificate Issue Request${pendingRequests.length > 1 ? 's' : ''} Pending</h3>
                  <span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">Action Required</span>
                </div>
                <p class="text-xs text-amber-700 mt-0.5">Participants in your campus contest have submitted Product Trial forms and are awaiting your verification.</p>
              </div>
            </div>
            <button onclick="switchTab('requests')" class="px-5 py-2.5 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors shrink-0">
              <span>Review & Approve</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        ` : ''}

        <!-- 2x2 Tasks Grid matching screenshot -->
        <div class="grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <!-- Quadrant 1: Product Trials -->
          <div class="p-8 relative border-b border-gray-200 md:border-r border-gray-200 flex flex-col justify-between">
            <div>
              <div class="absolute top-8 right-8 text-xs italic font-normal text-gray-400">
                ${tasks[0].category}
              </div>

              <div class="flex items-center mb-4 pr-16">
                <div class="w-10 h-10 rounded-xl bg-blue-50/70 border border-blue-100/60 flex items-center justify-center shrink-0">
                  <i data-lucide="disc" class="w-5 h-5 text-[#346BF1]"></i>
                </div>
                <h4 class="text-lg font-bold text-gray-900 ml-3.5">${tasks[0].title}</h4>
              </div>

              <div class="mb-3">
                <div class="inline-block text-[10px] uppercase tracking-wider ${googleGradient}">Month's Brief</div>
                <div class="font-bold text-gray-900 text-sm mt-0.5">${tasks[0].monthBriefTheme}</div>
              </div>

              <div class="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                ${tasks[0].briefHtml}
              </div>
            </div>

            <div>
              <button onclick="openTaskModal('product-trials')" class="bg-[#346BF1] hover:bg-[#2851C6] text-white font-medium px-8 py-2 rounded-full text-sm inline-block shadow-xs transition-colors">
                Continue
              </button>
            </div>
          </div>

          <!-- Quadrant 2: Content Creation -->
          <div class="p-8 relative border-b border-gray-200 flex flex-col justify-between">
            <div>
              <div class="absolute top-8 right-8 text-xs italic font-normal text-gray-400">
                ${tasks[1].category}
              </div>

              <div class="flex items-center mb-4 pr-16">
                <div class="w-10 h-10 rounded-xl bg-blue-50/70 border border-blue-100/60 flex items-center justify-center shrink-0">
                  <i data-lucide="video" class="w-5 h-5 text-[#346BF1]"></i>
                </div>
                <h4 class="text-lg font-bold text-gray-900 ml-3.5">${tasks[1].title}</h4>
              </div>

              <div class="mb-3">
                <div class="inline-block text-[10px] uppercase tracking-wider ${googleGradient}">Month's Brief</div>
                <div class="font-bold text-gray-900 text-sm mt-0.5">${tasks[1].monthBriefTheme}</div>
              </div>

              <div class="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                ${tasks[1].briefHtml}
              </div>
            </div>

            <div>
              <button onclick="openTaskModal('content-creation')" class="bg-[#346BF1] hover:bg-[#2851C6] text-white font-medium px-8 py-2 rounded-full text-sm inline-block shadow-xs transition-colors">
                Continue
              </button>
            </div>
          </div>

          <!-- Quadrant 3: Monthly Highlights -->
          <div class="p-8 relative md:border-r border-gray-200 flex flex-col justify-between">
            <div>
              <div class="absolute top-8 right-8 text-xs italic font-normal text-gray-400">
                ${tasks[2].category}
              </div>

              <div class="flex items-center mb-4 pr-16">
                <div class="w-10 h-10 rounded-xl bg-blue-50/70 border border-blue-100/60 flex items-center justify-center shrink-0">
                  <i data-lucide="map-pin" class="w-5 h-5 text-[#346BF1]"></i>
                </div>
                <h4 class="text-lg font-bold text-gray-900 ml-3.5">${tasks[2].title}</h4>
              </div>

              <div class="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                ${tasks[2].briefHtml}
              </div>
            </div>

            <div>
              <button onclick="openTaskModal('monthly-highlights')" class="bg-[#346BF1] hover:bg-[#2851C6] text-white font-medium px-8 py-2 rounded-full text-sm inline-block shadow-xs transition-colors">
                Continue
              </button>
            </div>
          </div>

          <!-- Quadrant 4: Product Understanding -->
          <div class="p-8 relative flex flex-col justify-between">
            <div>
              <div class="absolute top-8 right-8 text-xs italic font-normal text-gray-400">
                ${tasks[3].category}
              </div>

              <div class="flex items-center mb-4 pr-16">
                <div class="w-10 h-10 rounded-xl bg-blue-50/70 border border-blue-100/60 flex items-center justify-center shrink-0">
                  <i data-lucide="book-open" class="w-5 h-5 text-[#346BF1]"></i>
                </div>
                <h4 class="text-lg font-bold text-gray-900 ml-3.5">${tasks[3].title}</h4>
              </div>

              <div class="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                ${tasks[3].briefHtml}
              </div>
            </div>

            <div>
              <button onclick="openTaskModal('product-understanding')" class="bg-[#346BF1] hover:bg-[#2851C6] text-white font-medium px-8 py-2 rounded-full text-sm inline-block shadow-xs transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Task Completion Modal for Ambassador
  window.openTaskModal = function(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('portal-modal');
    const c = task.completion || {};
    const earned = AppState.calculateTaskScore(task);

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto animate-modal">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${task.type}</div>
            <h3 class="text-2xl font-bold text-gray-900">${task.title}</h3>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <div class="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
          <span class="text-gray-700 font-medium">${task.parameters}</span>
          <span class="font-bold text-[#346BF1] text-sm">+${earned} pts</span>
        </div>

        <div class="space-y-4 text-xs">
          <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span class="font-bold text-gray-800 text-sm">Mark Task as Completed</span>
            <input type="checkbox" id="modal-completed" ${c.completed ? 'checked' : ''} class="w-5 h-5 accent-[#346BF1] cursor-pointer">
          </div>

          ${renderAmbassadorTaskFields(task)}
        </div>

        <div class="pt-2 border-t border-gray-100 space-y-2">
          <div class="text-xs font-bold text-gray-700">Official Google Form Links:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${task.forms.map(f => `
              <a href="${f.link}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl border border-gray-200 hover:border-[#346BF1] hover:bg-blue-50/50 transition-all flex items-center justify-between text-[#346BF1] font-medium">
                <span>${f.name}</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            `).join('')}
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button onclick="closeModal()" class="px-5 py-2.5 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100">Close</button>
          <button onclick="saveModalSubmission('${task.id}')" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#346BF1] hover:bg-[#2851C6] shadow-sm">Save Submission</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
  };

  function renderAmbassadorTaskFields(task) {
    const c = task.completion || {};

    if (task.id === 'product-trials') {
      return `
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Participants Conducted (Min 10, Max 100):</label>
          <input type="number" id="inp-participants" min="0" max="100" value="${c.participantsCount || ''}" placeholder="0" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          <span class="text-[11px] text-gray-400 mt-0.5 block">12 pts per participant</span>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Google Meet Link:</label>
          <input type="url" id="inp-meet" value="${c.meetLink || ''}" placeholder="https://meet.google.com/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Google Drive Proof Folder (Photos / Video):</label>
          <input type="url" id="inp-proof" value="${c.proofDriveUrl || ''}" placeholder="https://drive.google.com/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Pre & Post Survey Sheet Link:</label>
          <input type="url" id="inp-survey" value="${c.surveySheetUrl || ''}" placeholder="https://docs.google.com/spreadsheets/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
      `;
    }

    if (task.id === 'content-creation') {
      return `
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Instagram Reel Link:</label>
          <input type="url" id="inp-reel" value="${c.reelUrl || ''}" placeholder="https://www.instagram.com/reel/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Authenticated Reel Views:</label>
          <input type="number" id="inp-views" min="0" value="${c.reelViews || ''}" placeholder="0" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          <span class="text-[11px] text-gray-400 mt-0.5 block">>1K views: 75 pts | >4K: 150 pts | >7K: 225 pts | >10K: 300 pts</span>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">LinkedIn Post Link:</label>
          <input type="url" id="inp-linkedin" value="${c.linkedInPostUrl || ''}" placeholder="https://www.linkedin.com/posts/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
      `;
    }

    if (task.id === 'monthly-highlights') {
      return `
        <div>
          <label class="block font-semibold text-gray-700 mb-1">LinkedIn Highlight Post URL:</label>
          <input type="url" id="inp-monthly-linkedin" value="${c.linkedInPostUrl || ''}" placeholder="https://www.linkedin.com/posts/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          <span class="text-[11px] text-gray-400 mt-0.5 block">200 pts fixed upon authentication</span>
        </div>
      `;
    }

    if (task.id === 'product-understanding') {
      return `
        <div>
          <label class="block font-semibold text-gray-700 mb-1">1-on-1 Sessions Conducted (Min 10, Max 50):</label>
          <input type="number" id="inp-sessions" min="0" max="50" value="${c.sessionsCount || ''}" placeholder="0" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          <span class="text-[11px] text-gray-400 mt-0.5 block">15 pts per session</span>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Video Reaction Drive Link:</label>
          <input type="url" id="inp-video" value="${c.videoDriveUrl || ''}" placeholder="https://drive.google.com/..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
        </div>
      `;
    }

    return '';
  }

  window.saveModalSubmission = function(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.completion) task.completion = {};

    task.completion.completed = document.getElementById('modal-completed').checked;

    if (taskId === 'product-trials') {
      task.completion.participantsCount = document.getElementById('inp-participants').value;
      task.completion.meetLink = document.getElementById('inp-meet').value;
      task.completion.proofDriveUrl = document.getElementById('inp-proof').value;
      task.completion.surveySheetUrl = document.getElementById('inp-survey').value;
    } else if (taskId === 'content-creation') {
      task.completion.reelUrl = document.getElementById('inp-reel').value;
      task.completion.reelViews = document.getElementById('inp-views').value;
      task.completion.linkedInPostUrl = document.getElementById('inp-linkedin').value;
    } else if (taskId === 'monthly-highlights') {
      task.completion.linkedInPostUrl = document.getElementById('inp-monthly-linkedin').value;
    } else if (taskId === 'product-understanding') {
      task.completion.sessionsCount = document.getElementById('inp-sessions').value;
      task.completion.videoDriveUrl = document.getElementById('inp-video').value;
    }

    AppState.save();
    closeModal();
    renderApp();
  };

  // 2.5 CERTIFICATE REQUESTS VIEW (Ambassador Review & Email Approval)
  function renderCertRequestsView() {
    const currentAmbId = AppState.session && AppState.session.ambassadorId ? AppState.session.ambassadorId : 'rishi';
    const currentAmb = (window.GSA_DATA.ambassadors || []).find(a => a.id === currentAmbId) || window.GSA_DATA.defaultProfile;

    const allRequests = AppState.certRequests || [];
    const myRequests = allRequests.filter(r => r.ambassadorId === currentAmbId || (!r.ambassadorId && currentAmbId === 'rishi'));

    const pending = myRequests.filter(r => r.status === 'pending');
    const approved = myRequests.filter(r => r.status === 'approved');
    const rejected = myRequests.filter(r => r.status === 'rejected');

    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-16">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-[#1A73E8] to-[#346BF1] rounded-3xl p-8 text-white shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div class="relative z-10 space-y-2">
            <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-blue-100">
              Ambassador Dashboard
            </span>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">Certificate Issue Requests</h1>
            <p class="text-blue-100 text-sm max-w-2xl leading-relaxed">
              When students in your contest complete their Product Trial surveys, their certificate requests arrive here. Review, approve, and send verification to their email.
            </p>
          </div>
        </div>

        <!-- Metric Counter Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Pending Review</span>
              <span class="text-2xl font-bold text-gray-900">${pending.length}</span>
            </div>
            <span class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i data-lucide="clock" class="w-5 h-5"></i>
            </span>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Approved & Issued</span>
              <span class="text-2xl font-bold text-gray-900">${approved.length}</span>
            </div>
            <span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i data-lucide="check-circle" class="w-5 h-5"></i>
            </span>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-semibold text-[#346BF1] uppercase tracking-wider block">Total Contest Requests</span>
              <span class="text-2xl font-bold text-gray-900">${myRequests.length}</span>
            </div>
            <span class="w-10 h-10 rounded-xl bg-blue-50 text-[#346BF1] flex items-center justify-center">
              <i data-lucide="inbox" class="w-5 h-5"></i>
            </span>
          </div>
        </div>

        <!-- Requests List -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Participant Requests (${myRequests.length})</h2>
              <p class="text-xs text-gray-500">Host Ambassador: <strong class="text-gray-700">${currentAmb.name}</strong> (GID: ${currentAmb.gid})</p>
            </div>
          </div>

          ${myRequests.length === 0 ? `
            <div class="py-12 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <i data-lucide="inbox" class="w-6 h-6"></i>
              </div>
              <h3 class="text-sm font-bold text-gray-800">No Certificate Requests Yet</h3>
              <p class="text-xs text-gray-500 max-w-sm mx-auto">
                When students complete your Product Trial and click "Request Certificate from Ambassador", their requests will appear here for your review and approval.
              </p>
            </div>
          ` : `
            <div class="space-y-4">
              ${myRequests.map(req => {
                const prompt = (window.GSA_DATA.masterPrompts || []).find(p => p.id === req.promptId);
                const reqDate = req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'Recent';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isPending = !isApproved && !isRejected;

                return `
                  <div class="p-5 rounded-2xl border ${isApproved ? 'border-emerald-200 bg-emerald-50/20' : isRejected ? 'border-red-200 bg-red-50/20' : 'border-blue-100 bg-blue-50/20'} space-y-4 transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-bold text-base text-gray-900">${req.participantName}</h3>
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }">
                            ${isApproved ? 'Approved' : isRejected ? 'Declined' : 'Pending Review'}
                          </span>
                        </div>
                        <p class="text-xs text-gray-600 mt-0.5">${req.participantCollege || 'Student'}</p>
                      </div>

                      <div class="text-left sm:text-right text-xs text-gray-500 font-mono">
                        <div>Requested: ${reqDate}</div>
                        ${req.verificationId ? `<div class="text-[#346BF1] font-bold">${req.verificationId}</div>` : ''}
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-gray-100">
                      <div class="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                        <div>
                          <span class="text-[10px] text-gray-400 uppercase font-semibold block">Participant Email</span>
                          <span class="font-mono text-gray-800 font-medium">${req.participantEmail}</span>
                        </div>
                        <button onclick="copyText('${req.participantEmail}', 'Email')" class="px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-[10px] font-bold text-[#346BF1] border border-gray-200">
                          Copy
                        </button>
                      </div>

                      <div class="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                        <div>
                          <span class="text-[10px] text-gray-400 uppercase font-semibold block">Game Concept Tested</span>
                          <span class="font-medium text-gray-800 truncate max-w-[200px] block">${prompt ? prompt.title : 'Custom Trial'}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded bg-blue-50 text-[#346BF1] font-bold text-[10px]">${prompt ? prompt.tag : 'Trial'}</span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap items-center gap-2 pt-2">
                      ${isPending ? `
                        <button onclick="approveCertRequest('${req.id}')" class="px-5 py-2.5 rounded-xl bg-[#346BF1] hover:bg-[#2851C6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors">
                          <i data-lucide="check" class="w-3.5 h-3.5"></i> Approve & Send to Mail
                        </button>
                        <button onclick="previewCertForRequest('${req.id}')" class="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5 transition-colors">
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i> Preview Certificate
                        </button>
                        <button onclick="rejectCertRequest('${req.id}')" class="px-4 py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 transition-colors">
                          Decline
                        </button>
                      ` : isApproved ? `
                        <button onclick="openEmailDispatchModalById('${req.id}')" class="px-5 py-2.5 rounded-xl bg-white border border-[#346BF1] text-[#346BF1] hover:bg-blue-50 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors">
                          <i data-lucide="mail" class="w-3.5 h-3.5"></i> Resend Email / Open Draft
                        </button>
                        <button onclick="previewCertForRequest('${req.id}')" class="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-gray-700 shadow-2xs flex items-center gap-1.5 transition-colors">
                          <i data-lucide="award" class="w-3.5 h-3.5"></i> View Issued Certificate
                        </button>
                      ` : `
                        <button onclick="reopenCertRequest('${req.id}')" class="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors">
                          Reopen Request
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // 3. ABOUT VIEW
  function renderAboutView() {
    const tiers = window.GSA_DATA.tiers.filter(t => !t.isStarter);
    const googleGradient = "bg-[linear-gradient(90deg,#EA4335,#FBBC04,#34A853,#4285F4)] bg-clip-text text-transparent";

    return `
      <div class="max-w-4xl mx-auto space-y-8 pb-12">
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold text-gray-900 tracking-tight">
            Google Gemini <br>
            <span class="${googleGradient}">Student Ambassador Program</span>
          </h1>
          <div class="text-gray-500 max-w-4xl mx-auto text-sm leading-relaxed space-y-4">
            <p>
              As a Google Student Ambassador, you'll have the opportunity to experience Google's latest AI tools firsthand, conduct meaningful workshops, and connect with a community of driven, like-minded students.
            </p>
          </div>
        </div>

        <div class="rounded-2xl shadow-xs border border-gray-200 overflow-hidden bg-white">
          <div class="w-full flex items-center justify-between p-4 bg-[#4285F4] text-white">
            <div class="flex items-center space-x-3">
              <i data-lucide="award" class="w-5 h-5"></i>
              <span class="font-semibold text-base">Reward Structure</span>
            </div>
          </div>

          <div class="p-6 bg-[#F8FAFF]">
            <div class="overflow-x-auto rounded-t-xl overflow-hidden border border-blue-200">
              <table class="w-full text-center border-collapse bg-[#E8F0FE] text-xs sm:text-sm">
                <thead>
                  <tr class="bg-[#4285F4] text-white font-medium">
                    <th class="p-3 border border-blue-300">Tier Category</th>
                    <th class="p-3 border border-blue-300">Points</th>
                    <th class="p-3 border border-blue-300">E- Vouchers & Physical Rewards</th>
                    <th class="p-3 border border-blue-300">Digital Rewards</th>
                  </tr>
                </thead>
                <tbody class="text-gray-800">
                  ${tiers.map((t, index) => {
                    const bg = index % 2 === 0 ? 'bg-[#F8FAFF]' : 'bg-[#E8F0FE]';
                    return `
                      <tr class="border-b border-white ${bg}">
                        <td class="p-3 border-r border-white font-bold text-gray-900 text-left pl-4">${t.name}</td>
                        <td class="p-3 border-r border-white font-bold text-[#346BF1]">${t.minPoints.toLocaleString()}</td>
                        <td class="p-3 border-r border-white font-medium">${t.rewards}</td>
                        <td class="p-3">
                          <div class="flex flex-col items-center justify-center gap-1">
                            <img src="${t.badge}" alt="${t.name}" class="w-10 h-10 object-contain">
                            <span class="text-[11px] text-gray-600 font-medium">${t.digitalRewards}</span>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="bg-[#4285F4] text-white p-4 text-xs rounded-b-xl">
              <div class="font-bold text-center mb-1 uppercase tracking-wider text-blue-100">Notes</div>
              <ul class="space-y-1 list-disc list-inside max-w-2xl mx-auto font-medium text-left">
                <li>The Certificate of Perseverance is for Semester 1 ambassadors continuing into Semester 2.</li>
                <li>The Certificate of Completion is for newly onboarded ambassadors who successfully complete the programme.</li>
                <li>Certificates will be given upon the completion of the programme.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. RESOURCES VIEW
  function renderResourcesView() {
    const resources = window.GSA_DATA.resources;
    const logos = window.GSA_DATA.logoAssets;

    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-12">
        <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-1">Resources</h1>
            <p class="text-xs text-gray-500">Official Google guides, survey forms, and tutorial drives.</p>
          </div>

          <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">Video Tutorials</span>
              <h3 class="font-bold text-gray-900 text-sm">Study Notebook Tutorial Videos</h3>
              <p class="text-xs text-gray-500">Access video guides on hosting campus sessions with Study Notebooks.</p>
            </div>
            <a href="https://drive.google.com/drive/folders/1kMIfA74eTwhtdb3NXB0-6q7PD8BLxeGV" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-full bg-[#346BF1] hover:bg-[#2851C6] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5">
              <span>Open Drive Folder</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>

          <div class="space-y-6">
            ${resources.map(sec => `
              <div class="space-y-3">
                <h3 class="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">${sec.section}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${sec.links.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl border ${
                      l.highlight ? 'border-[#346BF1] bg-blue-50/40' : 'border-gray-200 bg-white'
                    } hover:border-[#346BF1] transition-all flex items-center justify-between group text-xs">
                      <div>
                        <span class="text-[11px] text-gray-400 block">${l.label}</span>
                        <span class="font-bold text-gray-800 group-hover:text-[#346BF1]">${l.name}</span>
                      </div>
                      <i data-lucide="external-link" class="w-3.5 h-3.5 text-gray-400 group-hover:text-[#346BF1]"></i>
                    </a>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Brand Logo Files</h3>
            <a href="https://drive.google.com/drive/folders/1MlbJQMgm8CWpp03dKAgHeHCfbMnCMwYB" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-[#346BF1] hover:underline">
              All GSA Logos Drive ↗
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            ${logos.map(logo => `
              <div class="p-3 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between text-xs">
                <div class="h-16 flex items-center justify-center p-2 mb-2 bg-white rounded-lg">
                  <img src="${logo.path}" alt="${logo.name}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="truncate font-semibold text-gray-800">${logo.name}</div>
                <a href="${logo.path}" download class="text-[11px] font-bold text-[#346BF1] mt-1 hover:underline">Download</a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 5. MY SCORE VIEW
  function renderScoreView() {
    const p = AppState.profile;
    const tier = AppState.currentTier;
    const tasks = AppState.tasks;

    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-12">
        <div class="bg-[#1A73E8] rounded-3xl p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden shadow-sm">
          <div>
            <h2 class="text-3xl font-bold mb-1">${p.name}</h2>
            <div class="text-blue-100 text-sm mb-3">GID : ${p.gid}</div>
            <div class="inline-flex bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold">
              Current Score: ${AppState.totalScore} pts
            </div>
          </div>

          <div class="mt-4 md:mt-0 flex flex-col items-center">
            <img src="${tier.badge}" alt="${tier.name}" class="w-16 h-16 object-contain mb-1 ${tier.isStarter ? 'grayscale opacity-75' : ''}">
            <span class="text-xs font-bold uppercase tracking-wider text-white">${tier.name}</span>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-gray-900">Task Score Breakdown</h3>
          <div class="space-y-3">
            ${tasks.map(t => {
              const earned = AppState.calculateTaskScore(t);
              const max = t.maxPoints;
              const pct = Math.min(Math.round((earned / max) * 100), 100);
              return `
                <div class="p-3.5 rounded-xl border border-gray-100 bg-[#F8FAFF] space-y-1.5 text-xs">
                  <div class="flex justify-between items-center font-bold">
                    <span class="text-gray-800">${t.title}</span>
                    <span class="text-[#346BF1]">${earned} / ${max} pts</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-[#346BF1] rounded-full" style="width: ${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 6. LEADERBOARD VIEW
  function renderLeaderboardView() {
    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-12">
        <div class="bg-[#4285F4] rounded-3xl p-8 text-white shadow-sm">
          <h3 class="text-2xl font-bold mb-4">National Leaderboard</h3>
          <div class="bg-white p-8 rounded-2xl text-center text-gray-600 space-y-3">
            <p class="text-sm font-medium">No leaderboard data found. Sync the Google Sheet!</p>
          </div>
        </div>
      </div>
    `;
  }

  // Profile Modal for editing Ambassador name & GID
  window.openProfileModal = function() {
    const modal = document.getElementById('portal-modal');
    const p = AppState.profile;

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4 animate-modal">
        <div class="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 class="font-bold text-base text-gray-900">Edit Ambassador Profile</h3>
          <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Ambassador Name:</label>
            <input type="text" id="prof-name" value="${p.name}" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Google ID (GID):</label>
            <input type="text" id="prof-gid" value="${p.gid}" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">College / Campus:</label>
            <input type="text" id="prof-college" value="${p.college}" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onclick="saveProfile()" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#346BF1] hover:bg-[#2851C6]">Save</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
  };

  window.saveProfile = function() {
    AppState.profile.name = document.getElementById('prof-name').value.trim() || 'Rishi';
    AppState.profile.gid = document.getElementById('prof-gid').value.trim() || '965';
    AppState.profile.college = document.getElementById('prof-college').value.trim() || 'Campus Ambassador';
    AppState.save();
    closeModal();
    renderApp();
  };

  // Initial App Render
  renderApp();
});
