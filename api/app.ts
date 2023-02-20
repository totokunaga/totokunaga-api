import express from "express";
import compression from "compression";
import { googleOAuthHandler } from "../utils/functions/oauth";

require("dotenv").config();

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.get("/", (req, res) => {
  return res.send({ message: "hello world!" });
});

app.get("/api/sessions/oauth/google", googleOAuthHandler);

export default app;
