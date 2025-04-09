const { Sequelize } = require('sequelize');
const sequelize = require('../../config/db'); // Import kết nối DB

const User = require('./User')(sequelize);
const Trip = require('./Trip')(sequelize);
const Rating = require('./Rating')(sequelize);
const Payment = require('./Payment')(sequelize);
// // Định nghĩa quan hệ giữa các model
// User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
// User.hasMany(Rating, { foreignKey: 'driver_id', as: 'driverRatings' });
// Trip.hasMany(Rating, { foreignKey: 'trip_id', as: 'ratings' });

// Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// Rating.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });
// Rating.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });
const models = { sequelize, User, Trip, Rating, Payment };
Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });

module.exports = models;
