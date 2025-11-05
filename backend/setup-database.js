const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrd_db',
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Execute all .sql files in the database directory (sorted)
    const sqlDir = path.join(__dirname, 'database');
    const files = fs.readdirSync(sqlDir).filter(f => f.toLowerCase().endsWith('.sql')).sort();

    if (files.length === 0) {
      console.log('No .sql files found in', sqlDir);
    }

    for (const f of files) {
      const full = path.join(sqlDir, f);
      console.log('Running SQL file:', full);
      const sql = fs.readFileSync(full, 'utf8');

      // Use connection.query with multipleStatements enabled to run whole file
      await connection.query(sql);
    }

    console.log('Database setup completed successfully!');
    console.log('Tables created:');
    console.log('- training_needs');
    console.log('- training_approvals');

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nAvailable tables in hrd_db:');
    tables.forEach(table => {
      console.log('-', Object.values(table)[0]);
    });

  } catch (error) {
    console.error('Error setting up database:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database "hrd_db" not found. Please create it first in phpMyAdmin.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to MySQL. Make sure XAMPP is running.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();