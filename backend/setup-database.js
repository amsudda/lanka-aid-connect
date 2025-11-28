import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const setupDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'lanka_aid_connect';

    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1;
    `;
    const result = await client.query(checkDbQuery, [dbName]);

    if (result.rows.length > 0) {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    } else {
      console.log(`🔄 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName};`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    }

    console.log('\n📊 Database setup completed!');
    console.log(`\nNext steps:`);
    console.log(`1. Run: npm run db:migrate`);
    console.log(`2. Run: npm run db:seed (optional - adds sample data)`);
    console.log(`3. Run: npm run dev`);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed!');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('1. PostgreSQL is running on the VPS');
      console.log('2. PostgreSQL is configured to accept remote connections');
      console.log('3. Firewall allows connections on port 5432');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Username and password are correct');
      console.log('2. User has permission to create databases');
    } else if (error.code === '42501') {
      console.log('\n💡 Permission denied. The user needs CREATEDB privilege.');
      console.log('Run this on your VPS as postgres superuser:');
      console.log(`   ALTER USER ${process.env.DB_USER} CREATEDB;`);
    }

    await client.end();
    process.exit(1);
  }
};

setupDatabase();
