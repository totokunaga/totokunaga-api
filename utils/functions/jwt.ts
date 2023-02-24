import { createHmac } from "node:crypto";
import { JWTHeader, JWTMetadata, JWTPayload, OAuthProvider } from "../types";

export const sha256Secret = "Ud7o8vbNCkMjQwLb";

const encodeWithSHA256 = (value: string, secret: string) => {
  const hash = createHmac("sha256", secret).update(value).digest("hex");
  return hash;
};

const encodeWithBase64 = (value: string) => {
  return Buffer.from(value, "utf-8").toString("base64");
};

const decodeBase64 = (value: string) => {
  return Buffer.from(value, "base64").toString("utf-8");
};

export const generateJwt = (
  header: JWTHeader,
  payload: JWTPayload,
  secret: string
) => {
  const headerBase64 = encodeWithBase64(JSON.stringify(header)).replace(
    /=/g,
    ""
  );
  const payloadBase64 = encodeWithBase64(JSON.stringify(payload)).replace(
    /=/g,
    ""
  );
  const nonSignaturePart = headerBase64 + "." + payloadBase64;
  const signature = encodeWithSHA256(nonSignaturePart, secret);

  const jwt = nonSignaturePart + "." + signature;
  return jwt;
};

export const verifyJwt = (jwt: string, secret: string) => {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, givenSignature] = parts;
  const signature = encodeWithSHA256(header + "." + payload, secret);
  if (signature !== givenSignature) {
    return null;
  }

  const originalHeader = JSON.parse(decodeBase64(header)) as JWTHeader;
  const originalPayload = JSON.parse(decodeBase64(payload)) as JWTPayload;
  return { header: originalHeader, payload: originalPayload };
};

export const generateJwtHeader = () => {
  const header: JWTHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  return header;
};

export const generateJwtPayload = (data: JWTMetadata) => {
  const { oauthProvider, oauthId, name, avatorImagePath } = data;

  const now = Math.floor(new Date().getTime() / 1000);

  const payload: JWTPayload = {
    iss: "totokunaga",
    sub: `${oauthProvider}_${oauthId}`,
    // exp: now + 30 * 24 * 60 * 60 * 1000,
    exp: now + 60,
    iat: now,
    sessionId: "",
    metadata: {
      name,
      oauthProvider,
      oauthId,
      avatorImagePath,
    },
  };

  return payload;
};

export const generateIdToken = (data: JWTMetadata) => {
  const header = generateJwtHeader();
  const payload = generateJwtPayload(data);
  const idToken = generateJwt(header, payload, sha256Secret);

  return idToken;
};
