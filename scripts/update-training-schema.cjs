const db = require('../backend/config/database');

async function updateTrainingNeedsSchema() {
  try {
    console.log('🔧 Updating training_needs table schema...');
    
    // เพิ่มคอลัมน์ใหม่
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN job_levels JSON COMMENT "ระดับปฏิบัติงานที่เลือก [1,2,3]"');
      console.log('✅ Added job_levels column');
    } catch (e) {
      console.log('Column job_levels already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN selected_package_code VARCHAR(10) COMMENT "รหัสแพ็คเกจที่เลือก"');
      console.log('✅ Added selected_package_code column');
    } catch (e) {
      console.log('Column selected_package_code already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN selected_course_id INT COMMENT "ID หลักสูตรที่เลือกจาก tn_course"');
      console.log('✅ Added selected_course_id column');
    } catch (e) {
      console.log('Column selected_course_id already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD COLUMN backup_old_data JSON COMMENT "Backup ข้อมูลเก่าก่อน migration"');
      console.log('✅ Added backup_old_data column');
    } catch (e) {
      console.log('Column backup_old_data already exists');
    }
    
    // เพิ่ม foreign key constraint
    try {
      await db.execute('ALTER TABLE training_needs ADD CONSTRAINT fk_course FOREIGN KEY (selected_course_id) REFERENCES tn_course(id)');
      console.log('✅ Added foreign key constraint');
    } catch (e) {
      console.log('Foreign key constraint already exists or cannot be added');
    }
    
    // เพิ่ม index
    try {
      await db.execute('ALTER TABLE training_needs ADD INDEX idx_package_code (selected_package_code)');
      console.log('✅ Added package_code index');
    } catch (e) {
      console.log('Index already exists');
    }
    
    try {
      await db.execute('ALTER TABLE training_needs ADD INDEX idx_course_id (selected_course_id)');
      console.log('✅ Added course_id index');
    } catch (e) {
      console.log('Index already exists');
    }
    
    // ตรวจสอบโครงสร้างตารางใหม่
    const [columns] = await db.execute('SHOW COLUMNS FROM training_needs');
    console.log('\n📋 Updated table structure:');
    columns.forEach(col => {
      if (['job_levels', 'selected_package_code', 'selected_course_id', 'backup_old_data'].includes(col.Field)) {
        console.log(`✨ ${col.Field}: ${col.Type} (NEW)`);
      } else {
        console.log(`  ${col.Field}: ${col.Type}`);
      }
    });
    
    console.log('\n✅ Schema update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
}

updateTrainingNeedsSchema();