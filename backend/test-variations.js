import pkg from 'pg';
const { Client } = pkg;

// Test different password variations
const passwordVariations = [
  '#Lankaaid#2025',           // Original
  'Lankaaid#2025',            // Without leading #
  '#Lankaaid2025',            // Without middle #
  'Lankaaid2025',             // Without any #
  '\\#Lankaaid\\#2025',       // Escaped #
];

async function testConnection(password, index) {
  const client = new Client({
    host: '31.97.116.89',
    port: 5432,
    database: 'LankaaidDB',
    user: 'lankaaid',
    password: password,
  });

  try {
    console.log(`\nTest ${index + 1}: Trying password: "${password}"`);
    await client.connect();
    console.log('✅ SUCCESS! Connected with this password:', password);

    const result = await client.query('SELECT current_database(), current_user');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);

    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    await client.end();
    return false;
  }
}

async function runTests() {
  console.log('Testing different password variations...');
  console.log('==========================================');

  for (let i = 0; i < passwordVariations.length; i++) {
    const success = await testConnection(passwordVariations[i], i);
    if (success) {
      console.log('\n🎉 Found working password!');
      console.log('Update your .env file with this password.');
      process.exit(0);
    }
  }

  console.log('\n❌ None of the password variations worked.');
  console.log('\nPlease check:');
  console.log('1. What is the EXACT password set in Coolify?');
  console.log('2. Does it have special characters that need escaping?');
  console.log('3. Can you access the database from Coolify\'s web interface?');

  process.exit(1);
}

runTests();
