import { config } from "dotenv";
import { RemoteHost } from "../types";

config();

export const redisConfig: RemoteHost = {
  host: process.env.REDIS_HOST as string,
  port: Number(process.env.REDIS_PORT),
};
