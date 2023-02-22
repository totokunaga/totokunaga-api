import axios from "axios";
import qs from "qs";
import { Request, Response } from "express";
import { OAuthProvider, OAuthState } from "../types/oauth";
import { frontendRedirectUrl, oauthConfig } from "../constants/oauth";

export const oauthHandler = async (req: Request, res: Response) => {
  const provider = req.path.split("/").slice(-1)[0] as OAuthProvider;
  const code = req.query.code as string;
  const { path } = JSON.parse(req.query.state as string) as OAuthState;

  try {
    const tokenResponse = await getOAuthTokens(provider, code);
    // Upsert a user to the database
    upsertOAuthUser(provider, tokenResponse);
    // Create a cookie for access token and refresh token

    return res.redirect(frontendRedirectUrl + path);
  } catch (e: any) {
    return res.redirect(frontendRedirectUrl);
  }
};

export const getOAuthTokens = async (
  provider: OAuthProvider,
  code: string
): Promise<any> => {
  const {
    client_id,
    client_secret,
    redirect_uri,
    additionalQueries,
    tokenEndpoint,
  } = oauthConfig[provider];

  const queries = qs.stringify({
    code,
    client_id,
    client_secret,
    redirect_uri,
    ...additionalQueries,
  });

  const { url, queryType, headers } = tokenEndpoint;

  const endpoint =
    tokenEndpoint.queryType === "data" ? url : `${url}?${queries}`;

  try {
    const res = await axios.post(endpoint, queryType === "data" && queries, {
      headers: headers,
    });
    return res.data;
  } catch (e: any) {
    console.log(e, `Failed to fetch "${provider}" OAuth Tokens`);
    throw new Error(e.message);
  }
};

const upsertOAuthUser = async (provider: OAuthProvider, tokenResponse: any) => {
  const { tokenEndpoint, userInfoEndpoint } = oauthConfig[provider];
  const accessToken = tokenResponse[tokenEndpoint.userInfoAccessTokenKey];
  const bearerToken = tokenResponse[tokenEndpoint.userInfoBearerTokenKey];
  const userInfoUrl = getUserInfoEndpoint(provider, accessToken);

  try {
    const userInfo = (
      await axios.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
    ).data;
    const id = userInfo[userInfoEndpoint.idKey];
    const name = userInfo[userInfoEndpoint.nameKey];
    const picture = userInfo[userInfoEndpoint.profilePictureKey];

    // Sync with database
  } catch (e: any) {
    console.log(e, "Failed to upsert an oauth user");
    throw new Error(e.message);
  }
};

const getUserInfoEndpoint = (provider: OAuthProvider, accessToken: string) => {
  const rootUrl = oauthConfig[provider].userInfoEndpoint.url;
  const values: Record<string, string> = {};

  switch (provider) {
    case "google":
      values.access_token = accessToken;
      values.alt = "json";
      break;
    case "facebook":
      values.access_token = accessToken;
      values.fields = ["id", "name"].join(",");
      break;
    case "github":
      break;
  }

  const queries = qs.stringify(values);

  return `${rootUrl}?${queries}`;
};
