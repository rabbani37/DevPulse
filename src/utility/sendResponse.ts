import type { Response } from "express";





export function sendResponse<T>(res: Response, statusCod: number, { message, data, error, }: { message?: string; data?: T; error?: boolean }): void { res.status(statusCod).json({
        success: error ? false : true,
        message: message, data: error ? undefined : data
    })

}