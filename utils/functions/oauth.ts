import axios from "axios";
import qs from "qs";
import { Request, Response } from "express";
import config from "../config";
import { GoogleUserProfile, OAuthProvider, OAuthToken } from "../types/oauth";

export const getOAuthTokens = async (
  provider: OAuthProvider,
  code: string
): Promise<OAuthToken> => {
  const url = "https://oauth2.googleapis.com/token";

  const providerConfig = config.oauth[provider];
  const values = {
    code,
    client_id: providerConfig.clientId,
    client_secret: providerConfig.clientSecret,
    redirect_uri: providerConfig.redirectURI,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
    const { id_token, access_token } = await getOAuthTokens("google", code);
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
