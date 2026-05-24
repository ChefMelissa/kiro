// ============== CONFIGURATION ==============
const WHATSAPP_NUMBER = '213XXXXXXXXX'; // ← CHANGEZ CECI avec votre numéro WhatsApp

// ============== STATE ==============
let currentHotels = [];
let selectedHotel = null;
let selectedBoard = null;

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
  initDates();
  initSearchForm();
  initFilters();
});

function initDates() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 14);

  document.getElementById('checkIn').min = formatDate(today);
  document.getElementById('checkIn').value = formatDate(nextWeek);
  document.getElementById('checkOut').value = formatDate(twoWeeks);

  document.getElementById('checkIn').addEventListener('change', (e) => {
    const minOut = new Date(e.target.value);
    minOut.setDate(minOut.getDate() + 1);
    document.getElementById('checkOut').min = formatDate(minOut);
    if (new Date(document.getElementById('checkOut').value) <= new Date(e.target.value)) {
      document.getElementById('checkOut').value = formatDate(minOut);
    }
  });
}

function initSearchForm() {
  document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await searchHotels();
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortHotels(btn.dataset.sort);
    });
  });
}

// ============== SEARCH ==============
async function searchHotels() {
  const city = document.getElementById('city').value;
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;

  if (!city || !checkIn || !checkOut) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  showLoading(true);

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, checkIn, checkOut, adults: parseInt(adults), children: parseInt(children) })
    });
    const data = await response.json();
    currentHotels = data.hotels || [];
    displayResults(city, checkIn, checkOut);
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la recherche');
  } finally {
    showLoading(false);
  }
}

function searchCity(city) {
  document.getElementById('city').value = city;
  document.getElementById('searchForm').dispatchEvent(new Event('submit'));
}

// ============== DISPLAY ==============
function displayResults(city, checkIn, checkOut) {
  const section = document.getElementById('resultsSection');
  const grid = document.getElementById('resultsGrid');
  const title = document.getElementById('resultsTitle');
  const nights = calculateNights(checkIn, checkOut);

  title.textContent = `${currentHotels.length} hôtels à ${city} (${nights} nuits)`;
  grid.innerHTML = currentHotels.map((hotel, i) => createHotelCard(hotel, i)).join('');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth' });
}

function createHotelCard(hotel, index) {
  const stars = '★'.repeat(hotel.stars) + '☆'.repeat(5 - hotel.stars);
  const tags = hotel.tags.map(t => `<span class="hotel-tag">${t}</span>`).join('');
  const price = hotel.prices.lpd;

  return `
    <div class="hotel-card" data-index="${index}">
      <div class="hotel-image">
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
        ${hotel.discount ? `<span class="hotel-discount">-${hotel.discount}%</span>` : ''}
      </div>
      <div class="hotel-info">
        <h3 class="hotel-name">${hotel.name}</h3>
        <div class="hotel-stars">${stars}</div>
        <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.city}</div>
        <div class="hotel-tags">${tags}</div>
        <div class="hotel-boards">
          ${Object.keys(hotel.prices).map(key => `
            <button class="board-tab ${key === 'lpd' ? 'active' : ''}" 
                    onclick="switchBoard(${index}, '${key}')">
              ${key === 'lpd' ? 'LPD' : key === 'dp' ? 'DP+' : 'All Inc.'}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="hotel-pricing" id="pricing-${index}">
        <div>
          <div class="price-label">à partir de</div>
          <div class="price-original">${formatPrice(price.originalPrice)} DZD</div>
          <div class="price-current">${formatPrice(price.price)}</div>
          <div class="price-currency">DZD</div>
          <div class="price-nights">${hotel.nights} nuits</div>
        </div>
        <button class="btn-book" onclick="openBooking(${index}, 'lpd')">
          Réserver <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}

function switchBoard(index, boardKey) {
  const hotel = currentHotels[index];
  const price = hotel.prices[boardKey];
  const card = document.querySelectorAll('.hotel-card')[index];
  
  card.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
  card.querySelector(`[onclick="switchBoard(${index}, '${boardKey}')"]`).classList.add('active');

  document.getElementById(`pricing-${index}`).innerHTML = `
    <div>
      <div class="price-label">à partir de</div>
      <div class="price-original">${formatPrice(price.originalPrice)} DZD</div>
      <div class="price-current">${formatPrice(price.price)}</div>
      <div class="price-currency">DZD</div>
      <div class="price-nights">${hotel.nights} nuits</div>
    </div>
    <button class="btn-book" onclick="openBooking(${index}, '${boardKey}')">
      Réserver <i class="fas fa-arrow-right"></i>
    </button>
  `;
}

// ============== SORTING ==============
function sortHotels(type) {
  switch (type) {
    case 'price-asc': currentHotels.sort((a, b) => a.prices.lpd.price - b.prices.lpd.price); break;
    case 'price-desc': currentHotels.sort((a, b) => b.prices.lpd.price - a.prices.lpd.price); break;
    case 'stars': currentHotels.sort((a, b) => b.stars - a.stars); break;
    default: currentHotels.sort((a, b) => (b.discount + b.stars * 5) - (a.discount + a.stars * 5));
  }
  document.getElementById('resultsGrid').innerHTML = currentHotels.map((h, i) => createHotelCard(h, i)).join('');
}

// ============== BOOKING ==============
function openBooking(index, boardKey) {
  selectedHotel = currentHotels[index];
  selectedBoard = boardKey;
  const price = selectedHotel.prices[boardKey];
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;

  document.getElementById('bookingSummary').innerHTML = `
    <h4><i class="fas fa-hotel"></i> ${selectedHotel.name} ${'★'.repeat(selectedHotel.stars)}</h4>
    <div class="detail-row"><span>Destination</span><span>${selectedHotel.city}</span></div>
    <div class="detail-row"><span>Arrivée</span><span>${formatDateDisplay(checkIn)}</span></div>
    <div class="detail-row"><span>Départ</span><span>${formatDateDisplay(checkOut)}</span></div>
    <div class="detail-row"><span>Durée</span><span>${selectedHotel.nights} nuits</span></div>
    <div class="detail-row"><span>Formule</span><span>${price.label}</span></div>
    <div class="detail-row"><span>Voyageurs</span><span>${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}</span></div>
    <div class="detail-row total"><span>Total</span><span>${formatPrice(price.price)} DZD</span></div>
  `;

  document.getElementById('bookingModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('bookingForm').onsubmit = handleBooking;
}

function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
  document.body.style.overflow = '';
}

async function handleBooking(e) {
  e.preventDefault();

  const clientName = document.getElementById('clientName').value;
  const clientPhone = document.getElementById('clientPhone').value;
  const clientEmail = document.getElementById('clientEmail').value;
  const clientNotes = document.getElementById('clientNotes').value;
  const agencyName = document.getElementById('agencyName').value;
  const agencyPhone = document.getElementById('agencyPhone').value;
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;
  const price = selectedHotel.prices[selectedBoard];

  // Save to backend
  try {
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelName: selectedHotel.name,
        hotelStars: selectedHotel.stars,
        city: selectedHotel.city,
        checkIn, checkOut,
        roomType: 'Chambre Standard',
        boardType: price.label,
        adults: parseInt(adults),
        children: parseInt(children),
        totalPrice: price.price,
        currency: 'DZD',
        clientName, clientPhone, clientEmail,
        agencyName, agencyPhone,
        notes: clientNotes
      })
    });
  } catch (err) {
    console.log('Backend save skipped');
  }

  // Build WhatsApp message
  let msg = `🏨 *DEMANDE DE RÉSERVATION*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (agencyName) msg += `*Agence:* ${agencyName}\n`;
  if (agencyPhone) msg += `*Tél agence:* ${agencyPhone}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*Hôtel:* ${selectedHotel.name} ${'⭐'.repeat(selectedHotel.stars)}\n`;
  msg += `*Ville:* ${selectedHotel.city}\n`;
  msg += `*Arrivée:* ${formatDateDisplay(checkIn)}\n`;
  msg += `*Départ:* ${formatDateDisplay(checkOut)}\n`;
  msg += `*Nuits:* ${selectedHotel.nights}\n`;
  msg += `*Formule:* ${price.label}\n`;
  msg += `*Voyageurs:* ${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}\n`;
  msg += `*Prix Total:* ${formatPrice(price.price)} DZD\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Client:*\n`;
  msg += `*Nom:* ${clientName}\n`;
  msg += `*Tél:* ${clientPhone}\n`;
  if (clientEmail) msg += `*Email:* ${clientEmail}\n`;
  if (clientNotes) msg += `*Notes:* ${clientNotes}\n`;
  msg += `\n💳 *Paiement:* CCP / BaridiMob / Espèces\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ Merci de confirmer disponibilité et prix.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  closeBookingModal();
  showToast('Demande envoyée ! Vérifiez WhatsApp.');
}

// ============== UTILITIES ==============
function formatDate(date) { return date.toISOString().split('T')[0]; }
function formatDateDisplay(str) { return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function formatPrice(p) { return Math.round(p).toLocaleString('fr-FR'); }
function calculateNights(a, b) { return Math.ceil((new Date(b) - new Date(a)) / 86400000); }
function showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }

function showToast(message) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#28a745;color:white;padding:16px 24px;border-radius:12px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:5000;display:flex;align-items:center;gap:10px;';
  t.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

document.getElementById('bookingModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'bookingModal') closeBookingModal();
});
