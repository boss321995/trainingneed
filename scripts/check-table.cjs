const db = require('../backend/config/database');

async function checkTableStructure() {
  try {
    console.log('Checking training_needs table structure...');
    const [columns] = await db.execute('SHOW COLUMNS FROM training_needs');
    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default || ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTableStructure();