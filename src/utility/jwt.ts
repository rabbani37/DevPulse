import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken"
import config from "../config/index_config";
const signToken = (payload: JwtPayload) => {
    const accessToken = jwt.sign(payload, config.access_secret as string, { expiresIn: "20d" })
    const refreshToken = jwt.sign(payload, config.refresh_secret as string, { expiresIn: "30d" })
    return { accessToken, refreshToken }
}
export default signToken;