import "reflect-metadata";
import { DataSource } from "typeorm";
import { NODE_ENV } from "../utils/constants";
import { databaseConfig } from "../utils/constants/database";
import { User } from "./User";

console.log(databaseConfig[NODE_ENV]);

export const AppDataSource = new DataSource({
  type: "mysql",
  ...databaseConfig[NODE_ENV],
  entities: [User],
  synchronize: true,
  logging: false,
});

export const userRepository = AppDataSource.getRepository(User);
