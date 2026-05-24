// ============== HISTORY PAGE ==============
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

function filterHistory(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.history-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('tunistay_history') || '[]');
  const container = document.getElementById('historyList');
  
  let filtered = history;
  if (currentFilter !== 'all') {
    filtered = history.filter(b => b.status === currentFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <i class="fas fa-inbox"></i>
        <h3>Aucune réservation trouvée</h3>
        <p>${currentFilter === 'all' ? 'Vous n\'avez pas encore effectué de réservation.' : 'Aucune réservation avec ce statut.'}</p>
        <a href="/" style="color: var(--primary); margin-top: 10px; display: inline-block;">← Retour à la recherche</a>
      </div>
    `;
    return;
  }


  container.innerHTML = filtered.map(booking => {
    const statusLabels = {
      pending: 'En Attente',
      confirmed: 'Confirmée',
      paid: 'Payée',
      cancelled: 'Annulée'
    };
    const statusLabel = statusLabels[booking.status] || booking.status;
    const date = new Date(booking.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    return `
      <div class="history-item">
        <div class="history-item-info">
          <h4><i class="fas fa-hotel" style="color:var(--primary); margin-right:6px;"></i>${booking.hotelName} ${'★'.repeat(booking.hotelStars || 0)}</h4>
          <p><i class="fas fa-map-marker-alt"></i> ${booking.city} | ${booking.boardType}</p>
          <p><i class="fas fa-user"></i> ${booking.clientName} - ${booking.clientPhone}</p>
          <p><i class="fas fa-calendar"></i> ${formatDateFR(booking.checkIn)} → ${formatDateFR(booking.checkOut)}</p>
        </div>
        <div class="history-item-meta">
          <div class="history-item-price">${formatPriceFR(booking.totalPrice)} DZD</div>
          <div class="history-item-date">${date}</div>
          <span class="status-badge status-${booking.status}" style="margin-top:6px;">${statusLabel}</span>
          <div style="margin-top:8px;">
            <span style="font-size:0.75rem; color:var(--gray);">Réf: ${booking.id}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function formatDateFR(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPriceFR(p) {
  if (!p) return '0';
  return Math.round(p).toLocaleString('fr-FR');
}
