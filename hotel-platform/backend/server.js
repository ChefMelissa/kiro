const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { pool, testConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
// Pas de marge ajoutée côté serveur - les prix TunisiaBeds incluent déjà la marge
// Les agences peuvent ajouter leur propre marge côté frontend

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============== HOTEL SEARCH API ==============

app.post('/api/search', async (req, res) => {
  const { city, checkIn, checkOut, adults, children } = req.body;

  if (!city || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Ville, date d\'arrivée et date de départ sont obligatoires' });
  }

  try {
    // Check cache (valid for 1 hour)
    const [cached] = await pool.query(
      `SELECT results FROM search_cache 
       WHERE city = ? AND check_in = ? AND check_out = ? AND adults = ? AND children = ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY created_at DESC LIMIT 1`,
      [city, checkIn, checkOut, adults || 2, children || 0]
    );

    if (cached.length > 0) {
      const hotels = typeof cached[0].results === 'string' 
        ? JSON.parse(cached[0].results) 
        : cached[0].results;
      return res.json({ hotels, source: 'cache' });
    }

    // Generate hotels with markup
    const hotels = generateHotelsWithMarkup(city, checkIn, checkOut, adults || 2, children || 0);

    // Save to cache
    await pool.query(
      `INSERT INTO search_cache (city, check_in, check_out, adults, children, results) VALUES (?, ?, ?, ?, ?, ?)`,
      [city, checkIn, checkOut, adults || 2, children || 0, JSON.stringify(hotels)]
    );

    res.json({ hotels, source: 'live' });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============== RESERVATIONS API ==============

app.post('/api/reservations', async (req, res) => {
  const {
    hotelName, hotelStars, city, checkIn, checkOut,
    roomType, boardType, adults, children,
    totalPrice, currency, clientName, clientPhone, clientEmail,
    agencyName, agencyPhone, notes
  } = req.body;

  if (!hotelName || !city || !checkIn || !checkOut || !clientName || !clientPhone) {
    return res.status(400).json({ error: 'Informations obligatoires manquantes' });
  }

  try {
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO reservations (id, hotel_name, hotel_stars, city, check_in, check_out, room_type, board_type, adults, children, base_price, markup_percent, total_price, currency, client_name, client_phone, client_email, agency_name, agency_phone, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, hotelName, hotelStars, city, checkIn, checkOut, roomType, boardType, adults || 2, children || 0, totalPrice, 0, totalPrice, currency || 'DZD', clientName, clientPhone, clientEmail, agencyName, agencyPhone, notes]
    );

    res.json({ success: true, reservationId: id, message: 'Réservation créée avec succès' });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

app.get('/api/reservations', async (req, res) => {
  const { status, city, page = 1, limit = 20 } = req.query;
  
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM reservations WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }
    if (city) {
      query += ' AND city = ?';
      countQuery += ' AND city = ?';
      params.push(city);
      countParams.push(city);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [reservations] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({ reservations, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Réservation non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  const { status, notes, paymentMethod } = req.body;
  const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  try {
    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (paymentMethod) { updates.push('payment_method = ?'); params.push(paymentMethod); }

    if (updates.length === 0) return res.status(400).json({ error: 'Rien à mettre à jour' });

    params.push(req.params.id);
    await pool.query(`UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Réservation mise à jour' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Réservation non trouvée' });
    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============== STATISTICS API ==============

app.get('/api/stats', async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM reservations');
    const [[{ pending }]] = await pool.query('SELECT COUNT(*) as pending FROM reservations WHERE status = "pending"');
    const [[{ confirmed }]] = await pool.query('SELECT COUNT(*) as confirmed FROM reservations WHERE status = "confirmed"');
    const [[{ paid }]] = await pool.query('SELECT COUNT(*) as paid FROM reservations WHERE status = "paid"');
    const [[{ cancelled }]] = await pool.query('SELECT COUNT(*) as cancelled FROM reservations WHERE status = "cancelled"');
    const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(total_price), 0) as revenue FROM reservations WHERE status = "paid"');

    const [topHotels] = await pool.query(
      `SELECT hotel_name, city, COUNT(*) as bookings FROM reservations WHERE status != 'cancelled' GROUP BY hotel_name, city ORDER BY bookings DESC LIMIT 5`
    );
    const [citiesStats] = await pool.query(
      `SELECT city, COUNT(*) as bookings FROM reservations WHERE status != 'cancelled' GROUP BY city ORDER BY bookings DESC`
    );

    res.json({
      totalReservations: total,
      pendingReservations: pending,
      confirmedReservations: confirmed,
      paidReservations: paid,
      cancelledReservations: cancelled,
      totalRevenue: revenue,
      topHotels,
      citiesStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============== HOTEL DATA GENERATOR (with markup) ==============

function generateHotelsWithMarkup(city, checkIn, checkOut, adults, children) {
  const hotelsByCity = {
    'Sousse': [
      { name: 'Royal Jinene', stars: 4, tags: ['Famille', 'Bord de Mer', 'Toboggan'], img: 'royal-jinene' },
      { name: 'Jinene Resort', stars: 3, tags: ['Bord de Mer', 'Piscine'], img: 'jinene-resort' },
      { name: 'Soviva Resort & Aquapark', stars: 4, tags: ['Aquapark', 'Famille', 'Animation'], img: 'soviva' },
      { name: 'Kantaoui Center', stars: 3, tags: ['Centre ville', 'Économique'], img: 'kantaoui' },
      { name: 'Sol Palmeras Beach', stars: 4, tags: ['Bord de Mer', 'All Inclusive'], img: 'sol-palmeras' },
      { name: 'Houria Palace', stars: 5, tags: ['Luxe', 'Spa', 'Bord de Mer'], img: 'houria-palace' },
      { name: 'Miramar Sharm', stars: 3, tags: ['Piscine', 'Famille'], img: 'miramar' },
      { name: 'Best Beach Hotel', stars: 4, tags: ['Bord de Mer', 'Moderne'], img: 'best-beach' }
    ],
    'Hammamet': [
      { name: 'Hammamet Garden Resort', stars: 4, tags: ['Jardin', 'Piscine', 'Famille'], img: 'hammamet-garden' },
      { name: 'Medina Belisaire', stars: 4, tags: ['Thalasso', 'Bord de Mer'], img: 'medina-belisaire' },
      { name: 'Samira Club', stars: 3, tags: ['Animation', 'Piscine'], img: 'samira-club' },
      { name: 'Paradis Palace', stars: 5, tags: ['Luxe', 'Spa', 'Golf'], img: 'paradis-palace' },
      { name: 'Golden Tulip', stars: 4, tags: ['Business', 'Moderne'], img: 'golden-tulip' },
      { name: 'Nahrawess Thalasso', stars: 4, tags: ['Thalasso', 'Détente'], img: 'nahrawess' }
    ],
    'Djerba': [
      { name: 'Djerba Plaza', stars: 4, tags: ['Bord de Mer', 'Famille'], img: 'djerba-plaza' },
      { name: 'Club Meninx', stars: 3, tags: ['All Inclusive', 'Animation'], img: 'club-meninx' },
      { name: 'Radisson Blu Palace', stars: 5, tags: ['Luxe', 'Spa', 'Thalasso'], img: 'radisson-blu' },
      { name: 'Sentido Djerba Beach', stars: 4, tags: ['Bord de Mer', 'Adultes'], img: 'sentido' },
      { name: 'Seabel Alhambra', stars: 4, tags: ['Jardin', 'Famille', 'Piscine'], img: 'seabel' }
    ],
    'Monastir': [
      { name: 'Royal Thalassa Monastir', stars: 5, tags: ['Thalasso', 'Luxe', 'Bord de Mer'], img: 'royal-thalassa' },
      { name: 'Sahara Beach Aquapark', stars: 3, tags: ['Aquapark', 'Famille'], img: 'sahara-beach' },
      { name: 'Skanes Serail', stars: 4, tags: ['Bord de Mer', 'Animation'], img: 'skanes-serail' },
      { name: 'One Resort Monastir', stars: 4, tags: ['Moderne', 'Piscine'], img: 'one-resort' },
      { name: 'Marina Cap Monastir', stars: 3, tags: ['Port', 'Économique'], img: 'marina-cap' }
    ]
  };

  const cityHotels = hotelsByCity[city] || hotelsByCity['Sousse'];
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return cityHotels.map(hotel => {
    // Prices from TunisiaBeds (already include our 2% margin)
    const basePricePerNight = hotel.stars === 5 ? 14000 : hotel.stars === 4 ? 9500 : 6500;
    const variation = Math.floor(Math.random() * 2500);
    
    const priceLPD = (basePricePerNight + variation) * nights;
    const priceDP = Math.floor(priceLPD * 1.3);
    const priceAI = Math.floor(priceLPD * 1.6);
    
    const discount = Math.floor(Math.random() * 20) + 25;
    const originalLPD = Math.floor(priceLPD * (100 / (100 - discount)));
    const originalDP = Math.floor(priceDP * (100 / (100 - discount)));
    const originalAI = Math.floor(priceAI * (100 / (100 - discount)));

    return {
      name: hotel.name,
      stars: hotel.stars,
      city,
      tags: hotel.tags,
      image: `https://placehold.co/400x250/0099cc/ffffff?text=${encodeURIComponent(hotel.name)}`,
      discount,
      nights,
      prices: {
        lpd: { label: 'Logement Petit Déjeuner', price: priceLPD, originalPrice: originalLPD },
        dp: { label: 'Demi Pension (DP+)', price: priceDP, originalPrice: originalDP },
        ai: { label: 'Soft All Inclusive', price: priceAI, originalPrice: originalAI }
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

// ============== START SERVER ==============

async function startServer() {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log('⚠️  MySQL non connecté - Le serveur fonctionne en mode démo');
    console.log('   Exécutez: npm run setup-db');
  }

  app.listen(PORT, () => {
    console.log(`\n🏨 TuniStay B2B Platform`);
    console.log(`   Site:      http://localhost:${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`   Marge:     ${MARKUP * 100}%\n`);
  });
}

startServer();
