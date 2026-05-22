import type { Request, Response } from "express";
import issuesServices from "./issues.services";
import { sendResponse } from "../../utility/sendResponse";



const createIssuse = async (req: Request, res: Response) => {
    const token = req.headers.authorization
    const issues = await issuesServices.issuesCreate(req.body,token)
    sendResponse(res, 201, { message: "Issue created successfully", data: issues })
}










export const issuesController = {
    createIssuse
}