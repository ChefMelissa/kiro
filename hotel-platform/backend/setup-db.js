/**
 * Script d'initialisation de la base de données MySQL
 * Exécuter une seule fois: node backend/setup-db.js
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'hotel_platform';

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);

    console.log(`✅ Base de données "${dbName}" prête`);

    // Create reservations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id VARCHAR(36) PRIMARY KEY,
        hotel_name VARCHAR(255) NOT NULL,
        hotel_stars INT DEFAULT 0,
        city VARCHAR(100) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        room_type VARCHAR(100),
        board_type VARCHAR(100),
        adults INT DEFAULT 2,
        children INT DEFAULT 0,
        base_price DECIMAL(12,2) DEFAULT 0,
        markup_percent DECIMAL(5,2) DEFAULT 2.00,
        total_price DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'DZD',
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        client_email VARCHAR(255),
        agency_name VARCHAR(255),
        agency_phone VARCHAR(50),
        status ENUM('pending', 'confirmed', 'paid', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table "reservations" créée');

    // Create agencies table (for future use)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        city VARCHAR(100),
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        total_bookings INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table "agencies" créée');

    // Create search_cache table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS search_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        adults INT DEFAULT 2,
        children INT DEFAULT 0,
        results JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_search (city, check_in, check_out, adults, children)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table "search_cache" créée');

    console.log('\n🎉 Installation terminée avec succès!');
    console.log('   Lancez le serveur avec: npm start');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
