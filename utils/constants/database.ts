import { config } from "dotenv";
import { Env } from "../types";

config();

export const gcpCloudSqlPW = "&@V;1oliZz}LSZ;Q";

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export const databaseConfig: Record<Env, DatabaseConfig> = {
  development: {
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "t0Kut0m03119!",
    database: "totokunaga_development",
  },
  test: {
    host: "34.146.177.45",
    port: 3306,
    username: "root",
    password: "&@V;1oliZz}LSZ;Q",
    database: "spm_stg",
  },
  production: {
    host: "127.0.0.1",
    port: 3306,
    username: process.env.DB_USER as string,
    password: process.env.DB_PASS as string,
    database: process.env.DB_NAME as string,
  },
};
