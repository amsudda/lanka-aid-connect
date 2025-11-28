import pkg from 'pg';
const { Client } = pkg;

// Use the connection string directly from Coolify
const connectionString = 'postgres://lankaid:%23Minuka%232025@31.97.116.89:5443/postgres';

const client = new Client({
  connectionString: connectionString
});

async function test() {
  try {
    console.log('Testing connection using Coolify connection string...');
    console.log('Connection string:', connectionString);
    console.log('');

    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('\n✅ Connection Details:');
    console.log('  Database:', result.rows[0].current_database);
    console.log('  User:', result.rows[0].current_user);
    console.log('  Version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);

    // List all databases
    const dbList = await client.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname;
    `);
    console.log('\n📂 Available databases:');
    dbList.rows.forEach(row => console.log(`   - ${row.datname}`));

    await client.end();
    console.log('\n🎉 Success! Database connection is working!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    await client.end();
    process.exit(1);
  }
}

test();
