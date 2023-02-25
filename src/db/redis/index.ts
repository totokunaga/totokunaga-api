import Redis from "ioredis";
import { redisConfig } from "../../utils/configs";

export const redisClient = new Redis(redisConfig);
