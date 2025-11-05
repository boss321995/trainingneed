const db = require('../backend/config/database');

async function createTnCourseTable() {
  try {
    console.log('🗃️ Creating tn_course table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tn_course (
        id int(11) NOT NULL AUTO_INCREMENT,
        cid varchar(50) DEFAULT NULL,
        sap_code varchar(50) DEFAULT NULL,
        course_name text,
        training_type varchar(10) DEFAULT NULL,
        target_group text,
        course_section text,
        job_fam varchar(50) DEFAULT NULL,
        job_fam_sub varchar(50) DEFAULT NULL,
        save_by varchar(50) DEFAULT NULL,
        date_save datetime DEFAULT NULL,
        is_active int(11) NOT NULL DEFAULT '1',
        rtype varchar(10) DEFAULT NULL,
        level varchar(10) DEFAULT NULL,
        b_date datetime DEFAULT NULL,
        duration text,
        daycount float NOT NULL DEFAULT '0',
        occupy varchar(10) DEFAULT NULL,
        dtype varchar(10) DEFAULT NULL,
        cgroup varchar(10) DEFAULT NULL,
        g_name text,
        g_id varchar(20) DEFAULT NULL,
        c11 varchar(50) DEFAULT NULL,
        rid varchar(50) DEFAULT NULL,
        intro text,
        objective text,
        headsubject text,
        htraining text,
        evaluation_criteria text,
        commitee text,
        qualification_participants text,
        competency text,
        course_status int(11) NOT NULL DEFAULT '2',
        pid varchar(50) DEFAULT NULL,
        source varchar(50) DEFAULT NULL,
        app_date datetime DEFAULT NULL,
        newcourse int(11) NOT NULL DEFAULT '0',
        cid_ref varchar(50) DEFAULT NULL,
        evaluation_lv text,
        com_list text,
        hcount float NOT NULL DEFAULT '0',
        PRIMARY KEY (id),
        KEY idx_cgroup (cgroup),
        KEY idx_level (level),
        KEY idx_cid (cid)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8
    `);
    
    console.log('✅ Table created successfully!');
    
    // Insert sample data based on the provided SQL
    console.log('📝 Inserting sample course data...');
    
    const sampleCourses = [
      ['230FMGT35C00', '51694194', 'เทคนิคการปรับปรุงวิธีการทำงาน (Job Methods and Process Improvement)', 'C', '', '', null, null, null, null, 1, '01', '2', '2023-12-21', '2 วัน', 2, '44', '0', 'MGT', 'บริหารจัดการ', '2.6', '2.6.บริหารจัดการ', '309947'],
      ['230NEGY01S00', '51694193', 'หลักสูตรเพื่อพัฒนาบุคลากรให้มีความรู้ความสามารถในการบริหารจัดการพลังงานให้เกิดประสิทธิภาพสูงสุด', 'S', '', '', null, null, null, null, 1, '01', '2', '2024-01-18', '2 วัน', 2, '150', '0', 'EGY', 'งานติดตั้งและบำรุงรักษาระบบการกำลัง (ไฟฟ้า , แอร์)', '3.2.10', '3.2.10 งานติดตั้งและบำรุงรักษาระบบการกำลัง (ไฟฟ้า , แอร์)', '13902588'],
      ['230NBDA06C00', '51694706', 'Apache Spark and Kafka for Stream Data Process', 'C', '', '', null, null, null, null, 1, '01', '2', '2024-02-06', '5 วัน', 5, '15', '0', 'BDA', 'งานด้านระบบฐานข้อมูล', '3.3.2', '3.3.2 งานด้านระบบฐานข้อมูล', '13901219'],
      ['232NDGT02S00', '51694034', 'การสร้างรายได้อย่างยั่งยืนและการสร้างทีมงานสู่ความเป็นเลิศ (ภน.1)', 'S', '', '', null, null, null, null, 1, '01', '2', '2566-12-14', '2 วัน', 2, '150', '2', 'DGT', 'หลักสูตรเกี่ยวกับสินค้า และบริการ', '2.5', '2.5.หลักสูตรเกี่ยวกับสินค้า และบริการ', '13804720'],
      ['230NMGT34S00', '51693518', 'สัมมนา NT KM IM DAY 2023', 'S', '', '', null, null, null, null, 1, '01', '2', '2023-12-19', '0.5 (เฉพาะช่วงเช้า)', 0.5, '282', '0', 'MGT', 'งานบริหารองค์ความรู้ (KLC , SME ,IT)', '3.16.3', '3.16.3 งานบริหารองค์ความรู้ (KLC , SME ,IT)', '309947'],
      ['232FMGT33C00', '51693517', 'Certified Information Systems Auditor (CISA) ของสายงานตรวจสอบ (ว.)', 'C', '', '', null, null, null, null, 1, '01', '3', '2023-12-19', '4 วัน', 4, '51', '2', 'MGT', 'งานตรวจสอบ', '3.12', '3.12 งานตรวจสอบ', '309947'],
      ['230NLAW03C00', '51689084', 'เทคนิคการสืบสวนสอบสวนอย่างสร้างสรรค์', 'C', '', '', null, null, null, null, 1, '01', '1', '2023-11-08', '3 วัน', 3, '50', '0', 'LAW', 'งานกฎหมาย', '3.7', '3.7 งานกฎหมาย', '26200749'],
      ['230FINV04S00', '51689085', 'โครงการเสริมสร้างความรู้เกี่ยวกับการจัดซื้อจัดจ้างและการบริหารพัสดุที่เกี่ยวกับการพาณิชย์โดยตรง', 'S', '', '', null, null, null, null, 1, '01', '1', '2023-11-23', '2 วัน', 2, '90', '0', 'INV', 'งานบริการพัสดุ จัดซื้อ – จัดหา', '3.6', '3.6 งานบริการพัสดุ จัดซื้อ – จัดหา', '13509255'],
      ['232NDGT01C00', '51689853', 'Smart City Platform - Solutions สำหรับสายงานขายและปฏิบัติการลูกค้า 2 (ภน.)', 'C', '', '', null, null, null, null, 1, '01', '1', '2023-11-17', '1 วัน', 1, '100', '2', 'DGT', 'หลักสูตรคอมพิวเตอร์ และเทคโนโลยีสื่อสาร', '2.2', '2.2 หลักสูตรคอมพิวเตอร์ และเทคโนโลยีสื่อสาร', '309947'],
      ['232NBDA05C00', '51689852', 'Automated Analytics for All with Alteryx', 'C', '', '', null, null, null, null, 1, '01', '1', '2023-11-20', '1 วัน', 1, '80', '2', 'BDA', 'หลักสูตรคอมพิวเตอร์ และเทคโนโลยีสื่อสาร', '2.2', '2.2 หลักสูตรคอมพิวเตอร์ และเทคโนโลยีสื่อสาร', '309947']
    ];
    
    for (const course of sampleCourses) {
      await db.execute(`
        INSERT INTO tn_course (cid, sap_code, course_name, training_type, target_group, course_section, job_fam, job_fam_sub, save_by, date_save, is_active, rtype, level, b_date, duration, daycount, occupy, dtype, cgroup, g_name, g_id, c11, rid) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, course);
    }
    
    console.log('✅ Sample data inserted!');
    
    // Show analysis
    const [courses] = await db.execute('SELECT * FROM tn_course LIMIT 5');
    console.log('\n📋 Sample courses:');
    courses.forEach(course => {
      console.log(`- ${course.cid}: ${course.course_name.substring(0, 50)}...`);
      console.log(`  Group: ${course.cgroup} (${course.g_name}), Level: ${course.level}`);
    });
    
    // Get unique groups
    const [groups] = await db.execute('SELECT DISTINCT cgroup, g_name FROM tn_course WHERE cgroup IS NOT NULL ORDER BY cgroup');
    console.log(`\n📦 Found ${groups.length} course packages:`);
    groups.forEach(group => {
      console.log(`- ${group.cgroup}: ${group.g_name}`);
    });
    
    // Get unique levels
    const [levels] = await db.execute('SELECT DISTINCT level FROM tn_course WHERE level IS NOT NULL ORDER BY level');
    console.log('\n📊 Course Levels:');
    levels.forEach(level => {
      console.log(`- Level ${level.level}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTnCourseTable();