const rootRedirectURI = "http://localhost:4000/api/sessions/oauth";

export default {
  oauth: {
    google: {
      clientId:
        "1002097913976-l836deh06ctm4gepk2ojbqth5kb392ep.apps.googleusercontent.com",
      clientSecret: "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",
      redirectURI: rootRedirectURI + "/google",
    },
    facebook: {
      clientId: "864217824878323",
      clientSecret: "2aebac694405fac78d707a594e92d071",
      redirectURI: rootRedirectURI + "/facebook",
    },
    github: {
      clientId: "fa052a5a662b72a63c6c",
      clientSecret: "64008c4741c1c7a18875bc20a62b55609ece2f3a",
      redirectURI: rootRedirectURI + "/github",
    },
    frontendRedirectURI: "http://localhost:3000",
  },
};
