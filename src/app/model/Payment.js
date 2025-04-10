const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Trip, { foreignKey: 'trip_id', as: 'trip' });
    }
  }

  Payment.init(
    {
      payment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM('cash', 'momo', 'vnpay'),
        allowNull: true,
        defaultValue: null
      },
      amount: {
        type: DataTypes.DECIMAL(10,0),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      request_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trans_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      result_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      }
    },
    {
      sequelize,
      tableName: 'payments',
      timestamps: false, // bạn có thể bật nếu cần Sequelize tự xử lý createdAt/updatedAt
    }
  );

  return Payment;
};
