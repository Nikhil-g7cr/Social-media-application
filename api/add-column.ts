import { Sequelize } from 'sequelize-typescript';

async function alter() {
  const sequelize = new Sequelize('SocialMediaDB', 'NikhilKumar', 'Nikhil@g7cr', {
    host: 'localhost',
    dialect: 'mssql',
  });
  try {
    await sequelize.query('ALTER TABLE Conversation_Participants ADD HistoryClearedAt DATETIME NULL;');
    console.log('Column added');
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
alter();
