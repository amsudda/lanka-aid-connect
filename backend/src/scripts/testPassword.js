import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const { User } = db;

async function testPassword() {
  try {
    const adminEmail = 'idearigs@gmail.com';
    const testPassword = 'Admin@2024';

    // Get admin user
    const admin = await User.findOne({ where: { email: adminEmail } });

    if (!admin) {
      console.log('Admin not found!');
      process.exit(1);
    }

    console.log('Testing password for:', admin.email);
    console.log('Stored hash:', admin.password);
    console.log('Test password:', testPassword);

    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password match:', isMatch);

    // Also test with freshly hashed password
    const freshHash = await bcrypt.hash(testPassword, 10);
    console.log('\nFresh hash:', freshHash);
    const freshMatch = await bcrypt.compare(testPassword, freshHash);
    console.log('Fresh hash match:', freshMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();
