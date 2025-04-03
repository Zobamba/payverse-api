import fs from "fs";
import path from "path";
import { Sequelize, Model, ModelStatic } from "sequelize";
import config from "../../config/config.js";

interface DB {
  [key: string]: ModelStatic<Model<any, any>> & {
    associate?: (models: DB) => void;
  };
}

const db: DB = {};

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  config.development
);

fs.readdirSync(__dirname)
  .filter((file) => file !== path.basename(__filename) && file.endsWith(".ts"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const database = {
  ...db,
  sequelize,
  Sequelize,
};

export default database;
