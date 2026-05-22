import type { Request, Response } from "express";
import issuesServices from "./issues.services";
import { sendResponse } from "../../utility/sendResponse";



const createIssuse = async (req: Request, res: Response) => {
    const token = req.headers.authorization
    const issues = await issuesServices.issuesCreate(req.body, token)
    sendResponse(res, 201, { message: "Issue created successfully", data: issues })
}

const getAllIssues = async (req: Request, res: Response) => {
    const issues = await issuesServices.issuesAllGet()
    sendResponse(res, 200, { data: issues })
}

const getSingleIssues = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const issues = await issuesServices.issuesSingleGet(id)
    sendResponse(res, 200, { data: issues })
}

const updateIssues = async (req: Request, res: Response) => {
    const token = req.headers.authorization
    const id = req.params.id as string
    const issues = await issuesServices.issuesUpdate(req.body, id,token)
    sendResponse(res, 200, { data: issues })
}








export const issuesController = {
    createIssuse,
    getAllIssues,
    getSingleIssues,
    updateIssues
}