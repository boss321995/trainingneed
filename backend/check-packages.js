const mysql = require('mysql2/promise');

async function checkPackagesTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'hrd_db'
    });

    try {
        // Check if course_packages table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "course_packages"');
        console.log('Tables found:', tables.length > 0 ? 'course_packages exists' : 'course_packages does not exist');

        if (tables.length > 0) {
            // Get table structure
            const [structure] = await connection.execute('DESCRIBE course_packages');
            console.log('\nTable structure:');
            structure.forEach(col => {
                console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });

            // Get sample data
            const [data] = await connection.execute('SELECT * FROM course_packages ORDER BY package_name ASC LIMIT 10');
            console.log('\nSample data (first 10 rows):');
            data.forEach((row, index) => {
                console.log(`${index + 1}. ${JSON.stringify(row)}`);
            });

            // Get total count
            const [count] = await connection.execute('SELECT COUNT(*) as total FROM course_packages');
            console.log(`\nTotal packages: ${count[0].total}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkPackagesTable();