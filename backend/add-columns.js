import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to database');

    // Check if columns already exist and add them if they don't
    const columns = [
      { name: 'num_adults', sql: 'ADD COLUMN num_adults INT DEFAULT 1' },
      { name: 'num_children', sql: 'ADD COLUMN num_children INT DEFAULT 0' },
      { name: 'num_infants', sql: 'ADD COLUMN num_infants INT DEFAULT 0' },
      { name: 'infant_ages', sql: 'ADD COLUMN infant_ages JSON DEFAULT NULL' },
      { name: 'is_group_request', sql: 'ADD COLUMN is_group_request TINYINT(1) DEFAULT 0' },
      { name: 'group_size', sql: 'ADD COLUMN group_size INT DEFAULT NULL' }
    ];

    for (const column of columns) {
      try {
        // Check if column exists
        const [rows] = await connection.query(
          `SHOW COLUMNS FROM need_posts LIKE '${column.name}'`
        );

        if (rows.length === 0) {
          console.log(`Adding column: ${column.name}`);
          await connection.query(`ALTER TABLE need_posts ${column.sql}`);
          console.log(`✓ Added ${column.name}`);
        } else {
          console.log(`Column ${column.name} already exists`);
        }
      } catch (err) {
        console.error(`Error adding ${column.name}:`, err.message);
      }
    }

    console.log('All columns processed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addColumns();
