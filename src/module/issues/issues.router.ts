import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";
import rolePermission from "../../middleware/rolePermission";
import notDelete from "../../middleware/notDelete";



const router = Router();

router.post("/issues", auth(), issuesController.createIssuse)
router.get("/issues", issuesController.getAllIssues)
router.get("/issues/:id", issuesController.getSingleIssues)
router.put("/issues/:id", auth(), rolePermission(), issuesController.updateIssues)
router.delete("/issues/:id", auth(), rolePermission(), notDelete(), issuesController.deleteIssues)


export const issuesRouter = router