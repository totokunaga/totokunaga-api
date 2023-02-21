export type OAuthProvider = "google" | "facebook" | "github";

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
