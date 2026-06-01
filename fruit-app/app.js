/* =========================================================
   ذوق فروتس - Dhawq Fruits  |  v3.0
   تطبيق طلب المشروبات الاحترافي
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1) قاعدة البيانات (من مينيو المحل الحقيقي)
   --------------------------------------------------------- */
const DB = {
  // أسعار الفواكه المفردة: M / L / 1L  (بالدينار الجزائري)
  fruits: {
    orange:      { name: 'برتقال',       img: 'orange',      M: 300, L: 350, '1L': 600,  tier: 'a' },
    lemon:       { name: 'ليمون',        img: 'lemon',       M: 250, L: 300, '1L': 500,  tier: 'a' },
    mandarin:    { name: 'يوسفي',        img: 'mandarin',    M: 300, L: 350, '1L': 600,  tier: 'a' },
    apple:       { name: 'تفاح',         img: 'apple',       M: 300, L: 350, '1L': 600,  tier: 'a' },
    pear:        { name: 'إجاص',         img: 'pear',        M: 300, L: 350, '1L': 600,  tier: 'a' },
    watermelon:  { name: 'بطيخ',         img: 'watermelon',  M: 300, L: 350, '1L': 600,  tier: 'a' },
    banana:      { name: 'موز',          img: 'banana',      M: 300, L: 350, '1L': 600,  tier: 'a' },
    apricot:     { name: 'مشمش',         img: 'apricot',     M: 300, L: 350, '1L': 600,  tier: 'a' },
    strawberry:  { name: 'فراولة',       img: 'strawberry',  M: 350, L: 400, '1L': 700,  tier: 'b' },
    pomegranate: { name: 'رمان',         img: 'pomegranate', M: 350, L: 400, '1L': 700,  tier: 'b' },
    peach:       { name: 'خوخ',          img: 'peach',       M: 350, L: 400, '1L': 700,  tier: 'b' },
    melon:       { name: 'شمام',         img: 'melon',       M: 350, L: 400, '1L': 700,  tier: 'b' },
    cherry:      { name: 'كرز',          img: 'cherry',      M: 350, L: 400, '1L': 700,  tier: 'b' },
    fig:         { name: 'تين',          img: 'fig',         M: 400, L: 450, '1L': 800,  tier: 'b' },
    kiwi:        { name: 'كيوي',         img: 'kiwi',        M: 500, L: 550, '1L': 1000, tier: 'c' },
    dragonfruit: { name: 'فاكهة التنين', img: 'dragonfruit', M: 750, L: 900, '1L': 1500, tier: 'd' },
    avocado:     { name: 'أفوكادو',      img: 'avocado',     M: 750, L: 950, '1L': 1600, tier: 'd' },
    grape:       { name: 'عنب',          img: 'grape',       M: 700, L: 900, '1L': 1600, tier: 'd' },
    pineapple:   { name: 'أناناس',       img: 'pineapple',   M: 900, L: 1200,'1L': 2000, tier: 'd' },
    mango:       { name: 'مانجو',        img: 'mango',       M: 900, L: 1200,'1L': 2000, tier: 'd' },
  },

  // إضافات النكهة (نعناع/زنجبيل) — تُختار مع العصير دون تغيير السعر الأساسي
  flavorings: {
    mint:   { name: 'نعناع',  icon: '🌿' },
    ginger: { name: 'زنجبيل', icon: '🫚' },
  },

  // قواعد العصير
  bases: {
    water:  { name: 'ماء',          icon: '💧', note: 'خفيف ومنعش' },
    milk:   { name: 'حليب',         icon: '🥛', note: 'كريمي وغني' },
    orange: { name: 'عصير برتقال',  icon: '🍊', note: 'حمضي منعش' },
  },
};


/* الخلطات الجاهزة من المينيو — أسعار ثابتة (0.5L / 1L)
   variants: مجموعات الفواكه التي تُطابق هذه الخلطة (للبحث) */
DB.presetMixes = [
  // فاكهتان
  { id:'p_lemon_mint',     name:'ليمون + نعناع',              variants:[['lemon','+mint']],                 '0.5L':300,  '1L':500 },
  { id:'p_mango_orange',   name:'مانجو + برتقال',             variants:[['mango','orange']],                '0.5L':1200, '1L':2200 },
  { id:'p_orange_banana',  name:'برتقال + موز أو فراولة',     variants:[['orange','banana'],['orange','strawberry']], '0.5L':450, '1L':800 },
  { id:'p_lemon_apple',    name:'ليمون + تفاح أو إجاص',       variants:[['lemon','apple'],['lemon','pear']], '0.5L':400, '1L':750 },
  { id:'p_kiwi_banana',    name:'كيوي + موز',                 variants:[['kiwi','banana']],                 '0.5L':600,  '1L':1100 },
  { id:'p_ginger_citrus',  name:'زنجبيل + برتقال أو ليمون',   variants:[['orange','+ginger'],['lemon','+ginger']], '0.5L':500, '1L':900 },
  // ثلاث فواكه
  { id:'p_avo_ban_kiwi',   name:'أفوكادو + موز + كيوي',       variants:[['avocado','banana','kiwi']],       '0.5L':1200, '1L':1950 },
  { id:'p_apple_pear_lem', name:'تفاح + إجاص + ليمون',        variants:[['apple','pear','lemon']],          '0.5L':450,  '1L':800 },
  { id:'p_apple_kiwi_mint',name:'تفاح + كيوي + نعناع',        variants:[['apple','kiwi','+mint']],          '0.5L':600,  '1L':1100 },
  { id:'p_ban_or_str',     name:'موز + برتقال + فراولة أو تفاح',variants:[['banana','orange','strawberry'],['banana','orange','apple']], '0.5L':450, '1L':800 },
  { id:'p_pine_kiwi_ban',  name:'أناناس + كيوي + موز',        variants:[['pineapple','kiwi','banana']],     '0.5L':1200, '1L':2000 },
  { id:'p_mango_avo_or',   name:'مانجو + أفوكادو + برتقال',   variants:[['mango','avocado','orange']],      '0.5L':1400, '1L':2400 },
  { id:'p_dragon_ban_or',  name:'فاكهة التنين + موز + برتقال',variants:[['dragonfruit','banana','orange']], '0.5L':900,  '1L':1500 },
  // أربع فواكه
  { id:'p_kiwi_str_lem_ban',name:'كيوي + فراولة + ليمون + موز',variants:[['kiwi','strawberry','lemon','banana']], '0.5L':700, '1L':1200 },
  { id:'p_avo_or_ging',    name:'أفوكادو + برتقال + زنجبيل + عسل',variants:[['avocado','orange','+ginger','+honey']], '0.5L':950, '1L':1600 },
  { id:'p_or_ban_ap_str',  name:'برتقال + موز + تفاح + فراولة',variants:[['orange','banana','apple','strawberry']], '0.5L':450, '1L':800 },
  { id:'p_pine_ban_lem_str',name:'أناناس + موز + ليمون + فراولة',variants:[['pineapple','banana','lemon','strawberry']], '0.5L':1200, '1L':2000 },
];


/* ميلك شيك — شوكولاتة: اختيار النوع المحدّد (M / L / 1L) */
DB.msChoco = [
  { id:'c_nutella',  name:'نوتيلا',        img:'🍫', desc:'Nutella',        M:550, L:600, '1L':1100 },
  { id:'c_mars',     name:'مارس',          img:'🍫', desc:'Mars',           M:550, L:600, '1L':1100 },
  { id:'c_snickers', name:'سنيكرز',        img:'🥜', desc:'Snickers',        M:550, L:600, '1L':1100 },
  { id:'c_bounty',   name:'باونتي',        img:'🥥', desc:'Bounty',          M:550, L:600, '1L':1100 },
  { id:'c_kitkat',   name:'كيت كات',       img:'🍫', desc:'KitKat',          M:550, L:600, '1L':1100 },
  { id:'c_twix',     name:'تويكس',         img:'🍫', desc:'Twix',            M:550, L:600, '1L':1100 },
  { id:'c_bueno',    name:'كيندر بوينو',   img:'🍫', desc:'Kinder Bueno',    M:550, L:600, '1L':1100 },
  { id:'c_lotus',    name:'لوتس',          img:'🍪', desc:'Lotus Biscoff',   M:350, L:400, '1L':700 },
  { id:'c_oreo',     name:'أوريو',         img:'🍪', desc:'Oreo',            M:350, L:400, '1L':700 },
  { id:'c_raffa',    name:'رافاييلو',      img:'🤍', desc:'Raffaello',       M:600, L:650, '1L':1200 },
  { id:'c_ferrero',  name:'فيريرو روشيه',  img:'🟤', desc:'Ferrero Rocher',  M:600, L:650, '1L':1200 },
  { id:'c_caramel',  name:'كراميل',        img:'🍯', desc:'Caramel',         M:400, L:450, '1L':800 },
  { id:'c_nuts',     name:'مكسرات',        img:'🥜', desc:'Mixed Nuts',      M:450, L:500, '1L':900 },
];

/* ميلك شيك — فواكه (M / L / 1L) */
DB.msFruit = [
  { id:'msf_strawberry', name:'فراولة',    img:'strawberry', M:400, L:450, '1L':800 },
  { id:'msf_banana',     name:'موز',       img:'banana',     M:350, L:400, '1L':700 },
  { id:'msf_kiwi',       name:'كيوي',      img:'kiwi',       M:500, L:550, '1L':1000 },
  { id:'msf_blueberry',  name:'توت',       img:'🫐',         M:450, L:500, '1L':900 },
  { id:'msf_pistachio',  name:'فستق',      img:'🌰',         M:450, L:500, '1L':900 },
  { id:'msf_coconut',    name:'جوز الهند', img:'🥥',         M:400, L:450, '1L':800 },
];

/* ميلك شيك — خلطات مميزة (M / L / 1L) */
DB.msMixes = [
  { id:'msm_lotus_caramel', name:'لوتس + كراميل',      img:'🍪', M:500, L:600, '1L':1050 },
  { id:'msm_lotus_coconut', name:'لوتس + جوز الهند',   img:'🥥', M:500, L:600, '1L':1050 },
  { id:'msm_nut_snick',     name:'نوتيلا + سنيكرز',    img:'🍫', M:600, L:700, '1L':1250 },
  { id:'msm_bounty_pist',   name:'باونتي + فستق',      img:'🌰', M:550, L:650, '1L':1150 },
  { id:'msm_cookies_car',   name:'كوكيز + كراميل',     img:'🍪', M:500, L:550, '1L':1000 },
  { id:'msm_kiwi_str_ban',  name:'كيوي + فراولة + موز',img:'🥝', M:550, L:650, '1L':1150 },
  { id:'msm_oreo_nut',      name:'أوريو + نوتيلا',     img:'🍫', M:550, L:650, '1L':1150 },
  { id:'msm_nut_banana',    name:'نوتيلا + موز',       img:'🍌', M:500, L:600, '1L':1050 },
];

/* الإضافات (تُحسب لكل المشروب) */
DB.extrasJuice = [
  { id:'e_raisin', name:'زبيب',      icon:'🍇', price:100 },
  { id:'e_nuts',   name:'مكسرات',    icon:'🥜', price:150 },
  { id:'e_honey',  name:'عسل',       icon:'🍯', price:100 },
  { id:'e_syrup',  name:'دبس التمر', icon:'🫙', price:100 },
  { id:'e_dates',  name:'دقلة',      icon:'🌴', price:50 },
];
DB.extrasMs = [
  { id:'em_raisin',  name:'زبيب',       icon:'🍇', price:100 },
  { id:'em_nuts',    name:'مكسرات',     icon:'🥜', price:150 },
  { id:'em_honey',   name:'عسل',        icon:'🍯', price:100 },
  { id:'em_coconut', name:'جوز الهند',  icon:'🥥', price:100 },
  { id:'em_fruits',  name:'فواكه',      icon:'🍓', price:100 },
  { id:'em_choco',   name:'شوكو نوتيلا',icon:'🍫', price:250 },
  { id:'em_oat',     name:'شوفان',      icon:'🌾', price:50 },
  { id:'em_syrup',   name:'دبس التمر',  icon:'🫙', price:100 },
  { id:'em_dates',   name:'دقلة',       icon:'🌴', price:50 },
];


/* ---------------------------------------------------------
   2) محرك التسعير (متناسق وعادل)
   --------------------------------------------------------- */
/*
  المبدأ:
  - فاكهة مفردة  => سعر المينيو مباشرة.
  - خلطة موجودة في المينيو => السعر الثابت من المينيو (تطابق 100%).
  - خلطة مخصصة (غير موجودة) => الفاكهة الأغلى بسعرها الكامل
      + نسبة متناقصة من باقي الفواكه (30%، 20%، 15%، 10%).
    هذا يضمن أن السعر:
      • لا يقل أبداً عن سعر أغلى فاكهة (لا خسارة على المانجو مثلاً).
      • متناسق: نفس الفواكه = نفس السعر دائماً.
      • منطقي: كل فاكهة مضافة ترفع السعر بقدر قيمتها.
  - يُقرّب الناتج لأقرب 50 دج.
*/

// حجم العصير المخصص => مفتاح سعر الفاكهة
function fruitPriceKey(size) {
  if (size === '1L') return '1L';
  if (size === '0.5L') return 'L';   // نصف لتر ≈ حجم L للفاكهة المفردة
  return size;                        // M أو L
}

// تطبيع مجموعة المكونات لمقارنتها بخلطات المينيو
function normalizeSet(fruitIds, flavorIds, hasHoney) {
  const arr = [...fruitIds];
  (flavorIds || []).forEach(f => arr.push('+' + f));
  if (hasHoney) arr.push('+honey');
  return arr.slice().sort().join('|');
}

// البحث عن خلطة جاهزة مطابقة
function findPreset(fruitIds, flavorIds, hasHoney) {
  const target = normalizeSet(fruitIds, flavorIds, hasHoney);
  for (const mix of DB.presetMixes) {
    for (const variant of mix.variants) {
      const set = variant.slice().sort().join('|');
      if (set === target) return mix;
    }
  }
  return null;
}

const ADD_FACTORS = [0.30, 0.20, 0.15, 0.10]; // نسب الفواكه الإضافية المتناقصة

// سعر الخلطة الجاهزة لأي حجم (المينيو يعطي 0.5L و 1L؛ نشتق M و L منهما)
// L = سعر 0.5L (نصف لتر ≈ كأس L) ، 1L = سعر اللتر ، M = أصغر بنسبة ثابتة
function presetSizePrice(preset, size) {
  if (size === '1L') return preset['1L'];
  if (size === 'L' || size === '0.5L') return preset['0.5L'];
  if (size === 'M') return Math.round(preset['0.5L'] * 0.85 / 50) * 50;
  return preset['0.5L'];
}

// حساب سعر الخلطة المخصصة (غير موجودة في المينيو)
function customMixPrice(fruitIds, size) {
  const key = fruitPriceKey(size);
  const prices = fruitIds
    .map(id => DB.fruits[id] ? DB.fruits[id][key] : 0)
    .sort((a, b) => b - a);
  if (!prices.length) return 0;
  let total = prices[0];                       // الفاكهة الأغلى كاملة
  for (let i = 1; i < prices.length; i++) {
    const f = ADD_FACTORS[i - 1] != null ? ADD_FACTORS[i - 1] : 0.10;
    total += prices[i] * f;
  }
  return Math.round(total / 50) * 50;          // تقريب لأقرب 50
}

// السعر الموحّد لأي خلطة عصير (جاهزة أو مخصصة) لأي حجم
function mixPriceForSize(fruitIds, flavorIds, hasHoney, size) {
  const preset = findPreset(fruitIds, flavorIds, hasHoney);
  if (preset) return presetSizePrice(preset, size);
  return customMixPrice(fruitIds, size);
}

// السعر الأساسي لأي مشروب (قبل الإضافات)
function basePrice(item) {
  switch (item.kind) {
    case 'single':
      return DB.fruits[item.fruits[0]][item.size] || 0;
    case 'preset':
      return presetSizePrice(item.preset, item.size);
    case 'custom': {
      const preset = findPreset(item.fruits, item.flavors, item.honey);
      item.matchedPreset = preset ? preset.name : null;
      return mixPriceForSize(item.fruits, item.flavors, item.honey, item.size);
    }
    case 'ms_choco': return DB.msChoco.find(x => x.id === item.choice)[item.size] || 0;
    case 'ms_fruit': return DB.msFruit.find(x => x.id === item.choice)[item.size] || 0;
    case 'ms_mix':   return item.preset[item.size] || 0;
    default: return 0;
  }
}

// مجموع الإضافات
function extrasPrice(item) {
  const list = item.type === 'milkshake' ? DB.extrasMs : DB.extrasJuice;
  return (item.extras || []).reduce((s, id) => {
    const e = list.find(x => x.id === id);
    return s + (e ? e.price : 0);
  }, 0);
}

// السعر النهائي لوحدة واحدة
function unitPrice(item) { return basePrice(item) + extrasPrice(item); }

// السعر الإجمالي للعنصر (مع الكمية)
function linePrice(item) { return unitPrice(item) * (item.qty || 1); }


/* ---------------------------------------------------------
   3) حالة التطبيق
   --------------------------------------------------------- */
const App = {
  orderType: null,     // 'dinein' | 'takeaway'
  customerName: '',
  cart: [],            // العناصر المؤكدة
  draft: null,         // المشروب قيد البناء
  history: [],         // مكدّس الشاشات للرجوع
};

function newDraft() {
  App.draft = {
    type: null,        // 'juice' | 'milkshake'
    kind: null,        // single | custom | preset | ms_choco | ms_fruit | ms_mix
    size: null,
    base: null,
    fruits: [],
    flavors: [],
    honey: false,
    choice: null,      // لميلك شيك المفرد
    preset: null,
    extras: [],
    qty: 1,
    name: '',
  };
}

/* ---------------------------------------------------------
   4) التنقّل بين الشاشات
   --------------------------------------------------------- */
function go(screenId, opts) {
  opts = opts || {};
  const current = document.querySelector('.screen.active');
  if (current && !opts.noHistory) App.history.push(current.id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const next = document.getElementById(screenId);
  next.classList.add('active');
  next.scrollTop = 0;
  window.scrollTo(0, 0);
  updateCartBadge();
}

function back() {
  const prev = App.history.pop();
  if (!prev) { go('welcome', { noHistory: true }); return; }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(prev).classList.add('active');
  window.scrollTo(0, 0);
  updateCartBadge();
}

/* بدء الطلب */
function beginOrder() { newDraft(); go('type'); }

/* نوع الطلب (يُختار في صفحة الدفع) */
function pickOrderType(t) {
  App.orderType = t;
  document.querySelectorAll('#checkout .seg-opt').forEach(e =>
    e.classList.toggle('selected', e.dataset.t === t));
}

/* اختيار نوع المشروب */
function chooseType(type) {
  App.draft.type = type;
  pulse(event.currentTarget);
  setTimeout(() => go(type === 'juice' ? 'juiceMode' : 'msMode'), 220);
}

/* وضع العصير */
function chooseJuiceMode(mode) {
  App.draft.kind = mode; // single | custom | preset
  pulse(event.currentTarget);
  setTimeout(() => {
    if (mode === 'preset') { renderPresets(); go('presetList'); }
    else {
      // الجميع الآن M / L / 1L (توحيد الأحجام)
      renderSizeOptions('juiceSize', ['M', 'L', '1L'], 'chooseJuiceSize');
      go('juiceSize');
    }
  }, 220);
}


/* اختيار الحجم للعصير (مفرد/مخصص) */
function chooseJuiceSize(size) {
  App.draft.size = size;
  highlight('.size-opt', event.currentTarget);
  setTimeout(() => go('juiceBase'), 220);
}

/* اختيار القاعدة */
function chooseBase(base) {
  App.draft.base = base;
  highlight('.base-opt', event.currentTarget);
  setTimeout(() => { renderFruits(); go('fruits'); }, 220);
}

/* الخلطات الجاهزة */
function renderPresets() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = DB.presetMixes.map((m, i) => `
    <button class="preset-card reveal" style="--i:${i}" onclick="pickPreset('${m.id}')">
      <span class="preset-emoji">${presetEmoji(m)}</span>
      <span class="preset-name">${m.name}</span>
      <span class="preset-price">${presetSizePrice(m, 'M')} - ${m['1L']} دج</span>
    </button>`).join('');
}
function presetEmoji(m) {
  const first = m.variants[0][0];
  const f = DB.fruits[first];
  return f ? `<img class="mini-fruit" src="images/${f.img}.jpg" alt="">` : '🍹';
}
function pickPreset(id) {
  const m = DB.presetMixes.find(x => x.id === id);
  App.draft.kind = 'preset';
  App.draft.preset = m;
  App.draft.name = m.name;
  highlight('.preset-card', event.currentTarget);
  setTimeout(() => { renderSizeOptions('presetSize', ['M', 'L', '1L'], 'setPresetSize'); go('presetSize'); }, 220);
}

/* خيارات الحجم العامة */
function renderSizeOptions(screenId, sizes, handler) {
  const labels = { 'M': 'وسط', 'L': 'كبير', '0.5L': 'نصف لتر', '1L': 'لتر كامل' };
  const cont = document.querySelector('#' + screenId + ' .size-grid');
  cont.innerHTML = sizes.map(s => `
    <button class="size-opt" onclick="${handler}('${s}')">
      <span class="cup cup-${s.replace('.', '')}"></span>
      <span class="size-label">${s}</span>
      <span class="size-sub">${labels[s] || ''}</span>
    </button>`).join('');
}
function setPresetSize(size) {
  App.draft.size = size;
  highlight('.size-opt', event.currentTarget);
  setTimeout(() => { renderExtras(); go('extras'); }, 220);
}


/* ---- اختيار الفواكه (مفرد/مخصص) ---- */
function renderFruits() {
  const single = App.draft.kind === 'single';
  document.getElementById('fruitsTitle').textContent = single ? 'اختر فاكهتك' : 'اصنع خلطتك';
  document.getElementById('fruitsHint').textContent  = single
    ? 'اختر فاكهة واحدة' : 'اختر من 2 إلى 5 فواكه + نكهة اختيارية';
  document.getElementById('flavorRow').style.display = single ? 'none' : 'flex';

  const tiers = { a: 'فواكه أساسية', b: 'فواكه مميزة', c: 'فواكه خاصة', d: 'فواكه فاخرة' };
  const groups = { a: [], b: [], c: [], d: [] };
  Object.entries(DB.fruits).forEach(([id, f]) => groups[f.tier].push([id, f]));

  const key = fruitPriceKey(App.draft.size);
  let html = '', idx = 0;
  for (const t of ['a', 'b', 'c', 'd']) {
    html += `<div class="tier-label">${tiers[t]}</div><div class="fruit-grid">`;
    html += groups[t].map(([id, f]) => {
      const sel = App.draft.fruits.includes(id);
      const i = idx++;
      return `<button class="fruit-card reveal ${sel ? 'selected' : ''}" style="--i:${i}" data-id="${id}" onclick="toggleFruit('${id}')">
        <span class="fruit-img-wrap"><img class="fruit-img" src="images/${f.img}.jpg" alt="${f.name}" loading="lazy"></span>
        <span class="fruit-name">${f.name}</span>
        <span class="fruit-price">${f[key]} دج</span>
        <span class="fruit-tick">✓</span>
      </button>`;
    }).join('');
    html += `</div>`;
  }
  document.getElementById('fruitGrid').innerHTML = html;
  renderFlavorChips();
  updateFruitBar();
}

function renderFlavorChips() {
  const row = document.getElementById('flavorRow');
  row.innerHTML = '<span class="flavor-lead">نكهة:</span>' + Object.entries(DB.flavorings).map(([id, f]) => {
    const sel = App.draft.flavors.includes(id);
    return `<button class="flavor-chip ${sel ? 'selected' : ''}" onclick="toggleFlavor('${id}')">${f.icon} ${f.name}</button>`;
  }).join('');
}

function toggleFruit(id) {
  const d = App.draft;
  const max = d.kind === 'single' ? 1 : 5;
  const i = d.fruits.indexOf(id);
  if (i > -1) d.fruits.splice(i, 1);
  else {
    if (d.kind === 'single') d.fruits = [id];
    else if (d.fruits.length >= max) { toast('الحد الأقصى 5 فواكه'); shake('fruitBar'); return; }
    else d.fruits.push(id);
  }
  // تحديث البطاقات
  document.querySelectorAll('.fruit-card').forEach(c =>
    c.classList.toggle('selected', d.fruits.includes(c.dataset.id)));
  updateFruitBar();
}

function toggleFlavor(id) {
  const d = App.draft;
  const i = d.flavors.indexOf(id);
  if (i > -1) d.flavors.splice(i, 1); else d.flavors.push(id);
  renderFlavorChips();
  updateFruitBar();
}


function updateFruitBar() {
  const d = App.draft;
  const n = d.fruits.length;
  const min = d.kind === 'single' ? 1 : 2;
  const btn = document.getElementById('fruitsNext');
  const counter = document.getElementById('fruitCount');
  counter.textContent = d.kind === 'single' ? `${n}/1` : `${n}/5`;

  // معاينة السعر الحيّة
  let preview = 0, label = '';
  if (n >= 1) {
    if (d.kind === 'single') { preview = DB.fruits[d.fruits[0]][d.size]; }
    else if (n >= 2) {
      const preset = findPreset(d.fruits, d.flavors, d.honey);
      preview = preset ? presetSizePrice(preset, d.size) : customMixPrice(d.fruits, d.size);
      label = preset ? 'سعر المينيو' : 'خلطة مخصصة';
    }
  }
  const priceEl = document.getElementById('fruitPrice');
  const tagEl = document.getElementById('fruitPriceTag');
  if (preview > 0) { animateNumber(priceEl, preview); tagEl.textContent = label; }
  else { priceEl.textContent = '—'; tagEl.textContent = ''; }

  btn.disabled = n < min;
}

function confirmFruits() {
  const d = App.draft;
  const names = d.fruits.map(id => DB.fruits[id].name);
  d.flavors.forEach(f => names.push(DB.flavorings[f].name));
  d.name = names.join(' + ');
  renderExtras();
  go('extras');
}

/* ---- ميلك شيك ---- */
function chooseMsMode(mode) {
  App.draft.kind = mode; // ms_choco | ms_fruit | ms_mix
  pulse(event.currentTarget);
  setTimeout(() => {
    if (mode === 'ms_choco') { renderMsList('msListGrid', DB.msChoco, 'pickMsItem'); }
    else if (mode === 'ms_fruit') { renderMsList('msListGrid', DB.msFruit, 'pickMsItem'); }
    else { renderMsList('msListGrid', DB.msMixes, 'pickMsMix'); }
    document.getElementById('msListTitle').textContent =
      mode === 'ms_choco' ? 'اختر الشوكولاتة' : mode === 'ms_fruit' ? 'اختر الفاكهة' : 'اختر خلطتك';
    go('msList');
  }, 220);
}

function renderMsList(gridId, list, handler) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = list.map((it, i) => {
    const media = it.img && it.img.length <= 3
      ? `<span class="ms-emoji">${it.img}</span>`
      : `<img class="ms-img" src="images/${it.img}.jpg" alt="">`;
    return `<button class="ms-row reveal" style="--i:${i}" onclick="${handler}('${it.id}')">
      ${media}
      <span class="ms-info"><span class="ms-name">${it.name}</span>${it.desc ? `<span class="ms-desc">${it.desc}</span>` : ''}</span>
      <span class="ms-price">${it.M}-${it['1L']} دج</span>
    </button>`;
  }).join('');
}

function pickMsItem(id) {
  App.draft.choice = id;
  const list = App.draft.kind === 'ms_choco' ? DB.msChoco : DB.msFruit;
  App.draft.name = list.find(x => x.id === id).name + ' ميلك شيك';
  highlight('.ms-row', event.currentTarget);
  setTimeout(() => { renderSizeOptions('msSize', ['M', 'L', '1L'], 'setMsSize'); go('msSize'); }, 220);
}
function pickMsMix(id) {
  const m = DB.msMixes.find(x => x.id === id);
  App.draft.kind = 'ms_mix'; App.draft.preset = m; App.draft.name = m.name + ' ميلك شيك';
  highlight('.ms-row', event.currentTarget);
  setTimeout(() => { renderSizeOptions('msSize', ['M', 'L', '1L'], 'setMsSize'); go('msSize'); }, 220);
}
function setMsSize(size) {
  App.draft.size = size;
  highlight('.size-opt', event.currentTarget);
  setTimeout(() => { renderExtras(); go('extras'); }, 220);
}


/* ---- الإضافات ---- */
function renderExtras() {
  const list = App.draft.type === 'milkshake' ? DB.extrasMs : DB.extrasJuice;
  document.getElementById('extrasGrid').innerHTML = list.map((e, i) => {
    const sel = App.draft.extras.includes(e.id);
    return `<button class="extra-card reveal ${sel ? 'selected' : ''}" style="--i:${i}" data-id="${e.id}" onclick="toggleExtra('${e.id}')">
      <span class="extra-icon">${e.icon}</span>
      <span class="extra-name">${e.name}</span>
      <span class="extra-price">+${e.price}</span>
    </button>`;
  }).join('');
  updateExtrasTotal();
}
function toggleExtra(id) {
  const ex = App.draft.extras;
  const i = ex.indexOf(id);
  if (i > -1) ex.splice(i, 1); else ex.push(id);
  document.querySelectorAll('.extra-card').forEach(c =>
    c.classList.toggle('selected', ex.includes(c.dataset.id)));
  updateExtrasTotal();
}
function updateExtrasTotal() {
  animateNumber(document.getElementById('extrasTotal'), unitPrice(App.draft));
}

/* ---- السلة ---- */
function addToCart() {
  App.cart.push(JSON.parse(JSON.stringify(App.draft)));
  burst(document.getElementById('addCartBtn'));
  toast('أُضيف إلى الطلب ✓');
  setTimeout(() => { renderCart(); go('cart'); }, 360);
}
function addAnother() { newDraft(); go('type'); }

function renderCart() {
  const wrap = document.getElementById('cartList');
  if (!App.cart.length) { newDraft(); go('type', { noHistory: true }); return; }
  wrap.innerHTML = App.cart.map((it, i) => {
    const extras = (it.extras || []).map(eid => {
      const l = it.type === 'milkshake' ? DB.extrasMs : DB.extrasJuice;
      const e = l.find(x => x.id === eid); return e ? e.name : '';
    }).filter(Boolean);
    return `<div class="cart-card reveal" style="--i:${i}">
      <div class="cart-emoji">${it.type === 'juice' ? '🍹' : '🥤'}</div>
      <div class="cart-main">
        <div class="cart-name">${it.name}</div>
        <div class="cart-meta">${sizeLabel(it.size)}${extras.length ? ' • ' + extras.join('، ') : ''}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-val">${it.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <div class="cart-side">
        <div class="cart-price">${linePrice(it)} دج</div>
        <button class="cart-del" onclick="removeItem(${i})">🗑</button>
      </div>
    </div>`;
  }).join('');
  animateNumber(document.getElementById('cartTotal'), cartTotal());
  document.getElementById('cartCountLabel').textContent = App.cart.reduce((s, i) => s + i.qty, 0);
}
function changeQty(i, d) {
  App.cart[i].qty = Math.max(1, (App.cart[i].qty || 1) + d);
  renderCart();
}
function removeItem(i) { App.cart.splice(i, 1); renderCart(); updateCartBadge(); }
function cartTotal() { return App.cart.reduce((s, it) => s + linePrice(it), 0); }

function goToCheckout() {
  document.getElementById('nameInput').value = App.customerName || '';
  if (!App.orderType) App.orderType = 'takeaway';
  document.querySelectorAll('#checkout .seg-opt').forEach(e =>
    e.classList.toggle('selected', e.dataset.t === App.orderType));
  renderCheckoutSummary();
  go('checkout');
}

function renderCheckoutSummary() {
  const box = document.getElementById('checkoutSummary');
  if (!box) return;
  const count = App.cart.reduce((s, i) => s + i.qty, 0);
  box.innerHTML =
    `<div class="cs-row"><span>عدد المشروبات</span><span>${count}</span></div>` +
    App.cart.map(it => `<div class="cs-row"><span>${it.qty}× ${it.name}</span><span>${linePrice(it)} دج</span></div>`).join('') +
    `<div class="cs-row total"><span>الإجمالي</span><span>${cartTotal()} دج</span></div>`;
}


/* ---- الفاتورة ---- */
function confirmOrder() {
  App.customerName = (document.getElementById('nameInput').value || '').trim();
  renderReceipt();
  go('receipt');
}

function buildOrderItems() {
  return App.cart.map(it => {
    const l = it.type === 'milkshake' ? DB.extrasMs : DB.extrasJuice;
    const extras = (it.extras || []).map(eid => { const e = l.find(x => x.id === eid); return e ? e.name : ''; }).filter(Boolean);
    return {
      name: it.name, type: it.type, size: it.size, sizeLabel: sizeLabel(it.size),
      qty: it.qty, extras: extras, price: linePrice(it)
    };
  });
}

function renderReceipt() {
  const n = (typeof OrderStore !== 'undefined') ? OrderStore.nextNumber() : 1;
  const num = String(n).padStart(3, '0');
  const now = Date.now();

  // إنشاء الطلب وإرساله إلى لوحة صاحب المحل (مزامنة فورية)
  const order = {
    num: n, numStr: num,
    name: App.customerName || '',
    orderType: App.orderType || 'takeaway',
    items: buildOrderItems(),
    total: cartTotal(),
    count: App.cart.reduce((s, i) => s + i.qty, 0),
    status: 'new',
    createdAt: now,
  };
  if (typeof OrderStore !== 'undefined') OrderStore.addOrder(order);
  App.lastOrder = order;
  App.lastOrderNum = num;

  // تعبئة الفاتورة
  document.getElementById('rcNumber').textContent = '#' + num;
  document.getElementById('rcDate').textContent = new Date(now).toLocaleString('ar-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('rcType').textContent = order.orderType === 'dinein' ? 'تناول بالمحل 🪑' : 'سفري 🥡';
  document.getElementById('rcName').textContent = order.name ? order.name : '—';

  document.getElementById('rcLines').innerHTML = order.items.map(it => `
    <div class="rc-line">
      <div class="rc-line-top">
        <span class="rc-qty">${it.qty}×</span>
        <span class="rc-name">${it.name}</span>
        <span class="rc-amt">${it.price}</span>
      </div>
      <div class="rc-sub">${it.sizeLabel}${it.extras.length ? ' • ' + it.extras.join('، ') : ''}</div>
    </div>`).join('');
  animateNumber(document.getElementById('rcTotal'), order.total);
  document.getElementById('rcCount').textContent = order.count;
  launchConfetti();

  // تجهيز الفاتورة الحرارية والطباعة التلقائية (الطابعة أمام التابلت)
  if (typeof renderReceiptHTML === 'function') {
    const pa = document.getElementById('printArea');
    if (pa) pa.innerHTML = renderReceiptHTML(order);
  }
  setTimeout(() => { try { window.print(); } catch (e) {} }, 700);
}

/* طباعة يدوية (غير مستخدمة في واجهة الزبون) */
function printReceipt() {
  if (App.lastOrder && typeof printOrder === 'function') printOrder(App.lastOrder);
  else { try { window.print(); } catch (e) {} }
}

/* ---- وصول خفيّ للوحة صاحب المحل (لا يظهر للزبون) ----
   انقر شعار 🍹 خمس مرات متتالية لفتح طلب الرمز ثم الدخول للوحة. */
let _tapCount = 0, _tapTimer = null;
function secretTap() {
  _tapCount++;
  clearTimeout(_tapTimer);
  _tapTimer = setTimeout(() => { _tapCount = 0; }, 1500);
  if (_tapCount >= 5) { _tapCount = 0; openDashboard(); }
}

/* الدخول إلى لوحة صاحب المحل (محميّة برمز) */
function openDashboard() {
  const pin = localStorage.getItem('dhawq_pin') || '1234';
  const entry = prompt('أدخل رمز صاحب المحل:');
  if (entry === null) return;
  if (entry === pin) {
    try { sessionStorage.setItem('dhawq_auth', '1'); } catch (e) {}
    window.location.href = 'dashboard.html';
  } else {
    toast('رمز غير صحيح');
  }
}

function finishAndReset() {
  App.cart = []; App.customerName = ''; App.orderType = null; App.history = [];
  newDraft();
  go('welcome', { noHistory: true });
}

/* ---------------------------------------------------------
   5) أدوات مساعدة + أنيميشن
   --------------------------------------------------------- */
function sizeLabel(s) {
  const m = { 'M': 'وسط (M)', 'L': 'كبير (L)', '0.5L': 'نصف لتر', '1L': 'لتر (1L)' };
  return m[s] || s;
}
function updateCartBadge() {
  const n = App.cart.reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = n; b.style.display = n ? 'flex' : 'none';
  });
}
function highlight(sel, el) {
  document.querySelectorAll(sel).forEach(e => e.classList.remove('selected'));
  if (el) el.classList.add('selected');
}
function pulse(el) { if (!el) return; el.classList.remove('tap'); void el.offsetWidth; el.classList.add('tap'); }
function shake(id) { const e = document.getElementById(id); if (!e) return; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); }

function animateNumber(el, target) {
  if (!el) return;
  const from = parseInt((el.dataset.v || '0'), 10) || 0;
  const dur = 380, t0 = performance.now();
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    const val = Math.round((from + (target - from) * (1 - Math.pow(1 - p, 3))) / 5) * 5;
    el.textContent = val.toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(step); else { el.textContent = target.toLocaleString('en-US'); el.dataset.v = target; }
  }
  requestAnimationFrame(step);
}

let toastTimer;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}
function burst(btn) { if (!btn) return; btn.classList.add('success'); setTimeout(() => btn.classList.remove('success'), 600); }


/* كونفيتي بسيط على شاشة الفاتورة */
function launchConfetti() {
  const host = document.getElementById('confetti');
  if (!host) return;
  host.innerHTML = '';
  const colors = ['#16a34a', '#f59e0b', '#ef4444', '#22c55e', '#eab308', '#fb923c'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(p);
  }
  setTimeout(() => { host.innerHTML = ''; }, 2600);
}

/* صورة الفاكهة الافتراضية عند فشل التحميل */
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && el.classList.contains('fruit-img') && !el.dataset.fb) {
    el.dataset.fb = '1';
    el.style.display = 'none';
  }
}, true);

/* تهيئة */
document.addEventListener('DOMContentLoaded', () => {
  newDraft();
  updateCartBadge();
  if (typeof OrderStore !== 'undefined') OrderStore.tryEnableFirebase();
  console.log('🍹 ذوق فروتس — الكشك جاهز');
});

/* كشف للاختبارات (غير مؤثر في المتصفح) */
if (typeof window !== 'undefined') { window.App = App; window.DB = DB; }
