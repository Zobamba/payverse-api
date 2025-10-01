import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import User from "../user/user.model";

class Token extends Model {
  public id!: string;
  public userId!: string;
  public token!: string;
  public type!: "refresh" | "mfa";
  public expiresAt!: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("refresh", "mfa"),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, modelName: "Token", tableName: "Tokens", timestamps: true }
);

Token.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Token, { foreignKey: "userId", as: "tokens" });

export default Token;
