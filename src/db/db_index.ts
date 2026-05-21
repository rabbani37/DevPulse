import { Pool } from 'pg'
import config from '../config/index_config'


export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
})

export const initDB = async () => {

    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        email VARCHAR(40) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor' NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
        console.log("Database connected...");
    } catch (error) {
        console.log("Database connection", error);
    }

}