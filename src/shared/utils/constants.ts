import moment from 'moment-timezone';

export const RESPONSE_CODES = {
    GET: 200,
    PUT: 204,
    POST: 201,
    DELETE: 204,
    NOT_FOUND: 404,
    ERROR: 500,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    ALREADY_EXIST: 409,
    SSO_ALREADY_EXIST: 408,
    FORBIDDEN: 403,
    INVALID_ACCOUNT_STATUS: 402,
    UNPROCESSABLE_ENTITY: 422,
    DEACTIVATED: 410,
} as const;


export const RESPONSE_STATUS = {
    SUCCESS: 1,
    ERROR: 0,
} as const;

export const otp = function otp() {
    return Math.floor(100000 + Math.random() * 900000)
};

export const sanitizeString = function sanitizeString(input: string) {
    return input?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const currentDateTime = () => {
    return moment().utc().valueOf();
}
