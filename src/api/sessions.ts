import { Request, Response, Router } from "express";
import { redisClient } from "../db/redis";
import { paths } from "../utils/constants/api";
import {
  generateIdToken,
  sha256Secret,
  verifyJwt,
} from "../utils/functions/jwt";
import { oauthHandler } from "../utils/functions/oauth";

const sessionRouter = Router();

sessionRouter.post(
  paths.session.saveNonce,
  async (req: Request, res: Response) => {
    const { nonce } = req.body;
    try {
      const keyExists = await redisClient.exists(nonce);
      if (keyExists) {
        return res.status(400).send("Given nonce is already taken");
      } else {
        await redisClient.set(nonce, 1);
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

sessionRouter.get(paths.session.oauthRedirect, oauthHandler);

sessionRouter.get(
  paths.session.tokenRefresh,
  async (req: Request<unknown, { oldToken: string }>, res: Response) => {
    const { authorization: oldToken } = req.headers;
    const decodedJwt = verifyJwt(oldToken || "", sha256Secret);

    if (decodedJwt) {
      const { payload } = decodedJwt;
      const { exp, metadata } = payload;
      const { oauthProvider, oauthId, sessionId } = metadata;

      const now = Math.floor(new Date().getTime() / 1000);
      const redisKey = `${oauthProvider}_${oauthId}:${sessionId}`;
      const doesSessionExist = await redisClient.exists(redisKey);

      if (doesSessionExist && now <= exp) {
        const newToken = await generateIdToken(metadata, sessionId);
        return res.send(newToken);
      }
      return res
        .status(401)
        .send({ message: "User session was not found. Login required" });
    } else {
      // first time token generation
      const nonceKey = oldToken || "";
      const userSession = await redisClient.get(nonceKey);
      if (userSession) {
        const userData = JSON.parse(userSession);
        const newToken = await generateIdToken(userData);
        await redisClient.del(nonceKey);
        return res.send(newToken);
      }
      return res
        .status(401)
        .send({ message: "User nonce was not found. Login required" });
    }
  }
);

sessionRouter.post(
  paths.session.logout,
  async (req: Request, res: Response) => {
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
  }
);

export default sessionRouter;
