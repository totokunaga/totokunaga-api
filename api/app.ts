import express from "express";
import compression from "compression";
import { oauthHandler } from "../utils/functions/oauth";
import { FACEBOOK, GITHUB, GOOGLE } from "../utils/types";

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

app.get(`/api/sessions/oauth/${GOOGLE}`, oauthHandler);
app.get(`/api/sessions/oauth/${FACEBOOK}`, oauthHandler);
app.get(`/api/sessions/oauth/${GITHUB}`, oauthHandler);

export default app;
