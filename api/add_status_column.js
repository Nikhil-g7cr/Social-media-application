const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: 'localhost',
  port: 1433,
  database: 'SocialMediaDB',
  username: 'NikhilKumar',
  password: 'Nikhil@g7cr',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 1. Add Status column
    // Try to add the column, catch if it already exists
    try {
      await sequelize.query(`ALTER TABLE tbl_Follow ADD Status VARCHAR(20) DEFAULT 'PENDING' WITH VALUES;`);
      console.log('Status column added successfully.');
    } catch (e) {
      if (e.message && e.message.includes('already exists')) {
         console.log('Status column already exists.');
      } else if (e.message && e.message.includes('Column names in each table must be unique')) {
         console.log('Status column already exists.');
      } else {
         console.error('Error adding Status column:', e.message);
         // if the issue is just syntax without 'WITH VALUES' we try the normal way
         try {
             await sequelize.query(`ALTER TABLE tbl_Follow ADD Status VARCHAR(20) DEFAULT 'PENDING';`);
             console.log('Status column added successfully (without WITH VALUES).');
         } catch (e2) {
             console.error('Failed both ways:', e2.message);
         }
      }
    }

    // 2. Set existing records to ACCEPTED so we don't break existing friends
    await sequelize.query(`UPDATE tbl_Follow SET Status = 'ACCEPTED' WHERE Status = 'PENDING' OR Status IS NULL;`);
    console.log('Updated existing records to ACCEPTED.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
