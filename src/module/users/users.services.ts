
import { sign } from "node:crypto";
import { pool } from "../../db/db_index";
import type { TRUser } from "../../types/types";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import e from "express";
import config from "../../config/index_config";


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

        const userDB = await pool.query(`
            SELECT * FROM users WHERE email = $1
            `, [email]);

        const user_db = userDB?.rows[0] // user
        if (!user_db) {
            throw new Error("Invalid email ")
        }
        const { password_hash, ...user } = user_db
        console.log(user_db);
        const isvalidPass = await bcrypt.compare(password, password_hash)
        if (!isvalidPass) {
            throw new Error("Invalid Credential ")
        }
        const jwtpayload = {
            id: user_db.id,
            name: user_db.name,
            email: user_db.email,
            role: user_db.role
        }
        const accessToken = jwt.sign(jwtpayload, config.access_secret as string, { expiresIn: "1d" })
        const data = { accessToken, user };
        return data
    }



}

export default new AuthService();