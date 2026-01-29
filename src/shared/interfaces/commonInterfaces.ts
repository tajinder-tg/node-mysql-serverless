import { Request } from 'express';

export interface RESPONSE {
    status: number,
    status_code: number,
    message: string,
    data?: any,
}

export interface CustomRequest extends Request {
    user?: any;
    file?: any;
    files?: any;
}
