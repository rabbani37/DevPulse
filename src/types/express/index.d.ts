import type { TCurrentUser } from "../types";




declare global {
    namespace Express {
        interface Request {
            currentUser: TCurrentUser; // Adds 'currentUser' to the Express Request interface
        }
    }
}