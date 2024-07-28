import mysql from "mysql2/promise";  // Ensure you're using the 'promise' version
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function fetchData() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB
    });

    try {
        const [rows, fields] = await pool.query("SELECT * FROM waitlist");
        console.log(rows);
    } catch (err) {
        console.error('Error executing query', err);
    }
}

async function addUser(name, email) {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB
    });

    try {
        const [result] = await pool.query("INSERT INTO waitlist (name, email) VALUES (?, ?)", [name, email]);
        console.log('User added with ID:', result.insertId);
    } catch (err) {
        console.error('Error adding user:', err);
    }
}

// Example usage:
fetchData();
addUser('John Doe', 'johny.doe@example.com');
