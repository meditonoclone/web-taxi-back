
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
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profile_picture: {
            type: DataTypes.DATE,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reset_password_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        token_expires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'user',
        modelName: 'User',
        freezeTableName: true,
        timestamps: false
    });
    return User;
}

