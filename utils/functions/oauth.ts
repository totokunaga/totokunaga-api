import axios from "axios";
import qs from "qs";
import { Request, Response } from "express";
import { OAuthProvider, OAuthState } from "../types/oauth";
import { oauthConfig } from "../constants/oauth";
import { frontendOrigins, NODE_ENV } from "../constants";
import { userRepository } from "../../db/orm/DataSource";
import { initUser } from "../../db/orm/User";
import { redisClient } from "../../db/redis";
import { generateIdToken } from "./jwt";
import { JWTMetadata } from "../types";

const frontendOrigin = frontendOrigins[NODE_ENV];

export const oauthHandler = async (req: Request, res: Response) => {
  const provider = req.params.provider as OAuthProvider;
  const code = req.query.code as string;
  const { nounce, path } = JSON.parse(req.query.state as string) as OAuthState;

  try {
    // Check if the authorized user isn't an attacker
    const nounceExists = await redisClient.exists(nounce);
    if (!nounceExists) {
      return res.redirect(frontendOrigin + "/404");
    }
    await redisClient.del(nounce);

    // Upsert a user to the database
    const tokenResponse = await getOAuthTokens(provider, code);
    const userData = await upsertOAuthUser(provider, tokenResponse);

    // Generate a JWT token and set a cookie
    const idToken = generateIdToken(userData);
    res.cookie("token", idToken, { secure: true });

    return res.redirect(frontendOrigin + path);
  } catch (e: any) {
    return res.redirect(frontendOrigin);
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

    const id = userInfo[userInfoEndpoint.idKey] as string;
    const name = userInfo[userInfoEndpoint.nameKey] as string;
    const picture = userInfo[userInfoEndpoint.profilePictureKey] as string;

    const existingUser = await userRepository.findOneBy({
      oauthProvider: provider,
      oauthUserId: id,
    });

    const userData: JWTMetadata = {
      name,
      oauthProvider: provider,
      oauthId: id,
      avatorImagePath: picture,
    };

    if (!existingUser) {
      await userRepository.save(initUser(userData));
    }
    return userData;

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
