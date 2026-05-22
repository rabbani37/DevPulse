import { pool } from "../../db/db_index";
import type { TRUser } from "../../types/types";
import bcrypt from "bcrypt"
import signToken from "../../utility/jwt";
import type { JwtPayload } from "jsonwebtoken";


class AuthService {

    async userCreateAuth(user: TRUser) {
        const { name, email, password_hash, role } = user;
        const hash = await bcrypt.hash(password_hash, 15)

        const rslt = await pool.query(`
            INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)

            RETURNING id, name, email, role, created_at, updated_at 
            `, [name, email, hash, role ?? "contributor"])
        return rslt.rows[0];

    };


    async userLoginAuth(email: string, password: string) {

        const userDB = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email]);

        const user_db = userDB?.rows[0] // user
        if (!user_db) {
            throw new Error("Invalid email")
        }
        const { password_hash, ...user } = user_db as TRUser
        const isvalidPass = await bcrypt.compare(password, password_hash)
        if (!isvalidPass) {
            throw new Error("Invalid Credential ")
        }
        const jwtpayload:JwtPayload = {
            id: user_db.id,
            name: user_db.name,
            role: user_db.role
        }
        const { accessToken,refreshToken } = signToken(jwtpayload)
       
        return { accessToken,refreshToken, user }
    }
}

export default new AuthService();