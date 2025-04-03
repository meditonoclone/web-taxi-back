module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
      rating_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.TIMESTAMP,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      tableName: 'ratings',
      timestamps: false
    });
  
    Rating.associate = (models) => {
      Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Rating.belongsTo(models.User, { foreignKey: 'driver_id', as: 'driver' });
      Rating.belongsTo(models.TripHistory, { foreignKey: 'trip_id', as: 'trip' });
    };
  
    return Rating;
  };
  