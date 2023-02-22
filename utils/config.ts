import { NODE_ENV } from "./constants";
import { Env } from "./types";

const redirectPath = "/api/sessions/oauth";
const rootRedirectUrl: Record<Env, string> = {
  development: "http://localhost:4000" + redirectPath,
  test: "https://totokunaga.com" + redirectPath,
  production: "https://totokunaga.com" + redirectPath,
};

const frontendRedirectUrl: Record<Env, string> = {
  development: "http://localhost:3000",
  test: "https://totokunaga.com",
  production: "https://totokunaga.com",
};

export default {
  oauth: {
    google: {
      client_id:
        "1002097913976-l836deh06ctm4gepk2ojbqth5kb392ep.apps.googleusercontent.com",
      client_secret: "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",
      redirect_uri: rootRedirectUrl[NODE_ENV] + "/google",
    },
    facebook: {
      client_id: "864217824878323",
      client_secret: "2aebac694405fac78d707a594e92d071",
      redirect_uri: rootRedirectUrl[NODE_ENV] + "/facebook",
    },
    github: {
      client_id: "fa052a5a662b72a63c6c",
      client_secret: "64008c4741c1c7a18875bc20a62b55609ece2f3a",
      redirect_uri: rootRedirectUrl[NODE_ENV] + "/github",
    },
    frontendRedirectUrl: frontendRedirectUrl[NODE_ENV],
  },
};
