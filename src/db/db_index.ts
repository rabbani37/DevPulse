import { Pool } from 'pg'
import config from '../config/index_config'


export const pool = new Pool({
    connectionString: config.databaseUrl
})

export const initDB = async () => {

    pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        email VARCHAR(40) UNIQUE NOT NULL
        )`);


    console.log("Database connected...");

}