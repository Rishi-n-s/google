// Google Gemini Student Ambassador Portal Logic
// Role-Based Architecture: Ambassador vs. Student Participant

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const AppState = {
    role: localStorage.getItem('GSA_ROLE') || 'ambassador', // 'ambassador' | 'participant'
    profile: JSON.parse(localStorage.getItem('GSA_USER_PROFILE')) || { ...window.GSA_DATA.defaultProfile },
    tasks: JSON.parse(localStorage.getItem('GSA_USER_TASKS')) || JSON.parse(JSON.stringify(window.GSA_DATA.tasks)),
    currentTab: 'home',
    sidebarOpen: false,

    // Participant verification state
    participant: JSON.parse(localStorage.getItem('GSA_PARTICIPANT')) || {
      name: '',
      college: '',
      preSurveyFilled: false,
      trialDone: false,
      feedbackFilled: false,
      certificateIssued: false
    },

    save() {
      localStorage.setItem('GSA_ROLE', this.role);
      localStorage.setItem('GSA_USER_PROFILE', JSON.stringify(this.profile));
      localStorage.setItem('GSA_USER_TASKS', JSON.stringify(this.tasks));
      localStorage.setItem('GSA_PARTICIPANT', JSON.stringify(this.participant));
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
        scorePill.textContent = `Score: ${this.totalScore} pts`;
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

  window.AppState = AppState;

  // Role Switcher Handler
  window.setRole = function(newRole) {
    AppState.role = newRole;
    AppState.save();

    if (newRole === 'participant') {
      AppState.currentTab = 'participantHub';
    } else {
      AppState.currentTab = 'home';
    }

    renderApp();
    showToast(`Switched to ${newRole === 'ambassador' ? 'Ambassador Dashboard' : 'Student Participant Hub'}`);
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
      const items = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'resources', label: 'Resources' },
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
        <button onclick="AppState.reset()" class="flex items-center space-x-2 w-full px-5 py-3 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors rounded-2xl hover:bg-gray-50">
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
        <button onclick="setRole('ambassador')" class="flex items-center space-x-2 w-full px-5 py-3 text-[#346BF1] hover:bg-blue-50 text-xs font-bold transition-colors rounded-2xl">
          <i data-lucide="shield" class="w-4 h-4"></i>
          <span>Switch to Ambassador</span>
        </button>
      `;
    }
  }

  // Render Views
  function renderApp() {
    renderSidebar();
    AppState.updateHeader();
    const main = document.getElementById('main-content');

    if (AppState.role === 'participant') {
      main.innerHTML = renderParticipantHub();
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

  // 1. PARTICIPANT HUB (Product Trial Survey Links, Copy Details, Text Prompt & Certificate Generator)
  function renderParticipantHub() {
    const amb = AppState.profile;
    const sess = window.GSA_DATA.participantSession;
    const part = AppState.participant;

    const canIssue = part.preSurveyFilled && part.feedbackFilled && part.name.trim().length > 1;

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
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Ambassador Details for Your Form</h2>
              <p class="text-xs text-gray-500">Click the copy button next to each field to easily paste into the Google Form.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Workshop Theme</span>
                <span class="font-bold text-gray-900 text-sm truncate max-w-[220px] block">${sess.workshopTheme}</span>
              </div>
              <button onclick="copyText('${sess.workshopTheme}', 'Workshop Theme')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
              </button>
            </div>

            <div class="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Campus / College</span>
                <span class="font-bold text-gray-900 text-sm">${amb.college}</span>
              </div>
              <button onclick="copyText('${amb.college}', 'College')" class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#346BF1] text-xs font-bold text-[#346BF1] shadow-xs flex items-center gap-1.5 transition-colors">
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

        <!-- Section 4: Issue Your Official Certificate -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#346BF1] block">Verification & Generation</span>
              <h2 class="text-xl font-bold text-gray-900">Issue Your Certificate of Participation</h2>
            </div>
            ${canIssue ? `
              <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> Ready to Issue
              </span>
            ` : `
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1">
                <i data-lucide="lock" class="w-3.5 h-3.5"></i> Surveys Required
              </span>
            `}
          </div>

          <!-- Participant Identity Form -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Your Full Name (As it will appear on Certificate):</label>
              <input type="text" id="part-name" value="${part.name}" placeholder="e.g. John Doe" oninput="updateParticipantField('name', this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Your College / Institute:</label>
              <input type="text" id="part-college" value="${part.college}" placeholder="e.g. National Institute of Technology" oninput="updateParticipantField('college', this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#346BF1]">
            </div>
          </div>

          <!-- Certificate Action -->
          <div class="pt-2">
            ${canIssue ? `
              <button onclick="generateAndShowCertificate()" class="w-full sm:w-auto px-8 py-3 rounded-full bg-[#346BF1] hover:bg-[#2851C6] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                <i data-lucide="award" class="w-4 h-4"></i> Issue & Download My Certificate
              </button>
            ` : `
              <div class="p-3.5 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-4 h-4 text-gray-400 shrink-0"></i>
                <span>Please complete filling Step 1 (Pre-Survey) and Step 2 (Feedback Form) above and enter your name to unlock your certificate.</span>
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
    // Update button status live
    const canIssue = AppState.participant.preSurveyFilled && AppState.participant.feedbackFilled && AppState.participant.name.trim().length > 1;
    const btnContainer = document.querySelector('#main-content button[onclick*="generateAndShowCertificate"]');
    if (!canIssue && btnContainer) {
      renderApp();
    } else if (canIssue && !btnContainer) {
      renderApp();
    }
  };

  // Certificate Generator and Preview Modal
  window.generateAndShowCertificate = function() {
    const part = AppState.participant;
    const amb = AppState.profile;
    const sess = window.GSA_DATA.participantSession;
    const certDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = 'GSA-PT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const modal = document.getElementById('portal-modal');

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[95vh] overflow-y-auto animate-modal">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Verified Product Trial Completion</span>
            <h3 class="text-xl font-bold text-gray-900">Your Certificate of Participation</h3>
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
            <button onclick="downloadCertificateCanvas('${part.name}', '${certId}')" class="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#346BF1] hover:bg-[#2851C6] text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <i data-lucide="download" class="w-4 h-4"></i> Download Certificate (PNG)
            </button>
            <button onclick="window.print()" class="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5">
              <i data-lucide="printer" class="w-4 h-4"></i> Print
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();

    // Draw Certificate on Canvas
    setTimeout(() => {
      drawCertificate(part.name, part.college, amb.name, amb.gid, sess.workshopTheme, certDate, certId);
    }, 50);
  };

  function drawCertificate(studentName, college, ambName, ambGid, theme, dateStr, certId) {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Subtle background tint
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#FAFCFF');
    bgGrad.addColorStop(1, '#F0F5FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(40, 40, w - 80, h - 80);

    // Outer Border (Google Blue)
    ctx.strokeStyle = '#346BF1';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Inner Border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // Decorative 4-color top corner accent
    ctx.fillStyle = '#4285F4'; ctx.fillRect(48, 48, 120, 6);
    ctx.fillStyle = '#EA4335'; ctx.fillRect(168, 48, 120, 6);
    ctx.fillStyle = '#FBBC04'; ctx.fillRect(288, 48, 120, 6);
    ctx.fillStyle = '#34A853'; ctx.fillRect(408, 48, 120, 6);

    // Header Title
    ctx.fillStyle = '#346BF1';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOOGLE GEMINI STUDENT AMBASSADOR PROGRAM', w / 2, 130);

    // Main Certificate Header
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 54px Cinzel, serif, Outfit';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', w / 2, 210);

    // Divider line
    ctx.strokeStyle = '#346BF1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 160, 240);
    ctx.lineTo(w / 2 + 160, 240);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', w / 2, 310);

    // Student Name
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 64px Outfit, sans-serif';
    ctx.fillText(studentName || 'Student Participant', w / 2, 400);

    if (college) {
      ctx.fillStyle = '#4B5563';
      ctx.font = '500 22px Inter, sans-serif';
      ctx.fillText(`from ${college}`, w / 2, 445);
    }

    // Reason Text
    ctx.fillStyle = '#4B5563';
    ctx.font = '400 22px Inter, sans-serif';
    ctx.fillText('for successfully completing the hands-on Google Gemini Product Trial workshop:', w / 2, 530);

    // Workshop Theme
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 30px Outfit, sans-serif';
    ctx.fillText(theme, w / 2, 580);

    ctx.fillStyle = '#6B7280';
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillText('Exploring generative AI capabilities, multimodal prompting, and creative campus innovation.', w / 2, 625);

    // Signatures / Endorsements
    const sigY = 790;

    // Ambassador Signature Line
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(220, sigY);
    ctx.lineTo(520, sigY);
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ambName, 370, sigY + 35);
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText(`Google Student Ambassador (GID: ${ambGid})`, 370, sigY + 60);

    // Date & Verification
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w - 520, sigY);
    ctx.lineTo(w - 220, sigY);
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(dateStr, w - 370, sigY + 35);
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText(`Verified Certificate ID: ${certId}`, w - 370, sigY + 60);

    // Sparkle Logo in bottom center
    const sparkleImg = new Image();
    sparkleImg.src = 'assets/gemini-sparkle.png';
    sparkleImg.onload = () => {
      ctx.drawImage(sparkleImg, w / 2 - 36, 835, 72, 72);
    };

    ctx.fillStyle = '#346BF1';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('SHAPING THE FUTURE OF AI', w / 2, 925);
  }

  window.downloadCertificateCanvas = function(name, certId) {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const safeName = (name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
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
