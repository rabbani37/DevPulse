import config from "../config/index_config";
import jwt from "jsonwebtoken"
const tokenVerify = (token: string, type: "access" | "refresh") => {
    const secret = type === "access" ? config.access_secret : config.refresh_secret
    return jwt.verify(token, secret as string)
}

export default tokenVerify