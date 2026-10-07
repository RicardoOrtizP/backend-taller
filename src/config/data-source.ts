import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { UserEntity } from "../entities/UserEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "developer",
  password: process.env.DB_PASSWORD || "developer",
  database: process.env.DB_NAME || "test",
  synchronize: true,
  entities: [UserEntity],
});
