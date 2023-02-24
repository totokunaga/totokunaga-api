import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import sessionRouter from "./sessions";
import dbRouter from "./db";
import { checkCors } from "../utils/functions";

const app = express();
app.disable("x-powered-by");

app.use(checkCors);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use("/api/sessions", sessionRouter);
app.use("/api/db", dbRouter);

app.get("/", (req, res) => {
  return res.send({ message: "hello world!" });
});

app.get("/api/health", (req, res) => {
  return res.send({ message: "pod is healthy" });
});

export default app;
