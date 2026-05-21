import express, { type Application, type Request, type Response } from "express"



// app create
const app: Application = express()




// middleware
app.use(express.json())



app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "The DevPulseA server is start " })
})


export default app;
