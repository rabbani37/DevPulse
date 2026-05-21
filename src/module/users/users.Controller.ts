import type { Request, Response } from "express";
import AuthService from "./users.services";
import { sendResponse } from "../../utility/sendResponse";



const createUser = async (req: Request, res: Response) => {

    const rslt = await AuthService.userCreateAuth(req.body)
    const user = rslt?.rows[0];

    sendResponse(res, 201, { message: "User registered successfully", data: user })

    // res.status(201).json({ message: "create users " })
};

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const rslt = await AuthService.userLoginAuth(email, password)

    // console.log("controller", rslt);
}
















export const authController = {
    createUser,
    loginUser
}