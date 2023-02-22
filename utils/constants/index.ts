import { Env } from "../types";

export const NODE_ENV = process.env.NODE_ENV as Env;

export const frontendOrigins: Record<Env, string> = {
  development: "http://localhost:3000",
  test: "https://totokunaga.com",
  production: "https://totokunaga.com",
};

export const allowedOrigins = [frontendOrigins[NODE_ENV]];
