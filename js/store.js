/**
 * FOCUSLAB — Core State Management & Data Persistence Engine
 * Zero dummy data, local-first storage, full persistence across sessions,
 * Simplified catalog, customizable library widgets, online room synchronization,
 * drag-and-drop reorderable tasks, and full reset capability.
 */

const STORAGE_KEY = 'focuslab_v1_data';

const DEFAULT_THEMES = {
  'neutral': {
    id: 'neutral',
    name: 'Neutral (Sade & Denge)',
    primary: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.15)',
    bgDark: '#08090c',
    bgViaDark: '#0e1017',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'deep-blue': {
    id: 'deep-blue',
    name: 'Deep Blue (Derin Lacivert)',
    primary: '#0ea5e9',
    primaryGlow: 'rgba(14, 165, 233, 0.18)',
    bgDark: '#040810',
    bgViaDark: '#091322',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'midnight': {
    id: 'midnight',
    name: 'Midnight (Karanlık Gece)',
    primary: '#818cf8',
    primaryGlow: 'rgba(129, 140, 248, 0.18)',
    bgDark: '#05060a',
    bgViaDark: '#0d0e18',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'violet': {
    id: 'violet',
    name: 'Cosmic Violet (Kozmik Mor)',
    primary: '#a855f7',
    primaryGlow: 'rgba(168, 85, 247, 0.18)',
    bgDark: '#08050e',
    bgViaDark: '#140c20',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'crimson': {
    id: 'crimson',
    name: 'Crimson Dusk (Kızıl Alacakaranlık)',
    primary: '#f43f5e',
    primaryGlow: 'rgba(244, 63, 94, 0.18)',
    bgDark: '#0b0407',
    bgViaDark: '#1c0a12',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'forest': {
    id: 'forest',
    name: 'Forest Emerald (Zümrüt Yeşili)',
    primary: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.18)',
    bgDark: '#040a07',
    bgViaDark: '#0a1710',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'ocean': {
    id: 'ocean',
    name: 'Ocean Breeze (Okyanus Esintisi)',
    primary: '#06b6d4',
    primaryGlow: 'rgba(6, 182, 212, 0.18)',
    bgDark: '#04090e',
    bgViaDark: '#081622',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'graphite': {
    id: 'graphite',
    name: 'Graphite Carbon (Mat Grafit)',
    primary: '#94a3b8',
    primaryGlow: 'rgba(148, 163, 184, 0.15)',
    bgDark: '#0a0a0c',
    bgViaDark: '#141418',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'soft-purple': {
    id: 'soft-purple',
    name: 'Soft Purple (Hafif Lavanta)',
    primary: '#c084fc',
    primaryGlow: 'rgba(192, 132, 252, 0.18)',
    bgDark: '#08060d',
    bgViaDark: '#120f1e',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  }
};

const MOTIVATION_QUOTES = [
  { text: "Zorluklar başarıya giden merdivenlerin basamaklarıdır.", author: "Mustafa Kemal Atatürk" },
  { text: "Bizi rahatsız eden şeyler olayların kendisi değil, onlara yüklediğimiz anlamlardır.", author: "Marcus Aurelius" },
  { text: "Zaman en kıymetli hazinedir; onu en değerli hedefin için harca.", author: "Seneca" },
  { text: "Dehanın yüzde biri ilham, yüzde doksan dokuzu terdir.", author: "Thomas Edison" },
  { text: "Gelecek, hedeflerinin güzelliğine inananlarındır.", author: "Eleanor Roosevelt" },
  { text: "Sadelik en yüksek gelişmişlik düzeyidir.", author: "Leonardo da Vinci" },
  { text: "Büyük başarılar, küçük adımların sabırla birikmesiyle doğar.", author: "Focuslab" },
  { text: "Bugün dünden biraz daha iyi ol.", author: "Focuslab" }
];

// Clean Initial State — Absolutely ZERO dummy data, pristine baseline
const EMPTY_INITIAL_STATE = {
  theme: 'neutral',
  themeMode: 'dark', // 'dark' or 'light'
  activeTab: 'tasks',

  userProfile: {
    name: '',
    targetTitle: '',
    targetDepartment: '',
    targetRank: '',
    targetScore: '',
    targetSchool: '',
    focusCoins: 50,
    isConfigured: false
  },

  tasks: [],
  events: [],
  todos: [],
  calendarSchedule: {},
  completedDates: [],
  denemeler: [],

  cart: [],
  ownedItems: [],
  assembledCrafts: [],

  virtualLibrary: {
    wallpaper: 'misty-mountain',
    customWallpaperUrl: '',
    // Multi-widget selection: 'clock', 'pomodoro', 'stopwatch'
    activeWidgets: ['clock'],
    showSeconds: false,
    blurLevel: 1,
    totalFocusMinutes: 0,
    treeAgeWeeks: 1,
    gardenScore: 0,
    roomCode: null // 7-digit shared study room code
  },

  studyRoom: {
    roomCode: null,
    friends: [] // [{ id, name, status: 'working'|'resting'|'idle', lastPing }]
  },

  savedFriends: [], // [{ id, name, addedAt }]

  focusHistoryByDate: {}, // { 'YYYY-MM-DD': minutesFocused } - strictly real user data

  pomodoro: {
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsCompletedToday: 0,
    totalMinutesToday: 0
  },

  stats: {
    weeklyFocusHours: [0, 0, 0, 0, 0, 0, 0],
    totalCompletedTasks: 0,
    streakDays: 0
  },

  aiChat: []
};

// Simplified, Natural Marketplace Catalog (No heavy jargon, clean & simple terms)
function generateCatalogItems() {
  const items = [];

  // Crafting Set 1: Bilgisayar Klavyesi Parçaları (4 Parça)
  items.push(
    { id: 'craft-kb-1', name: 'Klavye Kasası', category: 'Teknoloji', subCategory: 'Set Parçası', setId: 'set-keyboard', price: 250, icon: '⌨️', desc: 'Mat siyah alüminyum gövde.' },
    { id: 'craft-kb-2', name: 'Devre Kartı', category: 'Teknoloji', subCategory: 'Set Parçası', setId: 'set-keyboard', price: 200, icon: '🔌', desc: 'Hot-swap klavye kartı.' },
    { id: 'craft-kb-3', name: 'Sessiz Tuş Switchleri', category: 'Teknoloji', subCategory: 'Set Parçası', setId: 'set-keyboard', price: 180, icon: '🔘', desc: 'Akıcı basış sağlayan sarı switchler.' },
    { id: 'craft-kb-4', name: 'Mat Tuş Takımı', category: 'Teknoloji', subCategory: 'Set Parçası', setId: 'set-keyboard', price: 220, icon: '🔤', desc: 'Minimalist siyah tuş takımı.' }
  );

  // Crafting Set 2: Çalışma Masası Seti (4 Parça)
  items.push(
    { id: 'craft-set-1', name: 'Ekran Lambası', category: 'Çalışma Ekipmanları', subCategory: 'Set Parçası', setId: 'set-setup', price: 300, icon: '💡', desc: 'Monitör üstü gözü yormayan lamba.' },
    { id: 'craft-set-2', name: 'Ahşap Monitör Standı', category: 'Masa', subCategory: 'Set Parçası', setId: 'set-setup', price: 320, icon: '🪵', desc: 'Meşe ağacı yükseltici stand.' },
    { id: 'craft-set-3', name: 'Ergonomik Mouse', category: 'Çalışma Ekipmanları', subCategory: 'Set Parçası', setId: 'set-setup', price: 280, icon: '🖱️', desc: 'Bileği yormayan dikey mouse.' },
    { id: 'craft-set-4', name: 'Masa Matı', category: 'Aksesuarlar', subCategory: 'Set Parçası', setId: 'set-setup', price: 150, icon: '⬛', desc: 'Keçe büyük çalışma pedi.' }
  );

  // Simple, realistic everyday study objects
  const simpleProducts = [
    // Bitkiler
    { n: 'Saksı', c: 'Bitkiler', p: 120, ic: '🪴', d: 'Masaüstü için seramik saksı.' },
    { n: 'Mini Sukulent', c: 'Bitkiler', p: 90, ic: '🌵', d: 'Bakımı kolay küçük sukulent.' },
    { n: 'Bonsai Ağacı', c: 'Bitkiler', p: 350, ic: '🌳', d: 'Huzur veren minyatür ardıç ağacı.' },
    { n: 'Masa Sarmaşığı', c: 'Bitkiler', p: 140, ic: '🌿', d: 'Yeşil yapraklı sarkan bitki.' },
    { n: 'Kaktüs', c: 'Bitkiler', p: 80, ic: '🌵', d: 'Masa köşesi için minik kaktüs.' },
    { n: 'Fanus Bitkisi', c: 'Bitkiler', p: 210, ic: '🫙', d: 'Cam fanus içinde yeşil yosun.' },

    // Masa
    { n: 'Çalışma Masası', c: 'Masa', p: 750, ic: '🪵', d: 'Geniş meşe çalışma masası.' },
    { n: 'Ayarlı Masa', c: 'Masa', p: 920, ic: '⚙️', d: 'Yüksekliği ayarlanabilir masa.' },
    { n: 'Ahşap Çekmece', c: 'Masa', p: 260, ic: '🗄️', d: 'Masa altı 3 gözlü çekmece.' },
    { n: 'Masa Rafı', c: 'Masa', p: 180, ic: '🪜', d: 'Kitap ve defterler için raf.' },
    { n: 'Çalışma Taburesi', c: 'Masa', p: 310, ic: '🪑', d: 'Duruşu destekleyen ergonomik tabure.' },

    // Teknoloji
    { n: 'Bilgisayar Klavyesi', c: 'Teknoloji', p: 450, ic: '⌨️', d: 'Sessiz kompakt mekanik klavye.' },
    { n: 'Kablosuz Mouse', c: 'Teknoloji', p: 240, ic: '🖱️', d: 'Sessiz tıklamalı optik mouse.' },
    { n: 'Kulaklık', c: 'Teknoloji', p: 520, ic: '🎧', d: 'Dış sesleri kesen rahat kulaklık.' },
    { n: 'Masa Hoparlörü', c: 'Teknoloji', p: 380, ic: '🔊', d: 'Sakin çalışma müziği hoparlörü.' },
    { n: 'Şarj Standı', c: 'Teknoloji', p: 280, ic: '⚡', d: 'Telefon için kablosuz şarj standı.' },
    { n: 'Masaüstü Fanı', c: 'Teknoloji', p: 160, ic: '💨', d: 'Sessiz mini serinletici fan.' },
    { n: 'Buhar Makinesi', c: 'Teknoloji', p: 230, ic: '💧', d: 'Oda havasını nemlendirici cihaz.' },
    { n: 'USB Çoklayıcı', c: 'Teknoloji', p: 110, ic: '🔌', d: '4 portlu alüminyum hub.' },

    // Dekorasyon
    { n: 'Masa Lambası', c: 'Dekorasyon', p: 220, ic: '🏮', d: 'Sıcak amber ışıklı çalışma lambası.' },
    { n: 'Cam Gece Küresi', c: 'Dekorasyon', p: 260, ic: '🔮', d: 'Işıklı dekoratif kristal küre.' },
    { n: 'Kum Saati', c: 'Dekorasyon', p: 150, ic: '⏳', d: '15 dakikalık ahşap kum saati.' },
    { n: 'Duvar Saati', c: 'Dekorasyon', p: 190, ic: '🕰️', d: 'Sessiz çalışan minimalist saat.' },
    { n: 'Zen Bahçesi', c: 'Dekorasyon', p: 140, ic: '🧘', d: 'Küçük tırmıklı kum tepsisi.' },
    { n: 'Lav Taşı', c: 'Dekorasyon', p: 110, ic: '🪨', d: 'Doğal koku difüzör taşı.' },

    // Kitaplar & Kırtasiye
    { n: 'Not Defteri', c: 'Kitaplar', p: 95, ic: '📓', d: 'Noktalı kalın yapraklı çalışma defteri.' },
    { n: 'Kitap Standı', c: 'Kitaplar', p: 130, ic: '📖', d: 'Ders kitaplarını açık tutan tutucu.' },
    { n: 'Ahşap Kitaplık Desteği', c: 'Kitaplar', p: 110, ic: '📚', d: 'Masada kitapları dik tutan destek.' },
    { n: 'Dolma Kalem', c: 'Kitaplar', p: 170, ic: '✒️', d: 'Mat siyah akıcı uçlu kalem.' },
    { n: 'Metal Cetvel Seti', c: 'Kitaplar', p: 75, ic: '📐', d: 'Geometri ve çizim cetveli.' },
    { n: 'Kitap Ayracı', c: 'Kitaplar', p: 45, ic: '🔖', d: 'İnce pirinç metal ayraç.' },

    // Aksesuarlar
    { n: 'Kahve Kupası', c: 'Aksesuarlar', p: 90, ic: '☕', d: 'Mat seramik kahve kupası.' },
    { n: 'Su Matarası', c: 'Aksesuarlar', p: 150, ic: '🍶', d: 'Paslanmaz çelik su şişesi.' },
    { n: 'Bilek Desteği', c: 'Aksesuarlar', p: 95, ic: '☁️', d: 'Yumuşak klavye bilek yastığı.' },
    { n: 'Bardak Altlığı', c: 'Aksesuarlar', p: 60, ic: '🍵', d: 'Doğal mantar bardak altlığı.' },
    { n: 'Kulaklık Askısı', c: 'Aksesuarlar', p: 130, ic: '🎧', d: 'Masa kenarı ahşap askı.' },
    { n: 'Kablo Klipsi', c: 'Aksesuarlar', p: 50, ic: '📎', d: 'Kabloları toplayan yapışkan tutucu.' },
    { n: 'Kablo Omurgası', c: 'Aksesuarlar', p: 120, ic: '🗂️', d: 'Sarkan kabloları gizleyen kanal.' },

    // Çalışma Ekipmanları
    { n: 'Laptop Standı', c: 'Çalışma Ekipmanları', p: 260, ic: '💻', d: 'Alüminyum açılı bilgisayar yükseltici.' },
    { n: 'Monitör Kolu', c: 'Çalışma Ekipmanları', p: 420, ic: '🦾', d: 'Masaya takılan hareketli ekran kolu.' },
    { n: 'Ayak Desteği', c: 'Çalışma Ekipmanları', p: 190, ic: '🦶', d: 'Otururken rahat ettiren basamak.' },
    { n: 'Mantar Pano', c: 'Çalışma Ekipmanları', p: 130, ic: '📋', d: 'Önemli notlar için masaüstü pano.' },
    { n: 'Kalemlik', c: 'Çalışma Ekipmanları', p: 85, ic: '🖊️', d: 'Deri minimalist masa kalemliği.' },
    { n: 'Ekran Temizleme Kiti', c: 'Çalışma Ekipmanları', p: 65, ic: '🧽', d: 'Mikrofiber bez ve solüsyon.' },
    { n: 'Geri Sayım Saati', c: 'Çalışma Ekipmanları', p: 160, ic: '⏲️', d: 'Dönen mekanik çalışma zamanlayıcısı.' }
  ];

  simpleProducts.forEach((p, idx) => {
    items.push({
      id: `shop-item-${idx + 1}`,
      name: p.n,
      category: p.c,
      price: p.p,
      icon: p.ic,
      desc: p.d
    });
  });

  // Additional everyday items to reach 80+ clean, naturally named catalog items
  const extraItems = [
    { n: 'Büyük Masa Matı', c: 'Aksesuarlar', p: 140, ic: '⬛', d: 'Geniş deri dokulu ped.' },
    { n: 'Küçük Saksı', c: 'Bitkiler', p: 70, ic: '🪴', d: 'Masa kenarı sukulenti.' },
    { n: 'Gece Işığı', c: 'Dekorasyon', p: 180, ic: '🏮', d: 'Loş sarı gece lambası.' },
    { n: 'Metal Kupa', c: 'Aksesuarlar', p: 110, ic: '☕', d: 'Çift katmanlı çelik bardak.' },
    { n: 'A5 Çizgili Defter', c: 'Kitaplar', p: 85, ic: '📓', d: 'Hızlı soru çözüm defteri.' },
    { n: 'Silgi ve Kalem Açacağı', c: 'Kitaplar', p: 35, ic: '✏️', d: 'Kompakt kırtasiye seti.' },
    { n: 'Ahşap Cetvel', c: 'Kitaplar', p: 40, ic: '📐', d: '30 cm sade ahşap cetvel.' },
    { n: 'Masa Askısı', c: 'Aksesuarlar', p: 95, ic: '🪝', d: 'Çanta ve kulaklık kancası.' },
    { n: 'Fosforlu Kalem Seti', c: 'Kitaplar', p: 65, ic: '🖍️', d: 'Pastel renkli 4lü işaretleme kalemi.' },
    { n: 'Kare Not Kağıtlığı', c: 'Kitaplar', p: 55, ic: '🗒️', d: 'Kendinden yapışkanlı kağıtlık.' },
    { n: 'Akustik Sünger', c: 'Çalışma Ekipmanları', p: 150, ic: '🧱', d: 'Yankı kesen masa arkası panel.' },
    { n: 'Bambu Kutu', c: 'Masa', p: 120, ic: '📦', d: 'Küçük eşyalar için kapaklı kutu.' },
    { n: 'Göz Dinlendirme Gözlüğü', c: 'Aksesuarlar', p: 210, ic: '👓', d: 'Mavi ışığı süzen şeffaf gözlük.' }
  ];

  extraItems.forEach((x, i) => {
    items.push({
      id: `shop-extra-${i+1}`,
      name: x.n,
      category: x.c,
      price: x.p,
      icon: x.ic,
      desc: x.d
    });
  });

  return items;
}

class Store {
  constructor() {
    this.catalog = generateCatalogItems();
    this.data = this.load();
    this.listeners = [];
  }

  isFirstTimeUser() {
    return !this.data.userProfile || !this.data.userProfile.isConfigured;
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...EMPTY_INITIAL_STATE, ...parsed };
        if (!merged.virtualLibrary.activeWidgets) {
          merged.virtualLibrary.activeWidgets = ['clock'];
        }
        return merged;
      }
    } catch (e) {
      console.warn('LocalStorage okunamadı, temiz durum oluşturuluyor', e);
    }
    return JSON.parse(JSON.stringify(EMPTY_INITIAL_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('LocalStorage kaydedilemedi', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // Complete Reset Option — Clears localStorage completely
  resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.data = JSON.parse(JSON.stringify(EMPTY_INITIAL_STATE));
      this.notify();
      return true;
    } catch (e) {
      console.error('Veri sıfırlama başarısız', e);
      return false;
    }
  }

  // --- USER PROFILE & ONBOARDING ---
  completeOnboarding(profileData) {
    this.data.userProfile = {
      name: profileData.name || 'Öğrenci',
      targetTitle: profileData.targetTitle || 'YKS Sayısal',
      targetDepartment: profileData.targetDepartment || 'Genel Odaklanma',
      targetRank: profileData.targetRank || '',
      targetScore: profileData.targetScore || '',
      targetSchool: profileData.targetSchool || '',
      focusCoins: 50,
      isConfigured: true
    };
    if (profileData.themeMode) {
      this.data.themeMode = profileData.themeMode;
    }
    this.save();
  }

  updateProfileTargets(targets) {
    this.data.userProfile = {
      ...this.data.userProfile,
      ...targets
    };
    this.save();
  }

  setThemeMode(mode) {
    this.data.themeMode = mode === 'light' ? 'light' : 'dark';
    this.save();
  }

  setTheme(themeId) {
    if (DEFAULT_THEMES[themeId]) {
      this.data.theme = themeId;
      this.save();
    }
  }

  setActiveTab(tabId) {
    this.data.activeTab = tabId;
    this.save();
  }

  // --- TASKS (Reorderable, Freeform Size, Subtle Near-Black Tints) ---
  addTask(task) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: task.title,
      description: task.description || '',
      date: task.date || new Date().toISOString().slice(0, 10),
      time: task.time || '10:00',
      durationMinutes: task.durationMinutes || 25,
      actualDurationMinutes: 0,
      color: task.color || 'neutral', // subtle dark tint
      priority: task.priority || 'normal',
      completed: false,
      subtasks: task.subtasks || [],
      width: task.width || 320,
      height: task.height || 140,
      isEvent: !!task.isEvent,
      order: this.data.tasks.length
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      this.save();
    }
  }

  reorderTasks(reorderedTasks) {
    this.data.tasks = reorderedTasks;
    this.save();
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
  }

  toggleTaskCompleted(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        this.data.stats.totalCompletedTasks = (this.data.stats.totalCompletedTasks || 0) + 1;
        this.addFocusCoins(15);
      }
      this.save();
    }
  }

  // --- DENEMELER (YKS / TYT / AYT) ---
  addDeneme(deneme) {
    const newDeneme = {
      id: 'deneme_' + Date.now(),
      type: deneme.type || 'TYT',
      title: deneme.title || 'Deneme Sınavı',
      date: deneme.date || new Date().toISOString().slice(0, 10),
      netTotal: deneme.netTotal || 0,
      details: deneme.details || {}
    };
    this.data.denemeler.push(newDeneme);
    this.addFocusCoins(25);
    this.save();
    return newDeneme;
  }

  deleteDeneme(id) {
    this.data.denemeler = this.data.denemeler.filter(d => d.id !== id);
    this.save();
  }

  // --- REAL-DATA STUDY SESSION & TREE METRICS ---
  logCompletedSession(minutes) {
    const mins = Math.max(1, Math.round(minutes));
    const today = new Date().toISOString().slice(0, 10);

    if (!this.data.focusHistoryByDate) this.data.focusHistoryByDate = {};
    this.data.focusHistoryByDate[today] = (this.data.focusHistoryByDate[today] || 0) + mins;

    this.data.pomodoro.totalMinutesToday = (this.data.pomodoro.totalMinutesToday || 0) + mins;
    this.data.pomodoro.sessionsCompletedToday = (this.data.pomodoro.sessionsCompletedToday || 0) + 1;

    this.data.virtualLibrary.totalFocusMinutes = (this.data.virtualLibrary.totalFocusMinutes || 0) + mins;
    this.data.virtualLibrary.gardenScore = Math.min(100, Math.floor(this.data.virtualLibrary.totalFocusMinutes / 12));
    this.data.virtualLibrary.treeAgeWeeks = Math.max(1, 1 + Math.floor(this.data.virtualLibrary.totalFocusMinutes / 120));

    const dayOfWeek = (new Date().getDay() + 6) % 7;
    if (!this.data.stats.weeklyFocusHours) this.data.stats.weeklyFocusHours = [0, 0, 0, 0, 0, 0, 0];
    this.data.stats.weeklyFocusHours[dayOfWeek] = parseFloat((this.data.stats.weeklyFocusHours[dayOfWeek] + (mins / 60)).toFixed(1));

    if (!this.data.completedDates) this.data.completedDates = [];
    if (!this.data.completedDates.includes(today)) {
      this.data.completedDates.push(today);
    }

    this.addFocusCoins(mins * 2);
    this.save();
  }

  addFocusCoins(amount) {
    this.data.userProfile.focusCoins = (this.data.userProfile.focusCoins || 0) + Math.max(0, amount);
    this.save();
  }

  // --- MARKETPLACE & CART ---
  addToCart(itemId) {
    if (!this.data.cart) this.data.cart = [];
    const existing = this.data.cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.data.cart.push({ id: itemId, quantity: 1 });
    }
    this.save();
  }

  removeFromCart(itemId) {
    if (!this.data.cart) return;
    this.data.cart = this.data.cart.filter(c => c.id !== itemId);
    this.save();
  }

  getCartTotal() {
    if (!this.data.cart) return 0;
    return this.data.cart.reduce((total, cartItem) => {
      const prod = this.catalog.find(p => p.id === cartItem.id);
      return total + (prod ? prod.price * cartItem.quantity : 0);
    }, 0);
  }

  checkoutCart() {
    const total = this.getCartTotal();
    const currentBalance = this.data.userProfile.focusCoins || 0;

    if (total === 0 || currentBalance < total) {
      return null;
    }

    this.data.userProfile.focusCoins = currentBalance - total;

    const purchasedProducts = [];
    if (!this.data.ownedItems) this.data.ownedItems = [];

    this.data.cart.forEach(cartItem => {
      const prod = this.catalog.find(p => p.id === cartItem.id);
      if (prod) {
        for (let i = 0; i < cartItem.quantity; i++) {
          purchasedProducts.push(prod);
          if (!this.data.ownedItems.includes(prod.id)) {
            this.data.ownedItems.push(prod.id);
          }
        }
      }
    });

    this.data.cart = [];
    this.save();
    return purchasedProducts;
  }

  // --- CRAFTING SETS ---
  craftSet(setId) {
    const requiredItems = this.catalog.filter(p => p.setId === setId);
    const owned = this.data.ownedItems || [];
    const allOwned = requiredItems.every(r => owned.includes(r.id));

    if (!allOwned) return false;

    if (!this.data.assembledCrafts) this.data.assembledCrafts = [];
    if (!this.data.assembledCrafts.includes(setId)) {
      this.data.assembledCrafts.push(setId);
      this.addFocusCoins(250);
      this.save();
    }
    return true;
  }

  // --- VIRTUAL LIBRARY SETTINGS & WIDGET CONFIG ---
  updateLibrary(settings) {
    this.data.virtualLibrary = {
      ...this.data.virtualLibrary,
      ...settings
    };
    this.save();
  }

  setLibraryWidgets(widgetList) {
    this.data.virtualLibrary.activeWidgets = widgetList;
    this.save();
  }

  // --- STUDY ROOM & FRIENDS ---
  setStudyRoomCode(code) {
    this.data.virtualLibrary.roomCode = code;
    this.save();
  }

  addSavedFriend(friendName) {
    if (!this.data.savedFriends) this.data.savedFriends = [];
    if (!this.data.savedFriends.some(f => f.name === friendName)) {
      this.data.savedFriends.push({
        id: 'fr_' + Date.now(),
        name: friendName,
        addedAt: new Date().toISOString()
      });
      this.save();
      return true;
    }
    return false;
  }
}

// Global Store Instance
window.DEFAULT_THEMES = DEFAULT_THEMES;
window.MOTIVATION_QUOTES = MOTIVATION_QUOTES;
window.appStore = new Store();
