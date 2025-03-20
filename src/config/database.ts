import { Sequelize } from "sequelize";
import { env } from "./env.config";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = env.DB_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const sequelize = new Sequelize({
  database: env.DB_NAME,
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: "postgres",
  storage: ":memory:",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: env.ENVIRONMENT === "development" ? console.log : false,
});

export default sequelize;
