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

            RETURNING * 
            `, [name, email, hash, role ?? "contributor"])
            return rslt;
        } catch (error) {
            console.log(error);
        }
    };


    // userLogin



}

export default new AuthService();