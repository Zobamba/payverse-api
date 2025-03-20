import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

class Password extends Model {
  public id!: string;
  public userId!: string;
  public status!: "Active" | "Inactive";
  public password!: string;
  public passwordSalt!: string;
}

Password.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Active",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordSalt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "password", timestamps: true }
);

Password.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Password, { foreignKey: "userId" });

export default Password;
