import { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "../constants";

export const checkCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.set({
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  next();
};

export const getRandomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
