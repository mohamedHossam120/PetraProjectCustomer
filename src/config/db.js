const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('MySQL Connected to XAMPP (Petra Database)...');
        connection.release(); 
    } catch (error) {
        console.error(`MySQL Connection Error: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = { connectDB, db };