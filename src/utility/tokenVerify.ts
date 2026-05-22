import config from "../config/index_config";
import jwt from "jsonwebtoken"
const tokenVerify = (token: string|undefined, type: "access" | "refresh") => {
    if (!token) {
        throw new Error("Access denied. No token provided")
    }
    const secret = type === "access" ? config.access_secret : config.refresh_secret
    return jwt.verify(token, secret as string)
}

export default tokenVerify