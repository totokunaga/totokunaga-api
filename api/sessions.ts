import { Request, Response, Router } from "express";
import { redisClient } from "../db/redis";
import { checkCors } from "../utils/functions";
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
  (req: Request<unknown, { oldToken: string }>, res: Response) => {
    const { authorization: oldToken } = req.headers;
    const decodedJwt = verifyJwt(oldToken || "", sha256Secret);

    if (decodedJwt) {
      const { payload } = decodedJwt;
      const { exp, metadata } = payload;

      const now = new Date().getTime();
      if (now <= exp) {
        const newToken = generateIdToken(metadata);
        return res.send(newToken);
      }
    }

    return res.status(401).send("login session expired");
  }
);

export default sessionRouter;
