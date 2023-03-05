import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import sessionRouter from "./sessions";
import dbRouter from "./db";
import { checkCors } from "../utils/functions";
import { paths } from "../utils/constants/api";

const app = express();
app.disable("x-powered-by");

app.use(checkCors);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use(paths.session.root, sessionRouter);
app.use(paths.db.root, dbRouter);

app.get(paths.root, (req, res) => {
  return res.send({ message: "hello world!" });
});

app.get(paths.health, (req, res) => {
  return res.send({ message: "pod is healthy" });
});

export default app;
