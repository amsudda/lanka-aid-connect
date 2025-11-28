import pkg from 'pg';
const { Client } = pkg;

// Test with hardcoded values to eliminate .env parsing issues
const client = new Client({
  host: '31.97.116.89',
  port: 5443,
  database: 'postgres',
  user: 'lankaid',
  password: '#Minuka#2025', // Hardcoded password
});

async function test() {
  try {
    console.log('Attempting connection with:');
    console.log('  Host: 31.97.116.89');
    console.log('  Port: 5443');
    console.log('  Database: postgres');
    console.log('  User: lankaid');
    console.log('  Password: #Minuka#2025');
    console.log('');

    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('✅ Query result:', result.rows[0]);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    await client.end();
    process.exit(1);
  }
}

test();
