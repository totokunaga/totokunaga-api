import axios from "axios";
import qs from "qs";
import { Request, Response } from "express";
import { OAuthProvider, OAuthState } from "../types/oauth";
import { oauthConfig } from "../constants/oauth";
import { frontendOrigin } from "../constants";
import { userRepository } from "../../db/orm/DataSource";
import { initUser } from "../../db/orm/User";
import { redisClient } from "../../db/redis";
import { JWTMetadata } from "../types";

export const oauthHandler = async (req: Request, res: Response) => {
  const provider = req.params.provider as OAuthProvider;
  const code = req.query.code as string;
  const { nonce, path } = JSON.parse(req.query.state as string) as OAuthState;

  try {
    // Check if the authorized user isn't an attacker
    const nonceExists = await redisClient.exists(nonce);
    if (!nonceExists) {
      return res.redirect(frontendOrigin + "/404");
    }

    // Upsert a user to the database
    const tokenResponse = await getOAuthTokens(provider, code);
    await upsertOAuthUser(provider, tokenResponse, nonce);

    return res.redirect(`${frontendOrigin}/${path}?nonce=${nonce}`);
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

const upsertOAuthUser = async (
  provider: OAuthProvider,
  tokenResponse: any,
  nonce: string
) => {
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

    const { idKey, nameKey, profilePictureKey, profilePictureHandler } =
      userInfoEndpoint;
    const id = userInfo[idKey] as string;
    const name = userInfo[nameKey] as string;
    const picture = profilePictureKey
      ? (userInfo[profilePictureKey] as string)
      : await profilePictureHandler!(id, accessToken);

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
    await redisClient.set(nonce, JSON.stringify(userData));

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
