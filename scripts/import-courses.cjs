const db = require('../backend/config/database');
const fs = require('fs');

async function importTnCourse() {
  try {
    console.log('📥 Importing tn_course table...');
    
    // Read SQL file
    const sqlContent = fs.readFileSync('../database/tn_course (2).sql', 'utf8');
    
    // Split by statements and filter out empty ones
    const statements = sqlContent
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('--'))
      .filter(stmt => !stmt.trim().startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await db.execute(statement);
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.error(`Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Import completed!');
    
    // Now analyze the data
    const [courses] = await db.execute('SELECT * FROM tn_course LIMIT 5');
    console.log('\n📋 Sample courses:');
    courses.forEach(course => {
      console.log(`- ${course.cid}: ${course.course_name}`);
      console.log(`  Group: ${course.cgroup} (${course.g_name}), Level: ${course.level}`);
    });
    
    // Get unique groups
    const [groups] = await db.execute('SELECT DISTINCT cgroup, g_name FROM tn_course WHERE cgroup IS NOT NULL ORDER BY cgroup');
    console.log(`\n📦 Found ${groups.length} course packages:`);
    groups.slice(0, 10).forEach(group => {
      console.log(`- ${group.cgroup}: ${group.g_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importTnCourse();