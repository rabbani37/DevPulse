import express, { type Application, type Request, type Response } from "express"
import { authRouter } from "./module/users/users.router"
import { issuesRouter } from "./module/issues/issues.router"
import globalError from "./middleware/globalError"
import cookieParser from "cookie-parser"


// app create
const app: Application = express()




// middleware
app.use(express.json()) // show json format data into response
app.use(cookieParser()) // to read cookie from browser
app.use("/api", authRouter)  // working user signup and login
app.use("/api", issuesRouter) // 



app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "The DevPulseA server is start " })
})

app.use(globalError); // catch global error like server error


export default app;
