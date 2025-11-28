import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const testConnection = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔄 Attempting to connect to PostgreSQL database...');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`📍 Port: ${process.env.DB_PORT || 5432}`);
    console.log(`📍 Database: ${process.env.DB_NAME}`);
    console.log(`📍 User: ${process.env.DB_USER}`);
    console.log('');

    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');

    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);

    const dbList = await client.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false;
    `);
    console.log('\n📂 Available databases:');
    dbList.rows.forEach(row => console.log(`   - ${row.datname}`));

    await client.end();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error details:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }

    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if PostgreSQL is running on the VPS');
    console.log('2. Verify the database credentials');
    console.log('3. Ensure the database "lanka_aid_connect" exists');
    console.log('4. Check if the VPS firewall allows PostgreSQL connections (port 5432)');
    console.log('5. Verify pg_hba.conf allows remote connections');

    await client.end();
    process.exit(1);
  }
};

testConnection();
