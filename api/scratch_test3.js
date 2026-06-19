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

class Conversation extends Model {}
Conversation.init({
  ID: { type: DataTypes.UUID, primaryKey: true },
  Type: DataTypes.STRING,
  CreatedBy: DataTypes.UUID,
  CreatedAt: DataTypes.DATE
}, { sequelize, tableName: 'tbl_Conversation', timestamps: false });

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
    
    const id = require('crypto').randomUUID();
    console.log('Inserting Conversation with ID', id);
    
    await Conversation.create({
      ID: id,
      Type: 'single',
      CreatedBy: '35CF9678-5338-461A-BD21-FD118FF4DA78',
      CreatedAt: new Date()
    });
    console.log('Conversation inserted.');
    
    const check = await sequelize.query(`SELECT * FROM tbl_Conversation WHERE ID = '${id}'`);
    console.log('Found in DB:', check[0]);
    
    await CP.create({
      ID: require('crypto').randomUUID(),
      ConversationID: id,
      UserID: '35CF9678-5338-461A-BD21-FD118FF4DA78',
      Role: 'OWNER',
      JoinedAt: new Date()
    });
    console.log('CP inserted.');
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.original) console.error('Original:', err.original.message);
  } finally {
    await sequelize.close();
  }
}

run();
