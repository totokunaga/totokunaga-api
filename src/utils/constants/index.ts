import { config } from "dotenv";
import { Env } from "../types";

config();

export const NODE_ENV = process.env.NODE_ENV as Env;

export const frontendOrigin = process.env.FRONTEND_ORIGIN as string;
export const backendOrigin = process.env.BACKEND_ORIGIN as string;

export const allowedOrigins = [frontendOrigin];
