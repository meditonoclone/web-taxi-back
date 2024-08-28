const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('taxi_dev', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', 
  logging: false,
});
const testconnect = async () =>{
    try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

}

testconnect();
module.exports = sequelize;