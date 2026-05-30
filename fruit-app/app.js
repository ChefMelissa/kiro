/* ========================================
   ذوق فروتس - Dhawq Fruits App
   المنطق البرمجي الكامل
   ======================================== */

// ========================================
// بيانات المنتجات - Products Data
// ========================================

const PRODUCTS = {
    // العصائر الطبيعية (Fresh Juice)
    fruits: [
        { id: 'orange', name: 'برتقال', emoji: '🍊', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'lemon', name: 'ليمون', emoji: '🍋', prices: { M: 250, L: 300, '1L': 500 }, category: 'regular' },
        { id: 'mandarin', name: 'يوسفي', emoji: '🍊', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'strawberry', name: 'فراولة', emoji: '🍓', prices: { M: 350, L: 400, '1L': 700 }, category: 'regular' },
        { id: 'apple', name: 'تفاح', emoji: '🍏', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'pomegranate', name: 'رمان', emoji: '🫐', prices: { M: 350, L: 400, '1L': 700 }, category: 'regular' },
        { id: 'pear', name: 'إجاص', emoji: '🍐', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'apricot', name: 'مشمش', emoji: '🍑', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'peach', name: 'خوخ', emoji: '🍑', prices: { M: 350, L: 400, '1L': 700 }, category: 'regular' },
        { id: 'melon', name: 'شمام', emoji: '🍈', prices: { M: 350, L: 400, '1L': 700 }, category: 'regular' },
        { id: 'watermelon', name: 'بطيخ', emoji: '🍉', prices: { M: 300, L: 350, '1L': 600 }, category: 'regular' },
        { id: 'grape', name: 'عنب', emoji: '🍇', prices: { M: 700, L: 900, '1L': 1600 }, category: 'premium' },
        { id: 'cherry', name: 'كرز', emoji: '🍒', prices: { M: 350, L: 400, '1L': 700 }, category: 'regular' },
        { id: 'fig', name: 'تين', emoji: '🫐', prices: { M: 400, L: 450, '1L': 800 }, category: 'regular' },
        // الفواكه الاستوائية
        { id: 'kiwi', name: 'كيوي', emoji: '🥝', prices: { M: 500, L: 550, '1L': 1000 }, category: 'tropical' },
        { id: 'pineapple', name: 'أناناس', emoji: '🍍', prices: { M: 900, L: 1200, '1L': 2000 }, category: 'tropical' },
        { id: 'avocado', name: 'أفوكادو', emoji: '🥑', prices: { M: 750, L: 950, '1L': 1600 }, category: 'tropical' },
        { id: 'banana', name: 'موز', emoji: '🍌', prices: { M: 300, L: 350, '1L': 600 }, category: 'tropical' },
        { id: 'mango', name: 'مانجو', emoji: '🥭', prices: { M: 900, L: 1200, '1L': 2000 }, category: 'tropical' },
        { id: 'dragonfruit', name: 'فاكهة التنين', emoji: '🐉', prices: { M: 750, L: 900, '1L': 1500 }, category: 'tropical' },
    ],

    // ميلك شيك - شوكولاتة
    milkshake_choco: [
        { id: 'choco', name: 'شوكو', emoji: '🍫', prices: { M: 550, L: 600, '1L': 1100 }, desc: 'Mars, Bounty, Snickers, KitKat' },
        { id: 'cookies', name: 'كوكيز', emoji: '🍪', prices: { M: 350, L: 400, '1L': 700 }, desc: 'Lotus, Biscoff' },
        { id: 'raffa_ferrero', name: 'رفاييلو & فيريرو', emoji: '🍬', prices: { M: 600, L: 650, '1L': 1200 }, desc: 'Raffaello, Ferrero' },
        { id: 'caramel', name: 'كراميل', emoji: '🍯', prices: { M: 400, L: 450, '1L': 800 }, desc: 'Caramel Cream' },
        { id: 'nuts', name: 'مكسرات', emoji: '🥜', prices: { M: 450, L: 500, '1L': 900 }, desc: 'Mixed Nuts' },
    ],

    // ميلك شيك - فواكه
    milkshake_fruits: [
        { id: 'ms_strawberry', name: 'فراولة', emoji: '🍓', prices: { M: 400, L: 450, '1L': 800 } },
        { id: 'ms_banana', name: 'موز', emoji: '🍌', prices: { M: 350, L: 400, '1L': 700 } },
        { id: 'ms_kiwi', name: 'كيوي', emoji: '🥝', prices: { M: 500, L: 550, '1L': 1000 } },
        { id: 'ms_blueberry', name: 'توت', emoji: '🫐', prices: { M: 450, L: 500, '1L': 900 } },
        { id: 'ms_pistachio', name: 'بيستاشيو', emoji: '🌰', prices: { M: 450, L: 500, '1L': 900 } },
        { id: 'ms_coconut', name: 'جوز الهند', emoji: '🥥', prices: { M: 400, L: 450, '1L': 800 } },
    ],

    // الإضافات - فروي
    extras_fruity: [
        { id: 'raisin', name: 'زبيب', emoji: '🫐', price: 100 },
        { id: 'nuts_extra', name: 'مكسرات', emoji: '🥜', price: 150 },
        { id: 'honey', name: 'عسل', emoji: '🍯', price: 100 },
        { id: 'date_syrup', name: 'دبس التمر', emoji: '🍶', price: 100 },
        { id: 'deglet', name: 'دقلة', emoji: '🌴', price: 50 },
    ],

    // الإضافات - ميلك شيك
    extras_milkshake: [
        { id: 'ms_raisin', name: 'زبيب', emoji: '🫐', price: 100 },
        { id: 'ms_nuts', name: 'مكسرات', emoji: '🥜', price: 150 },
        { id: 'ms_honey', name: 'عسل', emoji: '🍯', price: 100 },
        { id: 'ms_coconut_extra', name: 'جوز الهند', emoji: '🥥', price: 100 },
        { id: 'ms_fruits_extra', name: 'فواكه', emoji: '🍓', price: 100 },
        { id: 'ms_choco_extra', name: 'شوكو (نوتيلا)', emoji: '🍫', price: 250 },
        { id: 'ms_oat', name: 'شوفان', emoji: '🌾', price: 50 },
        { id: 'ms_date_syrup', name: 'دبس التمر', emoji: '🍶', price: 100 },
        { id: 'ms_deglet', name: 'دقلة', emoji: '🌴', price: 50 },
    ]
};

// ========================================
// حالة التطبيق - App State
// ========================================

let order = {
    type: null,          // 'fruity' أو 'milkshake'
    size: null,          // 'M', 'L', '1L'
    base: null,          // 'water', 'milk', 'orange' (فروي فقط)
    milkshakeCategory: null, // 'choco' أو 'fruits' (ميلك شيك فقط)
    ingredients: [],     // المكونات المختارة
    extras: [],          // الإضافات المختارة
    price: 0            // السعر الإجمالي
};

// ========================================
// التنقل بين الشاشات - Navigation
// ========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
}

function goBack(screenId) {
    showScreen(screenId);
}

function goBackFromIngredients() {
    if (order.type === 'fruity') {
        showScreen('base-screen');
    } else {
        showScreen('milkshake-category-screen');
    }
}

function startOrder() {
    showScreen('type-screen');
}

function newOrder() {
    order = {
        type: null,
        size: null,
        base: null,
        milkshakeCategory: null,
        ingredients: [],
        extras: [],
        price: 0
    };
    showScreen('welcome-screen');
}

// ========================================
// اختيار نوع المشروب - Select Type
// ========================================

function selectType(type) {
    order.type = type;
    order.ingredients = [];
    order.extras = [];
    
    // تأثير بصري
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-type="${type}"]`)?.classList.add('selected');
    
    setTimeout(() => {
        showScreen('size-screen');
    }, 300);
}

// ========================================
// اختيار الحجم - Select Size
// ========================================

function selectSize(size) {
    order.size = size;
    
    document.querySelectorAll('.size-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-size="${size}"]`)?.classList.add('selected');
    
    setTimeout(() => {
        if (order.type === 'fruity') {
            showScreen('base-screen');
        } else {
            showScreen('milkshake-category-screen');
        }
    }, 300);
}

// ========================================
// اختيار القاعدة - Select Base
// ========================================

function selectBase(base) {
    order.base = base;
    
    document.querySelectorAll('.base-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-base="${base}"]`)?.classList.add('selected');
    
    setTimeout(() => {
        setupIngredientsScreen();
        showScreen('ingredients-screen');
    }, 300);
}

// ========================================
// فئة الميلك شيك - Milkshake Category
// ========================================

function selectMilkshakeCategory(category) {
    order.milkshakeCategory = category;
    
    setTimeout(() => {
        setupIngredientsScreen();
        showScreen('ingredients-screen');
    }, 300);
}

// ========================================
// إعداد شاشة المكونات - Setup Ingredients
// ========================================

function setupIngredientsScreen() {
    const grid = document.getElementById('ingredients-grid');
    const title = document.getElementById('ingredients-title');
    const subtitle = document.getElementById('ingredients-subtitle');
    const countMax = document.getElementById('count-max');
    
    let items = [];
    let maxSelection = 5;
    
    if (order.type === 'fruity') {
        items = PRODUCTS.fruits;
        title.textContent = 'اختر الفواكه';
        subtitle.textContent = 'يمكنك اختيار من 1 إلى 5 فواكه';
        maxSelection = 5;
    } else if (order.milkshakeCategory === 'choco') {
        items = PRODUCTS.milkshake_choco;
        title.textContent = 'اختر نوع الشوكولاتة';
        subtitle.textContent = 'اختر نوع واحد';
        maxSelection = 1;
    } else {
        items = PRODUCTS.milkshake_fruits;
        title.textContent = 'اختر الفاكهة';
        subtitle.textContent = 'اختر نوع واحد';
        maxSelection = 1;
    }
    
    countMax.textContent = maxSelection;
    document.getElementById('count-number').textContent = '0';
    document.getElementById('counter-fill').style.width = '0%';
    document.getElementById('live-price-value').textContent = '0 د.ج';
    
    order.ingredients = [];
    
    grid.innerHTML = items.map(item => `
        <div class="ingredient-card" data-id="${item.id}" onclick="toggleIngredient('${item.id}', ${maxSelection})">
            <span class="ingredient-emoji">${item.emoji}</span>
            <span class="ingredient-name">${item.name}</span>
            <span class="ingredient-price">${item.prices[order.size]} د.ج</span>
        </div>
    `).join('');
    
    updateNextButton();
}

// ========================================
// تبديل المكونات - Toggle Ingredient
// ========================================

function toggleIngredient(id, maxSelection) {
    const index = order.ingredients.indexOf(id);
    
    if (index > -1) {
        // إزالة
        order.ingredients.splice(index, 1);
        document.querySelector(`.ingredient-card[data-id="${id}"]`).classList.remove('selected');
    } else {
        // إضافة
        if (order.ingredients.length >= maxSelection) {
            if (maxSelection === 1) {
                // ميلك شيك: استبدال الاختيار
                const oldId = order.ingredients[0];
                document.querySelector(`.ingredient-card[data-id="${oldId}"]`)?.classList.remove('selected');
                order.ingredients = [id];
            } else {
                // الحد الأقصى
                shakeElement(document.getElementById('selected-counter'));
                return;
            }
        } else {
            order.ingredients.push(id);
        }
        document.querySelector(`.ingredient-card[data-id="${id}"]`).classList.add('selected');
    }
    
    // تحديث العداد
    const count = order.ingredients.length;
    document.getElementById('count-number').textContent = count;
    document.getElementById('counter-fill').style.width = `${(count / maxSelection) * 100}%`;
    
    // تحديث السعر المباشر
    updateLivePrice();
    
    // تحديث حالة الزر
    updateNextButton();
    
    // تعطيل/تفعيل البطاقات
    if (order.type === 'fruity') {
        document.querySelectorAll('.ingredient-card').forEach(card => {
            if (!card.classList.contains('selected') && count >= maxSelection) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });
    }
}

// ========================================
// حساب سعر الكوكتيل الذكي
// Smart Cocktail Pricing
// ========================================

function calculateCocktailPrice() {
    if (order.ingredients.length === 0) return 0;
    
    const size = order.size;
    let items;
    
    if (order.type === 'fruity') {
        items = PRODUCTS.fruits;
    } else if (order.milkshakeCategory === 'choco') {
        items = PRODUCTS.milkshake_choco;
    } else {
        items = PRODUCTS.milkshake_fruits;
    }
    
    const selectedItems = order.ingredients.map(id => items.find(i => i.id === id)).filter(Boolean);
    
    if (selectedItems.length === 0) return 0;
    if (selectedItems.length === 1) return selectedItems[0].prices[size];
    
    // ====================================
    // نظام التسعير الذكي للكوكتيل V3
    // ====================================
    // المبدأ: المتوسط المرجح التصاعدي
    // - الفاكهة الأغلى تأخذ 55% من وزن السعر (لأنها المكون الرئيسي)
    // - باقي الفواكه تتقاسم 45% بالتساوي
    // - هامش 30% + 50 د.ج تكلفة تحضير
    // - تقريب إلى أقرب 50 د.ج
    // هذا النظام يتطابق مع أسعار المحل بنسبة ~90%
    // ====================================
    
    const prices = selectedItems.map(item => item.prices[size]);
    const n = prices.length;
    
    // ترتيب الأسعار من الأعلى للأدنى
    const sortedPrices = [...prices].sort((a, b) => b - a);
    
    // الفاكهة الأغلى تأخذ 55%
    const mainWeight = 0.55;
    const restWeight = 0.45 / (n - 1);
    
    let weightedPrice = sortedPrices[0] * mainWeight;
    for (let i = 1; i < n; i++) {
        weightedPrice += sortedPrices[i] * restWeight;
    }
    
    // هامش تحضير (30%) + تكلفة ثابتة
    const finalPrice = weightedPrice * 1.30 + 50;
    
    // تقريب إلى أقرب 50 د.ج
    return Math.round(finalPrice / 50) * 50;
}

// ========================================
// تحديث السعر المباشر - Update Live Price
// ========================================

function updateLivePrice() {
    const price = calculateCocktailPrice();
    document.getElementById('live-price-value').textContent = price > 0 ? `${price} د.ج` : '0 د.ج';
}

// ========================================
// تحديث زر التالي - Update Next Button
// ========================================

function updateNextButton() {
    const btn = document.getElementById('btn-next-ingredients');
    btn.disabled = order.ingredients.length === 0;
}

// ========================================
// شاشة الإضافات - Setup Extras
// ========================================

function goToExtras() {
    setupExtrasScreen();
    showScreen('extras-screen');
}

function setupExtrasScreen() {
    const grid = document.getElementById('extras-grid');
    const extras = order.type === 'fruity' ? PRODUCTS.extras_fruity : PRODUCTS.extras_milkshake;
    
    order.extras = [];
    
    grid.innerHTML = extras.map(item => `
        <div class="extra-card" data-id="${item.id}" onclick="toggleExtra('${item.id}')">
            <span class="extra-emoji">${item.emoji}</span>
            <div class="extra-info">
                <div class="extra-name">${item.name}</div>
                <div class="extra-price">+${item.price} د.ج</div>
            </div>
        </div>
    `).join('');
}

// ========================================
// تبديل الإضافات - Toggle Extra
// ========================================

function toggleExtra(id) {
    const index = order.extras.indexOf(id);
    const card = document.querySelector(`.extra-card[data-id="${id}"]`);
    
    if (index > -1) {
        order.extras.splice(index, 1);
        card.classList.remove('selected');
    } else {
        order.extras.push(id);
        card.classList.add('selected');
    }
}

// ========================================
// عرض الفاتورة - Show Invoice
// ========================================

function showInvoice() {
    const details = document.getElementById('invoice-details');
    const totalEl = document.getElementById('invoice-total-price');
    const dateEl = document.getElementById('invoice-date');
    const numberEl = document.getElementById('invoice-number');
    
    // التاريخ ورقم الطلب
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    numberEl.textContent = `طلب #${Math.floor(Math.random() * 9000) + 1000}`;
    
    // حساب التفاصيل
    let html = '';
    let total = 0;
    
    // نوع المشروب
    const typeName = order.type === 'fruity' ? 'كأس فروي 🍹' : 'ميلك شيك 🥤';
    html += `<div class="invoice-row"><span class="invoice-row-label">النوع</span><span class="invoice-row-value">${typeName}</span></div>`;
    
    // الحجم
    const sizeNames = { 'M': 'وسط (M)', 'L': 'كبير (L)', '1L': 'لتر (1L)' };
    html += `<div class="invoice-row"><span class="invoice-row-label">الحجم</span><span class="invoice-row-value">${sizeNames[order.size]}</span></div>`;
    
    // القاعدة (فروي فقط)
    if (order.type === 'fruity' && order.base) {
        const baseNames = { water: 'ماء 💧', milk: 'حليب 🥛', orange: 'عصير برتقال 🍊' };
        html += `<div class="invoice-row"><span class="invoice-row-label">القاعدة</span><span class="invoice-row-value">${baseNames[order.base]}</span></div>`;
    }
    
    // الفئة (ميلك شيك)
    if (order.type === 'milkshake') {
        const catName = order.milkshakeCategory === 'choco' ? 'شوكولاتة 🍫' : 'فواكه 🍓';
        html += `<div class="invoice-row"><span class="invoice-row-label">الفئة</span><span class="invoice-row-value">${catName}</span></div>`;
    }
    
    html += `<div class="invoice-divider"><span></span></div>`;
    html += `<div class="invoice-section-title">المكونات</div>`;
    
    // المكونات
    let items;
    if (order.type === 'fruity') {
        items = PRODUCTS.fruits;
    } else if (order.milkshakeCategory === 'choco') {
        items = PRODUCTS.milkshake_choco;
    } else {
        items = PRODUCTS.milkshake_fruits;
    }
    
    const selectedItems = order.ingredients.map(id => items.find(i => i.id === id)).filter(Boolean);
    
    if (selectedItems.length === 1) {
        // فاكهة واحدة = سعرها مباشرة
        const item = selectedItems[0];
        const price = item.prices[order.size];
        html += `<div class="invoice-row highlight">
            <span class="invoice-row-label">${item.emoji} ${item.name}</span>
            <span class="invoice-row-value">${price} د.ج</span>
        </div>`;
        total += price;
    } else {
        // كوكتيل متعدد
        selectedItems.forEach(item => {
            html += `<div class="invoice-row">
                <span class="invoice-row-label">${item.emoji} ${item.name}</span>
                <span class="invoice-row-value" style="color: var(--text-muted); font-size: 0.8rem">${item.prices[order.size]} د.ج</span>
            </div>`;
        });
        
        const cocktailPrice = calculateCocktailPrice();
        html += `<div class="invoice-row highlight">
            <span class="invoice-row-label">🍹 سعر الكوكتيل (${selectedItems.length} فواكه)</span>
            <span class="invoice-row-value">${cocktailPrice} د.ج</span>
        </div>`;
        total += cocktailPrice;
    }
    
    // الإضافات
    if (order.extras.length > 0) {
        html += `<div class="invoice-divider"><span></span></div>`;
        html += `<div class="invoice-section-title">الإضافات</div>`;
        
        const extras = order.type === 'fruity' ? PRODUCTS.extras_fruity : PRODUCTS.extras_milkshake;
        
        order.extras.forEach(extraId => {
            const extra = extras.find(e => e.id === extraId);
            if (extra) {
                html += `<div class="invoice-row">
                    <span class="invoice-row-label">${extra.emoji} ${extra.name}</span>
                    <span class="invoice-row-value">+${extra.price} د.ج</span>
                </div>`;
                total += extra.price;
            }
        });
    }
    
    details.innerHTML = html;
    totalEl.textContent = `${total} د.ج`;
    order.price = total;
    
    showScreen('invoice-screen');
}

// ========================================
// تأثير الاهتزاز - Shake Effect
// ========================================

function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // force reflow
    el.style.animation = 'shake 0.5s ease';
    setTimeout(() => { el.style.animation = ''; }, 500);
}

// إضافة CSS للاهتزاز
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-5px); }
        40% { transform: translateX(5px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(3px); }
    }
`;
document.head.appendChild(shakeStyle);

// ========================================
// تهيئة التطبيق - Init
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🍹 ذوق فروتس - جاهز!');
});
