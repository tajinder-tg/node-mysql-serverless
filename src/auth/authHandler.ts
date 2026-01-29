// // authHandler.ts
import express from "express";
import serverless from "serverless-http";
import { corsMiddleWare } from "../shared/middleware/cors.middleware";
import { authRoute } from "./routes/authRoute";
import { RESPONSE_CODES } from "../shared/utils/constants";
import { authMiddleWare } from "../shared/middleware/auth.middleware";

const app = express();



// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(corsMiddleWare);

const api_version = process.env.API_VERSION;

app.get(`/${api_version}/auth/healthcheck`, async (req, res) => {

  // const connectionSuccess = await connectToDatabase();
  
  const response = {
    status: 1,
    status_code: RESPONSE_CODES.GET,
    message: 'Auth module works perfectly',
  }
  return res.json(response);
})

app.use(authMiddleWare);

app.use(`/${api_version}/auth`, authRoute());

export const handler = serverless(app);