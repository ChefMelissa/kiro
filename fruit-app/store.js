/* =========================================================
   ذوق فروتس — طبقة مزامنة الطلبات (Order Store)
   تعمل بين الكشك (التابلت) ولوحة صاحب المحل.

   أوضاع المزامنة:
   1) محلي (افتراضي): localStorage + BroadcastChannel + حدث storage
      → يعمل فوراً بين النوافذ/التبويبات على نفس الجهاز/المتصفح.
   2) Firebase (اختياري): إذا أدخل صاحب المحل إعدادات Firebase،
      تتزامن الطلبات لحظياً بين أجهزة مختلفة (تابلت الزبون + شاشة المطبخ).
   ========================================================= */
(function (global) {
  'use strict';

  const ORDERS_KEY = 'dhawq_orders_v2';
  const SEQ_KEY    = 'dhawq_seq_day';
  const FB_KEY     = 'dhawq_fb_cfg';

  let channel = null;
  try { if ('BroadcastChannel' in global) channel = new BroadcastChannel('dhawq_orders'); } catch (e) {}

  const subscribers = [];
  let fbAdapter = null;     // محوّل Firebase عند التفعيل
  let fbOrders = null;      // أحدث نسخة من Firebase

  /* ---------- تخزين محلي ---------- */
  function localRead() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; }
  }
  function localWrite(arr) {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  /* ---------- رقم الطلب التسلسلي (يتجدد كل يوم) ---------- */
  function nextNumber() {
    const today = new Date().toISOString().slice(0, 10);
    let s = {};
    try { s = JSON.parse(localStorage.getItem(SEQ_KEY) || '{}'); } catch (e) {}
    if (s.day !== today) s = { day: today, n: 0 };
    s.n = (s.n || 0) + 1;
    try { localStorage.setItem(SEQ_KEY, JSON.stringify(s)); } catch (e) {}
    return s.n;
  }

  /* ---------- الإشعار للمشتركين ---------- */
  function notify() {
    const data = getOrders();
    subscribers.forEach(fn => { try { fn(data); } catch (e) {} });
  }

  /* ---------- واجهة عامة ---------- */
  function getOrders() {
    const arr = fbAdapter && fbOrders ? fbOrders.slice() : localRead();
    return arr.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }

  function addOrder(order) {
    order.id = order.id || ('o_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    order.status = order.status || 'new';
    order.createdAt = order.createdAt || Date.now();
    order.updatedAt = order.createdAt;
    if (fbAdapter) {
      fbAdapter.add(order);
    } else {
      const arr = localRead(); arr.push(order); localWrite(arr);
      broadcast(); notify();
    }
    return order;
  }

  function updateStatus(id, status) {
    if (fbAdapter) {
      fbAdapter.update(id, { status, updatedAt: Date.now() });
    } else {
      const arr = localRead();
      const o = arr.find(x => x.id === id);
      if (o) { o.status = status; o.updatedAt = Date.now(); }
      localWrite(arr); broadcast(); notify();
    }
  }

  function removeOrder(id) {
    if (fbAdapter) { fbAdapter.remove(id); }
    else { localWrite(localRead().filter(x => x.id !== id)); broadcast(); notify(); }
  }

  function clearAll() {
    if (fbAdapter) { fbAdapter.clear(); }
    else { localWrite([]); broadcast(); notify(); }
  }

  function onChange(fn) { subscribers.push(fn); fn(getOrders()); }

  function broadcast() { try { if (channel) channel.postMessage({ t: Date.now() }); } catch (e) {} }

  /* ---------- مزامنة محلية بين النوافذ ---------- */
  if (channel) channel.onmessage = () => notify();
  global.addEventListener && global.addEventListener('storage', (e) => {
    if (e.key === ORDERS_KEY) notify();
  });

  /* ---------- محوّل Firebase (اختياري) ---------- */
  function getFbConfig() {
    try { return JSON.parse(localStorage.getItem(FB_KEY) || 'null'); } catch (e) { return null; }
  }
  function setFbConfig(cfg) {
    try {
      if (cfg) localStorage.setItem(FB_KEY, JSON.stringify(cfg));
      else localStorage.removeItem(FB_KEY);
    } catch (e) {}
  }
  function initFirebase() {
    const cfg = getFbConfig();
    if (!cfg || !global.firebase || !global.firebase.firestore) return false;
    try {
      if (!global.firebase.apps || !global.firebase.apps.length) global.firebase.initializeApp(cfg);
      const col = global.firebase.firestore().collection('orders');
      fbAdapter = {
        add: (o) => col.doc(o.id).set(o),
        update: (id, patch) => col.doc(id).update(patch),
        remove: (id) => col.doc(id).delete(),
        clear: () => col.get().then(s => s.forEach(d => d.ref.delete())),
      };
      col.onSnapshot((snap) => {
        const arr = [];
        snap.forEach(d => arr.push(d.data()));
        fbOrders = arr;
        notify();
      });
      return true;
    } catch (e) { console.warn('Firestore init failed, using local mode', e); fbAdapter = null; return false; }
  }

  // محاولة تفعيل Firebase إذا كان متاحاً ومُعدّاً
  function tryEnableFirebase() { return initFirebase(); }

  global.OrderStore = {
    getOrders, addOrder, updateStatus, removeOrder, clearAll, onChange, nextNumber,
    getFbConfig, setFbConfig, tryEnableFirebase,
    get mode() { return fbAdapter ? 'firebase' : 'local'; }
  };
})(typeof window !== 'undefined' ? window : this);
