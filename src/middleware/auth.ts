import type { NextFunction, Request, Response } from "express";
import tokenVerify from "../utility/tokenVerify";
import { sendResponse } from "../utility/sendResponse";
import { pool } from "../db/db_index";
import type { JwtPayload } from "jsonwebtoken";



const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const token = req.headers.authorization
        const validToken = tokenVerify(token, "access") as JwtPayload
        const user = await pool.query(`SELECT id,name,email,role FROM users WHERE id = $1`, [validToken.id])
        if (user.rows.length === 0) {
            sendResponse(res, 404, { message: "user not found", error: true })
        }
        req.currentUser = user.rows[0];
        next()
    }
}


export default auth;