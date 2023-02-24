import express, { Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { oauthHandler } from "../utils/functions/oauth";
import { allowedOrigins } from "../utils/constants";
import { generateAccessToken } from "../utils/functions";
import { userRepository } from "../db/orm/DataSource";
import { redisClient } from "../db/redis";

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

app.post(
  "/api/sessions/oauth/save_nounce",
  async (req: Request, res: Response) => {
    const { nounce } = req.body;
    try {
      const keyExists = await redisClient.exists(nounce);
      if (keyExists) {
        return res.status(400).send("Given nounce is already taken");
      } else {
        await redisClient.set(nounce, 1);
        return res.end();
      }
    } catch (e: any) {
      console.error(e.message);
      return res
        .status(500)
        .send("Failed to communicate with a session server");
    }
  }
);
app.get("/api/sessions/oauth/:provider", oauthHandler);
app.get("/api/sessions/token", (req: Request, res: Response) => {
  const accessToken = generateAccessToken();
  return res
    .cookie("_tt", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .end();
});

app.get("/api/db/user/avator", async (req: Request, res: Response) => {
  const user = await userRepository.findOne({
    where: {
      oauthProvider: "google",
    },
  });

  return res.send(user?.avatorImagePath);
});

export default app;
