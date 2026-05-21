
import { pool } from "../../db/db_index";
import type { TRUser } from "../../types/types";
import bcrypt from "bcrypt"


class AuthService {

    async userCreateAuth(user: TRUser) {
        const { name, email, password_hash, role } = user;
        const hash = await bcrypt.hash(password_hash, 15)
        try {
            const rslt = await pool.query(`
            INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)

            RETURNING id, name, email, role, created_at, updated_at 
            `, [name, email, hash, role ?? "contributor"])
            return rslt;
        } catch (error) {
            console.log(error);
        }
    };


    async userLoginAuth(email: string, password: string) {

        const rslt = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email]);

        const {password_hash, } = rslt?.rows[0]
        console.log(password_hash);

        // console.log({email,password});
    }



}

export default new AuthService();