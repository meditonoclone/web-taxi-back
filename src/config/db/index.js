const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Mặc định trống
    database: 'taxi_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool.promise(); 