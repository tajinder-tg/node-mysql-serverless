// corsMiddleware.ts
import { Request, Response, NextFunction } from "express";
import cors from "cors";

export const corsMiddleWare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        return cors({
            origin: [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ],
            credentials: true,
            exposedHeaders: [
                "Date", "Content-Type", "Content-Length", "Connection", "Server",
                "X-Powered-By", "Access-Control-Allow-Origin", "Authorization", "X-Final-URL"
            ],
            allowedHeaders: ["Content-Type", "Accept", "Authorization"],
        })(req, res, next);
    } catch (error: any) {
        return next(error);
    }
};
