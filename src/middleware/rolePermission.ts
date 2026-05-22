import type { NextFunction, Request, Response } from "express"
import { sendResponse } from "../utility/sendResponse";
import { pool } from "../db/db_index";


const rolePermission = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id
        const currentUser = req.currentUser;
        const issues = await pool.query(`SELECT reporter_id,status FROM issues WHERE id = $1`, [id])
        const isIssues = issues.rows[0]
        console.log(isIssues);
console.log(currentUser.id);
        if (!currentUser) {
            return sendResponse(res, 401, { message: "Unauthorized user", error: true })
        }
        else if (issues.rows.length === 0) {
            return sendResponse(res, 404, { message: "Issues not found", error: true })
        }
        else if (currentUser.role === "contributor" && currentUser.id === isIssues.reporter_id && isIssues.status === "open") {
            return next()
        }
        else if (currentUser.role === "maintainer") {
            return next()
        }
        return sendResponse(res, 401, { message: "You are not allowed to modify and delete this issue", error: true })
    }
}


export default rolePermission;