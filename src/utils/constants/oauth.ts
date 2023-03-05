import { backendOrigin } from ".";
import { FACEBOOK, GITHUB, GOOGLE, OAuthConfig, OAuthProvider } from "../types";
import { config } from "dotenv";
import axios from "axios";

config();

const redirectPath = "/api/sessions/oauth";
const rootRedirectUrl = backendOrigin + redirectPath;

const googleOAuthCongfig: OAuthConfig = {
  client_id: process.env.GOOGLE_CLIENT_ID as string,
  client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
  redirect_uri: rootRedirectUrl + `/${GOOGLE}`,
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
};

const facebookOAuthCongfig: OAuthConfig = {
  client_id: process.env.FACEBOOK_CLIENT_ID as string,
  client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
  redirect_uri: rootRedirectUrl + `/${FACEBOOK}`,
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
    profilePictureHandler: async (userId: string, accessToken: string) => {
      const endpoint = `https://graph.facebook.com/v16.0/${userId}/picture?redirect=false&type=large`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const pictureUrl = response.data.data.url;
      return pictureUrl;
    },
  },
};

const githubOAuthConfig: OAuthConfig = {
  client_id: process.env.GITHUB_CLIENT_ID as string,
  client_secret: process.env.GITHUB_CLIENT_SECRET as string,
  redirect_uri: rootRedirectUrl + `/${GITHUB}`,
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
};

export const oauthConfig: Record<OAuthProvider, OAuthConfig> = {
  google: googleOAuthCongfig,
  facebook: facebookOAuthCongfig,
  github: githubOAuthConfig,
};
