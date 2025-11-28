import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testMySQLConnection() {
  try {
    console.log('🔄 Testing MySQL connection...');
    console.log('📍 Host:', process.env.DB_HOST);
    console.log('📍 Port:', process.env.DB_PORT);
    console.log('📍 Database:', process.env.DB_NAME);
    console.log('📍 User:', process.env.DB_USER);
    console.log('');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Successfully connected to MySQL!');

    const [rows] = await connection.execute('SELECT DATABASE() as db, USER() as user, VERSION() as version');
    console.log('\n📊 Connection Details:');
    console.log('  Database:', rows[0].db);
    console.log('  User:', rows[0].user);
    console.log('  MySQL Version:', rows[0].version);

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📂 Tables in database:');
    if (tables.length === 0) {
      console.log('  (no tables yet - database is empty)');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    }

    await connection.end();
    console.log('\n🎉 MySQL connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MySQL connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testMySQLConnection();
