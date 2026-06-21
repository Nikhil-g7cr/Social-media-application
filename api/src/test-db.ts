import { Sequelize } from 'sequelize-typescript';

async function test() {
  const sequelize = new Sequelize('SocialMedia', 'sa', 'Password123', {
    host: 'localhost',
    dialect: 'mssql',
  }); // I don't know the credentials, wait.
}
