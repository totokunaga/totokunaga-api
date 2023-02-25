import { Request, Response, Router } from "express";
import { redisClient } from "../db/redis";
import {
  generateIdToken,
  sha256Secret,
  verifyJwt,
} from "../utils/functions/jwt";
import { oauthHandler } from "../utils/functions/oauth";

const sessionRouter = Router();

sessionRouter.post(
  "/oauth/save_nounce",
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

sessionRouter.get("/oauth/:provider", oauthHandler);

sessionRouter.get(
  "/token/refresh",
  async (req: Request<unknown, { oldToken: string }>, res: Response) => {
    const { authorization: oldToken } = req.headers;
    const decodedJwt = verifyJwt(oldToken || "", sha256Secret);

    if (decodedJwt) {
      const { payload } = decodedJwt;
      const { iat, exp, metadata } = payload;
      const { oauthProvider, oauthId } = metadata;

      const now = Math.floor(new Date().getTime() / 1000);
      const currIat = iat.toString();
      const lastIat = await redisClient.get(`${oauthProvider}_${oauthId}`);

      if (currIat === lastIat && now <= exp) {
        const newToken = await generateIdToken(metadata);
        return res.send(newToken);
      }
    }

    return res.status(401).send("login session expired");
  }
);

sessionRouter.post("/oauth/logout", async (req: Request, res: Response) => {
  const { authorization: oldToken } = req.headers;
  const decodedJwt = verifyJwt(oldToken || "", sha256Secret);

  if (decodedJwt) {
    const { payload } = decodedJwt;
    const { metadata } = payload;
    const { oauthProvider, oauthId } = metadata;

    try {
      await redisClient.del(`${oauthProvider}_${oauthId}`);
    } catch (e: any) {
      console.error("Failed to communicate with a Redis server:", e.message);
    }
  }
  return res.end();
});

export default sessionRouter;