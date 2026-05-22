import { Router } from "express";
import { issuesController } from "./issues.controller";



const router = Router();

router.post("/issues", issuesController.createIssuse)
router.get("/issues", issuesController.getAllIssues)
router.get("/issues/:id", () => { })
router.put("/issues/:id", () => { })
router.delete("/issues/:id", () => { })


export const issuesRouter = router