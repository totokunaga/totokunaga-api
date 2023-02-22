import express from "express";
import compression from "compression";
import {
  facebookOAuthHandler,
  githubOAuthHandler,
  googleOAuthHandler,
} from "../utils/functions/oauth";

require("dotenv").config();

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.get("/", (req, res) => {
  return res.send({ message: "hello world!" });
});

app.get("/api/health", (req, res) => {
  return res.send({ message: "pod is healthy" });
});

app.get("/api/sessions/oauth/google", googleOAuthHandler);
app.get("/api/sessions/oauth/facebook", facebookOAuthHandler);
app.get("/api/sessions/oauth/github", githubOAuthHandler);

export default app;
