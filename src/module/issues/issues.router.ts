import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";



const router = Router();

router.post("/issues", auth(), issuesController.createIssuse)
router.get("/issues", issuesController.getAllIssues)
router.get("/issues/:id", issuesController.getSingleIssues)
router.put("/issues/:id", issuesController.updateIssues)
router.delete("/issues/:id", issuesController.deleteIssues)


export const issuesRouter = router