import {NextFunction, Request, Response} from "express";
import AuthService from "@src/services/auth";

export function authMiddleware(req: Partial<Request>, res: Partial<Response>, next: NextFunction): void {
    try {
        const token = req.headers?.['x-access-token'];
        req.decoded = AuthService.decodeToken(token as string);
        next();
    } catch (err) {
        res.status?.(401).send({code: 401, error: err.message});
    }
}