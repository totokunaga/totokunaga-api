import { Request, Response, Router } from "express";
import { userRepository } from "../db/orm";

const dbRouter = Router();

dbRouter.get("/user/avator", async (req: Request, res: Response) => {
  const user = await userRepository.findOne({
    where: {
      oauthProvider: "google",
    },
  });

  return res.send(user?.avatorImagePath);
});

export default dbRouter;
