import axios from "axios";
import qs from "qs";
import { Request, Response } from "express";
import config from "../config";
import { GoogleUserProfile, OAuthProvider, OAuthToken } from "../types/oauth";

const tokenEndpoints: Record<OAuthProvider, string> = {
  google: "https://oauth2.googleapis.com/token",
  facebook: "https://graph.facebook.com/v16.0/oauth/access_token",
  github: "https://github.com/login/oauth/access_token",
};

export const getOAuthTokens = async (
  provider: OAuthProvider,
  code: string,
  dataType?: "data" | "queries",
  headers?: any
): Promise<any> => {
  const url = tokenEndpoints[provider];

  const providerConfig = config.oauth[provider];
  const values = {
    code,
    client_id: providerConfig.clientId,
    client_secret: providerConfig.clientSecret,
    redirect_uri: providerConfig.redirectURI,
    grant_type: "authorization_code",
  };

  try {
    const queries = qs.stringify(values);
    const endpoint = dataType === "data" ? url : `${url}?${queries}`;
    const res = await axios.post(endpoint, dataType === "data" && queries, {
      headers,
    });
    return res.data;
  } catch (e: any) {
    console.log(e, `Failed to fetch "${provider}" OAuth Tokens`);
    throw new Error(e.message);
  }
};

export const getGoogleUser = async (
  id_token: string,
  access_token: string
): Promise<GoogleUserProfile> => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${id_token}` } }
    );
    return res.data;
  } catch (e: any) {
    console.log(e, "Failed to fetch Google user information");
    throw new Error(e.message);
  }
};

export const googleOAuthHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    const { id_token, access_token }: OAuthToken = await getOAuthTokens(
      "google",
      code,
      "data",
      { "Content-Type": "application/x-www-form-urlencoded" }
    );
    const { verified_email } = await getGoogleUser(id_token, access_token);
    console.log({ id_token, access_token });

    if (!verified_email) {
      return res.status(403).send("Google account is not verified");
    }

    // Upsert a user to the database
    // Create a cookie for access token and refresh token

    return res.redirect(config.oauth.frontendRedirectURI + "/algorithms");
  } catch (e: any) {
    return res.redirect(config.oauth.frontendRedirectURI);
  }
};

const getFacebookUser = async (accessToken: string) => {
  const fields = ["id", "name"].join(",");
  const endpoint = `https://graph.facebook.com/v16.0/me?${accessToken}&&fields=${fields}`;
  const response = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const facebookOAuthHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const response = await getOAuthTokens("facebook", code, "queries");
    const facebookUser = await getFacebookUser(response.access_token);
    console.log(facebookUser);

    // Upsert a user to the database
    // Create a cookie for access token and refresh token

    return res.redirect(config.oauth.frontendRedirectURI + "/algorithms");
  } catch (e: any) {
    return res.redirect(config.oauth.frontendRedirectURI);
  }
};

const getGithubUser = async (accessToken: string) => {
  const response = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const githubOAuthHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const response = await getOAuthTokens("github", code, "data", {
      Accept: "application/json",
    });

    const { name, avatar_url, id } = await getGithubUser(response.access_token);

    // Upsert a user to the database
    // Create a cookie for access token and refresh token

    return res.redirect(config.oauth.frontendRedirectURI + "/algorithms");
  } catch (e: any) {
    return res.redirect(config.oauth.frontendRedirectURI);
  }
};
