import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseConfig } from "../../utils/configs";
import { User } from "./User";

export const AppDataSource = new DataSource({
  type: "mysql",
  ...databaseConfig,
  entities: [User],
  synchronize: true,
  logging: false,
});

export const userRepository = AppDataSource.getRepository(User);
