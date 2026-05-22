import type { Request, Response } from "express";
import issuesServices from "./issues.services";
import { sendResponse } from "../../utility/sendResponse";



const createIssuse = async (req: Request, res: Response) => {
    const currentUser = req.currentUser
    if (!currentUser) {
        sendResponse(res, 401, { message: "Unauthorized", error: true })
    }
    const issues = await issuesServices.issuesCreate(req.body, currentUser)
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
    const id = req.params.id as string
    const issues = await issuesServices.issuesUpdate(req.body, id)
    sendResponse(res, 200, { data: issues })
}

const deleteIssues = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const issues = await issuesServices.issuesDelete(id)
    if (!issues.rowCount) {
        sendResponse(res, 404, { message: "Issue doesn't  deleted ", error: true })
    }
    sendResponse(res, 200, { message: "Issue deleted successfully" })
}



export const issuesController = {
    createIssuse,
    getAllIssues,
    getSingleIssues,
    updateIssues,
    deleteIssues
}