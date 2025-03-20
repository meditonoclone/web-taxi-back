const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Trip extends Model {
        
    }

    Trip.init({
        trip_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: true,  // Cho phép giá trị null
        },
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vehicle_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        from_location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        to_location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact: {
            type: DataTypes.STRING,
            allowNull: false
        },
        order_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        finished_time: {
            type: DataTypes.DATE,
            allowNull: true  // Cho phép giá trị null
        },
        distance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true  // Cho phép giá trị null
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true  // Cho phép giá trị null
        },
        waiting_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('cancel', 'waiting', 'booked', 'en route', 'in transit', 'completed'),
            allowNull: false,
            defaultValue: 'booked'
        },
        pickup_latitude: {
            type: DataTypes.DECIMAL(10, 7)
        },
        pickup_longitude: {
            type: DataTypes.DECIMAL(10, 7)
        },
        dropoff_latitude: {
            type: DataTypes.DECIMAL(10, 7)
        },
        dropoff_longitude: {
            type: DataTypes.DECIMAL(10, 7)
        },
    }, {
        sequelize,
        modelName: 'Trip',
        tableName: 'trip_history',
        freezeTableName: true,
        timestamps: false,
        hooks: {
            
        }
    });

    return Trip;
}