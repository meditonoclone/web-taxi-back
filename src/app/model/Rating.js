const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Rating.belongsTo(models.User, { foreignKey: 'driver_id', as: 'driver' });
      Rating.belongsTo(models.TripHistory, { foreignKey: 'trip_id', as: 'trip' });
    }
  }

  Rating.init(
    {
      rating_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize, // Cần truyền `sequelize` vào đây
      tableName: 'ratings',
      timestamps: false, // Nếu muốn tự động có `created_at` và `updated_at`, hãy đặt `timestamps: true`
    }
  );

  return Rating;
};
