import type { Request, Response } from "express";
import AuthService from "./users.services";
import { sendResponse } from "../../utility/sendResponse";



const createUser = async (req: Request, res: Response) => {

    const user = await AuthService.userCreateAuth(req.body);
    return sendResponse(res, 201, { message: "User registered successfully", data: user })

};

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await AuthService.userLoginAuth(email, password)
    // res.cookie("token", refreshToken, { sameSite: "lax", httpOnly: true })
    return sendResponse(res, 201, { message: "Login successful", data: { accessToken, user } })

}














export const authController = {
    createUser,
    loginUser
}