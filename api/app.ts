import express, { Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { oauthHandler } from "../utils/functions/oauth";
import { FACEBOOK, GITHUB, GOOGLE } from "../utils/types";
import { allowedOrigins } from "../utils/constants";
import { generateAccessToken } from "../utils/functions";

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.set({
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type",
  });
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.get("/", (req, res) => {
  return res.send({ message: "hello world!" });
});

app.get("/api/health", (req, res) => {
  return res.send({ message: "pod is healthy" });
});

app.get(`/api/sessions/oauth/${GOOGLE}`, oauthHandler);
app.get(`/api/sessions/oauth/${FACEBOOK}`, oauthHandler);
app.get(`/api/sessions/oauth/${GITHUB}`, oauthHandler);
app.get("/api/sessions/token", (req: Request, res: Response) => {
  const accessToken = generateAccessToken();
  return res
    .cookie("_tt", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .end();
});

export default app;
