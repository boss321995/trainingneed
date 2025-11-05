const mysql = require('mysql2/promise')

// Database configuration for XAMPP MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP default password is empty
  database: 'hrd_db',
  port: 3306,
  charset: 'utf8mb4'
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Expose configuration for consumers that need raw connection options (e.g. session stores)
pool.sessionConfig = dbConfig

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Connected to MySQL database successfully')
    connection.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

// Initialize database connection
testConnection()

module.exports = pool