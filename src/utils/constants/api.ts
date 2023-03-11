const ROOT = "/api";
const SESSION = "/sessions";
const DB = "/db";

export const paths = {
  root: "/",
  health: `${ROOT}/health`,
  session: {
    root: `${ROOT}${SESSION}`,
    saveNonce: `/oauth/save_nonce`,
    oauthRedirect: `/oauth/:provider`,
    logout: `/oauth/logout`,
    tokenRefresh: `/token/refresh`,
  },
  db: {
    root: `${ROOT}${DB}`,
  },
};
