import db from '../models/index.js';

const { User } = db;

async function checkAdmin() {
  try {
    const adminEmail = 'idearigs@gmail.com';

    const admin = await User.findOne({ where: { email: adminEmail } });

    if (admin) {
      console.log('Admin user found:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Full Name:', admin.full_name);
      console.log('Role:', admin.role);
      console.log('User Type:', admin.user_type);
      console.log('Has Password:', !!admin.password);
      console.log('Password Hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'NULL');
      console.log('Is Verified:', admin.is_verified);
    } else {
      console.log('Admin user not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
