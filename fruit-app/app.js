/* ========================================
   ذوق فروتس - Dhawq Fruits App v2.0
   نظام طلب المشروبات الاحترافي
   ======================================== */

// ========================================
// قاعدة بيانات المنتجات الكاملة من المينيو
// ========================================

const DATA = {


    // ========== أسعار الفواكه المفردة (من المينيو) ==========
    fruits: {
        orange:      { name: 'برتقال',        emoji: '🍊', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        lemon:       { name: 'ليمون',         emoji: '🍋', M: 250, L: 300, '1L': 500,  cat: 'regular' },
        mandarin:    { name: 'يوسفي',         emoji: '🍊', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        strawberry:  { name: 'فراولة',        emoji: '🍓', M: 350, L: 400, '1L': 700,  cat: 'regular' },
        apple:       { name: 'تفاح',          emoji: '🍏', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        pomegranate: { name: 'رمان',          emoji: '🍎', M: 350, L: 400, '1L': 700,  cat: 'regular' },
        pear:        { name: 'إجاص',          emoji: '🍐', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        apricot:     { name: 'مشمش',          emoji: '🍑', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        peach:       { name: 'خوخ',           emoji: '🍑', M: 350, L: 400, '1L': 700,  cat: 'regular' },
        melon:       { name: 'شمام',          emoji: '🍈', M: 350, L: 400, '1L': 700,  cat: 'regular' },
        watermelon:  { name: 'بطيخ',          emoji: '🍉', M: 300, L: 350, '1L': 600,  cat: 'regular' },
        grape:       { name: 'عنب',           emoji: '🍇', M: 700, L: 900, '1L': 1600, cat: 'premium' },
        cherry:      { name: 'كرز',           emoji: '🍒', M: 350, L: 400, '1L': 700,  cat: 'regular' },
        fig:         { name: 'تين',           emoji: '🫐', M: 400, L: 450, '1L': 800,  cat: 'regular' },
        kiwi:        { name: 'كيوي',          emoji: '🥝', M: 500, L: 550, '1L': 1000, cat: 'tropical' },
        pineapple:   { name: 'أناناس',        emoji: '🍍', M: 900, L: 1200,'1L': 2000, cat: 'tropical' },
        avocado:     { name: 'أفوكادو',       emoji: '🥑', M: 750, L: 950, '1L': 1600, cat: 'tropical' },
        banana:      { name: 'موز',           emoji: '🍌', M: 300, L: 350, '1L': 600,  cat: 'tropical' },
        mango:       { name: 'مانجو',         emoji: '🥭', M: 900, L: 1200,'1L': 2000, cat: 'tropical' },
        dragonfruit: { name: 'فاكهة التنين',  emoji: '🐉', M: 750, L: 900, '1L': 1500, cat: 'tropical' },
    },


    // ========== الخلطات الجاهزة (أسعار ثابتة من المينيو) ==========
    mixes: {
        // خلطة فاكهتين
        two: [
            { id: 'mix_lemon_mint', name: 'ليمون + نعناع', fruits: ['lemon'], emoji: '🍋🌿', '0.5L': 300, '1L': 500 },
            { id: 'mix_mango_orange', name: 'مانجو + برتقال', fruits: ['mango','orange'], emoji: '🥭🍊', '0.5L': 1200, '1L': 2200 },
            { id: 'mix_orange_banana', name: 'برتقال + موز أو فراولة', fruits: ['orange','banana'], emoji: '🍊🍌', '0.5L': 450, '1L': 800 },
            { id: 'mix_lemon_apple', name: 'ليمون + تفاح أو إجاص', fruits: ['lemon','apple'], emoji: '🍋🍏', '0.5L': 400, '1L': 750 },
            { id: 'mix_kiwi_banana', name: 'كيوي + موز', fruits: ['kiwi','banana'], emoji: '🥝🍌', '0.5L': 600, '1L': 1100 },
            { id: 'mix_ginger_orange', name: 'زنجبيل + برتقال أو ليمون', fruits: ['orange'], emoji: '🫚🍊', '0.5L': 500, '1L': 900 },
        ],
        // خلطة 3 فواكه
        three: [
            { id: 'mix_avocado_banana_kiwi', name: 'أفوكادو + موز + كيوي', fruits: ['avocado','banana','kiwi'], emoji: '🥑🍌🥝', '0.5L': 1200, '1L': 1950 },
            { id: 'mix_apple_pear_lemon', name: 'تفاح + إجاص + ليمون', fruits: ['apple','pear','lemon'], emoji: '🍏🍐🍋', '0.5L': 450, '1L': 800 },
            { id: 'mix_apple_kiwi_mint', name: 'تفاح + كيوي + نعناع', fruits: ['apple','kiwi'], emoji: '🍏🥝🌿', '0.5L': 600, '1L': 1100 },
            { id: 'mix_banana_orange_strawberry', name: 'موز + برتقال + فراولة', fruits: ['banana','orange','strawberry'], emoji: '🍌🍊🍓', '0.5L': 450, '1L': 800 },
            { id: 'mix_pineapple_kiwi_banana', name: 'أناناس + كيوي + موز', fruits: ['pineapple','kiwi','banana'], emoji: '🍍🥝🍌', '0.5L': 1200, '1L': 2000 },
            { id: 'mix_mango_avocado_orange', name: 'مانجو + أفوكادو + برتقال', fruits: ['mango','avocado','orange'], emoji: '🥭🥑🍊', '0.5L': 1400, '1L': 2400 },
            { id: 'mix_dragon_banana_orange', name: 'فاكهة التنين + موز + برتقال', fruits: ['dragonfruit','banana','orange'], emoji: '🐉🍌🍊', '0.5L': 900, '1L': 1500 },
        ],
        // خلطة 4 فواكه
        four: [
            { id: 'mix_kiwi_straw_lemon_banana', name: 'كيوي + فراولة + ليمون + موز', fruits: ['kiwi','strawberry','lemon','banana'], emoji: '🥝🍓🍋🍌', '0.5L': 700, '1L': 1200 },
            { id: 'mix_avocado_orange_ginger', name: 'أفوكادو + برتقال + زنجبيل + عسل', fruits: ['avocado','orange'], emoji: '🥑🍊🫚🍯', '0.5L': 950, '1L': 1600 },
            { id: 'mix_orange_banana_apple_straw', name: 'برتقال + موز + تفاح + فراولة', fruits: ['orange','banana','apple','strawberry'], emoji: '🍊🍌🍏🍓', '0.5L': 450, '1L': 800 },
            { id: 'mix_pineapple_banana_lemon_straw', name: 'أناناس + موز + ليمون + فراولة', fruits: ['pineapple','banana','lemon','strawberry'], emoji: '🍍🍌🍋🍓', '0.5L': 1200, '1L': 2000 },
        ],
    },


    // ========== ميلك شيك - شوكولاتة ==========
    milkshake_choco: [
        { id: 'choco',    name: 'شوكو',              emoji: '🍫', M: 550, L: 600, '1L': 1100, desc: 'Mars, Bounty, Snickers, KitKat, Twix' },
        { id: 'cookies',  name: 'كوكيز',             emoji: '🍪', M: 350, L: 400, '1L': 700,  desc: 'Lotus, Biscoff, Oreo' },
        { id: 'raffa',    name: 'رفاييلو & فيريرو',  emoji: '🍬', M: 600, L: 650, '1L': 1200, desc: 'Raffaello, Ferrero Rocher' },
        { id: 'caramel',  name: 'كراميل',            emoji: '🍯', M: 400, L: 450, '1L': 800,  desc: 'Caramel Cream' },
        { id: 'nuts_ms',  name: 'مكسرات',            emoji: '🥜', M: 450, L: 500, '1L': 900,  desc: 'Mixed Nuts Blend' },
    ],

    // ========== ميلك شيك - فواكه ==========
    milkshake_fruits: [
        { id: 'ms_strawberry', name: 'فراولة',    emoji: '🍓', M: 400, L: 450, '1L': 800 },
        { id: 'ms_banana',     name: 'موز',       emoji: '🍌', M: 350, L: 400, '1L': 700 },
        { id: 'ms_kiwi',       name: 'كيوي',      emoji: '🥝', M: 500, L: 550, '1L': 1000 },
        { id: 'ms_blueberry',  name: 'توت',       emoji: '🫐', M: 450, L: 500, '1L': 900 },
        { id: 'ms_pistachio',  name: 'بيستاشيو',  emoji: '🌰', M: 450, L: 500, '1L': 900 },
        { id: 'ms_coconut',    name: 'جوز الهند',  emoji: '🥥', M: 400, L: 450, '1L': 800 },
    ],

    // ========== خلطات ميلك شيك جاهزة ==========
    milkshake_mixes: [
        { id: 'msmix_lotus_caramel',    name: 'Lotus + كراميل',        emoji: '🍪🍯', M: 500, L: 600, '1L': 1050 },
        { id: 'msmix_lotus_coconut',    name: 'Lotus + جوز الهند',     emoji: '🍪🥥', M: 500, L: 600, '1L': 1050 },
        { id: 'msmix_nutella_snickers', name: 'Nutella + Snickers',    emoji: '🍫🍫', M: 600, L: 700, '1L': 1250 },
        { id: 'msmix_bounty_pistachio', name: 'Bounty + Pistachio',    emoji: '🍫🌰', M: 550, L: 650, '1L': 1150 },
        { id: 'msmix_cookies_caramel',  name: 'Cookies + كراميل',      emoji: '🍪🍯', M: 500, L: 550, '1L': 1000 },
        { id: 'msmix_kiwi_straw_banana',name: 'كيوي + فراولة + موز',   emoji: '🥝🍓🍌', M: 550, L: 650, '1L': 1150 },
        { id: 'msmix_oreo_nutella',     name: 'Oreo + Nutella',        emoji: '🍪🍫', M: 550, L: 650, '1L': 1150 },
        { id: 'msmix_nutella_banana',   name: 'Nutella + موز',         emoji: '🍫🍌', M: 500, L: 600, '1L': 1050 },
    ],


    // ========== الإضافات - عصائر ==========
    extras_juice: [
        { id: 'ex_raisin',     name: 'زبيب',       emoji: '🫐', price: 100 },
        { id: 'ex_nuts',       name: 'مكسرات',     emoji: '🥜', price: 150 },
        { id: 'ex_honey',      name: 'عسل',        emoji: '🍯', price: 100 },
        { id: 'ex_date_syrup', name: 'دبس التمر',  emoji: '🍶', price: 100 },
        { id: 'ex_deglet',     name: 'دقلة',       emoji: '🌴', price: 50 },
    ],

    // ========== الإضافات - ميلك شيك ==========
    extras_milkshake: [
        { id: 'exm_raisin',     name: 'زبيب',           emoji: '🫐', price: 100 },
        { id: 'exm_nuts',       name: 'مكسرات',         emoji: '🥜', price: 150 },
        { id: 'exm_honey',      name: 'عسل',            emoji: '🍯', price: 100 },
        { id: 'exm_coconut',    name: 'جوز الهند',       emoji: '🥥', price: 100 },
        { id: 'exm_fruits',     name: 'فواكه',          emoji: '🍓', price: 100 },
        { id: 'exm_choco',      name: 'شوكو (نوتيلا)',  emoji: '🍫', price: 250 },
        { id: 'exm_oat',        name: 'شوفان',          emoji: '🌾', price: 50 },
        { id: 'exm_date_syrup', name: 'دبس التمر',      emoji: '🍶', price: 100 },
        { id: 'exm_deglet',     name: 'دقلة',           emoji: '🌴', price: 50 },
    ],

    // ========== أحجام الأكواب ==========
    sizes: {
        juice: ['M', 'L', '1L'],
        milkshake: ['M', 'L', '1L'],
        mix_sizes: ['0.5L', '1L']
    }
};

// ========================================
// حالة التطبيق
// ========================================

let state = {
    currentScreen: 'welcome',
    cart: [],  // سلة الطلبات (يمكن إضافة أكثر من مشروب)
    currentItem: null,  // المشروب الحالي قيد البناء
};

function resetCurrentItem() {
    state.currentItem = {
        type: null,         // 'juice' | 'milkshake'
        mode: null,         // 'single' | 'mix_ready' | 'mix_custom' | 'ms_choco' | 'ms_fruit' | 'ms_mix_ready'
        size: null,         // 'M' | 'L' | '1L' | '0.5L'
        base: null,         // 'water' | 'milk' | 'orange' (juice only)
        selectedFruits: [], // اختيار الفواكه (للخلطة المخصصة)
        selectedMix: null,  // الخلطة الجاهزة المختارة
        selectedItem: null, // ميلك شيك مفرد
        extras: [],         // الإضافات
        price: 0,           // السعر المحسوب
        name: '',           // اسم المشروب للعرض
    };
}


// ========================================
// نظام التسعير الصحيح
// ========================================

function calculatePrice() {
    const item = state.currentItem;
    if (!item) return 0;

    let basePrice = 0;

    // === خلطة جاهزة (سعر ثابت من المينيو) ===
    if (item.mode === 'mix_ready' && item.selectedMix) {
        basePrice = item.selectedMix[item.size] || 0;
    }
    // === ميلك شيك خلطة جاهزة ===
    else if (item.mode === 'ms_mix_ready' && item.selectedMix) {
        basePrice = item.selectedMix[item.size] || 0;
    }
    // === عصير فاكهة واحدة ===
    else if (item.mode === 'single' && item.selectedFruits.length === 1) {
        const fruit = DATA.fruits[item.selectedFruits[0]];
        if (fruit) basePrice = fruit[item.size] || 0;
    }
    // === خلطة مخصصة (2-5 فواكه) ===
    else if (item.mode === 'mix_custom' && item.selectedFruits.length > 0) {
        basePrice = calculateCustomMixPrice(item.selectedFruits, item.size);
    }
    // === ميلك شيك شوكولاتة ===
    else if (item.mode === 'ms_choco' && item.selectedItem) {
        const choco = DATA.milkshake_choco.find(c => c.id === item.selectedItem);
        if (choco) basePrice = choco[item.size] || 0;
    }
    // === ميلك شيك فواكه ===
    else if (item.mode === 'ms_fruit' && item.selectedItem) {
        const fruit = DATA.milkshake_fruits.find(f => f.id === item.selectedItem);
        if (fruit) basePrice = fruit[item.size] || 0;
    }

    // إضافة سعر الإضافات
    let extrasPrice = 0;
    const extrasList = item.type === 'juice' ? DATA.extras_juice : DATA.extras_milkshake;
    item.extras.forEach(exId => {
        const ex = extrasList.find(e => e.id === exId);
        if (ex) extrasPrice += ex.price;
    });

    item.price = basePrice + extrasPrice;
    return item.price;
}

// حساب سعر الخلطة المخصصة
// المنطق: نبحث عن أقرب خلطة جاهزة مشابهة، وإن لم نجد نستخدم:
// السعر = أغلى فاكهة (كاملة) + 50% من سعر كل فاكهة إضافية
function calculateCustomMixPrice(fruitIds, size) {
    if (fruitIds.length === 1) {
        const f = DATA.fruits[fruitIds[0]];
        return f ? (f[size] || 0) : 0;
    }

    // محاولة مطابقة خلطة جاهزة
    const matchedMix = findMatchingMix(fruitIds);
    if (matchedMix && matchedMix[size]) {
        return matchedMix[size];
    }

    // حساب مخصص: أغلى فاكهة كاملة + 50% من كل فاكهة إضافية
    const prices = fruitIds.map(id => {
        const f = DATA.fruits[id];
        return f ? (f[size] || 0) : 0;
    }).sort((a, b) => b - a);

    let total = prices[0]; // أغلى فاكهة كاملة
    for (let i = 1; i < prices.length; i++) {
        total += Math.round(prices[i] * 0.50);
    }

    // تقريب إلى أقرب 50
    return Math.round(total / 50) * 50;
}


// البحث عن خلطة جاهزة مطابقة
function findMatchingMix(fruitIds) {
    const allMixes = [...DATA.mixes.two, ...DATA.mixes.three, ...DATA.mixes.four];
    const sortedInput = [...fruitIds].sort().join(',');

    for (const mix of allMixes) {
        const sortedMix = [...mix.fruits].sort().join(',');
        if (sortedMix === sortedInput) return mix;
    }
    return null;
}

// ========================================
// التنقل بين الشاشات
// ========================================

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.remove('slide-in');
    });
    const screen = document.getElementById(id);
    if (screen) {
        screen.classList.add('active', 'slide-in');
        state.currentScreen = id;
        window.scrollTo(0, 0);
    }
}

function goBack(screenId) {
    showScreen(screenId);
}

// ========================================
// بدء الطلب
// ========================================

function startOrder() {
    resetCurrentItem();
    showScreen('type-screen');
}

function newOrder() {
    state.cart = [];
    resetCurrentItem();
    showScreen('welcome-screen');
}

// ========================================
// اختيار نوع المشروب
// ========================================

function selectType(type) {
    state.currentItem.type = type;
    animateSelection('.type-card', `[data-type="${type}"]`);
    setTimeout(() => {
        if (type === 'juice') {
            showScreen('juice-mode-screen');
        } else {
            showScreen('milkshake-mode-screen');
        }
    }, 300);
}

// ========================================
// اختيار وضع العصير
// ========================================

function selectJuiceMode(mode) {
    state.currentItem.mode = mode;
    setTimeout(() => {
        if (mode === 'single' || mode === 'mix_custom') {
            showScreen('juice-size-screen');
        } else if (mode === 'mix_ready') {
            showScreen('mix-ready-screen');
            renderReadyMixes();
        }
    }, 300);
}

// ========================================
// اختيار حجم العصير
// ========================================

function selectJuiceSize(size) {
    state.currentItem.size = size;
    animateSelection('.size-card', `[data-size="${size}"]`);
    setTimeout(() => {
        showScreen('juice-base-screen');
    }, 300);
}

// اختيار حجم الخلطة الجاهزة
function selectMixSize(size) {
    state.currentItem.size = size;
    animateSelection('.size-card', `[data-size="${size}"]`);
    setTimeout(() => {
        showScreen('extras-screen');
        renderExtras();
    }, 300);
}

// ========================================
// اختيار القاعدة
// ========================================

function selectBase(base) {
    state.currentItem.base = base;
    animateSelection('.base-card', `[data-base="${base}"]`);
    setTimeout(() => {
        showScreen('fruits-screen');
        renderFruits();
    }, 300);
}


// ========================================
// الخلطات الجاهزة
// ========================================

function renderReadyMixes() {
    const grid = document.getElementById('mixes-grid');
    if (!grid) return;

    const allMixes = [...DATA.mixes.two, ...DATA.mixes.three, ...DATA.mixes.four];
    grid.innerHTML = allMixes.map(mix => `
        <div class="mix-card" data-id="${mix.id}" onclick="selectReadyMix('${mix.id}')">
            <div class="mix-emoji">${mix.emoji}</div>
            <div class="mix-name">${mix.name}</div>
            <div class="mix-price">${mix['0.5L']} - ${mix['1L']} د.ج</div>
        </div>
    `).join('');
}

function selectReadyMix(mixId) {
    const allMixes = [...DATA.mixes.two, ...DATA.mixes.three, ...DATA.mixes.four];
    const mix = allMixes.find(m => m.id === mixId);
    if (!mix) return;

    state.currentItem.selectedMix = mix;
    state.currentItem.name = mix.name;
    animateSelection('.mix-card', `[data-id="${mixId}"]`);

    setTimeout(() => {
        showScreen('mix-size-screen');
    }, 300);
}

// ========================================
// اختيار الفواكه (مفردة أو مخصصة)
// ========================================

function renderFruits() {
    const grid = document.getElementById('fruits-grid');
    if (!grid) return;

    const size = state.currentItem.size;
    const maxFruits = state.currentItem.mode === 'single' ? 1 : 5;
    const subtitle = document.getElementById('fruits-subtitle');
    if (subtitle) {
        subtitle.textContent = maxFruits === 1 ? 'اختر فاكهة واحدة' : 'اختر من 1 إلى 5 فواكه لخلطتك';
    }

    // تصنيف الفواكه
    const regular = Object.entries(DATA.fruits).filter(([,f]) => f.cat === 'regular');
    const tropical = Object.entries(DATA.fruits).filter(([,f]) => f.cat === 'tropical');
    const premium = Object.entries(DATA.fruits).filter(([,f]) => f.cat === 'premium');

    let html = '<div class="fruit-category-label">🍎 فواكه عادية</div><div class="fruits-section">';
    html += regular.map(([id, f]) => fruitCard(id, f, size)).join('');
    html += '</div><div class="fruit-category-label">🌴 فواكه استوائية</div><div class="fruits-section">';
    html += tropical.map(([id, f]) => fruitCard(id, f, size)).join('');
    html += '</div>';
    if (premium.length > 0) {
        html += '<div class="fruit-category-label">⭐ فواكه مميزة</div><div class="fruits-section">';
        html += premium.map(([id, f]) => fruitCard(id, f, size)).join('');
        html += '</div>';
    }

    grid.innerHTML = html;
    updateFruitCounter();
}

function fruitCard(id, fruit, size) {
    const selected = state.currentItem.selectedFruits.includes(id);
    return `
        <div class="fruit-card ${selected ? 'selected' : ''}" data-id="${id}" onclick="toggleFruit('${id}')">
            <span class="fruit-emoji">${fruit.emoji}</span>
            <span class="fruit-name">${fruit.name}</span>
            <span class="fruit-price">${fruit[size]} د.ج</span>
            ${selected ? '<span class="fruit-check">✓</span>' : ''}
        </div>
    `;
}

function toggleFruit(id) {
    const item = state.currentItem;
    const maxFruits = item.mode === 'single' ? 1 : 5;
    const idx = item.selectedFruits.indexOf(id);

    if (idx > -1) {
        item.selectedFruits.splice(idx, 1);
    } else {
        if (item.selectedFruits.length >= maxFruits) {
            if (maxFruits === 1) {
                item.selectedFruits = [id];
            } else {
                shakeElement(document.getElementById('fruit-counter'));
                return;
            }
        } else {
            item.selectedFruits.push(id);
        }
    }

    renderFruits();
    updateLivePrice();
}

function updateFruitCounter() {
    const counter = document.getElementById('fruit-counter');
    const btn = document.getElementById('btn-fruits-next');
    const maxFruits = state.currentItem.mode === 'single' ? 1 : 5;
    const count = state.currentItem.selectedFruits.length;

    if (counter) {
        counter.innerHTML = `<span>${count}</span> / ${maxFruits}`;
        const fill = document.getElementById('counter-fill');
        if (fill) fill.style.width = `${(count / maxFruits) * 100}%`;
    }
    if (btn) btn.disabled = count === 0;
}

function updateLivePrice() {
    const el = document.getElementById('live-price-value');
    if (el) {
        const price = calculatePrice();
        el.textContent = price > 0 ? `${price} د.ج` : '---';
    }
}

function confirmFruits() {
    const item = state.currentItem;
    // بناء اسم المشروب
    const names = item.selectedFruits.map(id => DATA.fruits[id]?.name || '');
    item.name = names.join(' + ');
    showScreen('extras-screen');
    renderExtras();
}


// ========================================
// ميلك شيك
// ========================================

function selectMilkshakeMode(mode) {
    state.currentItem.mode = mode;
    setTimeout(() => {
        if (mode === 'ms_choco') {
            showScreen('ms-choco-screen');
            renderMsChoco();
        } else if (mode === 'ms_fruit') {
            showScreen('ms-fruit-screen');
            renderMsFruit();
        } else if (mode === 'ms_mix_ready') {
            showScreen('ms-mix-screen');
            renderMsMixes();
        }
    }, 300);
}

function renderMsChoco() {
    const grid = document.getElementById('ms-choco-grid');
    if (!grid) return;
    grid.innerHTML = DATA.milkshake_choco.map(item => `
        <div class="ms-card" data-id="${item.id}" onclick="selectMsItem('${item.id}', 'choco')">
            <span class="ms-emoji">${item.emoji}</span>
            <div class="ms-info">
                <span class="ms-name">${item.name}</span>
                <span class="ms-desc">${item.desc}</span>
            </div>
        </div>
    `).join('');
}

function renderMsFruit() {
    const grid = document.getElementById('ms-fruit-grid');
    if (!grid) return;
    grid.innerHTML = DATA.milkshake_fruits.map(item => `
        <div class="ms-card" data-id="${item.id}" onclick="selectMsItem('${item.id}', 'fruit')">
            <span class="ms-emoji">${item.emoji}</span>
            <div class="ms-info">
                <span class="ms-name">${item.name}</span>
            </div>
        </div>
    `).join('');
}

function renderMsMixes() {
    const grid = document.getElementById('ms-mix-grid');
    if (!grid) return;
    grid.innerHTML = DATA.milkshake_mixes.map(item => `
        <div class="ms-card" data-id="${item.id}" onclick="selectMsMix('${item.id}')">
            <span class="ms-emoji">${item.emoji}</span>
            <div class="ms-info">
                <span class="ms-name">${item.name}</span>
                <span class="ms-price">${item.M} - ${item['1L']} د.ج</span>
            </div>
        </div>
    `).join('');
}

function selectMsItem(itemId, category) {
    state.currentItem.selectedItem = itemId;
    const list = category === 'choco' ? DATA.milkshake_choco : DATA.milkshake_fruits;
    const item = list.find(i => i.id === itemId);
    if (item) state.currentItem.name = item.name;
    animateSelection('.ms-card', `[data-id="${itemId}"]`);
    setTimeout(() => {
        showScreen('ms-size-screen');
    }, 300);
}

function selectMsMix(mixId) {
    const mix = DATA.milkshake_mixes.find(m => m.id === mixId);
    if (!mix) return;
    state.currentItem.selectedMix = mix;
    state.currentItem.mode = 'ms_mix_ready';
    state.currentItem.name = mix.name;
    animateSelection('.ms-card', `[data-id="${mixId}"]`);
    setTimeout(() => {
        showScreen('ms-size-screen');
    }, 300);
}

function selectMsSize(size) {
    state.currentItem.size = size;
    animateSelection('.size-card', `[data-size="${size}"]`);
    setTimeout(() => {
        showScreen('extras-screen');
        renderExtras();
    }, 300);
}


// ========================================
// الإضافات
// ========================================

function renderExtras() {
    const grid = document.getElementById('extras-grid');
    if (!grid) return;

    const extras = state.currentItem.type === 'juice' ? DATA.extras_juice : DATA.extras_milkshake;
    state.currentItem.extras = [];

    grid.innerHTML = extras.map(ex => `
        <div class="extra-card" data-id="${ex.id}" onclick="toggleExtra('${ex.id}')">
            <span class="extra-emoji">${ex.emoji}</span>
            <div class="extra-info">
                <span class="extra-name">${ex.name}</span>
                <span class="extra-price">+${ex.price} د.ج</span>
            </div>
        </div>
    `).join('');
}

function toggleExtra(id) {
    const idx = state.currentItem.extras.indexOf(id);
    const card = document.querySelector(`.extra-card[data-id="${id}"]`);

    if (idx > -1) {
        state.currentItem.extras.splice(idx, 1);
        if (card) card.classList.remove('selected');
    } else {
        state.currentItem.extras.push(id);
        if (card) card.classList.add('selected');
    }
}

// ========================================
// إضافة إلى السلة وعرض الفاتورة
// ========================================

function addToCart() {
    calculatePrice();
    state.cart.push({ ...state.currentItem });
    showScreen('cart-screen');
    renderCart();
}

function addAnotherDrink() {
    resetCurrentItem();
    showScreen('type-screen');
}

function renderCart() {
    const list = document.getElementById('cart-list');
    const totalEl = document.getElementById('cart-total');
    if (!list || !totalEl) return;

    let total = 0;
    list.innerHTML = state.cart.map((item, i) => {
        total += item.price;
        const sizeLabel = item.size || '';
        const typeIcon = item.type === 'juice' ? '🍹' : '🥤';
        return `
            <div class="cart-item">
                <div class="cart-item-header">
                    <span class="cart-item-icon">${typeIcon}</span>
                    <span class="cart-item-name">${item.name || 'مشروب'}</span>
                    <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-size">${sizeLabel}</span>
                    ${item.extras.length > 0 ? `<span class="cart-item-extras">+ ${item.extras.length} إضافات</span>` : ''}
                    <span class="cart-item-price">${item.price} د.ج</span>
                </div>
            </div>
        `;
    }).join('');

    totalEl.textContent = `${total} د.ج`;
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    if (state.cart.length === 0) {
        newOrder();
    } else {
        renderCart();
    }
}

function showInvoice() {
    if (state.cart.length === 0) return;

    const details = document.getElementById('invoice-details');
    const totalEl = document.getElementById('invoice-total-price');
    const dateEl = document.getElementById('invoice-date');
    const numberEl = document.getElementById('invoice-number');

    // التاريخ ورقم الطلب
    const now = new Date();
    if (dateEl) dateEl.textContent = now.toLocaleDateString('ar-DZ', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    if (numberEl) numberEl.textContent = `#${Math.floor(Math.random() * 9000) + 1000}`;

    let html = '';
    let grandTotal = 0;

    state.cart.forEach((item, idx) => {
        const typeIcon = item.type === 'juice' ? '🍹' : '🥤';
        const typeName = item.type === 'juice' ? 'عصير' : 'ميلك شيك';
        html += `<div class="invoice-item">`;
        html += `<div class="invoice-item-header">${typeIcon} ${item.name} <small>(${item.size})</small></div>`;

        // الإضافات
        if (item.extras.length > 0) {
            const extrasList = item.type === 'juice' ? DATA.extras_juice : DATA.extras_milkshake;
            const extraNames = item.extras.map(exId => {
                const ex = extrasList.find(e => e.id === exId);
                return ex ? ex.name : '';
            }).filter(Boolean);
            if (extraNames.length > 0) {
                html += `<div class="invoice-item-extras">إضافات: ${extraNames.join('، ')}</div>`;
            }
        }

        html += `<div class="invoice-item-price">${item.price} د.ج</div>`;
        html += `</div>`;
        grandTotal += item.price;
    });

    if (details) details.innerHTML = html;
    if (totalEl) totalEl.textContent = `${grandTotal} د.ج`;

    showScreen('invoice-screen');
}


// ========================================
// مساعدات
// ========================================

function animateSelection(allSelector, targetSelector) {
    document.querySelectorAll(allSelector).forEach(el => el.classList.remove('selected'));
    const target = document.querySelector(targetSelector);
    if (target) target.classList.add('selected');
}

function shakeElement(el) {
    if (!el) return;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
}

// ========================================
// تهيئة
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    resetCurrentItem();
    // تهيئة شاشة الخلطات الجاهزة
    const mixGrid = document.getElementById('mixes-grid');
    if (mixGrid) renderReadyMixes();
    console.log('🍹 ذوق فروتس v2.0 - جاهز!');
});
