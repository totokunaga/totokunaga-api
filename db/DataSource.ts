import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "t0Kut0m03119!",
  database: "totokunaga_development",
  entities: [User],
  synchronize: true,
  logging: false,
});

export const userRepository = AppDataSource.getRepository(User);
