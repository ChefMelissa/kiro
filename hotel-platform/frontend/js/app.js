// ============== GLOBAL STATE ==============
let currentHotels = [];
let selectedHotel = null;
let selectedBoard = null;

// WhatsApp number of the agency (change this!)
const WHATSAPP_NUMBER = '213XXXXXXXXX'; // Replace with your WhatsApp number

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
  initDates();
  initSearchForm();
  initFilters();
});

function initDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 7);
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 14);

  document.getElementById('checkIn').min = formatDate(today);
  document.getElementById('checkIn').value = formatDate(tomorrow);
  document.getElementById('checkOut').value = formatDate(weekLater);

  document.getElementById('checkIn').addEventListener('change', (e) => {
    const minCheckout = new Date(e.target.value);
    minCheckout.setDate(minCheckout.getDate() + 1);
    document.getElementById('checkOut').min = formatDate(minCheckout);
    if (new Date(document.getElementById('checkOut').value) <= new Date(e.target.value)) {
      document.getElementById('checkOut').value = formatDate(minCheckout);
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
    alert('Veuillez remplir tous les champs obligatoires');
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
    console.error('Search error:', error);
    alert('Erreur lors de la recherche. Veuillez réessayer.');
  } finally {
    showLoading(false);
  }
}

function searchCity(city) {
  document.getElementById('city').value = city;
  searchHotels();
}

// ============== DISPLAY RESULTS ==============
function displayResults(city, checkIn, checkOut) {
  const section = document.getElementById('resultsSection');
  const grid = document.getElementById('resultsGrid');
  const title = document.getElementById('resultsTitle');

  const nights = calculateNights(checkIn, checkOut);
  title.textContent = `${currentHotels.length} hôtels disponibles à ${city} (${nights} nuits)`;

  grid.innerHTML = currentHotels.map((hotel, index) => createHotelCard(hotel, index)).join('');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createHotelCard(hotel, index) {
  const starsHtml = '★'.repeat(hotel.stars) + '☆'.repeat(5 - hotel.stars);
  const tagsHtml = hotel.tags.map(tag => `<span class="hotel-tag">${tag}</span>`).join('');
  
  const defaultBoard = 'lpd';
  const price = hotel.prices[defaultBoard];

  return `
    <div class="hotel-card" data-index="${index}">
      <div class="hotel-image">
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
        ${hotel.discount ? `<span class="hotel-discount">-${hotel.discount}%</span>` : ''}
      </div>
      <div class="hotel-info">
        <h3 class="hotel-name">${hotel.name}</h3>
        <div class="hotel-stars">${starsHtml}</div>
        <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.city}</div>
        <div class="hotel-tags">${tagsHtml}</div>
        <div class="hotel-boards">
          ${Object.keys(hotel.prices).map(key => `
            <button class="board-tab ${key === defaultBoard ? 'active' : ''}" 
                    onclick="switchBoard(${index}, '${key}')">
              ${hotel.prices[key].label.split(' ').slice(0, 2).join(' ')}
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
          <div class="price-nights">${hotel.nights} nuits - ${hotel.prices[defaultBoard].label}</div>
        </div>
        <button class="btn-book" onclick="openBooking(${index}, '${defaultBoard}')">
          <i class="fas fa-arrow-right"></i> Réserver
        </button>
      </div>
    </div>
  `;
}

function switchBoard(hotelIndex, boardKey) {
  const hotel = currentHotels[hotelIndex];
  const price = hotel.prices[boardKey];
  
  // Update active tab
  const card = document.querySelectorAll('.hotel-card')[hotelIndex];
  card.querySelectorAll('.board-tab').forEach(tab => tab.classList.remove('active'));
  card.querySelector(`[onclick="switchBoard(${hotelIndex}, '${boardKey}')"]`).classList.add('active');
  
  // Update pricing
  const pricingDiv = document.getElementById(`pricing-${hotelIndex}`);
  pricingDiv.innerHTML = `
    <div>
      <div class="price-label">à partir de</div>
      <div class="price-original">${formatPrice(price.originalPrice)} DZD</div>
      <div class="price-current">${formatPrice(price.price)}</div>
      <div class="price-currency">DZD</div>
      <div class="price-nights">${hotel.nights} nuits - ${price.label}</div>
    </div>
    <button class="btn-book" onclick="openBooking(${hotelIndex}, '${boardKey}')">
      <i class="fas fa-arrow-right"></i> Réserver
    </button>
  `;
}

// ============== SORTING ==============
function sortHotels(sortType) {
  switch (sortType) {
    case 'price-asc':
      currentHotels.sort((a, b) => a.prices.lpd.price - b.prices.lpd.price);
      break;
    case 'price-desc':
      currentHotels.sort((a, b) => b.prices.lpd.price - a.prices.lpd.price);
      break;
    case 'stars':
      currentHotels.sort((a, b) => b.stars - a.stars);
      break;
    default:
      // recommended - mix of discount and stars
      currentHotels.sort((a, b) => (b.discount + b.stars * 5) - (a.discount + a.stars * 5));
  }
  
  const grid = document.getElementById('resultsGrid');
  grid.innerHTML = currentHotels.map((hotel, index) => createHotelCard(hotel, index)).join('');
}

// ============== BOOKING ==============
function openBooking(hotelIndex, boardKey) {
  selectedHotel = currentHotels[hotelIndex];
  selectedBoard = boardKey;
  
  const price = selectedHotel.prices[boardKey];
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;

  // Fill booking summary
  document.getElementById('bookingSummary').innerHTML = `
    <h4><i class="fas fa-hotel"></i> ${selectedHotel.name} ${'★'.repeat(selectedHotel.stars)}</h4>
    <div class="detail-row">
      <span>Destination</span>
      <span>${selectedHotel.city}</span>
    </div>
    <div class="detail-row">
      <span>Arrivée</span>
      <span>${formatDateDisplay(checkIn)}</span>
    </div>
    <div class="detail-row">
      <span>Départ</span>
      <span>${formatDateDisplay(checkOut)}</span>
    </div>
    <div class="detail-row">
      <span>Durée</span>
      <span>${selectedHotel.nights} nuits</span>
    </div>
    <div class="detail-row">
      <span>Formule</span>
      <span>${price.label}</span>
    </div>
    <div class="detail-row">
      <span>Voyageurs</span>
      <span>${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}</span>
    </div>
    <div class="detail-row total">
      <span>Total</span>
      <span>${formatPrice(price.price)} DZD</span>
    </div>
  `;

  document.getElementById('bookingModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Init form
  document.getElementById('bookingForm').onsubmit = handleBookingSubmit;
}

function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
  document.body.style.overflow = '';
}

async function handleBookingSubmit(e) {
  e.preventDefault();

  const clientName = document.getElementById('clientName').value;
  const clientPhone = document.getElementById('clientPhone').value;
  const clientEmail = document.getElementById('clientEmail').value;
  const clientNotes = document.getElementById('clientNotes').value;
  
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;
  const price = selectedHotel.prices[selectedBoard];

  // Save reservation to backend
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelName: selectedHotel.name,
        hotelStars: selectedHotel.stars,
        city: selectedHotel.city,
        checkIn,
        checkOut,
        roomType: 'Chambre Standard',
        boardType: price.label,
        adults: parseInt(adults),
        children: parseInt(children),
        totalPrice: price.price,
        currency: 'DZD',
        clientName,
        clientPhone,
        clientEmail,
        notes: clientNotes
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Build WhatsApp message
      const message = buildWhatsAppMessage(clientName, clientPhone, clientEmail, clientNotes, checkIn, checkOut, adults, children, price);
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Close modal and show success
      closeBookingModal();
      showSuccessMessage();
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert('Erreur lors de la réservation. Veuillez réessayer.');
  }
}

function buildWhatsAppMessage(name, phone, email, notes, checkIn, checkOut, adults, children, price) {
  let msg = `🏨 *NOUVELLE RÉSERVATION*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Hôtel:* ${selectedHotel.name} ${'⭐'.repeat(selectedHotel.stars)}\n`;
  msg += `*Ville:* ${selectedHotel.city}\n`;
  msg += `*Arrivée:* ${formatDateDisplay(checkIn)}\n`;
  msg += `*Départ:* ${formatDateDisplay(checkOut)}\n`;
  msg += `*Nuits:* ${selectedHotel.nights}\n`;
  msg += `*Formule:* ${price.label}\n`;
  msg += `*Voyageurs:* ${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}\n`;
  msg += `*Prix Total:* ${formatPrice(price.price)} DZD\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *Client:*\n`;
  msg += `*Nom:* ${name}\n`;
  msg += `*Tél:* ${phone}\n`;
  if (email) msg += `*Email:* ${email}\n`;
  if (notes) msg += `*Notes:* ${notes}\n`;
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ Merci de confirmer cette réservation.`;
  
  return msg;
}

function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Réservation envoyée avec succès ! Vérifiez WhatsApp.</span>
  `;
  successDiv.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; background: #28a745; color: white;
    padding: 16px 24px; border-radius: 12px; display: flex; align-items: center; gap: 10px;
    font-weight: 600; box-shadow: 0 4px 20px rgba(40,167,69,0.3); z-index: 5000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 5000);
}

// ============== UTILITIES ==============
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('fr-FR', options);
}

function formatPrice(price) {
  return Math.round(price).toLocaleString('fr-FR');
}

function calculateNights(checkIn, checkOut) {
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Close modal on outside click
document.getElementById('bookingModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('bookingModal')) {
    closeBookingModal();
  }
});
