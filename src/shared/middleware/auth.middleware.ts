import { Response, Request, NextFunction } from 'express';
import { RESPONSE_CODES } from '../utils/constants';
import { verifyAccessToken } from '../utils/jwt';
import { CustomRequest } from '../interfaces/commonInterfaces';
import { RESPONSE_MESSAGES } from '../utils/responseMessage';


export const authMiddleWare = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const apiPrefix = '/api_v1';
        const ignorePaths = [`${apiPrefix}/auth/login`, `${apiPrefix}/auth/register`, `${apiPrefix}/auth/resend_otp`, `${apiPrefix}/admin/login`];
        const { headers, originalUrl } = req;

        const ignoreIndex = ignorePaths.findIndex((item) => item === originalUrl.split('?')[0]);
        if (ignoreIndex > -1) {
            return next();
        }

        if (!headers.authorization) {
            res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error: RESPONSE_MESSAGES.AUTH.TOKEN_MISSING });
            return;
        }

        const tokenInfo: any = verifyAccessToken(req);
        if (tokenInfo.status) {

            tokenInfo.data.type = "id";
            //   const checkUser = await userDetail(tokenInfo.data);
            const checkUser = {
                status: 1,
                data: {
                    status: 1,
                    name: "test",
                    profile_pic: '',
                    user_name: "Test"
                }
            };

            if (checkUser?.data?.status === 1) {

                req.user.status = checkUser?.data?.status;
                req.user.name = checkUser?.data?.name;
                req.user.profile_pic = checkUser?.data?.profile_pic;
                req.user.user_name = checkUser?.data?.user_name;

                return next();
            } else {
                if (checkUser.status && !checkUser.data.status) {
                    const responsePayload = {
                        status: 0,
                        status_code: RESPONSE_CODES.UNAUTHORIZED,
                        message: RESPONSE_MESSAGES.AUTH.INACTIVE_USER,
                    };
                    res.status(responsePayload.status_code).json(responsePayload);
                    return
                } else {
                    const responsePayload = {
                        status: 0,
                        status_code: RESPONSE_CODES.UNAUTHORIZED,
                        message: RESPONSE_MESSAGES.COMMON.UNAUTHORIZED,
                    };
                    res.status(responsePayload.status_code).json(responsePayload);
                    return
                }
            }
        } else {
            res.status(tokenInfo.status_code).json(tokenInfo);
            return
        }

    } catch (error) {
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({ error });
        return
    }
};
