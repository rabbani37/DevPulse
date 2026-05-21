import dotenv from "dotenv"
import { env } from "process"
dotenv.config({ quiet: true })

const config = {
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    access_secret:env.ACCESS_SECRET,
    refresh_secret:env.REFRESH_SECRET
}




export default config;