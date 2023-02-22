import { NODE_ENV } from ".";
import {
  Env,
  FACEBOOK,
  GITHUB,
  GOOGLE,
  OAuthConfig,
  OAuthProvider,
} from "../types";
import { config } from "dotenv";

config();

const redirectPath = "/api/sessions/oauth";
const rootRedirectUrl: Record<Env, string> = {
  development: "http://localhost:4000" + redirectPath,
  test: "https://totokunaga.com" + redirectPath,
  production: "https://totokunaga.com" + redirectPath,
};

const frontendRedirectUrls: Record<Env, string> = {
  development: "http://localhost:3000",
  test: "https://totokunaga.com",
  production: "https://totokunaga.com",
};
export const frontendRedirectUrl = frontendRedirectUrls[NODE_ENV];

export const oauthConfig: Record<OAuthProvider, OAuthConfig> = {
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: rootRedirectUrl[NODE_ENV] + `/${GOOGLE}`,
    additionalQueries: { grant_type: "authorization_code" },
    tokenEndpoint: {
      url: "https://oauth2.googleapis.com/token",
      queryType: "data",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      userInfoAccessTokenKey: "access_token",
      userInfoBearerTokenKey: "id_token",
    },
    userInfoEndpoint: {
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
      nameKey: "name",
      idKey: "id",
      profilePictureKey: "picture",
    },
  },
  facebook: {
    client_id: process.env.FACEBOOK_CLIENT_ID as string,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
    redirect_uri: rootRedirectUrl[NODE_ENV] + `/${FACEBOOK}`,
    tokenEndpoint: {
      url: "https://graph.facebook.com/v16.0/oauth/access_token",
      queryType: "queries",
      userInfoAccessTokenKey: "access_token",
      userInfoBearerTokenKey: "access_token",
    },
    userInfoEndpoint: {
      url: "https://graph.facebook.com/v16.0/me",
      nameKey: "name",
      idKey: "id",
      profilePictureKey: "",
    },
  },
  github: {
    client_id: process.env.GITHUB_CLIENT_ID as string,
    client_secret: process.env.GITHUB_CLIENT_SECRET as string,
    redirect_uri: rootRedirectUrl[NODE_ENV] + `/${GITHUB}`,
    tokenEndpoint: {
      url: "https://github.com/login/oauth/access_token",
      queryType: "data",
      headers: {
        Accept: "application/json",
      },
      userInfoAccessTokenKey: "access_token",
      userInfoBearerTokenKey: "access_token",
    },
    userInfoEndpoint: {
      url: "https://api.github.com/user",
      nameKey: "name",
      idKey: "id",
      profilePictureKey: "avatar_url",
    },
  },
};
