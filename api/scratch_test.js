const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('SocialMediaDB', 'NikhilKumar', 'Nikhil@g7cr', {
  host: 'localhost',
  dialect: 'mssql',
  port: 1433,
  dialectOptions: {
    options: {
      trustServerCertificate: true,
    }
  }
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Conversation_Participants'
    `);
    console.log('Columns:', results);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
