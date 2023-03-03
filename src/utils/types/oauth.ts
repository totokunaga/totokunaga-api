export type OAuthProvider = "google" | "facebook" | "github";
export const GOOGLE: OAuthProvider = "google";
export const FACEBOOK: OAuthProvider = "facebook";
export const GITHUB: OAuthProvider = "github";

export type OAuthConfig = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  additionalQueries?: Record<string, string>;
  tokenEndpoint: {
    url: string;
    queryType: "queries" | "data";
    headers?: Record<string, string>;
    userInfoAccessTokenKey: string;
    userInfoBearerTokenKey: string;
  };
  userInfoEndpoint: {
    url: string;
    nameKey: string;
    idKey: string;
    profilePictureKey?: string;
    profilePictureHandler?: (
      userId: string,
      accessToken: string
    ) => Promise<string>;
  };
};

export type OAuthState = {
  nounce: string;
  path: string;
};

export type OAuthToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
};

export type GoogleUserProfile = {
  id: string;
  email: string;
  verified_email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};
