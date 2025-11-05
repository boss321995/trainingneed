const db = require('./config/database');

async function checkUserData() {
  try {
    const [rows] = await db.execute('SELECT ID8, FULLNAME, SECTION_N, SEC FROM hrnt WHERE ID8 = ?', ['14101074']);
    console.log('User data:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserData();