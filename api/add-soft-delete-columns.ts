import { Sequelize } from 'sequelize-typescript';

async function addSoftDeleteColumns() {
  const sequelize = new Sequelize('SocialMediaDB', 'NikhilKumar', 'Nikhil@g7cr', {
    host: 'localhost',
    dialect: 'mssql',
  });

  try {
    console.log('Adding IsDeleted column...');
    await sequelize.query(
      `IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
        AND name = 'IsDeleted'
      )
      ALTER TABLE [Users] ADD [IsDeleted] BIT NOT NULL DEFAULT 0;`,
    );
    console.log('IsDeleted column added (or already exists).');

    console.log('Adding DeletedAt column...');
    await sequelize.query(
      `IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
        AND name = 'DeletedAt'
      )
      ALTER TABLE [Users] ADD [DeletedAt] DATETIME NULL;`,
    );
    console.log('DeletedAt column added (or already exists).');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sequelize.close();
  }
}

addSoftDeleteColumns();
