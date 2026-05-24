const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============== HOTEL SEARCH API ==============

// Search hotels (uses scraping results or cache)
app.post('/api/search', (req, res) => {
  const { city, checkIn, checkOut, adults, children } = req.body;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Ville, date d\'arrivée et date de départ sont obligatoires' });
  }

  // Check cache (valid for 1 hour)
  const cached = db.prepare(`
    SELECT results FROM search_cache 
    WHERE city = ? AND check_in = ? AND check_out = ? AND adults = ? AND children = ?
    AND datetime(created_at) > datetime('now', '-1 hour')
    ORDER BY created_at DESC LIMIT 1
  `).get(city, checkIn, checkOut, adults || 2, children || 0);

  if (cached) {
    return res.json({ hotels: JSON.parse(cached.results), source: 'cache' });
  }

  // If no cache, return demo data (in production, trigger scraping)
  const demoHotels = generateDemoHotels(city, checkIn, checkOut, adults || 2, children || 0);
  
  // Save to cache
  db.prepare(`
    INSERT INTO search_cache (city, check_in, check_out, adults, children, results)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(city, checkIn, checkOut, adults || 2, children || 0, JSON.stringify(demoHotels));

  res.json({ hotels: demoHotels, source: 'live' });
});

// ============== RESERVATIONS API ==============

// Create a reservation
app.post('/api/reservations', (req, res) => {
  const {
    hotelName, hotelStars, city, checkIn, checkOut,
    roomType, boardType, adults, children,
    totalPrice, currency, clientName, clientPhone, clientEmail, notes
  } = req.body;

  if (!hotelName || !city || !checkIn || !checkOut || !clientName || !clientPhone) {
    return res.status(400).json({ error: 'Informations obligatoires manquantes' });
  }

  const id = uuidv4();
  
  db.prepare(`
    INSERT INTO reservations (id, hotel_name, hotel_stars, city, check_in, check_out, room_type, board_type, adults, children, total_price, currency, client_name, client_phone, client_email, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, hotelName, hotelStars, city, checkIn, checkOut, roomType, boardType, adults || 2, children || 0, totalPrice, currency || 'DZD', clientName, clientPhone, clientEmail, notes);

  res.json({ 
    success: true, 
    reservationId: id,
    message: 'Réservation créée avec succès'
  });
});

// Get all reservations (dashboard)
app.get('/api/reservations', (req, res) => {
  const { status, city, page = 1, limit = 20 } = req.query;
  
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const reservations = db.prepare(query).all(...params);
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM reservations WHERE 1=1';
  const countParams = [];
  if (status && status !== 'all') {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }
  if (city) {
    countQuery += ' AND city = ?';
    countParams.push(city);
  }
  const { total } = db.prepare(countQuery).get(...countParams);

  res.json({ reservations, total, page: parseInt(page), limit: parseInt(limit) });
});

// Get single reservation
app.get('/api/reservations/:id', (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: 'Réservation non trouvée' });
  }
  res.json(reservation);
});

// Update reservation status
app.patch('/api/reservations/:id', (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled'];
  
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: 'Réservation non trouvée' });
  }

  if (status) {
    db.prepare('UPDATE reservations SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
  }
  if (notes !== undefined) {
    db.prepare('UPDATE reservations SET notes = ?, updated_at = datetime(\'now\') WHERE id = ?').run(notes, req.params.id);
  }

  res.json({ success: true, message: 'Réservation mise à jour' });
});

// Delete reservation
app.delete('/api/reservations/:id', (req, res) => {
  const result = db.prepare('DELETE FROM reservations WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Réservation non trouvée' });
  }
  res.json({ success: true, message: 'Réservation supprimée' });
});

// ============== STATISTICS API ==============

app.get('/api/stats', (req, res) => {
  const totalReservations = db.prepare('SELECT COUNT(*) as count FROM reservations').get().count;
  const pendingReservations = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE status = ?').get('pending').count;
  const confirmedReservations = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE status = ?').get('confirmed').count;
  const paidReservations = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE status = ?').get('paid').count;
  const cancelledReservations = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE status = ?').get('cancelled').count;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_price), 0) as total FROM reservations WHERE status = ?').get('paid').total;
  
  const topHotels = db.prepare(`
    SELECT hotel_name, city, COUNT(*) as bookings 
    FROM reservations WHERE status != 'cancelled'
    GROUP BY hotel_name ORDER BY bookings DESC LIMIT 5
  `).all();

  const citiesStats = db.prepare(`
    SELECT city, COUNT(*) as bookings 
    FROM reservations WHERE status != 'cancelled'
    GROUP BY city ORDER BY bookings DESC
  `).all();

  res.json({
    totalReservations,
    pendingReservations,
    confirmedReservations,
    paidReservations,
    cancelledReservations,
    totalRevenue,
    topHotels,
    citiesStats
  });
});

// ============== DEMO DATA GENERATOR ==============

function generateDemoHotels(city, checkIn, checkOut, adults, children) {
  const hotelsByCity = {
    'Sousse': [
      { name: 'Royal Jinene', stars: 4, tags: ['Famille', 'Bord de Mer', 'Toboggan'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Royal+Jinene' },
      { name: 'Jinene Resort', stars: 3, tags: ['Bord de Mer', 'Piscine'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Jinene+Resort' },
      { name: 'Soviva Resort & Aquapark', stars: 4, tags: ['Aquapark', 'Famille', 'Animation'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Soviva+Resort' },
      { name: 'Kantaoui Center', stars: 3, tags: ['Centre ville', 'Économique'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Kantaoui+Center' },
      { name: 'Sol Palmeras Beach', stars: 4, tags: ['Bord de Mer', 'All Inclusive'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Sol+Palmeras' },
      { name: 'Houria Palace', stars: 5, tags: ['Luxe', 'Spa', 'Bord de Mer'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Houria+Palace' },
      { name: 'Miramar Sharm', stars: 3, tags: ['Piscine', 'Famille'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Miramar+Sharm' },
      { name: 'Best Beach Hotel', stars: 4, tags: ['Bord de Mer', 'Moderne'], image: 'https://via.placeholder.com/400x250/0099cc/ffffff?text=Best+Beach' }
    ],
    'Hammamet': [
      { name: 'Hammamet Garden Resort', stars: 4, tags: ['Jardin', 'Piscine', 'Famille'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Hammamet+Garden' },
      { name: 'Medina Belisaire', stars: 4, tags: ['Thalasso', 'Bord de Mer'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Medina+Belisaire' },
      { name: 'Samira Club', stars: 3, tags: ['Animation', 'Piscine'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Samira+Club' },
      { name: 'Paradis Palace', stars: 5, tags: ['Luxe', 'Spa', 'Golf'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Paradis+Palace' },
      { name: 'Golden Tulip', stars: 4, tags: ['Business', 'Moderne'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Golden+Tulip' },
      { name: 'Nahrawess Thalasso', stars: 4, tags: ['Thalasso', 'Détente'], image: 'https://via.placeholder.com/400x250/ff6600/ffffff?text=Nahrawess' }
    ],
    'Djerba': [
      { name: 'Djerba Plaza', stars: 4, tags: ['Bord de Mer', 'Famille'], image: 'https://via.placeholder.com/400x250/009933/ffffff?text=Djerba+Plaza' },
      { name: 'Club Meninx', stars: 3, tags: ['All Inclusive', 'Animation'], image: 'https://via.placeholder.com/400x250/009933/ffffff?text=Club+Meninx' },
      { name: 'Radisson Blu Palace', stars: 5, tags: ['Luxe', 'Spa', 'Thalasso'], image: 'https://via.placeholder.com/400x250/009933/ffffff?text=Radisson+Blu' },
      { name: 'Sentido Djerba Beach', stars: 4, tags: ['Bord de Mer', 'Adultes'], image: 'https://via.placeholder.com/400x250/009933/ffffff?text=Sentido' },
      { name: 'Seabel Alhambra', stars: 4, tags: ['Jardin', 'Famille', 'Piscine'], image: 'https://via.placeholder.com/400x250/009933/ffffff?text=Seabel+Alhambra' }
    ],
    'Monastir': [
      { name: 'Royal Thalassa Monastir', stars: 5, tags: ['Thalasso', 'Luxe', 'Bord de Mer'], image: 'https://via.placeholder.com/400x250/990099/ffffff?text=Royal+Thalassa' },
      { name: 'Sahara Beach Aquapark', stars: 3, tags: ['Aquapark', 'Famille'], image: 'https://via.placeholder.com/400x250/990099/ffffff?text=Sahara+Beach' },
      { name: 'Skanes Serail', stars: 4, tags: ['Bord de Mer', 'Animation'], image: 'https://via.placeholder.com/400x250/990099/ffffff?text=Skanes+Serail' },
      { name: 'One Resort Monastir', stars: 4, tags: ['Moderne', 'Piscine'], image: 'https://via.placeholder.com/400x250/990099/ffffff?text=One+Resort' },
      { name: 'Marina Cap Monastir', stars: 3, tags: ['Port', 'Économique'], image: 'https://via.placeholder.com/400x250/990099/ffffff?text=Marina+Cap' }
    ]
  };

  const cityHotels = hotelsByCity[city] || hotelsByCity['Sousse'];
  
  // Calculate number of nights
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return cityHotels.map(hotel => {
    const basePrice = hotel.stars === 5 ? 15000 : hotel.stars === 4 ? 10000 : 7000;
    const pricePerNight = basePrice + Math.floor(Math.random() * 3000);
    const totalLPD = pricePerNight * nights;
    const totalDP = Math.floor(totalLPD * 1.3);
    const totalAI = Math.floor(totalLPD * 1.6);
    const discount = Math.floor(Math.random() * 20) + 25;
    const originalPrice = Math.floor(totalLPD * (100 / (100 - discount)));

    return {
      name: hotel.name,
      stars: hotel.stars,
      city: city,
      tags: hotel.tags,
      image: hotel.image,
      discount: discount,
      nights: nights,
      prices: {
        lpd: { label: 'Logement Petit Déjeuner', price: totalLPD, originalPrice: originalPrice },
        dp: { label: 'Demi Pension (DP+)', price: totalDP, originalPrice: Math.floor(originalPrice * 1.3) },
        ai: { label: 'Soft All Inclusive', price: totalAI, originalPrice: Math.floor(originalPrice * 1.6) }
      },
      rooms: [
        { type: 'Chambre Standard', available: true },
        { type: 'Chambre Vue Mer', available: Math.random() > 0.3 },
        { type: 'Suite Familiale', available: Math.random() > 0.5 }
      ],
      currency: 'DZD'
    };
  });
}

// ============== SERVE FRONTEND ==============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🏨 Hotel Platform running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});
