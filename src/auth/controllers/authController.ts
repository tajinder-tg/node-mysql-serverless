import { Request, Response } from "express";

import { RESPONSE } from "../../shared/interfaces/commonInterfaces";
import { failure, sendResponse } from "../../shared/utils/response";
import { loginUser, registerUser, } from "../../shared/services/userServices";



// User login
export const authLogin = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const response: RESPONSE = await loginUser(body);

    return sendResponse(req, res, response);
  } catch (error: any) {
    return sendResponse(req, res, failure({ message: error.message }))
  }
};

export const authRegister = async (req: Request, res: Response) => {
  try {
    const response = await registerUser(req.body);
    return sendResponse(req, res, response);
  } catch (error: any) {
    return sendResponse(req, res, failure({ message: error.message }));
  }
};