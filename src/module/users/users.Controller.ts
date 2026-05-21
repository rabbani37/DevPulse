import type { Request, Response } from "express";
import AuthService from "./users.services";



const createUser = async (req: Request, res: Response) => {

    try {
        const rslt = await AuthService.userCreateAuth(req.body)
        console.log("Controller user", rslt?.rows[0]);
    } catch (error) {
        console.log(error);
    }

    // res.status(201).json({ message: "create users " })
};
















export const authController = {
    createUser
}