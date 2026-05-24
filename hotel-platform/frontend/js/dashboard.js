// ============== DASHBOARD STATE ==============
let currentPage = 1;
let currentReservations = [];

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadDashboard();
});

function initNavigation() {
  document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      
      // Update active state
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show section
      document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
      document.getElementById(`section-${section}`).style.display = 'block';
      
      // Update title
      const titles = {
        overview: 'Vue d\'ensemble',
        reservations: 'Réservations',
        settings: 'Paramètres'
      };
      document.getElementById('pageTitle').textContent = titles[section];
      
      // Load data
      if (section === 'reservations') loadReservations();
      if (section === 'overview') loadStats();
    });
  });
}

// ============== LOAD DASHBOARD DATA ==============
async function loadDashboard() {
  await loadStats();
}

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    // Update stat cards
    document.getElementById('statTotal').textContent = stats.totalReservations;
    document.getElementById('statPending').textContent = stats.pendingReservations;
    document.getElementById('statConfirmed').textContent = stats.confirmedReservations;
    document.getElementById('statPaid').textContent = stats.paidReservations;
    document.getElementById('statCancelled').textContent = stats.cancelledReservations;
    document.getElementById('statRevenue').textContent = formatPrice(stats.totalRevenue) + ' DZD';
    
    // Top Hotels
    const topHotelsDiv = document.getElementById('topHotels');
    if (stats.topHotels.length === 0) {
      topHotelsDiv.innerHTML = '<p style="color: #999; font-size: 0.9rem;">Aucune donnée disponible</p>';
    } else {
      topHotelsDiv.innerHTML = stats.topHotels.map(hotel => `
        <div class="top-item">
          <span class="top-item-name">${hotel.hotel_name} <small style="color:#999">(${hotel.city})</small></span>
          <span class="top-item-count">${hotel.bookings} réservation(s)</span>
        </div>
      `).join('');
    }
    
    // Cities Stats
    const citiesDiv = document.getElementById('citiesStats');
    if (stats.citiesStats.length === 0) {
      citiesDiv.innerHTML = '<p style="color: #999; font-size: 0.9rem;">Aucune donnée disponible</p>';
    } else {
      citiesDiv.innerHTML = stats.citiesStats.map(city => `
        <div class="top-item">
          <span class="top-item-name"><i class="fas fa-map-marker-alt" style="color: var(--primary); margin-right: 6px;"></i>${city.city}</span>
          <span class="top-item-count">${city.bookings} réservation(s)</span>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Stats error:', error);
  }
}

// ============== RESERVATIONS ==============
async function loadReservations() {
  const status = document.getElementById('filterStatus').value;
  const city = document.getElementById('filterCity').value;
  
  try {
    const params = new URLSearchParams({
      status,
      page: currentPage,
      limit: 15
    });
    if (city) params.append('city', city);
    
    const response = await fetch(`/api/reservations?${params}`);
    const data = await response.json();
    
    currentReservations = data.reservations;
    renderReservations(data.reservations);
    renderPagination(data.total, data.page, data.limit);
  } catch (error) {
    console.error('Load reservations error:', error);
  }
}

function renderReservations(reservations) {
  const tbody = document.getElementById('reservationsBody');
  
  if (reservations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
          <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
          Aucune réservation trouvée
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = reservations.map(r => `
    <tr>
      <td>
        <strong>${r.client_name}</strong><br>
        <small style="color: #999;">${r.client_phone}</small>
      </td>
      <td>
        <strong>${r.hotel_name}</strong><br>
        <small style="color: #FFB800;">${'★'.repeat(r.hotel_stars || 0)}</small>
      </td>
      <td>${r.city}</td>
      <td>
        <small>${formatDate(r.check_in)}</small><br>
        <small>${formatDate(r.check_out)}</small>
      </td>
      <td><small>${r.board_type || '-'}</small></td>
      <td><strong>${formatPrice(r.total_price)} DZD</strong></td>
      <td><span class="status-badge status-${r.status}">${getStatusLabel(r.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn-edit" title="Modifier" onclick="editReservation('${r.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="action-btn action-btn-delete" title="Supprimer" onclick="deleteReservation('${r.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const paginationDiv = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    paginationDiv.innerHTML = '';
    return;
  }
  
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  paginationDiv.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadReservations();
}

// ============== EDIT RESERVATION ==============
function editReservation(id) {
  const reservation = currentReservations.find(r => r.id === id);
  if (!reservation) return;
  
  document.getElementById('editContent').innerHTML = `
    <form class="edit-form" onsubmit="saveReservation(event, '${id}')">
      <div class="booking-summary" style="margin-bottom: 20px;">
        <h4><i class="fas fa-hotel"></i> ${reservation.hotel_name}</h4>
        <div class="detail-row">
          <span>Client</span>
          <span>${reservation.client_name} - ${reservation.client_phone}</span>
        </div>
        <div class="detail-row">
          <span>Dates</span>
          <span>${formatDate(reservation.check_in)} → ${formatDate(reservation.check_out)}</span>
        </div>
        <div class="detail-row">
          <span>Prix</span>
          <span>${formatPrice(reservation.total_price)} DZD</span>
        </div>
      </div>
      
      <div class="form-group">
        <label>Statut</label>
        <select id="editStatus">
          <option value="pending" ${reservation.status === 'pending' ? 'selected' : ''}>En Attente</option>
          <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmée</option>
          <option value="paid" ${reservation.status === 'paid' ? 'selected' : ''}>Payée</option>
          <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Notes</label>
        <textarea id="editNotes">${reservation.notes || ''}</textarea>
      </div>
      
      <button type="submit" class="btn-save">
        <i class="fas fa-save"></i> Enregistrer
      </button>
    </form>
  `;
  
  document.getElementById('editModal').style.display = 'flex';
}

async function saveReservation(e, id) {
  e.preventDefault();
  
  const status = document.getElementById('editStatus').value;
  const notes = document.getElementById('editNotes').value;
  
  try {
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    
    closeEditModal();
    loadReservations();
    loadStats();
    showToast('Réservation mise à jour avec succès');
  } catch (error) {
    console.error('Save error:', error);
    alert('Erreur lors de la sauvegarde');
  }
}

async function deleteReservation(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;
  
  try {
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    loadReservations();
    loadStats();
    showToast('Réservation supprimée');
  } catch (error) {
    console.error('Delete error:', error);
    alert('Erreur lors de la suppression');
  }
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// ============== UTILITIES ==============
function getStatusLabel(status) {
  const labels = {
    pending: 'En Attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    cancelled: 'Annulée'
  };
  return labels[status] || status;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('fr-FR', options);
}

function formatPrice(price) {
  if (!price) return '0';
  return Math.round(price).toLocaleString('fr-FR');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; background: #28a745; color: white;
    padding: 14px 22px; border-radius: 10px; font-weight: 600; z-index: 5000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15); font-size: 0.9rem;
  `;
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Close modal on outside click
document.getElementById('editModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) closeEditModal();
});
