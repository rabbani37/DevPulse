import dotenv from "dotenv"
import { env } from "process"
dotenv.config({ quiet: true })

const config = {
    port: env.PORT,
    databaseUrl: env.DATABASE_URL
}




export default config;