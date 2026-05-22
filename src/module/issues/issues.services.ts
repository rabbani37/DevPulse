import { error } from "node:console";
import { pool } from "../../db/db_index";
import type { Tissues } from "../../types/types";
import tokenVerify from "../../utility/tokenVerify";
import type { JwtPayload } from "jsonwebtoken";



class IssuesService {
    async issuesCreate(issuesInfo: Tissues, token: string | undefined) {
        const { title, description, type, status, } = issuesInfo;
        if (!token) {
            throw new Error("not found token")
        }
        const validToken = tokenVerify(token, "access") as JwtPayload
        const id = validToken.id
        const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])
        if (user.rows.length === 0) {
            throw new Error("Token now valid. So your not authencated user")
        }

        const rslt = await pool.query(`
            INSERT INTO issues(title, description, type, status, reporter_id)
            VALUES($1, $2, $3, $4, $5)

            RETURNING *
            `, [title, description, type, status ?? "open", id])
        return rslt.rows[0]
    }
}






export default new IssuesService()