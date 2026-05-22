import type { NextFunction, Request, Response } from "express"
import { sendResponse } from "../utility/sendResponse"


const notDelete = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req.currentUser
        if (!currentUser) {
            return sendResponse(res, 404, { message: "Unauthorized",error:true })
        }
        else if (currentUser.role === "contributor") {
            return sendResponse(res, 403, { message: "Unauthorized permission for Delete Issues",error:true })
        }
        next()
    }
}

export default notDelete;