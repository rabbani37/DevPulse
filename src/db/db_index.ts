import { Pool } from 'pg'
import config from '../config/index_config'


export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
})

export const initDB = async () => {
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



    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK(LENGTH (description) >=20),
        type VARCHAR(20) NOT NULL CHECK(type IN ('feature_request', 'bug ')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`)

    console.log("Database connected...");
}