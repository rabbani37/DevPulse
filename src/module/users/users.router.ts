import { Router } from "express";
import { authController } from "./users.Controller";



const router = Router()


router.post("/auth/signup",authController.createUser)
router.post("/auth/login",authController.loginUser)




export const authRouter = router