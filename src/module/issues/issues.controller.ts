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

    const dataSort = ["newest", "oldest"]
    const dataType = ["bug", "feature_request"]
    const dataStatus = ["open", "in_progress", "resolved"]
    const { status , type, sort= "newest" } = req.query;

    if (type && !dataType.includes(type as string)) {
        return sendResponse(res, 400, { message: "invalid type value" })
    }

    if (status && !dataStatus.includes(status as string)) {
        return sendResponse(res, 400, { message: "invalid status value" })
    }

    if (sort && !dataSort.includes(sort as string)) {
        return sendResponse(res, 400, { message: "invalid sort value" })
    }

    let quary = `SELECT * FROM issues WHERE 1 = 1`
    let values: any[] = []


    if (type) {
        values.push(type)
        quary += ` AND type = $${values.length}`
    }
    if (status) {
        values.push(status)
        quary += ` AND status = $${values.length}`
    }

    if (sort === "oldest") {
        quary += ` ORDER BY created_at ASC`
    }

    if (sort === "newest") {
        quary += ` ORDER BY created_at DESC`
    }
    


    const issues = await issuesServices.issuesAllGet(quary,values)
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