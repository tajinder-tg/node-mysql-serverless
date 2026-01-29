import { Request, Response } from "express";

import { RESPONSE_CODES, RESPONSE_STATUS } from "./constants";
import { RESPONSE_MESSAGES } from "./responseMessage";
import { RESPONSE } from "../interfaces/commonInterfaces";

export const success = ({ status = RESPONSE_STATUS.SUCCESS, status_code = RESPONSE_CODES.GET, message = RESPONSE_MESSAGES.COMMON.SUCCESS, data }: {
  status?: number;
  status_code?: number;
  message?: string;
  data: any;
}): RESPONSE => {
  return {
    status,
    status_code,
    message,
    data
  };
};

export const failure = ({ status = RESPONSE_STATUS.ERROR, status_code = RESPONSE_CODES.ERROR, message = RESPONSE_MESSAGES.COMMON.ERROR }: {
  status?: number;
  status_code?: number;
  message?: string;
} = {}): RESPONSE => {
  return {
    status,
    status_code,
    message
  };
};

export const sendResponse = (req: Request, res: Response, response: RESPONSE) => {
  return res.status(response.status_code).json(response);
};
