import { config } from "dotenv";
import { DatabaseConfig } from "../types";

config();

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  database: process.env.DB_NAME as string,
};
