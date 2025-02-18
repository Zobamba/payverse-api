import { Sequelize } from "sequelize";
import { env } from "./env.config";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = env.DB_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: env.ENVIRONMENT === "development" ? true : false,
});

export default sequelize;
