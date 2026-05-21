import type { Request, Response } from "express";
import issuesServices from "./issues.services";



const createIssuse = (req: Request, res: Response) => {
    const rslt = issuesServices.issuesCreate()
}










export const issuesController = {
    createIssuse
}