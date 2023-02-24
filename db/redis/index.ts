import Redis from "ioredis";
import { NODE_ENV } from "../../utils/constants";
import { redisConfig } from "../../utils/constants/database";

export const redisClient = new Redis(redisConfig[NODE_ENV]);
