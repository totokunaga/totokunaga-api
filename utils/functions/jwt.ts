import { createHmac } from "node:crypto";
import { redisClient } from "../../db/redis";
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

export const generateJwtPayload = (data: JWTMetadata, iat: number) => {
  const { oauthProvider, oauthId, name, avatorImagePath } = data;

  const payload: JWTPayload = {
    iss: "totokunaga",
    sub: `${oauthProvider}_${oauthId}`,
    exp: iat + 60,
    iat,
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

export const generateIdToken = async (data: JWTMetadata) => {
  const iat = Math.floor(new Date().getTime() / 1000);
  const header = generateJwtHeader();
  const payload = generateJwtPayload(data, iat);
  const idToken = generateJwt(header, payload, sha256Secret);

  const { oauthProvider, oauthId } = data;
  await redisClient.set(`${oauthProvider}_${oauthId}`, iat);

  return idToken;
};
