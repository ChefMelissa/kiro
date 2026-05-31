/* =========================================================
   ذوق فروتس — لوحة صاحب المحل (Dashboard)
   ========================================================= */
'use strict';

let soundOn = true;
let knownIds = new Set();
let firstRender = true;

/* ---------- قفل الدخول ---------- */
function getPin() { return localStorage.getItem('dhawq_pin') || '1234'; }
function tryUnlock() {
  const v = (document.getElementById('pinInput').value || '').trim();
  if (v === getPin()) {
    try { sessionStorage.setItem('dhawq_auth', '1'); } catch (e) {}
    enterBoard();
  } else {
    const card = document.querySelector('.lock-card');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    document.getElementById('pinInput').value = '';
  }
}
function enterBoard() {
  document.getElementById('lock').style.display = 'none';
  document.getElementById('board').classList.remove('hidden');
  startBoard();
}

/* ---------- تشغيل اللوحة ---------- */
function startBoard() {
  if (typeof OrderStore !== 'undefined') {
    OrderStore.tryEnableFirebase();
    updateModeBadge();
    OrderStore.onChange(render);
  }
}
function updateModeBadge() {
  const fb = OrderStore.mode === 'firebase';
  const b = document.getElementById('modeBadge');
  b.textContent = fb ? 'متصل (Firebase)' : 'محلي';
  b.classList.toggle('online', fb);
}

/* ---------- الرسم ---------- */
const STATUS_NEXT = { new: 'preparing', preparing: 'ready', ready: 'done' };
const STATUS_BTN = { new: 'بدء التحضير ▶', preparing: 'جاهز ✓', ready: 'تسليم 🎉' };

function isToday(ts) {
  const d = new Date(ts), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return 'منذ ' + m + ' د';
  const h = Math.floor(m / 60); return 'منذ ' + h + ' س';
}

function render(orders) {
  orders = orders || [];
  const active = orders.filter(o => o.status !== 'done');

  // كشف الطلبات الجديدة لتشغيل التنبيه
  const currentIds = new Set(orders.map(o => o.id));
  if (!firstRender) {
    for (const o of orders) {
      if (!knownIds.has(o.id) && o.status === 'new') { onNewOrder(o); break; }
    }
  }
  knownIds = currentIds;
  firstRender = false;

  const buckets = { new: [], preparing: [], ready: [] };
  active.forEach(o => { if (buckets[o.status]) buckets[o.status].push(o); });
  // الأحدث أولاً داخل كل عمود
  Object.keys(buckets).forEach(k => buckets[k].sort((a, b) => b.createdAt - a.createdAt));

  renderColumn('listNew', buckets.new);
  renderColumn('listPrep', buckets.preparing);
  renderColumn('listReady', buckets.ready);
  document.getElementById('cntNew').textContent = buckets.new.length;
  document.getElementById('cntPrep').textContent = buckets.preparing.length;
  document.getElementById('cntReady').textContent = buckets.ready.length;

  // الإحصائيات
  const today = orders.filter(o => isToday(o.createdAt));
  document.getElementById('mOrders').textContent = today.length;
  document.getElementById('mActive').textContent = active.length;
  document.getElementById('mRevenue').textContent =
    today.reduce((s, o) => s + (o.total || 0), 0).toLocaleString('en-US');
}

function renderColumn(id, list) {
  const el = document.getElementById(id);
  if (!list.length) { el.innerHTML = '<div class="col-empty">لا توجد طلبات</div>'; return; }
  el.innerHTML = list.map(o => orderCard(o)).join('');
}

function orderCard(o) {
  const typeBadge = o.orderType === 'dinein'
    ? '<span class="badge dinein">🪑 بالمحل</span>'
    : '<span class="badge takeaway">🥡 سفري</span>';
  const items = (o.items || []).map(it => `
    <div class="oc-item">
      <span class="oc-qty">${it.qty}×</span>
      <span class="oc-name">${it.name}<span class="oc-size">${it.sizeLabel}</span></span>
    </div>
    ${it.extras && it.extras.length ? `<div class="oc-extras">+ ${it.extras.join('، ')}</div>` : ''}
  `).join('');
  const nextBtn = STATUS_NEXT[o.status]
    ? `<button class="oc-advance" onclick="advance('${o.id}')">${STATUS_BTN[o.status]}</button>`
    : '';
  return `
    <div class="order-card s-${o.status}">
      <div class="oc-top">
        <span class="oc-num">#${o.numStr || o.num}</span>
        ${typeBadge}
        <span class="oc-time">${timeAgo(o.createdAt)}</span>
      </div>
      ${o.name ? `<div class="oc-customer">👤 ${o.name}</div>` : ''}
      <div class="oc-items">${items}</div>
      <div class="oc-foot">
        <span class="oc-total">${(o.total || 0).toLocaleString('en-US')} دج</span>
        <div class="oc-actions">
          <button class="oc-del" onclick="del('${o.id}')" title="حذف">🗑</button>
          ${nextBtn}
        </div>
      </div>
    </div>`;
}

function advance(id) {
  const o = OrderStore.getOrders().find(x => x.id === id);
  if (!o) return;
  const next = STATUS_NEXT[o.status];
  if (next) OrderStore.updateStatus(id, next);
}
function del(id) { if (confirm('حذف هذا الطلب؟')) OrderStore.removeOrder(id); }

/* ---------- تنبيه الطلب الجديد ---------- */
function onNewOrder(o) {
  if (soundOn) beep();
  flashTitle('🔔 طلب جديد #' + (o.numStr || o.num));
}
let audioCtx = null;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    [880, 1175].forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination); o.type = 'sine'; o.frequency.value = f;
      const s = t + i * 0.18;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.35, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16);
      o.start(s); o.stop(s + 0.18);
    });
  } catch (e) {}
}
let titleTimer;
function flashTitle(msg) {
  const orig = 'لوحة المحل | ذوق فروتس';
  let on = true; clearInterval(titleTimer);
  let count = 0;
  titleTimer = setInterval(() => {
    document.title = on ? msg : orig; on = !on;
    if (++count > 8) { clearInterval(titleTimer); document.title = orig; }
  }, 600);
}
function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('soundBtn').textContent = soundOn ? '🔔' : '🔕';
  if (soundOn) beep();
}

/* ---------- إعدادات اللوحة ---------- */
function openDashSettings() {
  const fb = (typeof OrderStore !== 'undefined') ? OrderStore.getFbConfig() : null;
  document.getElementById('fbCfg').value = fb ? JSON.stringify(fb, null, 2) : '';
  document.getElementById('pinChange').value = '';
  document.getElementById('fbMode').textContent = 'الوضع الحالي: ' + (OrderStore.mode === 'firebase' ? 'متصل (Firebase)' : 'محلي');
  document.getElementById('dashSettings').classList.add('show');
}
function closeDashSettings() { document.getElementById('dashSettings').classList.remove('show'); }
function saveDashSettings() {
  const pin = (document.getElementById('pinChange').value || '').trim();
  if (pin) localStorage.setItem('dhawq_pin', pin);
  const raw = (document.getElementById('fbCfg').value || '').trim();
  if (!raw) OrderStore.setFbConfig(null);
  else {
    try { OrderStore.setFbConfig(JSON.parse(raw)); }
    catch (e) { alert('صيغة Firebase غير صحيحة'); return; }
  }
  closeDashSettings();
  alert('تم الحفظ. سيُعاد تحميل الصفحة.');
  location.reload();
}
function clearDone() {
  if (!confirm('مسح كل الطلبات المكتملة؟')) return;
  OrderStore.getOrders().filter(o => o.status === 'done').forEach(o => OrderStore.removeOrder(o.id));
}

/* ---------- بدء ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('pinInput');
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
  let authed = false;
  try { authed = sessionStorage.getItem('dhawq_auth') === '1'; } catch (e) {}
  if (authed) enterBoard(); else input.focus();
});
