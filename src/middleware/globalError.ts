import type { NextFunction, Request, Response } from "express";




const globalError = (err: Error, req: Request, res: Response, next: NextFunction) => {

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        // stack: config.project_type === "development" ? err.stack:""
    });
}

export default globalError;