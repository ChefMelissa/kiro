/* =========================================================
   ذوق فروتس — مولّد فاتورة حرارية (Thermal receipt)
   مشترك بين الكشك ولوحة المحل. يملأ #printArea ثم يُطبع.
   ========================================================= */
(function (g) {
  'use strict';

  function money(n) { return (n || 0).toLocaleString('en-US'); }

  function renderReceiptHTML(order) {
    const d = new Date(order.createdAt || Date.now());
    const date = d.toLocaleDateString('en-GB');
    const time = d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    const typeStr = order.orderType === 'dinein' ? 'تناول بالمحل' : 'سفري';

    const items = (order.items || []).map(it => {
      const sub = it.sizeLabel + (it.extras && it.extras.length ? ' + ' + it.extras.join('، ') : '');
      return `
      <div class="t-item">
        <div class="t-row"><span class="t-name">${it.qty}× ${it.name}</span><span class="t-amt">${money(it.price)}</span></div>
        <div class="t-sub">${sub}</div>
      </div>`;
    }).join('');

    return `
    <div class="ticket">
      <div class="t-head">
        <div class="t-logo">🍹</div>
        <div class="t-shop">ذوق فروتس</div>
        <div class="t-slogan">DHAWQ FRUITS — عصائر طبيعية</div>
      </div>
      <div class="t-line"></div>
      <div class="t-meta">
        <div class="t-meta-row"><span>رقم الطلب</span><b>#${order.numStr || order.num}</b></div>
        <div class="t-meta-row"><span>التاريخ</span><b>${date} — ${time}</b></div>
        <div class="t-meta-row"><span>الاسم</span><b>${order.name || '—'}</b></div>
        <div class="t-meta-row"><span>النوع</span><b>${typeStr}</b></div>
      </div>
      <div class="t-line"></div>
      <div class="t-cols"><span>الصنف</span><span>السعر</span></div>
      <div class="t-line thin"></div>
      <div class="t-items">${items}</div>
      <div class="t-line"></div>
      <div class="t-total"><span>الإجمالي</span><span>${money(order.total)} دج</span></div>
      <div class="t-line"></div>
      <div class="t-foot">
        <div>شكراً لزيارتكم 💚</div>
        <div>أظهِر رقم الطلب عند الاستلام</div>
        <div class="t-ig">@dhawq.fruits</div>
      </div>
    </div>`;
  }

  // طباعة طلب معيّن: يملأ #printArea ثم يفتح حوار الطباعة
  function printOrder(order) {
    const pa = document.getElementById('printArea');
    if (pa) pa.innerHTML = renderReceiptHTML(order);
    try { window.print(); } catch (e) {}
  }

  g.renderReceiptHTML = renderReceiptHTML;
  g.printOrder = printOrder;
})(typeof window !== 'undefined' ? window : this);
