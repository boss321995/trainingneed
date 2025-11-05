const db = require('../backend/config/database');
const fs = require('fs');

async function updateDatabaseSchema() {
  try {
    console.log('🚀 Starting database schema update...');

    // สร้างตาราง job_levels
    console.log('📋 Creating job_levels table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS job_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level_name VARCHAR(100) NOT NULL,
        level_code VARCHAR(20) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // เพิ่มข้อมูลระดับปฏิบัติงาน
    console.log('📝 Inserting job levels...');
    await db.execute(`
      INSERT IGNORE INTO job_levels (level_name, level_code, description) VALUES 
      ('ระดับปฏิบัติงาน', 'OPERATIONAL', 'พนักงานระดับปฏิบัติการทั่วไป'),
      ('ระดับหัวหน้างาน', 'SUPERVISOR', 'หัวหน้างาน ผู้จัดการส่วน ผู้อำนวยการฝ่าย'),
  ('ผู้จัดการส่วน', 'EXECUTIVE', 'ผู้จัดการส่วน')
    `);

    // สร้างตาราง course_packages
    console.log('📦 Creating course_packages table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_code VARCHAR(20) NOT NULL,
        package_name VARCHAR(200) NOT NULL,
        description TEXT,
        job_level_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_package_code (package_code),
        FOREIGN KEY (job_level_id) REFERENCES job_levels(id)
      )
    `);

    // เพิ่มข้อมูลแพ็คเกจหลักสูตร
    console.log('📚 Inserting course packages...');
    const packages = [
      // แพ็คเกจระดับปฏิบัติงาน
      ['EGY', 'Infrastructure (Energy&Power)', 'หลักสูตรด้านพลังงานและโครงสร้างพื้นฐาน', 1],
      ['OSP', 'Broadband', 'หลักสูตรด้านบรอดแบนด์และเครือข่าย', 1],
      ['FIN', 'Finance', 'หลักสูตรด้านการเงินและบัญชี', 1],
      ['COM', 'Digital', 'หลักสูตรด้านเทคโนโลยีดิจิทัล', 1],
      ['BDA', 'Digital', 'หลักสูตรด้าน Big Data และ Analytics', 1],
      ['NET', 'Infrastructure (Network)', 'หลักสูตรด้านโครงสร้างพื้นฐานเครือข่าย', 1],
      ['MKT', 'Marketing & Effective Communication', 'หลักสูตรด้านการตลาดและการสื่อสาร', 1],
      ['LAG', 'ภาษาต่างประเทศ', 'หลักสูตรด้านภาษาต่างประเทศ', 1],
      ['HRX', 'Human Resource Management /Human Resource Development', 'หลักสูตรด้านการบริหารทรัพยากรมนุษย์', 1],
      ['DGT', 'Digital', 'หลักสูตรด้านเทคโนโลยีดิจิทัลขั้นสูง', 1],
      ['CUS', 'Essential Skills & Mindset', 'หลักสูตรทักษะพื้นฐานและความคิด', 1],
      ['POW', 'Infrastructure (Energy&Power)', 'หลักสูตรด้านพลังงาน', 1],
      ['SEC', 'Risk, Policy , Law and Compliance', 'หลักสูตรด้านความปลอดภัยและกฎระเบียบ', 1],
      ['ITS', 'Digital', 'หลักสูตรด้านระบบสารสนเทศ', 1],
      ['DEV', 'Digital', 'หลักสูตรด้านการพัฒนาซอฟต์แวร์', 1],
      ['SER', 'Marketing & Effective Communication', 'หลักสูตรด้านการบริการ', 1],
      ['SAF', 'Risk, Policy , Law and Compliance', 'หลักสูตรด้านความปลอดภัย', 1],
      ['SEL', 'Marketing & Effective Communication', 'หลักสูตรด้านการขาย', 1],
      ['DES', 'Essential Skills & Mindset', 'หลักสูตรด้านการออกแบบ', 1],
      ['AFS', 'Finance', 'หลักสูตรด้านการเงินขั้นสูง', 1],
      ['CGG', 'Risk, Policy , Law and Compliance', 'หลักสูตรด้านธรรมาภิบาล', 1],
      ['LAW', 'กฎหมาย', 'หลักสูตรด้านกฎหมาย', 1],
      ['TRX', 'Technology and Digital', 'หลักสูตรด้านเทคโนโลยีและดิจิทัล', 1],
      ['HRM', 'Human Resource Management /Human Resource Development', 'หลักสูตรด้านการบริหารทรัพยากรมนุษย์', 1],
      ['TAX', 'การบริหารและจัดการ', 'หลักสูตรด้านภาษีและการจัดการ', 1],
      ['GEN', 'Team Collaboration', 'หลักสูตรด้านการทำงานเป็นทีม', 1],
      ['DTC', 'Broadband', 'หลักสูตรด้านการสื่อสารข้อมูล', 1],
      ['SEM', 'กิจกรรมอื่นๆ', 'กิจกรรมและสัมมนาอื่นๆ', 1],
      ['STO', 'การบริหารและจัดการ', 'หลักสูตรด้านการจัดเก็บและการจัดการ', 1],
      ['CLD', 'Digital', 'หลักสูตรด้าน Cloud Computing', 1],
      
      // แพ็คเกจระดับหัวหน้างาน
      ['MGT', 'การบริหารและจัดการ', 'หลักสูตรด้านการบริหารจัดการ', 2],
      ['MGT', 'เตรียมความพร้อมผู้บริหาร', 'หลักสูตรสำหรับผู้บริหาร', 2],
      ['MGT', 'Team Collaboration', 'หลักสูตรด้านการทำงานเป็นทีม', 2],
      ['MGT', 'Project Management', 'หลักสูตรด้านการบริหารโครงการ', 2],
      ['MGT', 'Marketing & Effective Communication', 'หลักสูตรด้านการสื่อสารสำหรับผู้บริหาร', 2],
      ['MGT', 'Risk, Policy , Law and Compliance', 'หลักสูตรด้านความเสี่ยงและกฎระเบียบ', 2],
      ['MGT', 'Good Governance and Corporate Social Responsibility', 'หลักสูตรด้านธรรมาภิบาลและ CSR', 2],
      ['MGT', 'Essential Skills & Mindset', 'หลักสูตรทักษะสำหรับผู้บริหาร', 2],
      ['MGT', 'Human Resource Management /Human Resource Development', 'หลักสูตรด้าน HR สำหรับผู้บริหาร', 2],
      
      // แพ็คเกจผู้บริหารระดับต้น
      ['MGT', 'Digital', 'หลักสูตรเทคโนโลยีสำหรับผู้บริหารระดับสูง', 3]
    ];

    for (const [code, name, desc, levelId] of packages) {
      await db.execute(
        'INSERT IGNORE INTO course_packages (package_code, package_name, description, job_level_id) VALUES (?, ?, ?, ?)',
        [code, name, desc, levelId]
      );
    }

    // สร้างตารางหลักสูตร
    console.log('🎓 Creating courses table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(50) NOT NULL UNIQUE,
        course_title VARCHAR(500) NOT NULL,
        package_id INT,
        job_level_id INT,
        description TEXT,
        duration_hours INT DEFAULT 0,
        max_participants INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES course_packages(id),
        FOREIGN KEY (job_level_id) REFERENCES job_levels(id)
      )
    `);

    // อ่านและเพิ่มข้อมูลหลักสูตรจากไฟล์
    console.log('📖 Reading course data from file...');
    const courseData = fs.readFileSync('../public/course.txt', 'utf8');
    const lines = courseData.split('\n').filter(line => line.trim());
    
    console.log('💾 Inserting courses...');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const [packageCode, categoryName, courseCode, courseTitle] = parts;
        
        // หา package_id
        const [packageRows] = await db.execute(
          'SELECT id, job_level_id FROM course_packages WHERE package_code = ? AND package_name = ?',
          [packageCode, categoryName]
        );
        
        if (packageRows.length > 0) {
          const packageId = packageRows[0].id;
          const jobLevelId = packageRows[0].job_level_id;
          
          await db.execute(
            'INSERT IGNORE INTO courses (course_code, course_title, package_id, job_level_id) VALUES (?, ?, ?, ?)',
            [courseCode, courseTitle, packageId, jobLevelId]
          );
        }
      }
    }

    // เพิ่มคอลัมน์ใหม่ในตาราง training_needs
    console.log('🔧 Updating training_needs table...');
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN job_level_ids JSON COMMENT "ระดับปฏิบัติงานที่เลือก [1,2,3]"');
    } catch (e) {
      console.log('Column job_level_ids already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN package_id INT COMMENT "แพ็คเกจหลักสูตรที่เลือก"');
    } catch (e) {
      console.log('Column package_id already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN course_id INT COMMENT "หลักสูตรที่เลือก"');
    } catch (e) {
      console.log('Column course_id already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN old_course_types JSON COMMENT "เก็บข้อมูลเก่าไว้ก่อน migration"');
    } catch (e) {
      console.log('Column old_course_types already exists');
    }

    // Backup ข้อมูลเก่า
    await db.execute('UPDATE training_needs SET old_course_types = course_types WHERE course_types IS NOT NULL AND old_course_types IS NULL');

    console.log('✅ Database schema updated successfully!');
    console.log('📊 Summary:');
    
    const [jobLevels] = await db.execute('SELECT COUNT(*) as count FROM job_levels');
    const [packageCount] = await db.execute('SELECT COUNT(*) as count FROM course_packages');
    const [courses] = await db.execute('SELECT COUNT(*) as count FROM courses');
    
    console.log(`   - Job Levels: ${jobLevels[0].count}`);
    console.log(`   - Course Packages: ${packageCount[0].count}`);
    console.log(`   - Courses: ${courses[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    process.exit(1);
  }
}

updateDatabaseSchema();