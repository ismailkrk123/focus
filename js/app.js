/**
 * FOCUSLAB — Master Application Controller & Interaction Engine
 * Features: VisionOS Optical Liquid Glass, Notch Auto-Hide on Scroll,
 * In-Place Logarithmic Zooming Calendar (1 & 2 Modes), Reorderable Drag Tasks,
 * Multi-Widget Fullscreen Study Room (Clock, Pomodoro, Stopwatch),
 * 7-Digit Online Study Room & Real-time Desk Friends, Dark Marketplace Cards,
 * and Gemini-Level Turkish AI Assistant Engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.appStore;
  const audio = window.soundEngine;

  let currentTab = store.data.activeTab || 'tasks';
  if (currentTab === 'settings') currentTab = 'tasks';

  let activeModal = null;
  let activeDetailTaskId = null;
  let zoomedCalendarDate = null;
  let zoomedCalendarMode = 'tasks'; // 'tasks' (Mode 1) or 'timeline' (Mode 2)
  let activeDenemeType = 'TYT';
  let sanctuaryActiveTab = 'tree';
  let activeShopCategory = 'ALL';

  // Pomodoro & Stopwatch
  let timerMode = 'work';
  let timerSecondsLeft = (store.data.pomodoro.workTime || 25) * 60;
  let timerTotalSeconds = (store.data.pomodoro.workTime || 25) * 60;
  let timerInterval = null;
  let isTimerRunning = false;

  // Library Internal Stopwatch
  let libStopwatchSeconds = 0;
  let libStopwatchInterval = null;
  let isLibStopwatchRunning = false;

  // Selected library study duration from protocol card
  let selectedLibraryDurationMinutes = 25;

  // Clock
  let clockInterval = null;

  // Drag Resizing
  let resizingCard = null;
  let startX = 0, startY = 0, startW = 0, startH = 0;
  let isResizing = false;

  // Drag Reordering for Tasks
  let draggedTaskId = null;

  // Showcase state for purchases
  let showcaseItems = [];
  let currentShowcaseIndex = 0;

  // BroadcastChannel for Real-Time Online Study Room & Desk Friends Sync
  let roomChannel = null;
  try {
    roomChannel = new BroadcastChannel('focuslab_room_sync');
    roomChannel.onmessage = handleRoomBroadcast;
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }

  // Wallpapers Map for Virtual Library
  const wallpapersMap = {
    'misty-mountain': 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85")',
    'rainy-forest': 'url("https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85")',
    'alpine-lake': 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=85")',
    'sunset-fjord': 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85")'
  };

  // --- INITIALIZATION ---
  initTheme();
  initLucideIcons();
  setupNavigation();
  setupScrollNotchHiding();
  setupFreeformResizing();
  setupAudioPlayer();
  setupEventListeners();
  startClock();
  initRoomCode();

  // First-Time User Check
  if (store.isFirstTimeUser()) {
    showOnboardingModal();
  } else {
    renderCurrentTab();
    updateNotchStatus();
  }

  store.subscribe(() => {
    updateNotchStatus();
  });

  function initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // --- 1. NOTCH AUTO-HIDE ON SCROLL (Sayfayı Kaydırınca Asla Üstü Kapatmaz) ---
  // =========================================================================
  function setupScrollNotchHiding() {
    const notch = document.getElementById('liquid-top-notch');
    if (!notch) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        notch.classList.add('scrolled-hidden');
      } else {
        notch.classList.remove('scrolled-hidden');
      }
    }, { passive: true });
  }

  // =========================================================================
  // --- 2. FIRST-TIME ONBOARDING FLOW (SIFIR DUMMY VERİ İLE TEMİZ BAŞLANGIÇ) ---
  // =========================================================================
  function showOnboardingModal() {
    const modal = document.getElementById('modal-onboarding');
    if (!modal) return;
    modal.classList.add('active');

    let chosenThemeMode = 'dark';
    const btnDark = document.getElementById('onboard-btn-theme-dark');
    const btnLight = document.getElementById('onboard-btn-theme-light');

    btnDark?.addEventListener('click', () => {
      chosenThemeMode = 'dark';
      btnDark.className = 'p-2.5 rounded-xl border border-sky-500 bg-sky-500/10 text-white font-semibold text-center transition';
      btnLight.className = 'p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-semibold text-center hover:text-white transition';
    });

    btnLight?.addEventListener('click', () => {
      chosenThemeMode = 'light';
      btnLight.className = 'p-2.5 rounded-xl border border-sky-500 bg-sky-500/10 text-white font-semibold text-center transition';
      btnDark.className = 'p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-semibold text-center hover:text-white transition';
    });

    const form = document.getElementById('form-onboarding');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('onboard-input-name').value.trim() || 'Öğrenci';
      const area = document.getElementById('onboard-select-area').value;
      const target = document.getElementById('onboard-input-target').value.trim() || 'Genel Odaklanma';

      store.completeOnboarding({
        name,
        targetTitle: area,
        targetDepartment: target,
        themeMode: chosenThemeMode
      });

      applyThemeMode(chosenThemeMode);
      modal.classList.remove('active');
      showNotification(`Focuslab'e hoş geldin, ${name}!`);
      updateNotchStatus();
      renderCurrentTab();
    });
  }

  // =========================================================================
  // --- 3. THEME & DIFFUSE ATMOSPHERE CONTROLLER ---
  // =========================================================================
  function initTheme() {
    applyThemeMode(store.data.themeMode || 'dark');
    applyThemeColors(store.data.theme || 'neutral');
  }

  function applyThemeMode(mode) {
    const body = document.body;
    const modeIcon = document.getElementById('icon-theme-mode');

    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      body.classList.add('theme-light');
      body.classList.remove('theme-dark');
      body.style.background = `radial-gradient(ellipse at 50% -10%, #eef2f8 0%, #f4f6fa 60%, #e9ecf2 100%)`;
      if (modeIcon) modeIcon.setAttribute('data-lucide', 'moon');
    } else {
      document.documentElement.classList.add('dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      if (modeIcon) modeIcon.setAttribute('data-lucide', 'sun');
      const theme = window.DEFAULT_THEMES[store.data.theme || 'neutral'] || window.DEFAULT_THEMES['neutral'];
      body.style.background = `radial-gradient(ellipse at 50% -10%, ${theme.bgViaDark} 0%, ${theme.bgDark} 80%, #030406 100%)`;
    }
    initLucideIcons();
  }

  function applyThemeColors(themeId) {
    const theme = window.DEFAULT_THEMES[themeId] || window.DEFAULT_THEMES['neutral'];
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-glow', theme.primaryGlow);

    if (store.data.themeMode !== 'light') {
      document.body.style.background = `radial-gradient(ellipse at 50% -10%, ${theme.bgViaDark} 0%, ${theme.bgDark} 80%, #030406 100%)`;
    }
  }

  function updateNotchStatus() {
    const name = store.data.userProfile.name || 'Focuslab';
    const statusText = document.getElementById('notch-user-status');
    if (statusText) {
      statusText.textContent = `${name} • Odakta`;
    }

    const coinEl = document.getElementById('library-bottom-coins');
    if (coinEl) coinEl.textContent = `${store.data.userProfile.focusCoins} 🪙`;
    const homeCoins = document.getElementById('home-focus-coins');
    if (homeCoins) homeCoins.textContent = `${store.data.userProfile.focusCoins} 🪙`;

    const libUserName = document.getElementById('library-user-name');
    if (libUserName) libUserName.textContent = name;
    const homeUserName = document.getElementById('home-user-name');
    if (homeUserName) homeUserName.textContent = name;
  }

  // =========================================================================
  // --- 4. NAVIGATION CONTROLLER ---
  // =========================================================================
  function setupNavigation() {
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-target');
        switchTab(target);
      });
    });

    document.getElementById('btn-open-settings')?.addEventListener('click', openSettingsModal);
  }

  function switchTab(tabId) {
    currentTab = tabId;
    store.setActiveTab(tabId);

    document.querySelectorAll('.nav-tab-pill').forEach(btn => {
      if (btn.getAttribute('data-tab-target') === tabId) {
        btn.classList.add('active-tab');
      } else {
        btn.classList.remove('active-tab');
      }
    });

    document.querySelectorAll('.view-tab').forEach(sec => sec.classList.add('hidden'));

    const activeSec = document.getElementById(`view-${tabId}`);
    if (activeSec) {
      activeSec.classList.remove('hidden');
    }

    renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderCurrentTab() {
    switch (currentTab) {
      case 'home':
        renderHomeView();
        break;
      case 'tasks':
        renderMinimalistFluidTasks();
        break;
      case 'events':
        renderEventsList();
        break;
      case 'todos':
        renderTodosList();
        break;
      case 'calendar':
        renderCalendar();
        break;
      case 'deneme':
        renderDenemeModule();
        break;
      case 'pomodoro':
        renderPomodoro();
        renderSpotifyTrackList();
        break;
    }
    initLucideIcons();
  }

  // =========================================================================
  // --- 5. VIEW: ANA SAYFA (HOME) ---
  // =========================================================================
  function renderHomeView() {
    const p = store.data.userProfile;
    document.getElementById('home-user-name').textContent = p.name || 'Öğrenci';
    document.getElementById('home-user-target').textContent = `${p.targetTitle} • ${p.targetDepartment}`;
    document.getElementById('home-today-focus-time').textContent = `${store.data.pomodoro.totalMinutesToday} dk`;
    document.getElementById('home-completed-tasks').textContent = store.data.stats.totalCompletedTasks || 0;
    document.getElementById('home-focus-coins').textContent = `${p.focusCoins} 🪙`;

    const rankEl = document.getElementById('home-target-rank-text');
    const scoreEl = document.getElementById('home-target-score-text');
    const schoolEl = document.getElementById('home-target-school-text');
    if (rankEl) rankEl.textContent = p.targetRank || 'Belirtilmedi';
    if (scoreEl) scoreEl.textContent = p.targetScore || 'Belirtilmedi';
    if (schoolEl) schoolEl.textContent = p.targetSchool || 'Belirtilmedi';
  }

  // =========================================================================
  // --- 6. VIEW: GÖREVLER (MAT KOYU YÜZEY, İNCE BEYAZ STROKE, REORDERABLE) ---
  // =========================================================================
  function renderMinimalistFluidTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const tasks = store.data.tasks || [];
    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="w-full py-16 text-center text-xs text-slate-400">
          <p class="mb-3">Henüz görev eklenmemiş. Yukarıdaki "+" butonuna basarak ekleyebilirsiniz.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => {
      const cardWidth = task.width || 320;
      const cardHeight = task.height || 140;
      const subtaskCount = (task.subtasks || []).length;
      const doneSubtaskCount = (task.subtasks || []).filter(s => s.done).length;

      return `
        <div class="task-fluid-card card-color-${task.color || 'neutral'}" 
          data-task-id="${task.id}" 
          draggable="true"
          style="width: ${cardWidth}px; min-height: ${cardHeight}px;">
          
          <div class="flex items-center justify-between gap-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" class="task-card-checkbox form-checkbox rounded border-white/20 bg-black/40 text-sky-500 focus:ring-0 cursor-pointer w-4 h-4" 
                data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
              <span class="text-[10px] font-mono font-semibold uppercase tracking-wider ${task.completed ? 'text-emerald-400' : 'text-slate-400'}">
                ${task.completed ? 'Tamamlandı' : (task.priority === 'high' ? '⚡ Yüksek' : '🔹 Görev')}
              </span>
            </label>

            <!-- 3-Dots Button: Opens Liquid Glass Task Details Panel -->
            <button class="btn-open-task-details p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition" 
              title="Ayrıntıları ve Yapılacakları Aç" data-task-id="${task.id}">
              <i data-lucide="more-horizontal" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="my-auto py-2">
            <h3 class="text-sm font-semibold tracking-tight leading-snug ${task.completed ? 'line-through opacity-50' : ''}">
              ${escapeHtml(task.title)}
            </h3>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span class="font-mono text-[11px]">
              ${task.durationMinutes || 25} dk
              ${subtaskCount > 0 ? `• (${doneSubtaskCount}/${subtaskCount})` : ''}
            </span>

            <button class="btn-task-quick-focus p-1 rounded-full text-sky-400 hover:text-white hover:bg-sky-500/20 transition" 
              title="Odaklan" data-duration="${task.durationMinutes || 25}">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
            </button>
          </div>

          <!-- Free-Form Drag Resize Handle -->
          <div class="fluid-resize-handle-se" title="Serbest Boyutlandır (Sürükle)">
            <svg class="w-3.5 h-3.5 text-slate-400 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15l-6 6M21 9l-12 12" />
            </svg>
          </div>

        </div>
      `;
    }).join('');

    // Attach Event Listeners
    container.querySelectorAll('.task-card-checkbox').forEach(box => {
      box.addEventListener('change', () => {
        const id = box.getAttribute('data-task-id');
        store.toggleTaskCompleted(id);
        renderMinimalistFluidTasks();
      });
    });

    container.querySelectorAll('.btn-open-task-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-task-id');
        openTaskDetailModal(id);
      });
    });

    container.querySelectorAll('.btn-task-quick-focus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dur = Number(btn.getAttribute('data-duration')) || 25;
        startPomodoroTimer(dur);
        switchTab('pomodoro');
      });
    });

    // Drag-and-drop Reordering Handlers
    setupTaskDragReordering(container);

    initLucideIcons();
  }

  function setupTaskDragReordering(container) {
    const cards = container.querySelectorAll('.task-fluid-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        if (e.target.closest('.fluid-resize-handle-se')) {
          e.preventDefault();
          return;
        }
        draggedTaskId = card.getAttribute('data-task-id');
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        cards.forEach(c => c.classList.remove('drag-over'));
        draggedTaskId = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetTaskId = card.getAttribute('data-task-id');

        if (draggedTaskId && targetTaskId && draggedTaskId !== targetTaskId) {
          const tasks = [...store.data.tasks];
          const fromIndex = tasks.findIndex(t => t.id === draggedTaskId);
          const toIndex = tasks.findIndex(t => t.id === targetTaskId);

          if (fromIndex !== -1 && toIndex !== -1) {
            const [movedItem] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, movedItem);
            store.reorderTasks(tasks);
            renderMinimalistFluidTasks();
          }
        }
      });
    });
  }

  // =========================================================================
  // --- 7. FREEFORM DRAG RESIZE ENGINE ---
  // =========================================================================
  function setupFreeformResizing() {
    document.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('.fluid-resize-handle-se');
      if (!handle) return;

      resizingCard = handle.closest('.task-fluid-card');
      if (!resizingCard) return;

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = resizingCard.offsetWidth;
      startH = resizingCard.offsetHeight;

      resizingCard.classList.add('is-resizing');
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('pointermove', (e) => {
      if (!isResizing || !resizingCard) return;

      requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newW = Math.max(220, Math.min(800, startW + deltaX));
        const newH = Math.max(120, Math.min(500, startH + deltaY));

        resizingCard.style.width = `${newW}px`;
        resizingCard.style.minHeight = `${newH}px`;
      });
    });

    document.addEventListener('pointerup', () => {
      if (!isResizing || !resizingCard) return;

      const taskId = resizingCard.getAttribute('data-task-id');
      const finalW = resizingCard.offsetWidth;
      const finalH = resizingCard.offsetHeight;

      resizingCard.classList.remove('is-resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      isResizing = false;

      if (taskId) {
        store.updateTask(taskId, { width: finalW, height: finalH });
      }
      resizingCard = null;
    });
  }

  // =========================================================================
  // --- 8. VIEW: ETKİNLİKLER & TO-DO LİSTELERİ ---
  // =========================================================================
  function renderEventsList() {
    const container = document.getElementById('events-list-container');
    if (!container) return;

    const events = (store.data.tasks || []).filter(t => t.isEvent || t.time);
    if (events.length === 0) {
      container.innerHTML = `<div class="py-12 text-center text-xs text-slate-400">Kayıtlı etkinlik bulunmuyor.</div>`;
      return;
    }

    container.innerHTML = events.map(ev => `
      <div class="glass-panel p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 font-mono text-xs font-bold">${ev.time || '10:00'}</span>
          <div>
            <h4 class="text-xs font-semibold text-white">${escapeHtml(ev.title)}</h4>
            <span class="text-[11px] text-slate-400 font-mono">${ev.date || 'Tarih belirtilmedi'} • ${ev.durationMinutes || 45} dk</span>
          </div>
        </div>
        <button class="btn-open-task-details p-1.5 rounded-full text-slate-400 hover:text-white" data-task-id="${ev.id}">
          <i data-lucide="more-horizontal" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-open-task-details').forEach(btn => {
      btn.addEventListener('click', () => openTaskDetailModal(btn.getAttribute('data-task-id')));
    });
  }

  function renderTodosList() {
    const container = document.getElementById('todos-list-container');
    if (!container) return;

    const todos = store.data.todos || [];
    if (todos.length === 0) {
      container.innerHTML = `<div class="py-8 text-center text-xs text-slate-400">Henüz yapılacak bir to-do öğesi eklenmedi.</div>`;
      return;
    }

    container.innerHTML = todos.map(todo => `
      <div class="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs">
        <label class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none">
          <input type="checkbox" class="todo-quick-toggle form-checkbox rounded text-sky-500 bg-black/40 border-white/20 cursor-pointer" 
            data-todo-id="${todo.id}" ${todo.done ? 'checked' : ''}>
          <span class="${todo.done ? 'line-through text-slate-400' : 'text-slate-200'} truncate">${escapeHtml(todo.text)}</span>
        </label>
        <button class="btn-del-todo text-slate-400 hover:text-rose-400 p-1 transition" data-todo-id="${todo.id}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.todo-quick-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-todo-id');
        const item = store.data.todos.find(t => t.id === id);
        if (item) {
          item.done = !item.done;
          store.save();
          renderTodosList();
        }
      });
    });

    container.querySelectorAll('.btn-del-todo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-todo-id');
        store.data.todos = store.data.todos.filter(t => t.id !== id);
        store.save();
        renderTodosList();
      });
    });
  }

  // =========================================================================
  // --- 9. TASK DETAILS MODAL CONTROLLER ---
  // =========================================================================
  function openTaskDetailModal(taskId) {
    const task = (store.data.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    activeDetailTaskId = taskId;
    document.getElementById('detail-task-title').textContent = task.title;
    document.getElementById('detail-task-desc').textContent = task.description || 'Açıklama belirtilmemiş.';

    renderDetailSubtasks(task);

    const modal = document.getElementById('modal-task-detail');
    modal.classList.add('active');
    activeModal = modal;
  }

  function renderDetailSubtasks(task) {
    const container = document.getElementById('detail-subtasks-container');
    if (!container) return;

    const subtasks = task.subtasks || [];
    if (subtasks.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-1">Alt görev bulunmuyor.</p>`;
    } else {
      container.innerHTML = subtasks.map(st => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 text-xs">
          <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
            <input type="checkbox" class="detail-st-toggle form-checkbox rounded border-white/20 bg-black/40 text-sky-500 cursor-pointer" 
              data-st-id="${st.id}" ${st.done ? 'checked' : ''}>
            <span class="${st.done ? 'line-through text-slate-400' : ''} truncate">${escapeHtml(st.text)}</span>
          </label>
          <button class="btn-del-detail-st text-slate-400 hover:text-rose-400 p-0.5" data-st-id="${st.id}">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      container.querySelectorAll('.detail-st-toggle').forEach(input => {
        input.addEventListener('change', () => {
          const stId = input.getAttribute('data-st-id');
          const st = task.subtasks.find(s => s.id === stId);
          if (st) {
            st.done = input.checked;
            store.save();
            renderMinimalistFluidTasks();
          }
        });
      });

      container.querySelectorAll('.btn-del-detail-st').forEach(btn => {
        btn.addEventListener('click', () => {
          const stId = btn.getAttribute('data-st-id');
          task.subtasks = task.subtasks.filter(s => s.id !== stId);
          store.save();
          renderDetailSubtasks(task);
          renderMinimalistFluidTasks();
        });
      });
    }
  }

  // =========================================================================
  // --- 10. TAKVİM (LOGARİTMİK YAKINLAŞMA & DİĞER GÜNLERİN KÜÇÜLMESİ) ---
  // =========================================================================
  function renderCalendar() {
    const container = document.getElementById('calendar-days-container');
    if (!container) return;

    const totalDays = 31;
    const startOffset = 3;
    const completedDates = store.data.completedDates || [];

    if (zoomedCalendarDate) {
      container.classList.add('calendar-has-zoomed-day');
    } else {
      container.classList.remove('calendar-has-zoomed-day');
    }

    let cellsHtml = '';
    for (let i = 0; i < startOffset; i++) {
      cellsHtml += `<div class="opacity-10 rounded-2xl border border-white/5 p-2 min-h-[70px]"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
      const isCompleted = completedDates.includes(dateStr);
      const isToday = day === 22;
      const isZoomed = zoomedCalendarDate === dateStr;

      const dayTasks = (store.data.tasks || []).filter(t => t.date === dateStr);

      if (isZoomed) {
        // Logarithmically Enlarged Focal Day with 1 & 2 Simple Mode Switchers
        cellsHtml += `
          <div class="calendar-zoomed-day" data-date="${dateStr}">
            <!-- Zoomed Header -->
            <div class="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-white">${day} Ekim 2026</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">${dayTasks.length} Görev</span>
              </div>
              <div class="flex items-center gap-1.5">
                <!-- Simple 1 and 2 Buttons for Modes -->
                <button class="btn-cal-zoom-mode-1 px-3 py-1 rounded-full text-xs font-bold transition ${zoomedCalendarMode === 'tasks' ? 'bg-sky-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'}">
                  1
                </button>
                <button class="btn-cal-zoom-mode-2 px-3 py-1 rounded-full text-xs font-bold transition ${zoomedCalendarMode === 'timeline' ? 'bg-sky-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'}">
                  2
                </button>
                <button class="btn-close-calendar-zoom p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition" title="Küçült">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <!-- Content Container -->
            <div class="overflow-y-auto pr-1 flex-1 space-y-2">
              ${zoomedCalendarMode === 'tasks' 
                ? (dayTasks.length === 0 
                    ? `<p class="text-xs text-slate-400 py-6 text-center">Bu gün için atanmış görev bulunmuyor.</p>` 
                    : dayTasks.map(t => `
                        <div class="calendar-mini-task-card card-color-${t.color || 'neutral'}">
                          <div class="flex items-center justify-between">
                            <span class="text-[9px] font-mono font-semibold uppercase ${t.completed ? 'text-emerald-400' : 'text-slate-400'}">
                              ${t.completed ? '✓ Tamamlandı' : '🔹 Görev'}
                            </span>
                            <span class="text-[9px] font-mono text-slate-400">${t.durationMinutes || 25} dk</span>
                          </div>
                          <span class="text-xs font-semibold text-white truncate block mt-0.5">${escapeHtml(t.title)}</span>
                        </div>
                      `).join(''))
                : `
                  <div class="space-y-1">
                    ${['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(hour => {
                      const taskAtHour = dayTasks.find(t => t.time && t.time.startsWith(hour.slice(0, 2)));
                      return `
                        <div class="flex items-center gap-2 py-1 border-b border-white/5 text-xs">
                          <span class="font-mono text-[10px] font-bold text-sky-400 w-12">${hour}</span>
                          <div class="flex-1">
                            ${taskAtHour 
                              ? `<div class="calendar-mini-task-card card-color-${taskAtHour.color || 'neutral'} py-1 px-2 text-[11px] font-semibold text-white truncate">${escapeHtml(taskAtHour.title)}</div>` 
                              : `<span class="text-[10px] text-slate-500 italic">Serbest Zaman</span>`
                            }
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `
              }
            </div>
          </div>
        `;
      } else {
        // Normal Day Cell (Logarithmically scales down when another day is zoomed)
        cellsHtml += `
          <div class="calendar-day-cell ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/10' : ''} ${isToday ? 'ring-1.5 ring-sky-500' : ''}"
            data-date="${dateStr}">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-mono font-bold ${isCompleted ? 'line-through text-emerald-400' : ''}">${day}</span>
              ${isCompleted ? '<span class="text-xs text-emerald-400 font-bold">✓</span>' : ''}
            </div>
            <div class="space-y-1">
              ${dayTasks.slice(0, 2).map(t => `
                <div class="text-[10px] px-1.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-200 truncate">${escapeHtml(t.title)}</div>
              `).join('')}
              ${dayTasks.length > 2 ? `<span class="text-[9px] text-slate-400 block font-mono">+${dayTasks.length - 2} daha</span>` : ''}
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = cellsHtml;

    container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.getAttribute('data-date');
        zoomedCalendarDate = date;
        renderCalendar();
      });
    });

    const closeBtn = container.querySelector('.btn-close-calendar-zoom');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomedCalendarDate = null;
      renderCalendar();
    });

    const mode1Btn = container.querySelector('.btn-cal-zoom-mode-1');
    mode1Btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomedCalendarMode = 'tasks';
      renderCalendar();
    });

    const mode2Btn = container.querySelector('.btn-cal-zoom-mode-2');
    mode2Btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomedCalendarMode = 'timeline';
      renderCalendar();
    });

    initLucideIcons();
  }

  // =========================================================================
  // --- 11. DENEMELER (YKS / TYT & AYT) ---
  // =========================================================================
  function renderDenemeModule() {
    const listContainer = document.getElementById('denemeler-list-container');
    const barsContainer = document.getElementById('deneme-trend-bars');
    const latestNetEl = document.getElementById('deneme-latest-net');
    if (!listContainer || !barsContainer) return;

    const filtered = (store.data.denemeler || []).filter(d => d.type === activeDenemeType);

    if (filtered.length === 0) {
      listContainer.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">Henüz ${activeDenemeType} denemesi kaydedilmemiş.</p>`;
      barsContainer.innerHTML = `<p class="text-xs text-slate-500 m-auto">Kayıtlı veri yok</p>`;
      if (latestNetEl) latestNetEl.textContent = '0.00 Net';
      return;
    }

    const latest = filtered[filtered.length - 1];
    if (latestNetEl) latestNetEl.textContent = `${latest.netTotal.toFixed(2)} Net`;

    listContainer.innerHTML = filtered.slice().reverse().map(d => `
      <div class="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <h4 class="text-xs font-semibold text-white">${escapeHtml(d.title)}</h4>
          <span class="text-[11px] text-slate-400 font-mono">${d.date} • ${d.type}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-mono font-bold text-sky-400">${d.netTotal.toFixed(2)} Net</span>
          <button class="btn-del-deneme text-slate-400 hover:text-rose-400 p-1" data-deneme-id="${d.id}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `).join('');

    listContainer.querySelectorAll('.btn-del-deneme').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-deneme-id');
        store.deleteDeneme(id);
        renderDenemeModule();
      });
    });

    const maxNet = activeDenemeType === 'TYT' ? 120 : 80;
    barsContainer.innerHTML = filtered.slice(-7).map(d => {
      const heightPercent = Math.max(12, Math.round((d.netTotal / maxNet) * 100));
      return `
        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span class="text-[10px] font-mono font-bold text-sky-300">${d.netTotal.toFixed(1)}</span>
          <div class="w-full max-w-[26px] bg-white/5 rounded-xl overflow-hidden flex flex-col justify-end p-0.5" style="height: 100px;">
            <div class="w-full rounded-lg bg-sky-500 transition-all duration-300" style="height: ${heightPercent}%;"></div>
          </div>
          <span class="text-[9px] font-mono text-slate-400 truncate max-w-[48px]">${d.date.slice(5)}</span>
        </div>
      `;
    }).join('');

    initLucideIcons();
  }

  // =========================================================================
  // --- 12. POMODORO & AMBİYANS SES SİSTEMİ ---
  // =========================================================================
  function renderPomodoro() {
    updateTimerDisplay();
  }

  function startPomodoroTimer(minutes) {
    timerSecondsLeft = minutes * 60;
    timerTotalSeconds = minutes * 60;
    updateTimerDisplay();
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      document.getElementById('btn-pomodoro-toggle').innerHTML = `<i data-lucide="play" class="w-4 h-4 fill-current"></i><span>Başlat</span>`;
      broadcastRoomStatus('resting');
    } else {
      isTimerRunning = true;
      document.getElementById('btn-pomodoro-toggle').innerHTML = `<i data-lucide="pause" class="w-4 h-4 fill-current"></i><span>Durdur</span>`;
      broadcastRoomStatus('working');
      timerInterval = setInterval(() => {
        if (timerSecondsLeft > 0) {
          timerSecondsLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          isTimerRunning = false;
          audio.playChime('complete');
          store.logCompletedSession(Math.round(timerTotalSeconds / 60));
          showNotification('🎉 Odaklanma oturumu tamamlandı! Ağacınız büyüdü.');
          broadcastRoomStatus('resting');
          renderPomodoro();
        }
      }, 1000);
    }
    initLucideIcons();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSecondsLeft = timerTotalSeconds;
    updateTimerDisplay();
    document.getElementById('btn-pomodoro-toggle').innerHTML = `<i data-lucide="play" class="w-4 h-4 fill-current"></i><span>Başlat</span>`;
    broadcastRoomStatus('idle');
    initLucideIcons();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('pomodoro-time-display');
    if (el) el.textContent = str;

    const libPomoEl = document.getElementById('library-pomo-display');
    if (libPomoEl) libPomoEl.textContent = str;
  }

  function renderSpotifyTrackList() {
    const container = document.getElementById('spotify-tracks-list-container');
    if (!container) return;

    const tracks = audio.getTracks();
    const current = audio.getCurrentTrack();

    container.innerHTML = tracks.map(tr => {
      const isCur = tr.id === current.id;
      return `
        <div class="p-3 rounded-2xl border ${isCur && audio.isPlaying ? 'border-sky-500 bg-sky-500/10' : 'border-white/5 bg-white/[0.02]'} flex items-center justify-between cursor-pointer hover:border-white/15 transition"
          data-track-id="${tr.id}">
          <div class="flex items-center gap-3">
            <span class="text-xl">${tr.icon}</span>
            <div>
              <h4 class="text-xs font-semibold text-white">${escapeHtml(tr.name)}</h4>
              <p class="text-[11px] text-slate-400">${escapeHtml(tr.desc)}</p>
            </div>
          </div>
          <button class="p-2 rounded-full ${isCur && audio.isPlaying ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300'} transition">
            <i data-lucide="${isCur && audio.isPlaying ? 'pause' : 'play'}" class="w-3.5 h-3.5 fill-current"></i>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-track-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-track-id');
        if (audio.currentTrackId === id && audio.isPlaying) {
          audio.pause();
        } else {
          audio.playTrack(id);
        }
        renderSpotifyTrackList();
      });
    });

    initLucideIcons();
  }

  function setupAudioPlayer() {
    audio.onStateChange = (state) => {
      const miniTitle = document.getElementById('mini-player-title');
      const miniIcon = document.getElementById('mini-player-icon');
      const miniPlayIcon = document.getElementById('mini-player-toggle-icon');

      if (miniTitle) miniTitle.textContent = state.track.name;
      if (miniIcon) miniIcon.textContent = state.track.icon;
      if (miniPlayIcon) {
        miniPlayIcon.setAttribute('data-lucide', state.isPlaying ? 'pause' : 'play');
        initLucideIcons();
      }

      const libTrackName = document.getElementById('library-current-track-name');
      const libPlayIcon = document.getElementById('icon-library-music-play');
      if (libTrackName) libTrackName.textContent = state.track.name;
      if (libPlayIcon) {
        libPlayIcon.setAttribute('data-lucide', state.isPlaying ? 'pause' : 'play');
        initLucideIcons();
      }
    };

    document.getElementById('mini-player-toggle')?.addEventListener('click', () => {
      audio.togglePlay();
      renderSpotifyTrackList();
    });

    document.getElementById('mini-player-next')?.addEventListener('click', () => {
      const tracks = audio.getTracks();
      const idx = tracks.findIndex(t => t.id === audio.currentTrackId);
      const nextIdx = (idx + 1) % tracks.length;
      audio.playTrack(tracks[nextIdx].id);
      renderSpotifyTrackList();
    });

    document.getElementById('mini-player-prev')?.addEventListener('click', () => {
      const tracks = audio.getTracks();
      const idx = tracks.findIndex(t => t.id === audio.currentTrackId);
      const prevIdx = (idx - 1 + tracks.length) % tracks.length;
      audio.playTrack(tracks[prevIdx].id);
      renderSpotifyTrackList();
    });
  }

  // =========================================================================
  // --- 13. FULLSCREEN SANAL KÜTÜPHANE (MODÜLER EKLENTİLER & ODA ARKADAŞLARI) ---
  // =========================================================================
  function enterFullscreenLibrary() {
    const overlay = document.getElementById('fullscreen-library-overlay');
    if (!overlay) return;

    audio.pause();

    const wp = store.data.virtualLibrary.customWallpaperUrl || wallpapersMap[store.data.virtualLibrary.wallpaper] || wallpapersMap['misty-mountain'];
    overlay.style.backgroundImage = wp;

    const name = store.data.userProfile.name || 'Öğrenci';
    document.getElementById('library-user-name').textContent = name;
    document.getElementById('library-bottom-coins').textContent = `${store.data.userProfile.focusCoins} 🪙`;

    // Apply duration choice
    if (selectedLibraryDurationMinutes > 0) {
      startPomodoroTimer(selectedLibraryDurationMinutes);
    }

    renderLibraryWidgets();
    renderLibraryAmbientTracks();
    renderRoomFriendsList();

    overlay.classList.remove('hidden');
    broadcastRoomStatus('working');
  }

  function renderLibraryWidgets() {
    const active = store.data.virtualLibrary.activeWidgets || ['clock'];
    const clockEl = document.getElementById('library-widget-clock');
    const pomoEl = document.getElementById('library-widget-pomodoro');
    const swEl = document.getElementById('library-widget-stopwatch');

    if (clockEl) clockEl.classList.toggle('hidden', !active.includes('clock'));
    if (pomoEl) pomoEl.classList.toggle('hidden', !active.includes('pomodoro'));
    if (swEl) swEl.classList.toggle('hidden', !active.includes('stopwatch'));
  }

  function renderLibraryAmbientTracks() {
    const grid = document.getElementById('library-ambient-tracks-grid');
    if (!grid) return;

    const tracks = audio.getTracks();
    const current = audio.getCurrentTrack();

    grid.innerHTML = tracks.map(tr => `
      <div class="p-2 rounded-xl border ${tr.id === current.id && audio.isPlaying ? 'border-sky-500 bg-sky-500/15' : 'border-white/5 bg-white/5'} flex items-center justify-between cursor-pointer hover:border-white/20 transition text-xs"
        data-lib-track="${tr.id}">
        <div class="flex items-center gap-2 truncate">
          <span>${tr.icon}</span>
          <span class="text-white truncate">${escapeHtml(tr.name)}</span>
        </div>
        <i data-lucide="${tr.id === current.id && audio.isPlaying ? 'volume-2' : 'play'}" class="w-3.5 h-3.5 text-sky-400"></i>
      </div>
    `).join('');

    grid.querySelectorAll('[data-lib-track]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-lib-track');
        if (audio.currentTrackId === id && audio.isPlaying) {
          audio.pause();
        } else {
          audio.playTrack(id);
        }
        renderLibraryAmbientTracks();
      });
    });

    initLucideIcons();
  }

  function startClock() {
    clearInterval(clockInterval);
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }

  function updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');

    const showSec = store.data.virtualLibrary.showSeconds;
    const digitalEl = document.getElementById('library-digital-clock');
    if (digitalEl) {
      digitalEl.textContent = showSec ? `${hrs}:${mins}:${secs}` : `${hrs}:${mins}`;
    }
  }

  // Library Internal Stopwatch
  function toggleLibraryStopwatch() {
    const btn = document.getElementById('btn-lib-sw-toggle');
    const display = document.getElementById('library-stopwatch-display');

    if (isLibStopwatchRunning) {
      clearInterval(libStopwatchInterval);
      isLibStopwatchRunning = false;
      if (btn) btn.textContent = 'Başlat';
    } else {
      isLibStopwatchRunning = true;
      if (btn) btn.textContent = 'Durdur';
      libStopwatchInterval = setInterval(() => {
        libStopwatchSeconds++;
        const h = String(Math.floor(libStopwatchSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((libStopwatchSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(libStopwatchSeconds % 60).padStart(2, '0');
        if (display) display.textContent = `${h}:${m}:${s}`;
      }, 1000);
    }
  }

  // =========================================================================
  // --- 14. ONLINE STUDY ROOM & DESK FRIENDS (7-Haneli Kod & Gerçek Zamanlı) ---
  // =========================================================================
  function initRoomCode() {
    if (!store.data.virtualLibrary.roomCode) {
      const code = Math.floor(1000000 + Math.random() * 9000000).toString();
      store.setStudyRoomCode(code);
    }
    const display = document.getElementById('room-code-display');
    if (display) display.textContent = store.data.virtualLibrary.roomCode;
  }

  function broadcastRoomStatus(status) {
    if (!roomChannel) return;
    const roomCode = store.data.virtualLibrary.roomCode;
    const userName = store.data.userProfile.name || 'Öğrenci';

    roomChannel.postMessage({
      type: 'USER_PING',
      roomCode: roomCode,
      user: userName,
      status: status || (isTimerRunning ? 'working' : 'idle'),
      timestamp: Date.now()
    });
  }

  function handleRoomBroadcast(ev) {
    const data = ev.data;
    if (!data || data.roomCode !== store.data.virtualLibrary.roomCode) return;

    if (!store.data.studyRoom.friends) store.data.studyRoom.friends = [];
    const myName = store.data.userProfile.name || 'Öğrenci';
    if (data.user === myName) return;

    const existing = store.data.studyRoom.friends.find(f => f.name === data.user);
    if (existing) {
      existing.status = data.status;
      existing.lastPing = data.timestamp;
    } else {
      store.data.studyRoom.friends.push({
        id: 'fr_' + Date.now(),
        name: data.user,
        status: data.status,
        lastPing: data.timestamp
      });
    }

    renderRoomFriendsList();
  }

  function renderRoomFriendsList() {
    const container = document.getElementById('library-room-friends-area');
    if (!container) return;

    const friends = store.data.studyRoom.friends || [];
    if (friends.length === 0) {
      container.innerHTML = `
        <div class="text-[11px] text-slate-400 font-mono py-2 opacity-60">
          Oda Kodu: <strong class="text-sky-300 font-bold">${store.data.virtualLibrary.roomCode}</strong> • Arkadaşların katıldığında burada görünecek.
        </div>
      `;
      return;
    }

    container.innerHTML = friends.map(friend => {
      const isWorking = friend.status === 'working';
      const isResting = friend.status === 'resting';
      const statusClass = isWorking ? 'status-pulse-green' : (isResting ? 'status-pulse-orange' : 'status-pulse-idle');
      const statusText = isWorking ? 'Çalışıyor' : (isResting ? 'Dinleniyor' : 'Masada');

      return `
        <div class="study-friend-desk">
          <!-- Minimalist Vector Student & Desk Graphic -->
          <svg class="w-10 h-10 text-slate-300" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 36h20M24 16a5 5 0 100-10 5 5 0 000 10zM15 28c0-5 4-8 9-8s9 3 9 8M8 36v6M40 36v6" stroke-linecap="round"/>
            <rect x="18" y="28" width="12" height="7" rx="1.5" stroke="currentColor"/>
          </svg>
          <span class="text-xs font-semibold text-white tracking-tight">${escapeHtml(friend.name)}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="${statusClass}"></span>
            <span class="text-[10px] text-slate-400 font-mono">${statusText}</span>
          </div>
          <button class="btn-save-friend mt-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 transition"
            data-friend-name="${escapeHtml(friend.name)}">
            + Arkadaş Ekle
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-save-friend').forEach(btn => {
      btn.addEventListener('click', () => {
        const friendName = btn.getAttribute('data-friend-name');
        if (store.addSavedFriend(friendName)) {
          showNotification(`${friendName} arkadaş listenize eklendi!`);
          btn.textContent = '✓ Eklendi';
          btn.classList.add('text-emerald-400');
        } else {
          showNotification('Bu kullanıcı zaten listenizde.');
        }
      });
    });
  }

  // =========================================================================
  // --- 15. 3D TREE CANVAS FRACTAL & MARKETPLACE ---
  // =========================================================================
  function draw3DTreeCanvas() {
    const canvas = document.getElementById('tree-canvas-3d');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0d14');
    grad.addColorStop(1, '#05070a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.ellipse(w / 2, h - 35, 150, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    const focusMins = store.data.virtualLibrary.totalFocusMinutes || 0;
    const maxBranchDepth = Math.min(8, 3 + Math.floor(focusMins / 45));
    const startLength = Math.min(68, 42 + Math.floor(focusMins / 35));

    function drawBranch(startX, startY, len, angle, depth) {
      ctx.beginPath();
      ctx.save();
      ctx.strokeStyle = depth > 4 ? '#38bdf8' : '#64748b';
      ctx.lineWidth = Math.max(1, depth * 0.9);
      ctx.translate(startX, startY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      if (depth === 0) {
        ctx.beginPath();
        ctx.arc(0, -len, 4, 0, Math.PI * 2);
        ctx.fillStyle = focusMins > 120 ? '#ec4899' : '#10b981';
        ctx.fill();
        ctx.restore();
        return;
      }

      drawBranch(0, -len, len * 0.76, -22, depth - 1);
      drawBranch(0, -len, len * 0.76, 22, depth - 1);
      ctx.restore();
    }

    drawBranch(w / 2, h - 38, startLength, 0, maxBranchDepth);
  }

  function switchSanctuaryTab(tabName) {
    sanctuaryActiveTab = tabName;
    const tabs = ['tree', 'shop', 'cart', 'equip'];
    tabs.forEach(t => {
      document.getElementById(`pane-sanctuary-${t}`)?.classList.toggle('hidden', t !== tabName);
      const btn = document.getElementById(`tab-sanctuary-${t}`);
      if (btn) {
        if (t === tabName) {
          btn.className = 'px-4 py-1.5 rounded-full bg-sky-600 text-white font-semibold transition';
        } else {
          btn.className = 'px-4 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-white transition';
        }
      }
    });

    if (tabName === 'tree') {
      setTimeout(draw3DTreeCanvas, 50);
      const p = store.data.virtualLibrary;
      document.getElementById('tree-age-text').textContent = `${p.treeAgeWeeks} Hafta`;
      document.getElementById('tree-score-text').textContent = `${p.gardenScore} / 100`;

      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const prev2 = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

      const hist = store.data.focusHistoryByDate || {};
      document.getElementById('tree-history-today').textContent = `${hist[today] || 0} dk`;
      document.getElementById('tree-history-yesterday').textContent = `${hist[yesterday] || 0} dk`;
      document.getElementById('tree-history-prev2').textContent = `${hist[prev2] || 0} dk`;
    } else if (tabName === 'shop') {
      renderShopCatalog();
    } else if (tabName === 'cart') {
      renderCart();
    } else if (tabName === 'equip') {
      renderEquipment();
    }
  }

  // Marketplace: Koyu Liquid Glass Kartlar, Sade & Doğal İsimler
  function renderShopCatalog() {
    const grid = document.getElementById('shop-catalog-grid');
    if (!grid) return;

    let catalog = store.catalog || [];
    if (activeShopCategory !== 'ALL') {
      catalog = catalog.filter(item => item.category === activeShopCategory);
    }

    grid.innerHTML = catalog.map(item => `
      <div class="shop-product-card flex flex-col justify-between">
        <div>
          <div class="shop-icon-box">
            <span class="text-3xl">${item.icon}</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">${item.category}</span>
          <h4 class="text-xs font-bold text-white leading-snug">${escapeHtml(item.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${escapeHtml(item.desc)}</p>
        </div>

        <div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <span class="text-xs font-bold font-mono text-amber-400">${item.price} 🪙</span>
          <button class="btn-add-to-cart px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition"
            data-item-id="${item.id}">
            Sepete Ekle
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-item-id');
        store.addToCart(id);
        updateCartBadge();
        showNotification('Ürün sepete eklendi!');
      });
    });
  }

  function updateCartBadge() {
    const count = (store.data.cart || []).reduce((acc, c) => acc + c.quantity, 0);
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = count;
  }

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    if (!container) return;

    const cart = store.data.cart || [];
    if (cart.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">Sepetinizde ürün bulunmuyor.</p>`;
      if (totalEl) totalEl.textContent = '0 🪙';
      return;
    }

    container.innerHTML = cart.map(cartItem => {
      const prod = store.catalog.find(p => p.id === cartItem.id);
      if (!prod) return '';
      return `
        <div class="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${prod.icon}</span>
            <div>
              <h4 class="text-xs font-bold text-white">${escapeHtml(prod.name)}</h4>
              <span class="text-[11px] text-slate-400 font-mono">${prod.price} 🪙 • Adet: ${cartItem.quantity}</span>
            </div>
          </div>
          <button class="btn-del-cart-item text-slate-400 hover:text-rose-400 p-1" data-item-id="${prod.id}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = `${store.getCartTotal()} 🪙`;

    container.querySelectorAll('.btn-del-cart-item').forEach(btn => {
      btn.addEventListener('click', () => {
        store.removeFromCart(btn.getAttribute('data-item-id'));
        renderCart();
        updateCartBadge();
      });
    });

    initLucideIcons();
  }

  function launchPurchaseShowcase(products) {
    if (!products || products.length === 0) return;
    showcaseItems = products;
    currentShowcaseIndex = 0;
    renderShowcaseItem(0);

    const overlay = document.getElementById('modal-purchase-showcase');
    overlay?.classList.add('active');
  }

  function renderShowcaseItem(idx) {
    const item = showcaseItems[idx];
    if (!item) return;

    document.getElementById('showcase-item-icon').textContent = item.icon || '📦';
    document.getElementById('showcase-item-title').textContent = item.name;
    document.getElementById('showcase-item-desc').textContent = item.desc || 'Çalışma alanınıza eklendi.';
    document.getElementById('showcase-item-price').textContent = `${item.price} 🪙 Focus Coin`;
    document.getElementById('showcase-step-counter').textContent = `Ürün ${idx + 1} / ${showcaseItems.length}`;

    const nextBtn = document.getElementById('btn-showcase-next');
    if (idx === showcaseItems.length - 1) {
      nextBtn.innerHTML = `<span>Tamamla & Ekipmanlara Git</span><i data-lucide="check" class="w-3.5 h-3.5"></i>`;
    } else {
      nextBtn.innerHTML = `<span>Sonraki Ürünü Gör</span><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>`;
    }
    initLucideIcons();
  }

  function renderEquipment() {
    const grid = document.getElementById('owned-items-grid');
    if (!grid) return;

    const owned = store.data.ownedItems || [];
    if (owned.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-xs text-slate-400 py-6 text-center">Henüz satın alınmış ekipmanınız bulunmuyor.</p>`;
    } else {
      grid.innerHTML = owned.map(id => {
        const prod = store.catalog.find(p => p.id === id);
        if (!prod) return '';
        return `
          <div class="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span class="text-3xl block mb-1">${prod.icon}</span>
            <span class="text-xs font-bold text-white block truncate">${escapeHtml(prod.name)}</span>
            <span class="text-[10px] text-sky-400 font-mono">${prod.category}</span>
          </div>
        `;
      }).join('');
    }

    const kbSlots = document.getElementById('set-keyboard-slots');
    if (kbSlots) {
      const kbParts = store.catalog.filter(i => i.setId === 'set-keyboard');
      kbSlots.innerHTML = kbParts.map(part => {
        const hasIt = owned.includes(part.id);
        return `
          <div class="p-2.5 rounded-xl border ${hasIt ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/5 opacity-40'}">
            <span class="text-xl block mb-1">${part.icon}</span>
            <span class="text-[10px] text-white block truncate">${escapeHtml(part.name)}</span>
            <span class="text-[9px] font-mono ${hasIt ? 'text-emerald-400' : 'text-slate-500'}">${hasIt ? 'Mevcut' : 'Eksik'}</span>
          </div>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // --- 16. SETTINGS MODAL & KÜTÜPHANE DÜZENLEYİCİ ---
  // =========================================================================
  function openSettingsModal() {
    const modal = document.getElementById('modal-settings');
    if (!modal) return;
    modal.classList.add('active');
    activeModal = modal;

    renderSettingsModalContent();
  }

  function renderSettingsModalContent() {
    const p = store.data.userProfile || {};
    const nameInput = document.getElementById('settings-input-name');
    const areaSelect = document.getElementById('settings-select-area');
    const rankInput = document.getElementById('settings-input-rank');
    const scoreInput = document.getElementById('settings-input-score');
    const schoolInput = document.getElementById('settings-input-school');

    if (nameInput) nameInput.value = p.name || 'Öğrenci';
    if (areaSelect && p.targetTitle) areaSelect.value = p.targetTitle;
    if (rankInput) rankInput.value = p.targetRank || '';
    if (scoreInput) scoreInput.value = p.targetScore || '';
    if (schoolInput) schoolInput.value = p.targetSchool || '';

    const grid = document.getElementById('theme-picker-grid');
    if (!grid) return;

    grid.innerHTML = Object.values(window.DEFAULT_THEMES).map(t => `
      <div class="p-3 rounded-2xl bg-white/5 border ${store.data.theme === t.id ? 'border-sky-500' : 'border-white/10'} cursor-pointer hover:border-white/20 transition flex items-center justify-between"
        data-theme="${t.id}">
        <div class="flex items-center gap-2.5">
          <div class="w-4 h-4 rounded-full" style="background: ${t.primary}"></div>
          <span class="text-xs font-semibold text-white">${escapeHtml(t.name)}</span>
        </div>
        ${store.data.theme === t.id ? '<span class="text-sky-400 text-xs font-bold">✓</span>' : ''}
      </div>
    `).join('');

    grid.querySelectorAll('[data-theme]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-theme');
        store.setTheme(id);
        applyThemeColors(id);
        renderSettingsModalContent();
      });
    });
  }

  // =========================================================================
  // --- 17. GEMINI-LEVEL TURKISH AI CONVERSATIONAL ENGINE ---
  // =========================================================================
  function generateGeminiResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('tyt') && (q.includes('net') || q.includes('nasıl') || q.includes('art'))) {
      return `### 🎯 TYT Netlerini Yükseltmek İçin Stratejik Yol Haritası:

1. **Türkçe Paragraf Rutini (Hedef: 35+ Net):**
   * Her sabah zihniniz en dinçken aralıksız **20 paragraf sorusu** çözün. Soruları okurken anahtar kelimelerin altını çizin ve şıklara geçmeden önce ana fikri aklınızda netleştirin.

2. **Temel Matematik & Problem Kampı:**
   * TYT Matematik bilgi sınavı değil, **okuduğunu hızlı anlama ve denkleme dökme** sınavıdır. Oran-orantı, sayı-kesir ve yüzde problemlerinden her gün en az 15-20 soru çözün.

3. **Fen Bilimleri Kolay Net Avı:**
   * Fizik (Optik ve Isı-Sıcaklık), Kimya (Maddenin Halleri ve Periyodik Sistem), Biyoloji (Kalıtım ve Hücre) konuları her yıl kesin soru gelen alanlardır. 2 haftalık nokta atışı tekrarla +8 net elde edebilirsiniz.

4. **Haftalık Branş Denemeleri:**
   * Genel deneme yerine **branş denemelerine** ağırlık verin. Yanlış yaptığınız her sorunun analizini yapıp konu eksiğinizi hemen aynı gün kapatın.`;
    }

    if (q.includes('matematik') || q.includes('geometri')) {
      return `### 📐 Matematik & Geometride Başarı Stratejisi:

* **Ezber Değil, Mantık:** Formülleri ezberlemek yerine nereden türetildiğini anlayın.
* **Turlama Taktiği:** Soruyla 2 dakikadan fazla inatlaşmayın. Yanına küçük bir işaret koyup sonraki soruya geçin; zihniniz arka planda çözümü işlemeye devam eder.
* **Geometride Görme Sanatı:** Geometri sorularında verilen her bilgiyi şeklin üzerine aktarın. Ek çizimler yaparken ikizkenar, eşkenar veya muhteşem üçlü kurallarını arayın.
* **Soru Defteri Tutun:** Yapamadığınız ve çözümünü video çözümden öğrendiğiniz soruları kesip yapıştırın, haftada bir tekrar gözden geçirin.`;
    }

    if (q.includes('pomodoro') || q.includes('kaç') || q.includes('saat') || q.includes('plan')) {
      return `### ⏱️ İdeal Günlük Odaklanma & Pomodoro Dağılımı:

* **Optimum Aralık:** Günde **6 ila 8 Pomodoro** (toplam 3 - 4 saat saf derin odak), verimsiz geçirilen 8 saatlik masa başı oyalanmasından %200 daha etkilidir.
* **Blok Düzeni:**
  * **Sabah:** 3 Pomodoro (Zorlayıcı konular: Matematik, Fizik)
  * **Öğleden Sonra:** 3 Pomodoro (Soru çözümü & Paragraf)
  * **Akşam:** 2 Pomodoro (Günlük genel tekrar & Deneme analizi)
* **Mola Disiplini:** 5 dakikalık molalarda kesinlikle sosyal medyaya girmeyin; su için, esneme hareketleri yapın ve gözlerinizi dinlendirin.`;
    }

    if (q.includes('kaygı') || q.includes('stres') || q.includes('motivasyon') || q.includes('yoruldum')) {
      return `### 🌿 Zihinsel Dinginlik ve Sınav Kaygısını Yönetme:

* **Sonuca Değil, Sürece Odaklan:** Sınav günü ne olacağını düşünmek stres yaratır. Senin kontrol edebileceğin tek an **şu an masada olduğun andır**.
* **Nefes Egzersizi (4-7-8 Tekniği):** Kaygının yükseldiğini hissettiğinde 4 saniye burnundan nefes al, 7 saniye tut ve 8 saniyede yavaşça ağzından ver. Kalp ritmin anında yavaşlayacaktır.
* **Kıyaslamayı Bırak:** Başkalarının netleri seni ilgilendirmiyor. Senin tek rakibin dünkü halin. Bugün dünden 1 soru bile fazla çözdüysen hedefine yaklaştın demektir.`;
    }

    // Comprehensive Default Academic / Productivity Response
    return `### 💡 Focuslab Danışmanı Yanıtı:

Sorduğunuz soru çalışma verimliliğiniz için oldukça kritik bir noktaya değiniyor:

* **Hedef Odaklı Çalışma:** Çalışmaya başlamadan önce bu 45 veya 25 dakikalık blokta *tam olarak neyi bitireceğinizi* netleştirin (Örn: "Hareket konusundan 2 test bitirilecek").
* **Çevre İzolasyonu:** Sanal Kütüphane moduna geçip tek bir ambiyans sesi (özellikle 432Hz Kozmik Dalga veya Yağmur) açmak, odaklanma sürenizi belirgin şekilde artıracaktır.
* **Gelişimi Takip Edin:** Odaklandığınız her dakika Ağacınızı büyütür ve Focus Coin kazandırır. Disiplin bir alışkanlıktır ve siz doğru adımları atıyorsunuz.

Başka bir ders, konu veya strateji hakkında detaylı planlama yapmak isterseniz sorabilirsiniz!`;
  }

  // =========================================================================
  // --- 18. EVENT LISTENERS & MODAL HANDLERS ---
  // =========================================================================
  function setupEventListeners() {
    // Mode toggles
    document.getElementById('btn-theme-mode-toggle')?.addEventListener('click', () => {
      const next = store.data.themeMode === 'light' ? 'dark' : 'light';
      store.setThemeMode(next);
      applyThemeMode(next);
      applyThemeColors(store.data.theme);
    });

    document.getElementById('settings-btn-dark-mode')?.addEventListener('click', () => {
      store.setThemeMode('dark');
      applyThemeMode('dark');
      applyThemeColors(store.data.theme);
    });

    document.getElementById('settings-btn-light-mode')?.addEventListener('click', () => {
      store.setThemeMode('light');
      applyThemeMode('light');
      applyThemeColors(store.data.theme);
    });

    // Save profile targets in settings
    document.getElementById('btn-save-settings-profile')?.addEventListener('click', () => {
      const name = document.getElementById('settings-input-name')?.value.trim();
      const area = document.getElementById('settings-select-area')?.value;
      const rank = document.getElementById('settings-input-rank')?.value.trim();
      const score = document.getElementById('settings-input-score')?.value.trim();
      const school = document.getElementById('settings-input-school')?.value.trim();

      store.updateProfileTargets({
        name: name || 'Öğrenci',
        targetTitle: area || 'YKS Sayısal',
        targetRank: rank,
        targetScore: score,
        targetSchool: school
      });

      closeModals();
      updateNotchStatus();
      renderHomeView();
      showNotification('Profil ve hedef bilgileri güncellendi.');
    });

    document.getElementById('btn-edit-home-target')?.addEventListener('click', openSettingsModal);

    // Kütüphane Canlı Düzenleme Butonu (Settings içindeki)
    document.getElementById('btn-open-library-customize')?.addEventListener('click', () => {
      closeModals();
      enterFullscreenLibrary();
    });

    // Dock Button (+) & New Task Modal
    document.getElementById('dock-btn-add')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-task');
      modal?.classList.add('active');
      activeModal = modal;
    });

    document.getElementById('btn-open-new-task-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-task');
      modal?.classList.add('active');
      activeModal = modal;
    });

    document.getElementById('btn-add-event')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-task');
      modal?.classList.add('active');
      activeModal = modal;
    });

    // Form Task Submit
    document.getElementById('form-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('input-task-title').value.trim();
      const desc = document.getElementById('input-task-desc').value.trim();
      const date = document.getElementById('input-task-date').value || new Date().toISOString().slice(0, 10);
      const time = document.getElementById('input-task-time').value || '10:00';
      const color = document.getElementById('select-task-color').value;
      const duration = Number(document.getElementById('input-task-duration').value) || 25;

      store.addTask({
        title,
        description: desc,
        date,
        time,
        color,
        durationMinutes: duration,
        isEvent: currentTab === 'events'
      });

      closeModals();
      e.target.reset();
      showNotification('Görev eklendi!');
      renderCurrentTab();
    });

    // Form Quick Todo Submit
    document.getElementById('form-quick-todo')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-quick-todo');
      const text = input.value.trim();
      if (text) {
        if (!store.data.todos) store.data.todos = [];
        store.data.todos.push({ id: 'todo_' + Date.now(), text, done: false });
        store.save();
        input.value = '';
        renderTodosList();
      }
    });

    // Add subtask in Task Details modal
    document.getElementById('input-detail-new-subtask')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = e.target.value.trim();
        if (text && activeDetailTaskId) {
          const task = store.data.tasks.find(t => t.id === activeDetailTaskId);
          if (task) {
            if (!task.subtasks) task.subtasks = [];
            task.subtasks.push({ id: 'st_' + Date.now(), text, done: false });
            store.save();
            e.target.value = '';
            renderDetailSubtasks(task);
            renderMinimalistFluidTasks();
          }
        }
      }
    });

    // Delete task in details modal
    document.getElementById('btn-detail-delete-task')?.addEventListener('click', () => {
      if (activeDetailTaskId) {
        store.deleteTask(activeDetailTaskId);
        closeModals();
        renderMinimalistFluidTasks();
        showNotification('Görev silindi.');
      }
    });

    // Deneme Exam Modal & Submit
    document.getElementById('btn-open-deneme-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-deneme');
      modal?.classList.add('active');
      activeModal = modal;
    });

    const dInput = document.getElementById('input-deneme-d');
    const yInput = document.getElementById('input-deneme-y');
    const netInput = document.getElementById('input-deneme-net');

    function calculateNet() {
      const d = Number(dInput?.value) || 0;
      const y = Number(yInput?.value) || 0;
      const net = Math.max(0, d - (y / 4));
      if (netInput) netInput.value = net.toFixed(2);
    }
    dInput?.addEventListener('input', calculateNet);
    yInput?.addEventListener('input', calculateNet);

    document.getElementById('form-deneme')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('input-deneme-type').value;
      const title = document.getElementById('input-deneme-title').value.trim();
      const netTotal = Number(document.getElementById('input-deneme-net').value) || 0;

      store.addDeneme({ type, title, netTotal });
      closeModals();
      e.target.reset();
      calculateNet();
      showNotification('Deneme sınavı kaydedildi!');
      renderDenemeModule();
    });

    document.getElementById('tab-deneme-tyt')?.addEventListener('click', () => {
      activeDenemeType = 'TYT';
      document.getElementById('tab-deneme-tyt').className = 'px-4 py-1.5 rounded-full text-xs font-semibold transition bg-sky-500/20 text-sky-300 border border-sky-500/30';
      document.getElementById('tab-deneme-ayt').className = 'px-4 py-1.5 rounded-full text-xs font-semibold transition text-slate-400 hover:text-white border border-white/5';
      renderDenemeModule();
    });

    document.getElementById('tab-deneme-ayt')?.addEventListener('click', () => {
      activeDenemeType = 'AYT';
      document.getElementById('tab-deneme-ayt').className = 'px-4 py-1.5 rounded-full text-xs font-semibold transition bg-sky-500/20 text-sky-300 border border-sky-500/30';
      document.getElementById('tab-deneme-tyt').className = 'px-4 py-1.5 rounded-full text-xs font-semibold transition text-slate-400 hover:text-white border border-white/5';
      renderDenemeModule();
    });

    // Kütüphane Etüt Protokolü Süre Seçicileri
    document.querySelectorAll('.lib-dur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lib-dur-btn').forEach(b => {
          b.className = 'lib-dur-btn p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition';
        });
        btn.className = 'lib-dur-btn p-2 rounded-xl border border-sky-500 bg-sky-500/20 text-white font-semibold transition';
        selectedLibraryDurationMinutes = Number(btn.getAttribute('data-library-duration')) || 25;
      });
    });

    // Fullscreen Library Start
    document.getElementById('btn-enter-fullscreen-library')?.addEventListener('click', enterFullscreenLibrary);

    document.getElementById('btn-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.add('active');
    });

    document.getElementById('btn-cancel-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.remove('active');
    });

    document.getElementById('btn-confirm-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.remove('active');
      document.getElementById('fullscreen-library-overlay')?.classList.add('hidden');
      document.getElementById('library-music-drawer')?.classList.remove('active');
      audio.pause();
      broadcastRoomStatus('resting');
    });

    // Preset Wallpaper Dropdown Change
    document.getElementById('select-library-wallpaper')?.addEventListener('change', (e) => {
      const val = e.target.value;
      store.updateLibrary({ wallpaper: val, customWallpaperUrl: '' });
      const overlay = document.getElementById('fullscreen-library-overlay');
      if (overlay) overlay.style.backgroundImage = wallpapersMap[val];
      showNotification('Doğa manzarası güncellendi.');
    });

    // Custom Wallpaper Upload
    document.getElementById('input-custom-wallpaper')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = `url("${ev.target.result}")`;
          store.updateLibrary({ customWallpaperUrl: url });
          const overlay = document.getElementById('fullscreen-library-overlay');
          if (overlay) overlay.style.backgroundImage = url;
          showNotification('Özel arka plan yüklendi!');
        };
        reader.readAsDataURL(file);
      }
    });

    // Library Dedicated Floating Music Drawer Toggle
    document.getElementById('btn-toggle-library-music')?.addEventListener('click', () => {
      const drawer = document.getElementById('library-music-drawer');
      drawer?.classList.toggle('active');
      renderLibraryAmbientTracks();
    });

    document.getElementById('btn-close-library-music')?.addEventListener('click', () => {
      document.getElementById('library-music-drawer')?.classList.remove('active');
    });

    document.getElementById('btn-library-music-toggle')?.addEventListener('click', () => {
      audio.togglePlay();
      renderLibraryAmbientTracks();
    });

    document.getElementById('range-library-volume')?.addEventListener('input', (e) => {
      audio.setMasterVolume(parseFloat(e.target.value));
    });

    // Library Widget Manager Modal (+ Butonu)
    document.getElementById('btn-manage-library-widgets')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-library-widgets');
      modal?.classList.add('active');
      activeModal = modal;

      const active = store.data.virtualLibrary.activeWidgets || ['clock'];
      const chkClock = document.getElementById('chk-widget-clock');
      const chkPomo = document.getElementById('chk-widget-pomodoro');
      const chkSw = document.getElementById('chk-widget-stopwatch');

      if (chkClock) chkClock.checked = active.includes('clock');
      if (chkPomo) chkPomo.checked = active.includes('pomodoro');
      if (chkSw) chkSw.checked = active.includes('stopwatch');
    });

    document.getElementById('btn-save-library-widgets')?.addEventListener('click', () => {
      const chkClock = document.getElementById('chk-widget-clock')?.checked;
      const chkPomo = document.getElementById('chk-widget-pomodoro')?.checked;
      const chkSw = document.getElementById('chk-widget-stopwatch')?.checked;

      const newWidgets = [];
      if (chkClock) newWidgets.push('clock');
      if (chkPomo) newWidgets.push('pomodoro');
      if (chkSw) newWidgets.push('stopwatch');

      if (newWidgets.length === 0) newWidgets.push('clock'); // at least 1 widget

      store.setLibraryWidgets(newWidgets);
      closeModals();
      renderLibraryWidgets();
      showNotification('Kütüphane eklentileri güncellendi.');
    });

    // Library Internal Pomodoro & Stopwatch Buttons
    document.getElementById('btn-lib-pomo-toggle')?.addEventListener('click', toggleTimer);
    document.getElementById('btn-lib-sw-toggle')?.addEventListener('click', toggleLibraryStopwatch);

    // Online Study Room & Friends Modal
    document.getElementById('btn-open-room-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-study-room');
      modal?.classList.add('active');
      activeModal = modal;
      const display = document.getElementById('room-code-display');
      if (display) display.textContent = store.data.virtualLibrary.roomCode;
    });

    document.getElementById('btn-copy-room-code')?.addEventListener('click', () => {
      const code = store.data.virtualLibrary.roomCode;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
        showNotification('Oda kodu kopyalandı: ' + code);
      }
    });

    document.getElementById('btn-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('input-join-room-code');
      const code = input?.value.trim();
      if (code && code.length >= 6) {
        store.setStudyRoomCode(code);
        initRoomCode();
        closeModals();
        showNotification(`${code} numaralı odaya katıldınız!`);
        broadcastRoomStatus(isTimerRunning ? 'working' : 'idle');
      } else {
        alert('Lütfen geçerli 7 haneli oda kodunu girin.');
      }
    });

    // Tree Sanctuary Modal
    document.getElementById('btn-open-tree-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-tree-forest');
      modal?.classList.add('active');
      activeModal = modal;
      document.getElementById('modal-coin-balance').textContent = store.data.userProfile.focusCoins;
      switchSanctuaryTab('tree');
      updateCartBadge();
    });

    document.getElementById('tab-sanctuary-tree')?.addEventListener('click', () => switchSanctuaryTab('tree'));
    document.getElementById('tab-sanctuary-shop')?.addEventListener('click', () => switchSanctuaryTab('shop'));
    document.getElementById('tab-sanctuary-cart')?.addEventListener('click', () => switchSanctuaryTab('cart'));
    document.getElementById('tab-sanctuary-equip')?.addEventListener('click', () => switchSanctuaryTab('equip'));

    // Shop Category Filter Pills
    document.querySelectorAll('#shop-category-filters [data-shop-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-shop-cat');
        activeShopCategory = cat;
        document.querySelectorAll('#shop-category-filters [data-shop-cat]').forEach(b => {
          b.className = 'px-3.5 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-white transition';
        });
        btn.className = 'px-3.5 py-1.5 rounded-full bg-sky-600 text-white font-semibold transition';
        renderShopCatalog();
      });
    });

    // Cart Checkout & Purchase Celebration Showcase
    document.getElementById('btn-checkout-cart')?.addEventListener('click', () => {
      const purchased = store.checkoutCart();
      if (purchased) {
        renderCart();
        updateCartBadge();
        document.getElementById('modal-coin-balance').textContent = store.data.userProfile.focusCoins;
        launchPurchaseShowcase(purchased);
      } else {
        alert('Yeterli Focus Coin bakiyeniz bulunmuyor veya sepetiniz boş!');
      }
    });

    // Showcase Next / Finish Button
    document.getElementById('btn-showcase-next')?.addEventListener('click', () => {
      if (currentShowcaseIndex < showcaseItems.length - 1) {
        currentShowcaseIndex++;
        renderShowcaseItem(currentShowcaseIndex);
      } else {
        document.getElementById('modal-purchase-showcase')?.classList.remove('active');
        switchSanctuaryTab('equip');
      }
    });

    // Keyboard Crafting
    document.getElementById('btn-craft-keyboard')?.addEventListener('click', () => {
      if (store.craftSet('set-keyboard')) {
        showNotification('🎉 Tebrikler! Bilgisayar Klavyesi üretildi (+250 🪙)');
        renderEquipment();
      } else {
        alert('Seti tamamlamak için tüm 4 parçaya sahip olmanız gerekmektedir.');
      }
    });

    // Pomodoro Controls
    document.getElementById('btn-pomodoro-toggle')?.addEventListener('click', toggleTimer);
    document.getElementById('btn-pomodoro-reset')?.addEventListener('click', resetTimer);

    document.querySelectorAll('[data-timer-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-timer-mode]').forEach(b => {
          b.className = 'px-4 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white';
        });
        btn.className = 'px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white';

        const mode = btn.getAttribute('data-timer-mode');
        timerMode = mode;
        if (mode === 'work') startPomodoroTimer(store.data.pomodoro.workTime || 25);
        else if (mode === 'shortBreak') startPomodoroTimer(store.data.pomodoro.shortBreak || 5);
        else if (mode === 'longBreak') startPomodoroTimer(store.data.pomodoro.longBreak || 15);
        else if (mode === 'stopwatch') {
          timerSecondsLeft = 0;
          timerTotalSeconds = 0;
          updateTimerDisplay();
        }
      });
    });

    // Floating AI Drawer
    document.getElementById('btn-floating-ai')?.addEventListener('click', () => {
      document.getElementById('drawer-ai-assistant')?.classList.toggle('active');
    });

    document.getElementById('btn-close-ai-drawer')?.addEventListener('click', () => {
      document.getElementById('drawer-ai-assistant')?.classList.remove('active');
    });

    // AI Quick Prompt Pills
    document.querySelectorAll('.ai-quick-prompt').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.textContent.trim();
        appendAiMessage('user', text);
        setTimeout(() => {
          const reply = generateGeminiResponse(text);
          appendAiMessage('assistant', reply);
        }, 400);
      });
    });

    document.getElementById('form-ai-chat')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = document.getElementById('input-ai-message');
      const val = inp.value.trim();
      if (!val) return;

      appendAiMessage('user', val);
      inp.value = '';

      setTimeout(() => {
        const reply = generateGeminiResponse(val);
        appendAiMessage('assistant', reply);
      }, 450);
    });

    // Danger: Reset All Data
    document.getElementById('btn-trigger-reset-all')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-reset-confirm');
      modal?.classList.add('active');
      activeModal = modal;
    });

    document.getElementById('btn-confirm-reset-all')?.addEventListener('click', () => {
      store.resetAllData();
      closeModals();
      showOnboardingModal();
      showNotification('Tüm veriler temizlendi ve Focuslab sıfırlandı.');
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });
  }

  function appendAiMessage(sender, text) {
    const box = document.getElementById('ai-chat-messages');
    if (!box) return;
    const isUser = sender === 'user';
    const msg = document.createElement('div');
    msg.className = `p-3 rounded-2xl ${isUser ? 'bg-sky-600/30 text-sky-100 ml-auto' : 'glass-panel text-slate-200'} max-w-[92%] leading-relaxed`;
    
    // Parse markdown-like bold and bullet lists
    let formatted = escapeHtml(text)
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-sky-300 text-xs mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*?)\n/g, '<li class="ml-3 list-disc my-0.5">$1</li>')
      .replace(/\n\n/g, '<br><br>');

    msg.innerHTML = `
      <span class="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">${isUser ? 'Sen' : 'Focuslab AI (Gemini)'}</span>
      <div class="space-y-1">${formatted}</div>
    `;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  function closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    activeModal = null;
    activeDetailTaskId = null;
  }

  function showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-[200] px-4 py-2 rounded-full glass-panel text-white text-xs font-semibold shadow-2xl flex items-center gap-2 transition-all duration-300 transform -translate-y-3 opacity-0';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400"></span><span>${escapeHtml(msg)}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = '-translate-y-3';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
