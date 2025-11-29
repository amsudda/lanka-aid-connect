import sequelize from '../config/database.js';

async function addIsVerifiedColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if column exists
    const tableDescription = await queryInterface.describeTable('need_posts');

    if (!tableDescription.is_verified) {
      console.log('Adding is_verified column to need_posts table...');
      await queryInterface.addColumn('need_posts', 'is_verified', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('is_verified column added successfully!');
    } else {
      console.log('is_verified column already exists');
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addIsVerifiedColumn();
