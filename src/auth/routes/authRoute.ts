import express, { Router } from "express";

import { validateSchema } from "../../shared/utils/validator";
import { authLogin, authRegister } from "../controllers/authController";
import { auth_login_schema, auth_register_schema } from "../validators/auth";



export const authRoute = (): Router => {

  const router = express.Router();
  router.post("/login", validateSchema(auth_login_schema, 'body'), authLogin);
  router.post("/register", validateSchema(auth_register_schema, "body"), authRegister);

  return router;

};