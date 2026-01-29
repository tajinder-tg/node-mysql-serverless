import { prisma } from "../../shared/db/prismaClient";
import { RESPONSE_CODES } from "../utils/constants";
import { failure, success } from "../utils/response";
import { RESPONSE_MESSAGES } from "../utils/responseMessage";
import { generateHash } from "../utils/jwt";
import bcrypt from 'bcryptjs';


export const registerUser = async (payload: any) => {
    try {
        const exists = await prisma.user.findFirst({
            where: { email: payload.email },
        });

        if (exists) {
            return failure({ message: RESPONSE_MESSAGES.AUTH.EMAIL_ALREADY_EXIST });
        }

        const hashed: any = await generateHash(payload.password);

        const user = await prisma.user.create({
            data: {
                email: payload.email,
                password: hashed,
                name: payload.name,
            },
        });

        return success({
            message: RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS,
            data: { id: user.id, email: user.email, name: user.name },
        });
    } catch {
        return failure();
    }
};

export const loginUser = async (payload: any) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: payload.email,
          is_deleted: false,
          status: true,
        },
      });
  
      if (!user) {
        return failure({ message: RESPONSE_MESSAGES.AUTH.EMAIL_NOT_MATCHED });
      }
  
      const match = await bcrypt.compare(payload.password, user.password);
  
      if (!match) {
        return failure({ message: RESPONSE_MESSAGES.AUTH.INVALID_PASSWORD  });
      }
  
      return success({
        message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch {
      return failure();
    }
  };