import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CustomRequest } from '../interfaces/commonInterfaces';
import { RESPONSE_CODES } from '../utils/constants';
import { RESPONSE_MESSAGES } from './responseMessage';

interface User {
  // Define the properties of your user object here
  // For example: id: string;
}
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-secret";

const generateToken = (user: any): string | false => {
  try {
    // return jwt.sign(user, ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' });
    return jwt.sign(user, ACCESS_TOKEN_SECRET as string, { expiresIn: user.otp ? '5m' : '1h' });
  } catch (error: any) {
    console.log(`(shared/utils/jwt ) --> generateToken function catch error : ${error.message}`);
    return false;
  }

};

const refreshToken = (user: User): string | false => {
  try {
    return jwt.sign(user, ACCESS_TOKEN_SECRET as string, { expiresIn: '7d' });
  } catch (error: any) {
    console.log(`(shared/utils/jwt ) --> refreshToken function catch error : ${error.message}`);
    return false;
  }
};

const verifyAccessToken = (req: CustomRequest): User | null => {
  try {

    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const verifyAccessToken: any = jwt.verify(token, ACCESS_TOKEN_SECRET as string);
      if (verifyAccessToken) {
        verifyAccessToken.refresh_token = token;
        req.user = verifyAccessToken;
        return {
          status: 1,
          status_code: RESPONSE_CODES.GET,
          message: RESPONSE_MESSAGES.AUTH.TOKEN_VERIFIED,
          data: verifyAccessToken
        };
      };
    };
    return null;
  } catch (error: any) {
    console.log(`(shared/utils/jwt ) --> verifyAccessToken function catch error : ${error.message}`);
    return {
      status: 0,
      status_code: RESPONSE_CODES.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.AUTH.TOKEN_INVALID
    }
  }
};

const verifyRefreshToken = (refresh_token: any) => {
  try {

    const verifyRefreshToken = jwt.verify(refresh_token, ACCESS_TOKEN_SECRET as string);
    if (verifyRefreshToken) {
      return {
        status: 1,
        status_code: RESPONSE_CODES.GET,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_VERIFIED,
        data: verifyRefreshToken
      };
    } else {
      return {
        status: 0,
        status_code: RESPONSE_CODES.UNAUTHORIZED,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_INVALID,
      }
    }
  } catch (error: any) {
    console.log(`(shared/utils/jwt ) --> verifyRefreshToken function catch error : ${error.message}`);
    return {
      status: 0,
      status_code: RESPONSE_CODES.UNAUTHORIZED,
      message: RESPONSE_MESSAGES.AUTH.TOKEN_INVALID
    }
  }
};


const generateHash = async (text: string) => {
  try {
    const hash = await bcrypt.hash(text, 10);
    return hash;
  } catch (error: any) {
    console.log(`(shared/utils/jwt ) --> generateHash function catch error : ${error.message}`);
    return false;
  }
};

export {
  verifyAccessToken,
  generateToken,
  refreshToken,
  generateHash,
  verifyRefreshToken
};
