import express, { type Application, type Request, type Response } from "express"
import { authRouter } from "./module/users/users.router"
import { issuesRouter } from "./module/issues/issues.router"
import globalError from "./middleware/globalError"



// app create
const app: Application = express()




// middleware
app.use(express.json())


// routers middleware
app.use("/api", authRouter)
app.use("/api", issuesRouter)



app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "The DevPulseA server is start " })
})


app.use(globalError);


export default app;
