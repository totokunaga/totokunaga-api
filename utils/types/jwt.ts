import { OAuthProvider } from "./oauth";

export type JWTHeader = {
  alg: "HS256";
  typ: "JWT";
};

export type JWTMetadata = {
  name: string;
  oauthProvider: OAuthProvider;
  oauthId: string;
  avatorImagePath?: string;
};

export type RegisteredClaimName = {
  iss: string;
  sub: string;
  aud?: string;
  exp: number;
  nbf?: string;
  iat: number;
  jti?: string;
};

export type PublicClaimName = {
  sessionId: string;
  metadata: JWTMetadata;
};

export type JWTPayload = RegisteredClaimName & PublicClaimName;
