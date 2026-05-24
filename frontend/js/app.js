// ============== CONFIGURATION ==============
const WHATSAPP_NUMBER = '213XXXXXXXXX'; // ← CHANGEZ CECI avec votre numéro WhatsApp

// ============== STATE ==============
let currentHotels = [];
let selectedHotel = null;
let selectedBoard = null;
let agencyMarkupType = 'none'; // 'none', 'percent', 'fixed'
let agencyMarkupValue = 0;
let comparisonList = []; // max 3
let favorites = JSON.parse(localStorage.getItem('tunistay_favorites') || '[]');
let countdownTimers = {};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
  initDates();
  initSearchForm();
  initFilters();
  updateFavCount();
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

  // Markup controls
  document.querySelectorAll('input[name="markupType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      agencyMarkupType = e.target.value;
      const input = document.getElementById('markupValue');
      if (agencyMarkupType === 'none') {
        input.disabled = true;
        input.value = '';
        agencyMarkupValue = 0;
      } else {
        input.disabled = false;
        input.placeholder = agencyMarkupType === 'percent' ? 'Ex: 5' : 'Ex: 3000';
      }
      if (currentHotels.length > 0) refreshResults();
    });
  });

  document.getElementById('markupValue')?.addEventListener('input', (e) => {
    agencyMarkupValue = parseFloat(e.target.value) || 0;
    if (currentHotels.length > 0) refreshResults();
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
  
  // Start countdown timers for high discount hotels
  startCountdowns();
}


function createHotelCard(hotel, index) {
  const stars = '★'.repeat(hotel.stars) + '☆'.repeat(5 - hotel.stars);
  const tags = hotel.tags.map(t => `<span class="hotel-tag">${t}</span>`).join('');
  const price = hotel.prices.lpd;
  const displayPrice = applyMarkup(price.price);
  const isFav = isFavorite(hotel.name, hotel.city);
  const isCompared = comparisonList.some(h => h.name === hotel.name && h.city === hotel.city);
  const showCountdown = hotel.discount >= 35;

  return `
    <div class="hotel-card" data-index="${index}">
      <div class="hotel-image">
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
        ${hotel.discount ? `<span class="hotel-discount">-${hotel.discount}%</span>` : ''}
        <button class="btn-favorite ${isFav ? 'active' : ''}" onclick="toggleFavorite(${index})" title="Ajouter aux favoris">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="hotel-info">
        <h3 class="hotel-name hotel-name-link" onclick="openHotelDetail(${index})">${hotel.name}</h3>
        <div class="hotel-stars">${stars}</div>
        <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.city}</div>
        <div class="hotel-tags">${tags}</div>
        ${showCountdown ? `<div class="countdown-badge" id="countdown-${index}"><i class="fas fa-clock"></i> Offre expire dans: <span class="countdown-timer" data-index="${index}">--:--:--</span></div>` : ''}
        <div class="hotel-boards">
          ${Object.keys(hotel.prices).map(key => `
            <button class="board-tab ${key === 'lpd' ? 'active' : ''}" 
                    onclick="switchBoard(${index}, '${key}')">
              ${key === 'lpd' ? 'LPD' : key === 'dp' ? 'DP+' : 'All Inc.'}
            </button>
          `).join('')}
        </div>
        <button class="btn-compare-add ${isCompared ? 'active' : ''}" onclick="toggleComparison(${index})">
          <i class="fas fa-balance-scale"></i> ${isCompared ? 'Retiré de la comparaison' : 'Ajouter à la comparaison'}
        </button>
      </div>
      <div class="hotel-pricing" id="pricing-${index}">
        <div>
          <div class="price-label">à partir de</div>
          <div class="price-original">${formatPrice(applyMarkup(price.originalPrice))} DZD</div>
          <div class="price-current">${formatPrice(displayPrice)}</div>
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
  const displayPrice = applyMarkup(price.price);
  const card = document.querySelectorAll('.hotel-card')[index];
  
  card.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
  card.querySelector(`[onclick="switchBoard(${index}, '${boardKey}')"]`).classList.add('active');

  document.getElementById(`pricing-${index}`).innerHTML = `
    <div>
      <div class="price-label">à partir de</div>
      <div class="price-original">${formatPrice(applyMarkup(price.originalPrice))} DZD</div>
      <div class="price-current">${formatPrice(displayPrice)}</div>
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
  startCountdowns();
}


// ============== BOOKING ==============
function openBooking(index, boardKey) {
  selectedHotel = currentHotels[index];
  selectedBoard = boardKey;
  const price = selectedHotel.prices[boardKey];
  const clientPrice = applyMarkup(price.price);
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;

  let summaryHtml = `
    <h4><i class="fas fa-hotel"></i> ${selectedHotel.name} ${'★'.repeat(selectedHotel.stars)}</h4>
    <div class="detail-row"><span>Destination</span><span>${selectedHotel.city}</span></div>
    <div class="detail-row"><span>Arrivée</span><span>${formatDateDisplay(checkIn)}</span></div>
    <div class="detail-row"><span>Départ</span><span>${formatDateDisplay(checkOut)}</span></div>
    <div class="detail-row"><span>Durée</span><span>${selectedHotel.nights} nuits</span></div>
    <div class="detail-row"><span>Formule</span><span>${price.label}</span></div>
    <div class="detail-row"><span>Voyageurs</span><span>${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}</span></div>
    <div class="detail-row"><span>Prix de base</span><span>${formatPrice(price.price)} DZD</span></div>`;
  
  if (agencyMarkupType !== 'none' && agencyMarkupValue > 0) {
    const markupLabel = agencyMarkupType === 'percent' ? `+${agencyMarkupValue}%` : `+${formatPrice(agencyMarkupValue)} DZD`;
    summaryHtml += `<div class="detail-row"><span>Votre marge (${markupLabel})</span><span>+${formatPrice(clientPrice - price.price)} DZD</span></div>`;
  }
  
  summaryHtml += `<div class="detail-row total"><span>Prix client final</span><span>${formatPrice(clientPrice)} DZD</span></div>`;

  document.getElementById('bookingSummary').innerHTML = summaryHtml;
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
  const clientPrice = applyMarkup(price.price);
  const bookingRef = 'TS-' + Date.now().toString(36).toUpperCase();

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
        totalPrice: clientPrice,
        currency: 'DZD',
        clientName, clientPhone, clientEmail,
        agencyName, agencyPhone,
        notes: clientNotes
      })
    });
  } catch (err) {
    console.log('Backend save skipped');
  }

  // Save to localStorage history
  const booking = {
    id: bookingRef,
    hotelName: selectedHotel.name,
    hotelStars: selectedHotel.stars,
    city: selectedHotel.city,
    checkIn, checkOut,
    boardType: price.label,
    totalPrice: clientPrice,
    clientName, clientPhone, clientEmail,
    agencyName, agencyPhone,
    notes: clientNotes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  saveBookingToHistory(booking);


  // Build WhatsApp message
  let msg = `🏨 *DEMANDE DE RÉSERVATION*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Réf:* ${bookingRef}\n`;
  if (agencyName) msg += `*Agence:* ${agencyName}\n`;
  if (agencyPhone) msg += `*Tél agence:* ${agencyPhone}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*Hôtel:* ${selectedHotel.name} ${'⭐'.repeat(selectedHotel.stars)}\n`;
  msg += `*Ville:* ${selectedHotel.city}\n`;
  msg += `*Arrivée:* ${formatDateDisplay(checkIn)}\n`;
  msg += `*Départ:* ${formatDateDisplay(checkOut)}\n`;
  msg += `*Nuits:* ${selectedHotel.nights}\n`;
  msg += `*Formule:* ${price.label}\n`;
  msg += `*Voyageurs:* ${adults} adulte(s)${children > 0 ? ', ' + children + ' enfant(s)' : ''}\n\n`;
  msg += `*Prix TuniStay:* ${formatPrice(price.price)} DZD\n`;
  if (agencyMarkupType !== 'none' && agencyMarkupValue > 0) {
    msg += `*Prix client (avec marge agence):* ${formatPrice(clientPrice)} DZD\n`;
  }
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
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

  // Show PDF confirmation modal
  showPdfConfirmation(booking, price);
}


// ============== PDF CONFIRMATION ==============
function showPdfConfirmation(booking, price) {
  const content = document.getElementById('pdfConfirmContent');
  content.innerHTML = `
    <div class="pdf-confirm-box">
      <p style="margin-bottom:15px; color: var(--gray);">Votre demande de réservation a été envoyée via WhatsApp.</p>
      <div class="booking-summary">
        <div class="detail-row"><span>Référence</span><span><strong>${booking.id}</strong></span></div>
        <div class="detail-row"><span>Hôtel</span><span>${booking.hotelName}</span></div>
        <div class="detail-row"><span>Dates</span><span>${formatDateDisplay(booking.checkIn)} → ${formatDateDisplay(booking.checkOut)}</span></div>
        <div class="detail-row"><span>Client</span><span>${booking.clientName}</span></div>
        <div class="detail-row total"><span>Prix total</span><span>${formatPrice(booking.totalPrice)} DZD</span></div>
      </div>
      <button class="btn-pdf" onclick="generatePDF()">
        <i class="fas fa-file-pdf"></i> Télécharger le récapitulatif PDF
      </button>
    </div>
  `;
  document.getElementById('pdfConfirmModal').style.display = 'flex';
  
  // Store data for PDF generation
  window._lastBooking = booking;
}

function closePdfModal() {
  document.getElementById('pdfConfirmModal').style.display = 'none';
}


function generatePDF() {
  const booking = window._lastBooking;
  if (!booking) return;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('TuniStay B2B', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Confirmation de Réservation', 105, 30, { align: 'center' });
    
    // Body
    doc.setTextColor(0, 0, 0);
    let y = 55;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Référence: ${booking.id}`, 20, y);
    y += 8;
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, y);
    y += 15;
    
    // Hotel info
    doc.setFontSize(14);
    doc.text('Informations Hôtel', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Hôtel: ${booking.hotelName} (${'★'.repeat(booking.hotelStars)})`, 20, y); y += 7;
    doc.text(`Ville: ${booking.city}`, 20, y); y += 7;
    doc.text(`Arrivée: ${formatDateDisplay(booking.checkIn)}`, 20, y); y += 7;
    doc.text(`Départ: ${formatDateDisplay(booking.checkOut)}`, 20, y); y += 7;
    doc.text(`Formule: ${booking.boardType}`, 20, y); y += 12;
    
    // Client info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Informations Client', 20, y); y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nom: ${booking.clientName}`, 20, y); y += 7;
    doc.text(`Téléphone: ${booking.clientPhone}`, 20, y); y += 7;
    if (booking.clientEmail) { doc.text(`Email: ${booking.clientEmail}`, 20, y); y += 7; }
    y += 5;
    
    // Agency info
    if (booking.agencyName) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Agence', 20, y); y += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Nom: ${booking.agencyName}`, 20, y); y += 7;
      if (booking.agencyPhone) { doc.text(`Téléphone: ${booking.agencyPhone}`, 20, y); y += 7; }
      y += 5;
    }


    // Price
    doc.setFillColor(240, 249, 255);
    doc.rect(15, y, 180, 20, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Prix Total: ${formatPrice(booking.totalPrice)} DZD`, 105, y + 13, { align: 'center' });
    y += 30;
    
    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Ce document est un récapitulatif de votre demande de réservation.', 105, 270, { align: 'center' });
    doc.text('La confirmation définitive sera envoyée après validation.', 105, 277, { align: 'center' });
    doc.text('TuniStay B2B - Plateforme réservée aux agences de voyage', 105, 284, { align: 'center' });
    
    doc.save(`reservation-${booking.id}.pdf`);
    showToast('PDF téléchargé avec succès !');
  } catch (err) {
    console.error('PDF generation error:', err);
    // Fallback: print
    window.print();
  }
}


// ============== FAVORITES ==============
function isFavorite(name, city) {
  return favorites.some(f => f.name === name && f.city === city);
}

function toggleFavorite(index) {
  const hotel = currentHotels[index];
  const existingIdx = favorites.findIndex(f => f.name === hotel.name && f.city === hotel.city);
  
  if (existingIdx >= 0) {
    favorites.splice(existingIdx, 1);
    showToast('Retiré des favoris');
  } else {
    favorites.push({
      name: hotel.name,
      stars: hotel.stars,
      city: hotel.city,
      tags: hotel.tags,
      image: hotel.image,
      discount: hotel.discount,
      prices: hotel.prices
    });
    showToast('Ajouté aux favoris ❤️');
  }
  
  localStorage.setItem('tunistay_favorites', JSON.stringify(favorites));
  updateFavCount();
  
  // Refresh card display
  const btn = document.querySelectorAll('.hotel-card')[index]?.querySelector('.btn-favorite');
  if (btn) btn.classList.toggle('active');
}

function updateFavCount() {
  const el = document.getElementById('favCount');
  if (el) el.textContent = favorites.length;
}

function toggleFavoritesModal() {
  const modal = document.getElementById('favoritesModal');
  const content = document.getElementById('favoritesContent');
  
  if (favorites.length === 0) {
    content.innerHTML = '<p style="text-align:center; color: var(--gray); padding: 30px;"><i class="fas fa-heart" style="font-size:2rem; display:block; margin-bottom:10px; color:#ddd;"></i>Aucun favori enregistré.<br>Cliquez sur le ❤️ pour ajouter des hôtels.</p>';
  } else {
    content.innerHTML = favorites.map((fav, i) => `
      <div class="fav-item">
        <img src="${fav.image}" alt="${fav.name}" class="fav-img">
        <div class="fav-info">
          <h4>${fav.name} <span style="color:#FFB800;">${'★'.repeat(fav.stars)}</span></h4>
          <p><i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> ${fav.city}</p>
          <p class="fav-price">À partir de ${formatPrice(fav.prices.lpd.price)} DZD</p>
        </div>
        <button class="btn-fav-remove" onclick="removeFavorite(${i})"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
  }
  
  modal.style.display = 'flex';
}

function closeFavoritesModal() {
  document.getElementById('favoritesModal').style.display = 'none';
}

function removeFavorite(idx) {
  favorites.splice(idx, 1);
  localStorage.setItem('tunistay_favorites', JSON.stringify(favorites));
  updateFavCount();
  toggleFavoritesModal(); // refresh display
}


// ============== COMPARISON ==============
function toggleComparison(index) {
  const hotel = currentHotels[index];
  const existingIdx = comparisonList.findIndex(h => h.name === hotel.name && h.city === hotel.city);
  
  if (existingIdx >= 0) {
    comparisonList.splice(existingIdx, 1);
  } else {
    if (comparisonList.length >= 3) {
      showToast('Maximum 3 hôtels pour la comparaison');
      return;
    }
    comparisonList.push(hotel);
  }
  
  updateComparisonBar();
  // Refresh cards to update button states
  const grid = document.getElementById('resultsGrid');
  if (grid && currentHotels.length > 0) {
    grid.innerHTML = currentHotels.map((h, i) => createHotelCard(h, i)).join('');
    startCountdowns();
  }
}

function updateComparisonBar() {
  const bar = document.getElementById('comparisonBar');
  const text = document.getElementById('comparisonBarText');
  
  if (comparisonList.length >= 2) {
    bar.style.display = 'flex';
    text.textContent = `${comparisonList.length} hôtel(s) sélectionné(s)`;
  } else if (comparisonList.length === 1) {
    bar.style.display = 'flex';
    text.textContent = `1 hôtel sélectionné (min. 2 pour comparer)`;
  } else {
    bar.style.display = 'none';
  }
}

function clearComparison() {
  comparisonList = [];
  updateComparisonBar();
  if (currentHotels.length > 0) {
    document.getElementById('resultsGrid').innerHTML = currentHotels.map((h, i) => createHotelCard(h, i)).join('');
    startCountdowns();
  }
}


function showComparison() {
  if (comparisonList.length < 2) {
    showToast('Sélectionnez au moins 2 hôtels');
    return;
  }
  
  const content = document.getElementById('comparisonContent');
  const cols = comparisonList.map(hotel => {
    const stars = '★'.repeat(hotel.stars);
    return `
      <div class="compare-col">
        <img src="${hotel.image}" alt="${hotel.name}" class="compare-img">
        <h4>${hotel.name}</h4>
        <p class="compare-stars">${stars}</p>
        <p class="compare-city"><i class="fas fa-map-marker-alt"></i> ${hotel.city}</p>
        <div class="compare-tags">${hotel.tags.map(t => `<span class="hotel-tag">${t}</span>`).join('')}</div>
        ${hotel.discount ? `<p class="compare-discount">-${hotel.discount}%</p>` : ''}
        <div class="compare-prices">
          <div class="compare-price-row"><span>LPD</span><strong>${formatPrice(applyMarkup(hotel.prices.lpd.price))} DZD</strong></div>
          <div class="compare-price-row"><span>DP+</span><strong>${formatPrice(applyMarkup(hotel.prices.dp.price))} DZD</strong></div>
          <div class="compare-price-row"><span>All Inc.</span><strong>${formatPrice(applyMarkup(hotel.prices.ai.price))} DZD</strong></div>
        </div>
      </div>
    `;
  }).join('');
  
  content.innerHTML = `<div class="compare-grid compare-grid-${comparisonList.length}">${cols}</div>`;
  document.getElementById('comparisonModal').style.display = 'flex';
}

function closeComparisonModal() {
  document.getElementById('comparisonModal').style.display = 'none';
}


// ============== COUNTDOWN TIMER ==============
function startCountdowns() {
  // Clear existing timers
  Object.values(countdownTimers).forEach(t => clearInterval(t));
  countdownTimers = {};
  
  currentHotels.forEach((hotel, index) => {
    if (hotel.discount >= 35) {
      // Random between 2-8 hours
      const totalSeconds = Math.floor(Math.random() * (8 * 3600 - 2 * 3600) + 2 * 3600);
      let remaining = totalSeconds;
      
      const timerEl = document.querySelector(`.countdown-timer[data-index="${index}"]`);
      if (!timerEl) return;
      
      const updateTimer = () => {
        if (remaining <= 0) {
          timerEl.textContent = 'Expirée';
          clearInterval(countdownTimers[index]);
          return;
        }
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        remaining--;
      };
      
      updateTimer();
      countdownTimers[index] = setInterval(updateTimer, 1000);
    }
  });
}


// ============== HOTEL DETAIL ==============
function openHotelDetail(index) {
  const hotel = currentHotels[index];
  const stars = '★'.repeat(hotel.stars) + '☆'.repeat(5 - hotel.stars);
  const tags = hotel.tags.map(t => `<span class="hotel-tag">${t}</span>`).join('');
  
  const cityCoords = {
    'Sousse': '35.8254,10.6084',
    'Hammamet': '36.4000,10.6167',
    'Djerba': '33.8076,10.8451',
    'Monastir': '35.7643,10.8113'
  };
  const coords = cityCoords[hotel.city] || '35.8254,10.6084';
  
  const content = document.getElementById('hotelDetailContent');
  document.getElementById('detailModalTitle').innerHTML = `<i class="fas fa-hotel"></i> ${hotel.name}`;
  
  content.innerHTML = `
    <div class="detail-hero">
      <img src="${hotel.image}" alt="${hotel.name}" class="detail-hero-img">
      ${hotel.discount ? `<span class="hotel-discount" style="position:absolute;top:15px;left:15px;">-${hotel.discount}%</span>` : ''}
    </div>
    <div class="detail-meta">
      <div class="hotel-stars" style="font-size:1.2rem;">${stars}</div>
      <div class="hotel-location" style="font-size:1rem;"><i class="fas fa-map-marker-alt"></i> ${hotel.city}, Tunisie</div>
      <div class="hotel-tags" style="margin-top:10px;">${tags}</div>
    </div>
    <div class="detail-description">
      <h4><i class="fas fa-info-circle"></i> Description</h4>
      <p>${hotel.description || 'Hôtel situé dans la belle ville de ' + hotel.city + ', offrant un séjour confortable avec toutes les commodités modernes.'}</p>
    </div>
    <div class="detail-rooms">
      <h4><i class="fas fa-bed"></i> Types de chambres</h4>
      ${hotel.rooms.map(r => `
        <div class="detail-room-item">
          <span>${r.type}</span>
          <span class="${r.available ? 'room-available' : 'room-unavailable'}">
            ${r.available ? '<i class="fas fa-check-circle"></i> Disponible' : '<i class="fas fa-times-circle"></i> Indisponible'}
          </span>
        </div>
      `).join('')}
    </div>
    <div class="detail-prices">
      <h4><i class="fas fa-money-bill-wave"></i> Tarifs (${hotel.nights} nuits)</h4>
      <div class="detail-price-grid">
        <div class="detail-price-card">
          <span class="detail-price-label">LPD</span>
          <span class="detail-price-value">${formatPrice(applyMarkup(hotel.prices.lpd.price))} DZD</span>
        </div>
        <div class="detail-price-card">
          <span class="detail-price-label">Demi Pension</span>
          <span class="detail-price-value">${formatPrice(applyMarkup(hotel.prices.dp.price))} DZD</span>
        </div>
        <div class="detail-price-card">
          <span class="detail-price-label">All Inclusive</span>
          <span class="detail-price-value">${formatPrice(applyMarkup(hotel.prices.ai.price))} DZD</span>
        </div>
      </div>
    </div>
    <div class="detail-map">
      <h4><i class="fas fa-map"></i> Localisation</h4>
      <img src="https://placehold.co/750x200/e8f4e8/333333?text=Carte+-+${encodeURIComponent(hotel.city)}+-+Tunisie" alt="Carte ${hotel.city}" class="detail-map-img">
    </div>
    <button class="btn-book" style="margin-top:20px;" onclick="closeHotelDetailModal(); openBooking(${index}, 'lpd');">
      <i class="fas fa-bookmark"></i> Réserver cet hôtel
    </button>
  `;
  
  document.getElementById('hotelDetailModal').style.display = 'flex';
}

function closeHotelDetailModal() {
  document.getElementById('hotelDetailModal').style.display = 'none';
}


// ============== BOOKING HISTORY (localStorage) ==============
function saveBookingToHistory(booking) {
  const history = JSON.parse(localStorage.getItem('tunistay_history') || '[]');
  history.unshift(booking);
  localStorage.setItem('tunistay_history', JSON.stringify(history));
}

// ============== UTILITIES ==============
function formatDate(date) { return date.toISOString().split('T')[0]; }
function formatDateDisplay(str) { return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function formatPrice(p) { return Math.round(p).toLocaleString('fr-FR'); }
function calculateNights(a, b) { return Math.ceil((new Date(b) - new Date(a)) / 86400000); }
function showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }

function applyMarkup(price) {
  if (agencyMarkupType === 'percent' && agencyMarkupValue > 0) {
    return Math.ceil(price * (1 + agencyMarkupValue / 100));
  } else if (agencyMarkupType === 'fixed' && agencyMarkupValue > 0) {
    return price + agencyMarkupValue;
  }
  return price;
}

function refreshResults() {
  const city = document.getElementById('city').value;
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  if (currentHotels.length > 0) displayResults(city, checkIn, checkOut);
}

function showToast(message) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#28a745;color:white;padding:16px 24px;border-radius:12px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:5000;display:flex;align-items:center;gap:10px;';
  t.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

// Close modals on overlay click
document.getElementById('bookingModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'bookingModal') closeBookingModal();
});
document.getElementById('favoritesModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'favoritesModal') closeFavoritesModal();
});
document.getElementById('hotelDetailModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'hotelDetailModal') closeHotelDetailModal();
});
document.getElementById('comparisonModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'comparisonModal') closeComparisonModal();
});
document.getElementById('pdfConfirmModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'pdfConfirmModal') closePdfModal();
});
