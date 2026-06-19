const { Sequelize, DataTypes, Model } = require('sequelize');

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

class CP extends Model {}
CP.init({
  ID: { type: DataTypes.UUID, primaryKey: true },
  ConversationID: DataTypes.UUID,
  UserID: DataTypes.UUID,
  Role: DataTypes.STRING,
  JoinedAt: DataTypes.DATE
}, { sequelize, tableName: 'Conversation_Participants', timestamps: false });

async function run() {
  try {
    await sequelize.authenticate();
    
    await CP.create({
      ID: '00000000-0000-0000-0000-000000000001',
      ConversationID: '00000000-0000-0000-0000-000000000002',
      UserID: '00000000-0000-0000-0000-000000000003',
      Role: 'MEMBER',
      JoinedAt: new Date()
    });
    console.log('Success!');
  } catch (err) {
    console.error('Sequelize Error Message:', err.message);
    if (err.original) {
      console.error('Original SQL Error:', err.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

run();
