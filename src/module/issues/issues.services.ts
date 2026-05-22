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



    async issuesAllGet() {
        const issues = await pool.query(`
        SELECT * FROM issues
        `);
        if(issues.rows.length === 0){
            throw new Error("Issues not found")
        }
        const reporterIds = issues.rows.map(i => i.reporter_id)
        const users = await pool.query(`
            SELECT id, name, role FROM users WHERE id = ANY($1)
            `, [reporterIds])
        if(users.rows.length === 0){
            throw new Error("User not found")
        }
        const result = issues.rows.map(issues => {
            const reporter = users.rows.find(u => u.id === issues.reporter_id)
            return {
                id: issues.id,
                title: issues.title,
                description: issues.description,
                type: issues.type,
                status: issues.status,
                reporter: reporter,
                created_at: issues.created_at,
                updated_at: issues.updated_at

            }
        })

        return result;
    }
}






export default new IssuesService()