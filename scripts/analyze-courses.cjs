const db = require('../backend/config/database');

async function analyzeExistingData() {
  try {
    console.log('🔍 Analyzing existing tn_course data...');
    
    // Get sample data from tn_course
    const [courses] = await db.execute('SELECT * FROM tn_course LIMIT 10');
    console.log('\n📋 Sample tn_course records:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.cid} - ${course.course_name}`);
      console.log(`   Group: ${course.cgroup} (${course.g_name})`);
      console.log(`   Level: ${course.level}`);
      console.log('   ---');
    });
    
    // Get unique course groups (packages)
    const [groups] = await db.execute('SELECT DISTINCT cgroup, g_name FROM tn_course WHERE cgroup IS NOT NULL ORDER BY cgroup');
    console.log('\n📦 Course Packages (cgroup):');
    groups.forEach(group => {
      console.log(`- ${group.cgroup}: ${group.g_name}`);
    });
    
    // Get unique levels
    const [levels] = await db.execute('SELECT DISTINCT level FROM tn_course WHERE level IS NOT NULL ORDER BY level');
    console.log('\n📊 Course Levels:');
    levels.forEach(level => {
      console.log(`- Level ${level.level}`);
    });
    
    // Count courses by group
    const [groupCounts] = await db.execute(`
      SELECT cgroup, g_name, COUNT(*) as course_count 
      FROM tn_course 
      WHERE cgroup IS NOT NULL 
      GROUP BY cgroup, g_name 
      ORDER BY course_count DESC
    `);
    console.log('\n📈 Courses per Package:');
    groupCounts.forEach(group => {
      console.log(`- ${group.cgroup} (${group.g_name}): ${group.course_count} courses`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

analyzeExistingData();