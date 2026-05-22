
import { pool } from "../../db/db_index";
import type { TCurrentUser, Tissues } from "../../types/types";
import tokenVerify from "../../utility/tokenVerify";
import type { JwtPayload } from "jsonwebtoken";




class IssuesService {
    async issuesCreate(issuesInfo: Tissues, currentUser: TCurrentUser) {
        const { title, description, type, status, } = issuesInfo;
        if (!title || !description || !type) {
            throw new Error("Title, description and type are required")
        }
        const { id } = currentUser
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
        if (issues.rows.length === 0) {
            throw new Error("Issues not found")
        }
        const reporterIds = issues.rows.map(i => i.reporter_id)
        const users = await pool.query(`
            SELECT id, name, role FROM users WHERE id = ANY($1)
            `, [reporterIds])
        if (users.rows.length === 0) {
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


    async issuesSingleGet(id: string) {

        const issues_db = await pool.query(`SELECT * FROM issues WHERE id = $1`, [parseInt(id)]);
        const issues = issues_db.rows[0]
        if (!issues) {
            throw new Error("Issues not found")
        }
        const { reporter_id } = issues
        const reporter_db = await pool.query(`SELECT id, name, role FROM users WHERE id = $1`, [reporter_id])
        const reporter = reporter_db.rows[0]

        const result = {
            id: issues.id,
            title: issues.title,
            description: issues.description,
            type: issues.type,
            status: issues.status,
            reporter: reporter,
            created_at: issues.created_at,
            updated_at: issues.updated_at
        }
        return result
    }


    async issuesUpdate(updateInfo: Tissues, id: string, token: string | undefined) {
        const { title, description, type, } = updateInfo;
        const updated_atNow = new Date().toISOString();

        const validToken = tokenVerify(token, "access") as JwtPayload
        const tokenId = validToken.id

        const issues_db = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id])
        const issues = issues_db.rows[0]
        if (!issues) {
            throw new Error("Issues not found")
        }
        const { reporter_id } = issues
        if (tokenId !== reporter_id) {
            throw new Error("You are not authorized to update this Issues")
        }

        const issuesUpdate_db = await pool.query(`
            UPDATE issues 
            SET title = $1, description = $2, type = $3, updated_at=$4
            WHERE id = $5
            `, [title, description, type, updated_atNow, id]);

        if (!issuesUpdate_db.rowCount) {
            throw new Error("Failed to update issue")
        }
        const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id])
        return result.rows[0]
    }


    async issuesDelete(id: string, token: string | undefined) {
        const validToken = tokenVerify(token, "access") as JwtPayload
        const tokenId = validToken.id

        const issues_db = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id])
        const issues = issues_db.rows[0]
        if (!issues) {
            throw new Error("Issues not found")
        }
        const { reporter_id } = issues

        if (tokenId !== reporter_id) {
            throw new Error("You are not authorized to delete this Issues")
        }

        const issueDelete = await pool.query(`
            DELETE FROM issues WHERE id = $1
            `, [id])
        return issueDelete
    }


}


export default new IssuesService()