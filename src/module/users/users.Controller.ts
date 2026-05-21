import type { Request, Response } from "express";
import AuthService from "./users.services";
import { sendResponse } from "../../utility/sendResponse";



const createUser = async (req: Request, res: Response) => {

    const user = await AuthService.userCreateAuth(req.body);   
    sendResponse(res, 201, { message: "User registered successfully", data: user })

};

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const finalUser = await AuthService.userLoginAuth(email, password)
    sendResponse(res, 201, { message: "Login successful", data: finalUser })

}
















export const authController = {
    createUser,
    loginUser
}