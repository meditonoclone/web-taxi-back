
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {

    };

    User.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        account_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profile_picture: {
            type: DataTypes.DATE,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'user',
        modelName: 'User',
        freezeTableName: true,
        timestamps: false
    });
    return User;
}

