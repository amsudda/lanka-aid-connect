import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const testBasicConnection = async () => {
  // Try to connect to the default postgres database first
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Default database
    user: 'postgres', // Default superuser
    password: process.env.DB_PASSWORD, // Try with the same password
  });

  try {
    console.log('🔄 Testing basic connection to PostgreSQL...');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`📍 Port: ${process.env.DB_PORT || 5432}`);
    console.log(`📍 Database: postgres (default)`);
    console.log(`📍 User: postgres (superuser)`);
    console.log('');

    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Check if user exists
    const userCheck = await client.query(`
      SELECT 1 FROM pg_roles WHERE rolname='lankaaid';
    `);

    if (userCheck.rows.length > 0) {
      console.log('✅ User "lankaaid" exists');
    } else {
      console.log('❌ User "lankaaid" does NOT exist');
      console.log('\n📝 To create the user, run on your VPS:');
      console.log(`   sudo -u postgres psql -c "CREATE USER lankaaid WITH PASSWORD '#Lankaaid#2025';"`);
    }

    // Check if database exists
    const dbCheck = await client.query(`
      SELECT 1 FROM pg_database WHERE datname='lanka_aid_connect';
    `);

    if (dbCheck.rows.length > 0) {
      console.log('✅ Database "lanka_aid_connect" exists');
    } else {
      console.log('❌ Database "lanka_aid_connect" does NOT exist');
      console.log('\n📝 To create the database, run on your VPS:');
      console.log(`   sudo -u postgres psql -c "CREATE DATABASE lanka_aid_connect OWNER lankaaid;"`);
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);

    console.log('\n💡 This means you need to run these commands on your VPS:');
    console.log('\n1. Create the user:');
    console.log(`   sudo -u postgres psql`);
    console.log(`   CREATE USER lankaaid WITH PASSWORD '#Lankaaid#2025';`);
    console.log(`   ALTER USER lankaaid CREATEDB;`);
    console.log(`   \\q`);
    console.log('\n2. Create the database:');
    console.log(`   sudo -u postgres createdb -O lankaaid lanka_aid_connect`);
    console.log('\n3. Configure pg_hba.conf for remote access:');
    console.log(`   sudo nano /etc/postgresql/*/main/pg_hba.conf`);
    console.log(`   Add: host    all    all    0.0.0.0/0    md5`);
    console.log('\n4. Configure postgresql.conf:');
    console.log(`   sudo nano /etc/postgresql/*/main/postgresql.conf`);
    console.log(`   Set: listen_addresses = '*'`);
    console.log('\n5. Restart PostgreSQL:');
    console.log(`   sudo systemctl restart postgresql`);

    await client.end();
    process.exit(1);
  }
};

testBasicConnection();
